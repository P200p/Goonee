// Service worker copy for docs (same behavior as original)
const SW_VERSION = 'v1';
const BALANCES = new Map();

self.addEventListener('install', (e) => {
  self.skipWaiting();
  console.log('sw-gamble installed', SW_VERSION);
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    console.log('sw-gamble activated', SW_VERSION);
  })());
});

// allow page to tell the SW to skipWaiting (used on deploy to force update)
self.addEventListener('message', (evt) => {
  try {
    const data = evt.data || {};
    if (data && data.type === 'SKIP_WAITING') {
      console.log('sw-gamble received SKIP_WAITING');
      self.skipWaiting();
    }
  } catch (err) { /* ignore */ }
});

function jsonResponse(obj, status = 200, delay = 200) {
  return new Promise((resolve) => setTimeout(() => resolve(new Response(JSON.stringify(obj), {
    status,
    headers: {'Content-Type': 'application/json'}
  })), delay));
}

self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);
  if (url.pathname.startsWith('/api/')) {
    evt.respondWith(handleApi(evt.request));
  }
});

async function handleApi(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/', '');
  const apiKey = req.headers.get('x-api-key') || '';
  if (!apiKey.startsWith('key-')) {
    return jsonResponse({error: 'missing_or_invalid_api_key'}, 401, 150);
  }

  try {
    if (path === 'login' && req.method === 'POST') {
      const body = await req.json();
      const user = body.username || 'anonymous';
      if (!BALANCES.has(user)) BALANCES.set(user, 1000);
      return jsonResponse({username: user, balance: BALANCES.get(user)} , 200, 120);
    }

    if (path === 'balance' && req.method === 'GET') {
      const user = url.searchParams.get('user') || 'anonymous';
      const bal = BALANCES.get(user) ?? 0;
      return jsonResponse({username: user, balance: bal}, 200, 200);
    }

    if (path === 'spin' && req.method === 'POST') {
      const body = await req.json();
      const user = body.username || 'anonymous';
      const bet = Number(body.bet) || 1;

      if (Math.random() < 0.08) return jsonResponse({error: 'rate_limited'}, 429, 300);

      let balance = BALANCES.get(user) ?? 0;
      if (balance < bet) return jsonResponse({error: 'insufficient_balance'}, 402, 100);

      const reels = [randSym(), randSym(), randSym()];
      let payout = 0;
      if (reels[0] === reels[1] && reels[1] === reels[2]) {
        payout = bet * (10 + reels[0]);
      } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        payout = bet * 2;
      } else {
        payout = -bet;
      }

      balance = Math.max(0, balance + payout);
      BALANCES.set(user, balance);

      const delay = 120 + Math.floor(Math.random() * 600);
      return jsonResponse({reels, payout, balance}, 200, delay);
    }

    return jsonResponse({error: 'not_found'}, 404, 80);
  } catch (err) {
    return jsonResponse({error: 'server_error', detail: String(err)}, 500, 80);
  }
}

function randSym(){ return Math.floor(Math.random() * 6); }
