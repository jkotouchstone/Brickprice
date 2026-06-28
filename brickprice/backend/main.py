from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import sqlite3
import os
from datetime import datetime, timedelta

app = FastAPI(title="BrickPrice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.environ.get("DB_PATH", "brickprice.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api/sets")
def get_sets(
    theme: Optional[str] = None,
    sort: Optional[str] = "cpp",
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    conn = get_db()
    try:
        query = """
            SELECT 
                s.id, s.set_number, s.name, s.theme, s.piece_count, s.year, s.image_url, s.msrp,
                p.price as best_price,
                p.retailer as best_retailer,
                p.url as best_url,
                ROUND(CAST(p.price AS FLOAT) / s.piece_count * 100, 2) as cpp,
                p.updated_at as last_updated
            FROM sets s
            LEFT JOIN (
                SELECT set_id, price, retailer, url, updated_at
                FROM prices
                WHERE (set_id, price) IN (
                    SELECT set_id, MIN(price) FROM prices 
                    WHERE available = 1 
                    GROUP BY set_id
                )
            ) p ON s.id = p.set_id
            WHERE 1=1
        """
        params = []
        if theme:
            query += " AND s.theme = ?"
            params.append(theme)
        if search:
            query += " AND (s.name LIKE ? OR s.set_number LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])

        if sort == "cpp":
            query += " ORDER BY cpp ASC NULLS LAST"
        elif sort == "price_asc":
            query += " ORDER BY best_price ASC NULLS LAST"
        elif sort == "price_desc":
            query += " ORDER BY best_price DESC NULLS LAST"
        elif sort == "pieces":
            query += " ORDER BY s.piece_count DESC"
        elif sort == "name":
            query += " ORDER BY s.name ASC"

        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

@app.get("/api/sets/{set_id}")
def get_set(set_id: int):
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM sets WHERE id = ?", (set_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Set not found")
        s = dict(row)

        prices = conn.execute("""
            SELECT retailer, price, url, available, updated_at
            FROM prices WHERE set_id = ? AND available = 1
            ORDER BY price ASC
        """, (set_id,)).fetchall()
        s["prices"] = [dict(p) for p in prices]

        if s["piece_count"]:
            for p in s["prices"]:
                p["cpp"] = round(p["price"] / s["piece_count"] * 100, 2)

        history = conn.execute("""
            SELECT DATE(updated_at) as date, MIN(price) as min_price
            FROM prices WHERE set_id = ?
            GROUP BY DATE(updated_at)
            ORDER BY date DESC LIMIT 30
        """, (set_id,)).fetchall()
        s["history"] = [dict(h) for h in reversed(history)]

        return s
    finally:
        conn.close()

@app.get("/api/deals")
def get_deals(limit: int = 12):
    conn = get_db()
    try:
        rows = conn.execute("""
            SELECT 
                s.id, s.set_number, s.name, s.theme, s.piece_count, s.image_url, s.msrp,
                p.price as best_price,
                p.retailer as best_retailer,
                p.url as best_url,
                ROUND(CAST(p.price AS FLOAT) / s.piece_count * 100, 2) as cpp,
                ROUND((1.0 - p.price / s.msrp) * 100, 0) as discount_pct
            FROM sets s
            JOIN (
                SELECT set_id, MIN(price) as price, retailer, url
                FROM prices WHERE available = 1
                GROUP BY set_id
            ) p ON s.id = p.set_id
            WHERE s.msrp > 0 AND s.piece_count > 0
            ORDER BY cpp ASC
            LIMIT ?
        """, (limit,)).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

@app.get("/api/themes")
def get_themes():
    conn = get_db()
    try:
        rows = conn.execute("""
            SELECT theme, COUNT(*) as count 
            FROM sets GROUP BY theme ORDER BY count DESC
        """).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

@app.get("/api/stats")
def get_stats():
    conn = get_db()
    try:
        total_sets = conn.execute("SELECT COUNT(*) FROM sets").fetchone()[0]
        avg_cpp = conn.execute("""
            SELECT AVG(CAST(p.price AS FLOAT) / s.piece_count * 100)
            FROM sets s JOIN (
                SELECT set_id, MIN(price) as price FROM prices WHERE available = 1 GROUP BY set_id
            ) p ON s.id = p.set_id WHERE s.piece_count > 0
        """).fetchone()[0]
        new_lows = conn.execute("""
            SELECT COUNT(DISTINCT set_id) FROM prices
            WHERE updated_at >= datetime('now', '-7 days')
        """).fetchone()[0]
        stores = conn.execute("SELECT COUNT(DISTINCT retailer) FROM prices").fetchone()[0]
        return {
            "total_sets": total_sets,
            "avg_cpp": round(avg_cpp, 3) if avg_cpp else 0,
            "new_lows_week": new_lows,
            "stores_tracked": stores
        }
    finally:
        conn.close()

@app.get("/api/alerts")
def get_alerts(limit: int = 10):
    conn = get_db()
    try:
        rows = conn.execute("""
            SELECT s.name, s.set_number, p.retailer, p.price, s.piece_count,
                ROUND(CAST(p.price AS FLOAT) / s.piece_count * 100, 2) as cpp,
                p.updated_at
            FROM prices p JOIN sets s ON p.set_id = s.id
            WHERE p.updated_at >= datetime('now', '-24 hours') AND p.available = 1
            ORDER BY p.updated_at DESC LIMIT ?
        """, (limit,)).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
