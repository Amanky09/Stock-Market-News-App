# Stock Market News App

A focused market news dashboard that reads the public Google News RSS feed, labels headlines by keyword impact, and can show browser notifications for newly found high impact stories while the page is open.

## Run locally

Requires Node.js 20 or newer and an internet connection.

```bash
npm install
npm start
```

Open <http://localhost:3000>. Run `npm test` for the feed parser and priority rules.

## Features

- Fetches market headlines through a small Node server and caches them for five minutes.
- Labels stories as high impact, market update, or general using transparent keyword rules in `news.js`.
- Filters by impact and search text; links to original publishers.
- Optional desktop notifications for new high impact headlines while the tab is open.
- Handles an unavailable news feed with a visible error state.

The labels are heuristic, not trading advice or a measure of actual price impact. Browser notifications require user permission and a browser that supports them. The app has no account, background push service, or guaranteed instant delivery.
