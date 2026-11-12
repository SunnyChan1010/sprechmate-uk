/* 英國英語口語練習 Service Worker
 * 作用：滿足 Chrome PWA 可安裝要求（必須有帶 fetch 處理的 SW）+ 弱網/離線兜底。
 * 策略：本站 GET 請求走網路優先（帶超時競速），失敗或弱網超時時讀快取；API 與 CDN 請求不攔截。
 * 注意：更新 index.html 後刷新頁面即生效，無需手動清快取。
 */
const CACHE = 'sprechmate-uk-v10';
const ASSETS = [
  './',
  'index.html',
  'uk_engine.js',
  'quotes.js',
  'qrgen.js',
  'qr-scanner-worker.min.js',
  'manifest.json',
  'favicon-32.png',
  'icon-192.png',
  'icon-512.png',
  'uk_reading_presets.json',
  'uk_stages.json',
  'uk_drills.json'
];

self.addEventListener('install', (e) => {
  // 打卡照片不再於安裝時預下載（約 40 張）：首次使用時由下方 fetch 處理器按需快取
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // 只接管本站 GET（页面 / manifest / 图标）；API 与 CDN 直接放行
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const isNav = e.request.mode === 'navigate';
  const timeoutMs = isNav ? 3000 : 4000;

  const networkFetch = fetch(e.request).then((res) => {
    if (res && res.ok && res.status === 200 && !url.search) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
    }
    return res;
  });
  // 避免在超時 fallback 快取後，背景 networkFetch 失敗拋出未捕獲異常
  networkFetch.catch(() => {});

  let timerId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
  });
  networkFetch.finally(() => { if (timerId) clearTimeout(timerId); });

  e.respondWith(
    Promise.race([networkFetch, timeoutPromise]).catch(() =>
      caches.match(e.request, { ignoreSearch: isNav }).then((r) => {
        if (r) return r;
        if (isNav) return caches.match('index.html');
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
    )
  );
});
