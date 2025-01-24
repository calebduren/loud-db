# Reddit Album Import Script

This script crawls Reddit (specifically r/indieheads) for new album releases and imports them into the database.

## Setup

1. Create a Spotify Developer account and create an application at https://developer.spotify.com/dashboard
2. Add your Spotify credentials to your `.env` file:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

## Usage

Run the script:
```bash
npx tsx scripts/importFromReddit.ts
```

The script will:
1. Crawl the r/indieheads "fresh" posts from the last 24 hours
2. Extract all Spotify album links
3. Fetch album details from Spotify's API
4. Import the albums into your database using the existing release service

## Notes

- The script uses Puppeteer to scrape Reddit, so it requires Chrome/Chromium to be installed
- It respects Reddit's rate limits and uses a realistic user agent
- Albums are imported with `created_by: 'reddit-import'` to track their source
- Duplicate albums will be skipped (based on Spotify URL)
