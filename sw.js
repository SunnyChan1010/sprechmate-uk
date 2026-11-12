/* 英國英語口語練習 Service Worker
 * 作用：滿足 Chrome PWA 可安裝要求（必須有帶 fetch 處理的 SW）+ 弱網/離線兜底。
 * 策略：本站 GET 請求走網絡優先（帶超時競速與 AbortController 中止），失敗或弱網超時時讀已記憶化之快取控制代碼；
 *       同時防禦公共 Wi-Fi Captive Portal 將 text/html 寫入非 HTML 資產快取；API 與 CDN 請求不攔截。
 * 注意：更新 index.html 後重新整理頁面即生效，無需手動清快取。
 */
const CACHE = 'sprechmate-uk-v12';
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

let cachePromise = null;
function getAppCache() {
  if (!cachePromise) {
    cachePromise = caches.open(CACHE).catch((err) => {
      cachePromise = null;
      throw err;
    });
  }
  return cachePromise;
}

function matchCacheEntry(cacheHandle, reqOrKey, opts) {
  if (cacheHandle && typeof cacheHandle.match === 'function') {
    return opts ? cacheHandle.match(reqOrKey, opts) : cacheHandle.match(reqOrKey);
  }
  if (typeof caches !== 'undefined' && typeof caches.match === 'function') {
    return opts ? caches.match(reqOrKey, opts) : caches.match(reqOrKey);
  }
  return Promise.resolve(null);
}

function getCachedFallback(req) {
  const isNav = Boolean(req && req.mode === 'navigate');
  return getAppCache()
    .then((c) =>
      matchCacheEntry(c, req, { ignoreSearch: isNav }).then((cached) => {
        if (cached) return cached;
        if (!isNav) return null;
        return matchCacheEntry(c, './index.html')
          .then((htmlRes) => htmlRes || matchCacheEntry(c, 'index.html'))
          .then((htmlRes) => htmlRes || matchCacheEntry(c, './'));
      })
    )
    .catch(() => null);
}

self.addEventListener('install', (e) => {
  // 打卡相片不再於安裝時預下載（約 40 張）：首次使用時由下方 fetch 處理器按需快取
  e.waitUntil(
    getAppCache().then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
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
  // 只接管本站 GET（頁面 / manifest / 圖示）；API 與 CDN 直接放行
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isNav = e.request.mode === 'navigate';
  const expectsHtml = isNav || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  const timeoutMs = isNav ? 3000 : 4000;
  const ac = new AbortController();
  let timerId = null;
  let settledFromCache = false;

  const clearTimer = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const networkFetch = Promise.resolve()
    .then(() => fetch(e.request, { signal: ac.signal }))
    .then((res) => {
      const contentType = (
        (res && res.headers && typeof res.headers.get === 'function' && res.headers.get('content-type')) || ''
      ).toLowerCase();
      const isHtmlResp = contentType.includes('text/html');

      // 防禦公共 Wi-Fi Captive Portal 將 HTML 登入頁偽裝成 JS/CSS/JSON/圖片回傳並污染快取
      if (!expectsHtml && isHtmlResp) {
        return getCachedFallback(e.request).then((cached) => {
          if (cached) return cached;
          return new Response('Unexpected HTML response blocked for non-HTML asset', {
            status: 502,
            statusText: 'Bad Gateway'
          });
        });
      }

      const isSafeType = res && (res.type === 'basic' || res.type === 'default' || res.type === undefined);
      if (
        res &&
        res.ok &&
        res.status === 200 &&
        isSafeType &&
        !res.redirected &&
        !url.search &&
        !settledFromCache &&
        (expectsHtml || !isHtmlResp)
      ) {
        const clone = res.clone();
        e.waitUntil(
          getAppCache().then((c) => c.put(e.request, clone)).catch(() => {})
        );
      }
      return res;
    });
  // 清理計時器並避免在超時回退快取或離線失敗時產生未捕獲 Promise 拒絕
  networkFetch.then(clearTimer, clearTimer);

  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
  });

  e.respondWith(
    Promise.race([networkFetch, timeoutPromise]).catch(() =>
      getCachedFallback(e.request).then((cached) => {
        if (cached) {
          settledFromCache = true;
          ac.abort();
          return cached;
        }
        return networkFetch.catch(() => new Response('Offline', { status: 503, statusText: 'Offline' }));
      })
    )
  );
});
