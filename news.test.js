import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, parseFeed } from './news.js';

test('priority recognises material events', () => {
  assert.equal(classify('Company announces merger after earnings').impact, 'high');
  assert.equal(classify('Stocks rise as market opens').impact, 'medium');
});

test('RSS parser extracts a usable article', () => {
  const xml = '<rss><channel><item><title>Profit warning hits shares</title><link>https://example.com/story</link><guid>abc</guid><pubDate>Wed, 28 Oct 2026 12:00:00 GMT</pubDate><source>Example</source></item></channel></rss>';
  const articles = parseFeed(xml);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].impact, 'high');
  assert.equal(articles[0].source, 'Example');
});
