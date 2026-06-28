import sqlite3
import os

DB_PATH = os.environ.get("DB_PATH", "brickprice.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.executescript("""
        CREATE TABLE IF NOT EXISTS sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            set_number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            theme TEXT,
            piece_count INTEGER,
            year INTEGER,
            image_url TEXT,
            msrp REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            set_id INTEGER NOT NULL,
            retailer TEXT NOT NULL,
            price REAL NOT NULL,
            url TEXT,
            available INTEGER DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (set_id) REFERENCES sets(id)
        );

        CREATE INDEX IF NOT EXISTS idx_prices_set_id ON prices(set_id);
        CREATE INDEX IF NOT EXISTS idx_prices_updated ON prices(updated_at);
        CREATE INDEX IF NOT EXISTS idx_sets_theme ON sets(theme);
        CREATE INDEX IF NOT EXISTS idx_sets_number ON sets(set_number);
    """)

    # Seed with popular LEGO sets so the site has data immediately
    seed_sets = [
        ("75192", "Millennium Falcon", "Star Wars", 7541, 2017, "https://images.brickset.com/sets/images/75192-1.jpg", 849.99),
        ("71043", "Hogwarts Castle", "Harry Potter", 6020, 2018, "https://images.brickset.com/sets/images/71043-1.jpg", 469.99),
        ("10294", "Titanic", "Icons", 9090, 2021, "https://images.brickset.com/sets/images/10294-1.jpg", 679.99),
        ("42055", "Bucket Wheel Excavator", "Technic", 3929, 2016, "https://images.brickset.com/sets/images/42055-1.jpg", 279.99),
        ("75313", "AT-AT", "Star Wars", 6785, 2021, "https://images.brickset.com/sets/images/75313-1.jpg", 849.99),
        ("10307", "Eiffel Tower", "Icons", 10001, 2022, "https://images.brickset.com/sets/images/10307-1.jpg", 629.99),
        ("10276", "Colosseum", "Icons", 9036, 2020, "https://images.brickset.com/sets/images/10276-1.jpg", 549.99),
        ("21337", "Table Football", "Ideas", 2339, 2022, "https://images.brickset.com/sets/images/21337-1.jpg", 249.99),
        ("10313", "Wildflower Bouquet", "Botanical", 939, 2023, "https://images.brickset.com/sets/images/10313-1.jpg", 59.99),
        ("75341", "The Razor Crest", "Star Wars", 1023, 2022, "https://images.brickset.com/sets/images/75341-1.jpg", 129.99),
        ("42143", "Ferrari Daytona SP3", "Technic", 3778, 2022, "https://images.brickset.com/sets/images/42143-1.jpg", 399.99),
        ("10300", "Back to the Future Time Machine", "Icons", 1872, 2022, "https://images.brickset.com/sets/images/10300-1.jpg", 169.99),
        ("76216", "Iron Man Armory", "Marvel", 496, 2022, "https://images.brickset.com/sets/images/76216-1.jpg", 99.99),
        ("21325", "Medieval Blacksmith", "Ideas", 2164, 2021, "https://images.brickset.com/sets/images/21325-1.jpg", 199.99),
        ("10290", "Pickup Truck", "Icons", 1677, 2022, "https://images.brickset.com/sets/images/10290-1.jpg", 99.99),
        ("75304", "Darth Vader Helmet", "Star Wars", 834, 2021, "https://images.brickset.com/sets/images/75304-1.jpg", 69.99),
        ("10302", "Optimus Prime", "Icons", 1508, 2022, "https://images.brickset.com/sets/images/10302-1.jpg", 169.99),
        ("42130", "BMW M 1000 RR", "Technic", 1920, 2022, "https://images.brickset.com/sets/images/42130-1.jpg", 229.99),
        ("21330", "Home Alone", "Ideas", 3955, 2021, "https://images.brickset.com/sets/images/21330-1.jpg", 249.99),
        ("10305", "Lion Knights' Castle", "Icons", 4514, 2022, "https://images.brickset.com/sets/images/10305-1.jpg", 399.99),
    ]

    for s in seed_sets:
        try:
            c.execute("""
                INSERT OR IGNORE INTO sets (set_number, name, theme, piece_count, year, image_url, msrp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, s)
        except Exception as e:
            print(f"Skipping set {s[0]}: {e}")

    # Seed with realistic price data
    import random
    retailers = [
        ("Amazon", "https://amazon.com"),
        ("Walmart", "https://walmart.com"),
        ("Target", "https://target.com"),
        ("LEGO.com", "https://lego.com"),
        ("Best Buy", "https://bestbuy.com"),
    ]

    set_rows = c.execute("SELECT id, msrp FROM sets").fetchall()
    for set_id, msrp in set_rows:
        if not msrp:
            continue
        for retailer, base_url in retailers:
            # Vary prices realistically: some have sales, some are at MSRP, some are unavailable
            r = random.random()
            if r < 0.15:  # 15% chance this retailer doesn't carry it
                continue
            discount = random.uniform(0.0, 0.30)  # 0-30% off
            price = round(msrp * (1 - discount), 2)
            price = max(price, msrp * 0.50)  # Never below 50% MSRP
            available = 1 if random.random() > 0.1 else 0
            c.execute("""
                INSERT INTO prices (set_id, retailer, price, url, available, updated_at)
                VALUES (?, ?, ?, ?, ?, datetime('now', ? || ' minutes'))
            """, (set_id, retailer, price, f"{base_url}/lego-{set_id}", available,
                  f"-{random.randint(1, 60)}"))

        # Add price history (last 30 days)
        base_price = msrp * random.uniform(0.7, 1.0)
        for days_ago in range(30, 0, -1):
            daily_price = base_price * random.uniform(0.95, 1.05)
            daily_price = round(daily_price, 2)
            retailer = random.choice(retailers)[0]
            c.execute("""
                INSERT INTO prices (set_id, retailer, price, url, available, updated_at)
                VALUES (?, ?, ?, ?, 1, datetime('now', ? || ' days'))
            """, (set_id, retailer, daily_price, f"https://amazon.com/lego-{set_id}",
                  f"-{days_ago}"))

    conn.commit()
    conn.close()
    print(f"✅ Database initialized at {DB_PATH} with {len(seed_sets)} LEGO sets")

if __name__ == "__main__":
    init_db()
