# 🛡️ Bot Setup Guide (Zero-Cost for Students)

Building a "World Class" agriculture tool requires fresh data every day. Since you are a student, we use **GitHub Actions** and **Supabase** to run your bots for free.

## 1. The Bot Host: GitHub Actions (Already Installed!)
I have already created the configuration file for you in your project.

- **File Path:** `.github/workflows/daily_scrape.yml`
- **What it does:** It tells GitHub to wake up every night, run your `agmarknet_historical_fetcher.js` script, and save the new prices into your website.

### What you need to do:
1. **GitHub Secrets:** Go to your GitHub Repository Settings -> Secrets and Variables -> Actions.
2. Add a new secret named `OGD_API_KEY` and paste your API key there.
3. **That's it!** Every night your website will now update itself.
```yaml
name: Daily Mandi Scrape
on:
  schedule:
    - cron: '0 0 * * *' # Runs daily at Midnight UTC
  workflow_dispatch: # Allows manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Run Scraper
        run: node scripts/agmarknet_historical_fetcher.js
      - name: Commit Results
        run: |
          git config --local user.email "bot@kisanbaba.com"
          git config --local user.name "KisanBaba Bot"
          git add src/data/historical_stats.json
          git commit -m "📊 Auto-Update: Daily Price Stats"
          git push
```

## 2. The Database: Supabase (Free Tier)
If your data becomes too large for JSON files (e.g., >50,000 rows), use Supabase.
1. Sign up at [supabase.com](https://supabase.com).
2. Create a new "PriceHistory" table.
3. Update the scraper to use `supabase-js` to `insert()` data instead of `fs.writeFileSync`.

## 3. Why this is Zero Cost?
- **GitHub Actions:** 2,000 minutes/month free (Scraping takes 2 mins/day).
- **Supabase:** 500MB free (Enough for 2 years of daily prices).
- **Hosting:** Vercel/Netlify for your website is also free.

---
*Bot Architecture designed by Antigravity AI*
