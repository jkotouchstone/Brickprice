"""
BrickPrice Brickset Importer
-----------------------------
Pulls LEGO set data from the Brickset API and populates the database.
Brickset has 20,000+ sets with accurate piece counts, themes, and retail prices.

Setup:
  1. Get a free API key: https://brickset.com/tools/webservices/requestkey
  2. Add to Railway env vars: BRICKSET_API_KEY=your_key
  3. Run: python3 import_brickset.py
"""

import sqlite3
import os
import time
import requests
import logging

DB_PATH = os.environ.get("DB_PATH", "brickprice.db")
API_KEY = os.environ.get("BRICKSET_API_KEY")
BRICKSET_USER_HASH = os.environ.get("BRICKSET_USER_HASH", "")

BASE_URL = "https://brickset.com/api/v3.asmx"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("brickset_import")

THEMES_TO_IMPORT = [
    "Star Wars", "Technic", "Icons", "Harry Potter", "Ideas",
    "City", "Creator Expert", "Marvel", "Ninjago", "Friends",
    "Architecture", "Speed Champions", "Botanical Collection",
    "Minecraft", "DC Comics Super Heroes", "Disney",
]

MIN_YEAR = 2015
MAX_PER_THEME = 60


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def brickset_get_sets(theme: str, page_size: int = 60):
    if not API_KEY:
        log.error("BRICKSET_API_KEY not set. Add it in Railway Variables.")
        return []

    params = {
        "apiKey": API_KEY,
        "userHash": BRICKSET_USER_HASH,
        "params": f'{{"theme":"{theme}","pageSize":{page_size},"orderBy":"YearFrom"}}'
    }

    try:
        resp = requests.get(f"{BASE_URL}/getSets", params=params, timeout=20)
        data = resp.json()
        if data.get("status") != "success":
            log.warning(f"Brickset API error for theme '{theme}': {data.get('message')}")
            return []
        return data.get("sets", [])
    except Exception as e:
        log.warning(f"Failed to fetch theme '{theme}': {e}")
        return []


def import_sets():
    if not API_KEY:
        print("\n❌ BRICKSET_API_KEY not found.")
        print("Add it in Railway → Variables → BRICKSET_API_KEY = your_key\n")
        return

    conn = get_db()
    total_imported = 0
    total_skipped = 0

    for theme in THEMES_TO_IMPORT:
        log.info(f"Fetching theme: {theme}")
        sets = brickset_get_sets(theme, page_size=MAX_PER_THEME)
        log.info(f"  Found {len(sets)} sets")

        for s in sets:
            try:
                year = s.get("year", 0)
                if year and year < MIN_YEAR:
                    total_skipped += 1
                    continue

                set_number = s.get("number")
                name = s.get("name")
                pieces = s.get("pieces")
                image_url = s.get("image", {}).get("imageURL") if s.get("image") else None

                price_info = s.get("LEGOCom", {}).get("US", {}) if s.get("LEGOCom") else {}
                msrp = price_info.get("retailPrice")

                if not set_number or not name or not pieces:
                    total_skipped += 1
                    continue

                if not msrp:
                    msrp = 0

                conn.execute("""
                    INSERT OR IGNORE INTO sets
                    (set_number, name, theme, piece_count, year, image_url, msrp)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (set_number, name, theme, pieces, year, image_url, msrp))

                total_imported += 1

            except Exception as e:
                log.warning(f"Skipping a set in '{theme}' due to error: {e}")
                total_skipped += 1

        time.sleep(1)

    conn.commit()

    count = conn.execute("SELECT COUNT(*) FROM sets").fetchone()[0]
    conn.close()

    print(f"\n✅ Import complete!")
    print(f"   Imported/updated: {total_imported} sets")
    print(f"   Skipped: {total_skipped} sets (missing data or too old)")
    print(f"   Total sets in database now: {count}")
    print(f"\nNext step: run 'python3 scraper.py' to generate prices for the new sets.\n")


if __name__ == "__main__":
    import_sets()
