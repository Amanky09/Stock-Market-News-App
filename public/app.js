const $ = (selector) => document.querySelector(selector);
const state = { items: [], impact: 'all', seen: new Set(JSON.parse(localStorage.getItem('seenArticles') || '[]')) };

function render() {
  const query = $('#search').value.trim().toLowerCase();
  const filtered = state.items.filter((item) => (state.impact === 'all' || item.impact === state.impact) && `${item.title} ${item.source}`.toLowerCase().includes(query));
  $('#total').textContent = state.items.length;
  $('#high-count').textContent = state.items.filter((item) => item.impact === 'high').length;
  $('#source-count').textContent = new Set(state.items.map((item) => item.source).filter(Boolean)).size;
  const list = $('#news');
  list.replaceChildren();
  for (const item of filtered) {
    const article = document.createElement('article');
    article.className = 'news-card';
    const label = document.createElement('span');
    label.className = `badge ${item.impact}`;
    label.textContent = item.impact === 'high' ? 'HIGH IMPACT' : item.impact === 'medium' ? 'MARKET UPDATE' : 'GENERAL';
    const date = document.createElement('time');
    date.dateTime = item.publishedAt;
    date.textContent = new Date(item.publishedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    const heading = document.createElement('h2');
    const link = document.createElement('a');
    link.href = item.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = item.title;
    heading.append(link);
    const source = document.createElement('p');
    source.className = 'source';
    source.textContent = item.source || 'News source';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.append(label, date);
    article.append(meta, heading, source);
    list.append(article);
  }
  $('#status').textContent = filtered.length ? `${filtered.length} headlines shown` : 'No headlines match this filter.';
}

async function refresh() {
  $('#refresh').disabled = true;
  $('#status').textContent = 'Loading current headlines…';
  try {
    const response = await fetch('/api/news');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'News feed unavailable');
    const freshHigh = data.items.filter((item) => item.impact === 'high' && !state.seen.has(item.id));
    state.items = data.items;
    if ($('#alerts').checked && Notification.permission === 'granted' && state.seen.size) {
      freshHigh.slice(0, 3).forEach((item) => new Notification('Market headline', { body: item.title }));
    }
    state.seen = new Set(data.items.map((item) => item.id));
    localStorage.setItem('seenArticles', JSON.stringify([...state.seen].slice(0, 200)));
    $('#updated').textContent = `Updated ${new Date(data.fetchedAt).toLocaleTimeString()}`;
    render();
  } catch (error) {
    $('#status').textContent = `Could not load news: ${error.message}`;
  } finally {
    $('#refresh').disabled = false;
  }
}

document.querySelectorAll('[data-impact]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-impact]').forEach((other) => other.classList.remove('active'));
  button.classList.add('active');
  state.impact = button.dataset.impact;
  render();
}));
$('#search').addEventListener('input', render);
$('#refresh').addEventListener('click', refresh);
$('#alerts').checked = localStorage.getItem('alerts') === 'true';
$('#alerts').addEventListener('change', async (event) => {
  if (event.target.checked && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
  if (!('Notification' in window) || Notification.permission !== 'granted') event.target.checked = false;
  localStorage.setItem('alerts', event.target.checked);
});
refresh();
setInterval(refresh, 5 * 60_000);
