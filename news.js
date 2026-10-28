import { XMLParser } from 'fast-xml-parser';

const HIGH = /\b(earnings|profit warning|merger|acquisition|bankruptcy|fraud|rate cut|rate hike|interest rate|ipo|guidance|layoffs|sec|rbi|fed|results|dividend)\b/i;
const MEDIUM = /\b(shares?|stocks?|market|index|nifty|sensex|nasdaq|dow|s&p|trading|investors?|revenue|inflation)\b/i;
const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });

export function classify(title) {
  if (HIGH.test(title)) return { impact: 'high', category: 'Market moving' };
  if (MEDIUM.test(title)) return { impact: 'medium', category: 'Market update' };
  return { impact: 'low', category: 'General' };
}

export function parseFeed(xml) {
  const channel = parser.parse(xml)?.rss?.channel;
  const raw = channel?.item;
  if (!raw) return [];
  return (Array.isArray(raw) ? raw : [raw]).map((item) => {
    const title = String(item.title ?? '').trim();
    const link = String(item.link ?? '').trim();
    const source = typeof item.source === 'object' ? String(item.source['#text'] ?? '') : String(item.source ?? '');
    const parsedDate = new Date(item.pubDate ?? '');
    const publishedAt = Number.isNaN(parsedDate.getTime()) ? new Date(0).toISOString() : parsedDate.toISOString();
    return { id: String(item.guid?.['#text'] ?? item.guid ?? link), title, link, source, publishedAt, ...classify(title) };
  }).filter((item) => item.title && /^https:\/\//.test(item.link));
}
