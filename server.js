import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseFeed } from './news.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const port = Number(process.env.PORT ?? 3000);
const feedUrl = 'https://news.google.com/rss/search?q=stock%20market%20OR%20earnings%20OR%20NIFTY&hl=en-IN&gl=IN&ceid=IN:en';
let cache = { expires: 0, items: [] };

async function news() {
  if (Date.now() < cache.expires) return cache.items;
  const response = await fetch(feedUrl, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'StockMarketNewsApp/1.0' } });
  if (!response.ok) throw new Error(`News feed returned ${response.status}`);
  const items = parseFeed(await response.text()).slice(0, 80);
  if (!items.length) throw new Error('News feed is empty');
  cache = { expires: Date.now() + 5 * 60_000, items };
  return items;
}

const files = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/style.css': ['style.css', 'text/css; charset=utf-8'] };
http.createServer(async (request, response) => {
  try {
    const route = new URL(request.url, 'http://localhost').pathname;
    if (route === '/api/news') {
      const items = await news();
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ items, fetchedAt: new Date().toISOString() }));
      return;
    }
    if (!files[route]) { response.writeHead(404); response.end('Not found'); return; }
    const [file, contentType] = files[route];
    response.writeHead(200, { 'Content-Type': contentType, 'X-Content-Type-Options': 'nosniff' });
    response.end(await readFile(path.join(root, file)));
  } catch (error) {
    response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: error.message }));
  }
}).listen(port, () => console.log(`Stock Market News App: http://localhost:${port}`));
