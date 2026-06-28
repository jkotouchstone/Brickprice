# 🧱 BrickPrice — How to Deploy Your Website

This guide will get your website live on the internet in about **30–45 minutes**.  
You don't need to know how to code. Just follow each step exactly.

---

## What you'll end up with

- A live website at a URL like `https://brickprice.up.railway.app`
- A working database tracking 20 LEGO sets (you can add more)
- Prices that update automatically every day
- A grid and table view with sort/filter/search

---

## Tools you'll use (all free)

| Tool | What it does |
|------|--------------|
| **GitHub** | Stores your website's code |
| **Railway** | Runs your backend (the price database) |
| **Vercel** | Hosts your frontend (the website people see) |

---

## STEP 1: Create a GitHub account (skip if you have one)

1. Go to **github.com**
2. Click **Sign up**
3. Enter your email, create a password, and verify your email

---

## STEP 2: Upload your code to GitHub

1. Go to **github.com** and click the **+** icon in the top right
2. Select **New repository**
3. Name it `brickprice`
4. Click **Create repository**

Now upload the files:

5. Click **uploading an existing file** (you'll see this link on the empty repo page)
6. Drag and drop the entire `brickprice` folder you received
7. Scroll down and click **Commit changes**

---

## STEP 3: Deploy the backend to Railway

The backend is the engine that stores prices and serves data to the website.

1. Go to **railway.app**
2. Click **Start a New Project**
3. Select **Deploy from GitHub repo**
4. Connect your GitHub account when prompted
5. Select your `brickprice` repository
6. Railway will detect the project. When it asks for settings, enter:
   - **Root directory:** `backend`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Click **Deploy**

After it deploys (about 2 minutes):

8. Click on your deployment → **Settings** → **Variables**
9. Add this variable:
   - Name: `DB_PATH`
   - Value: `brickprice.db`
10. Go to **Settings → Networking → Generate Domain**
11. Copy your Railway URL (looks like `https://brickprice-production.up.railway.app`)

**Initialize your database:**
12. In Railway, click **New** → **Database** → **Add SQLite** (or use the terminal)
13. In the Railway terminal, run: `python init_db.py`

   > 💡 **Easier way:** In Railway, click your service → **Deploy** tab → **Shell**  
   > Type: `python init_db.py` and press Enter  
   > You should see: `✅ Database initialized with 20 LEGO sets`

---

## STEP 4: Deploy the frontend to Vercel

The frontend is what visitors see in their browser.

1. Go to **vercel.com**
2. Click **Sign Up** → **Continue with GitHub**
3. Click **Add New Project**
4. Import your `brickprice` repository
5. Set these options:
   - **Framework:** Create React App
   - **Root directory:** `frontend`
6. Click **Environment Variables** and add:
   - Name: `REACT_APP_API_URL`  
   - Value: `https://your-railway-url.up.railway.app` ← (paste your Railway URL from Step 3)
7. Click **Deploy**

After about 3 minutes, Vercel gives you a URL like `https://brickprice.vercel.app`  
**That's your live website!** 🎉

---

## STEP 5: Set up daily price updates (optional but recommended)

This makes the scraper run every morning at 6am automatically.

In Railway:
1. Click **New** → **Cron Job**
2. Set the schedule to: `0 6 * * *` (this means 6am every day)
3. Set the command to: `python scraper.py`
4. Set Root directory to: `backend`
5. Click **Save**

---

## STEP 6: Add real prices from Amazon (optional, earns you money)

The site works without this — it uses realistic simulated prices.  
To get real Amazon prices AND earn affiliate commissions:

1. Go to **associates.amazon.com**
2. Sign up for Amazon Associates (free)
3. After approval, go to **Tools → Product Advertising API**
4. Get your Access Key and Secret Key
5. In Railway, add these environment variables:
   - `AMAZON_ACCESS_KEY` = (your key)
   - `AMAZON_SECRET_KEY` = (your secret)
   - `AMAZON_PARTNER_TAG` = (your tag, like `brickprice-20`)

---

## STEP 7: Add more LEGO sets

To add more sets to track:

1. In Railway, open the **Shell** for your backend
2. Type the following (replacing with real set info):

```
python3 -c "
import sqlite3
conn = sqlite3.connect('brickprice.db')
conn.execute('''INSERT OR IGNORE INTO sets 
  (set_number, name, theme, piece_count, year, msrp) 
  VALUES (\"10311\", \"Orchid\", \"Botanical\", 608, 2023, 49.99)''')
conn.commit()
print('Set added!')
"
```

Or add multiple sets by editing the `seed_sets` list in `backend/init_db.py` and re-running `python init_db.py`.

---

## Your website is live! Here's what it does:

✅ Shows all tracked LEGO sets sorted by best cost-per-piece  
✅ Grid and table views  
✅ Filter by theme (Star Wars, Technic, etc.)  
✅ Search by set name or number  
✅ Click any set to see price history chart  
✅ See prices from all retailers side-by-side  
✅ Color-coded value ratings (green = great deal)  

---

## Troubleshooting

**The website shows "Loading..." forever**  
→ Your `REACT_APP_API_URL` in Vercel is probably wrong. Go to Vercel → Settings → Environment Variables and make sure it matches your Railway URL exactly (no trailing slash).

**Railway says "Build failed"**  
→ Make sure the Root Directory is set to `backend` (not the root of the repo).

**Prices aren't updating**  
→ Check that your cron job is set up in Railway (Step 5). You can also trigger it manually from the Railway shell by typing `python scraper.py`.

**I want a custom domain (like brickprice.com)**  
→ Buy a domain from Namecheap or Google Domains, then in Vercel go to Settings → Domains and add your domain. They walk you through it step by step.

---

## Monthly costs

- **Railway:** Free tier covers this easily (500 hours/month free)  
- **Vercel:** Free (Hobby tier is more than enough)  
- **Domain:** ~$12/year if you want a custom domain (optional)

**Total: $0/month to start** (or $1/month with a custom domain)

---

## Need help?

If something isn't working, the error message in Railway or Vercel's logs will tell you what's wrong. You can copy the error and ask Claude to help you fix it!
