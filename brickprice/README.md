# 🧱 BrickPrice

**Track cost-per-piece across Amazon, Walmart, Target, Best Buy & LEGO.com**

BrickPrice is a LEGO set price tracker that finds the best cost-per-piece deal across every major retailer, updated daily.

## Project structure

```
brickprice/
├── backend/           ← Python API + scraper
│   ├── main.py        ← FastAPI routes
│   ├── init_db.py     ← Database setup + seed data
│   ├── scraper.py     ← Daily price fetcher
│   ├── requirements.txt
│   └── railway.toml   ← Railway deployment config
├── frontend/          ← React website
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/     ← Home, Browse, SetDetail
│   │   ├── components/← Navbar, SetCard
│   │   └── hooks/api.js
│   └── package.json
├── DEPLOY.md          ← Step-by-step deployment guide
└── README.md
```

## Features

- 🏆 Cost-per-piece rankings across all retailers
- 📊 30-day price history charts  
- 🔍 Search and filter by theme
- ⚡ Grid and table views
- 🟢 Value ratings (Exceptional / Good / Average / Wait)
- 🔔 Recent price drop alerts
- 📱 Mobile responsive

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions.  
No technical knowledge required — live in ~45 minutes.

## Local development

```bash
# Backend
cd backend
pip install -r requirements.txt
python init_db.py
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Visit http://localhost:3000
