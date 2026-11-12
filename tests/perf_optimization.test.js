'use strict';
/* v1.6.2 全鏈路執行期效能最佳化與等價性微基準測試套件 (P1–P10 Equivalence & Performance Micro-Benchmark Suite)
 * 零外部依賴：僅使用 Node 內建 node:test、node:assert/strict、node:vm 與 node:perf_hooks。
 * 嚴格遵守 CODE_RULES.md：零動態字串求值、零單字母 t 變數遮蔽、純港式繁體中文（zh-HK）註解。 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');

const root = path.join(__dirname, '..');
const htmlSrc = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const engineSrc = fs.readFileSync(path.join(root, 'uk_engine.js'), 'utf8');
const swSrc = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

function extractFunction(src, name) {
  const m = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(').exec(src);
  assert.ok(m, '找不到函式：' + name);
  const startBrace = src.indexOf('{', m.index);
  let depth = 0;
  for (let idx = startBrace; idx < src.length; idx++) {
    if (src[idx] === '{') depth++;
    else if (src[idx] === '}' && --depth === 0) return src.slice(m.index, idx + 1);
  }
  throw new Error('大括號未閉合：' + name);
}

function loadVm(code, extraGlobals) {
  const ctx = vm.createContext(Object.assign({
    console,
    URL,
    Set,
    Map,
    Uint8Array,
    Int16Array,
    Int32Array,
    Float32Array,
    Float64Array,
    ArrayBuffer,
    DataView,
    Blob,
    Promise,
    Math,
    Date,
    Number,
    String,
    Boolean,
    Array,
    Object,
    RegExp,
    JSON,
    isNaN,
    parseInt,
    parseFloat,
    setTimeout,
    clearTimeout
  }, extraGlobals || {}));
  vm.runInContext(code, ctx);
  return ctx;
}

/* 建立輕量 DOM 節點模擬器（支援 DocumentFragment、children 追蹤、closest 與事件委派） */
function makeDomNode(tagName, ownerDoc) {
  const listeners = Object.create(null);
  const attrs = Object.create(null);
  const classes = new Set();
  const node = {
    tagName: String(tagName || 'DIV').toUpperCase(),
    id: '',
    type: '',
    value: '',
    disabled: false,
    textContent: '',
    _innerHTML: '',
    parentNode: null,
    children: [],
    style: { cssText: '', width: '', padding: '' },
    dataset: Object.create(null),
    classList: {
      add: (...names) => names.forEach(n => classes.add(n)),
      remove: (...names) => names.forEach(n => classes.delete(n)),
      toggle: (name, force) => {
        const shouldHave = force === undefined ? !classes.has(name) : Boolean(force);
        if (shouldHave) classes.add(name);
        else classes.delete(name);
        return shouldHave;
      },
      contains: (name) => classes.has(name)
    },
    get className() {
      return Array.from(classes).join(' ');
    },
    set className(val) {
      classes.clear();
      String(val || '').split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
    },
    get innerHTML() {
      return this._innerHTML;
    },
    set innerHTML(val) {
      this._innerHTML = String(val || '');
      this.children = [];
    },
    get childElementCount() {
      return this.children.length;
    },
    setAttribute(k, v) {
      const strVal = String(v);
      attrs[k] = strVal;
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
        this.dataset[camel] = strVal;
      }
    },
    getAttribute(k) {
      return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null;
    },
    appendChild(child) {
      if (!child) return child;
      if (child.isFragment) {
        const moved = child.children.slice();
        child.children.length = 0;
        moved.forEach(sub => {
          sub.parentNode = this;
          this.children.push(sub);
        });
        return child;
      }
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    contains(other) {
      let cur = other;
      while (cur) {
        if (cur === this) return true;
        cur = cur.parentNode;
      }
      return false;
    },
    closest(selector) {
      let cur = this;
      while (cur) {
        if (matchesSimpleSelector(cur, selector)) return cur;
        cur = cur.parentNode;
      }
      return null;
    },
    querySelector(selector) {
      for (let i = 0; i < this.children.length; i++) {
        const ch = this.children[i];
        if (matchesSimpleSelector(ch, selector)) return ch;
        if (ch.querySelector) {
          const found = ch.querySelector(selector);
          if (found) return found;
        }
      }
      return null;
    },
    addEventListener(evName, fn) {
      if (!listeners[evName]) listeners[evName] = [];
      listeners[evName].push(fn);
    },
    dispatchEvent(ev) {
      const list = listeners[ev.type] || [];
      list.forEach(fn => fn(ev));
    }
  };
  node.ownerDocument = ownerDoc || null;
  return node;
}

function matchesSimpleSelector(el, selector) {
  if (!el || el.isFragment) return false;
  if (selector === 'button') return el.tagName === 'BUTTON';
  if (selector === 'button[data-pb-act]') {
    return el.tagName === 'BUTTON' && Boolean(el.getAttribute('data-pb-act') || (el.dataset && el.dataset.pbAct));
  }
  if (selector.startsWith('#')) return el.id === selector.slice(1);
  if (selector.startsWith('.')) return el.classList && el.classList.contains(selector.slice(1));
  return false;
}

/* =========================================================================
 * P1: getProgressionState() Write-Through O(1) 快取等價性與 1,000 次讀取基準測試
 * ========================================================================= */
test('P1 getProgressionState: 1,000 次連續呼叫僅讀取 localStorage 1 次，且支援 saveProgressionState 寫穿、storage 事件與手動失效', () => {
  const lsStore = Object.create(null);
  let getItemCalls = 0;
  let setItemCalls = 0;
  const storageListeners = [];
  let mockToday = '2026-11-12';

  lsStore.uk_progression_state = JSON.stringify({
    xp: 420,
    level: 2,
    streakDays: 5,
    dailyDate: '2026-11-12',
    dailyReviewsDone: 2,
    readingsCount: 3,
    quests: { review: false, reading: true, chat: false },
    completedMissions: ['m1', 'm3']
  });

  const winMock = {
    addEventListener: (ev, fn) => {
      if (ev === 'storage') storageListeners.push(fn);
    }
  };

  const ctx = loadVm([
    "const LS_PROGRESSION = 'uk_progression_state';",
    'let _progressionCache = null;',
    "let _progressionDay = '';",
    extractFunction(engineSrc, 'localDayStr'),
    extractFunction(engineSrc, 'invalidateProgressionCache'),
    'window.addEventListener("storage", (ev) => { if (!ev || !ev.key || ev.key === LS_PROGRESSION) invalidateProgressionCache(); });',
    extractFunction(engineSrc, 'getProgressionState'),
    extractFunction(engineSrc, 'saveProgressionState'),
    'this.getProgressionState = getProgressionState;',
    'this.saveProgressionState = saveProgressionState;',
    'this.invalidateProgressionCache = invalidateProgressionCache;'
  ].join('\n'), {
    window: winMock,
    usageDay: () => mockToday,
    localStorage: {
      getItem: (k) => { getItemCalls++; return Object.prototype.hasOwnProperty.call(lsStore, k) ? lsStore[k] : null; },
      setItem: (k, v) => { setItemCalls++; lsStore[k] = String(v); }
    }
  });

  // Legacy 未快取基準（1,000 次同步 getItem + JSON.parse）
  const rawSample = lsStore.uk_progression_state;
  const legacyStart = performance.now();
  for (let i = 0; i < 1000; i++) {
    const parsed = JSON.parse(rawSample);
    assert.equal(parsed.xp, 420);
  }
  const legacyMs = performance.now() - legacyStart;

  // P1 最佳化後：1,000 次連續讀取只應觸發 1 次 localStorage.getItem
  getItemCalls = 0;
  const optStart = performance.now();
  let stateRef = null;
  for (let i = 0; i < 1000; i++) {
    stateRef = ctx.getProgressionState();
  }
  const optMs = performance.now() - optStart;

  assert.equal(getItemCalls, 1, `1,000 次呼叫只應讀取 localStorage 1 次（實際：${getItemCalls}）`);
  assert.equal(stateRef.xp, 420);
  assert.equal(stateRef.level, 2);
  assert.equal(stateRef.streakDays, 5);
  assert.deepEqual(Array.from(stateRef.completedMissions), ['m1', 'm3']);

  // 驗證 saveProgressionState 寫穿更新（不觸發額外 getItem）
  const updatedState = Object.assign({}, stateRef, { xp: 1050, level: 3 });
  ctx.saveProgressionState(updatedState);
  assert.equal(setItemCalls, 1);
  assert.equal(ctx.getProgressionState().xp, 1050);
  assert.equal(getItemCalls, 1, 'saveProgressionState 寫穿後讀取仍應命中記憶體快取');

  // 驗證跨分頁 storage 事件自動失效並重讀外部修改
  lsStore.uk_progression_state = JSON.stringify(Object.assign({}, updatedState, { xp: 2600, level: 4 }));
  storageListeners.forEach(fn => fn({ key: 'uk_progression_state' }));
  const reloaded = ctx.getProgressionState();
  assert.equal(reloaded.xp, 2600);
  assert.equal(getItemCalls, 2, 'storage 事件失效後應精準重讀 1 次');

  // 驗證 invalidateProgressionCache() 與跨日自動推進連勝
  mockToday = '2026-11-13';
  const nextDayState = ctx.getProgressionState();
  assert.equal(nextDayState.dailyDate, '2026-11-13');
  assert.equal(nextDayState.streakDays, 6);
  assert.equal(nextDayState.dailyReviewsDone, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(nextDayState.quests)), { review: false, reading: false, chat: false });

  ctx.invalidateProgressionCache();
  ctx.getProgressionState();
  assert.equal(getItemCalls, 4, '跨日讀取 1 次 + 手動失效後重讀 1 次');
  console.log(`[Perf P1] 1,000x getProgressionState: cached=${optMs.toFixed(3)}ms (getItem=1) vs uncached=${legacyMs.toFixed(3)}ms`);
});

/* =========================================================================
 * P2: idbDelBatch 單一交易批次刪除 & trimTtsCache 零 Blob 反序列化淘汰
 * ========================================================================= */
test('P2 idbDelBatch & trimTtsCache: 60 鍵合併於單一 readwrite 交易刪除，且已水合 trimTtsCache 零 store.get 反序列化', async () => {
  const idbData = new Map();
  let txCount = 0;
  let readwriteTxCount = 0;
  let getAllKeysCount = 0;
  let storeGetCount = 0;
  let storeDeleteCount = 0;

  for (let i = 0; i < 60; i++) {
    idbData.set('my:rec_' + i, { wav: 'mock_pcm_' + i });
  }

  const fakeDb = {
    transaction(storeName, mode) {
      assert.equal(storeName, 'audios');
      txCount++;
      if (mode === 'readwrite') readwriteTxCount++;
      const txObj = {
        oncomplete: null,
        onerror: null,
        objectStore() {
          return {
            delete(k) {
              storeDeleteCount++;
              idbData.delete(k);
            },
            getAllKeys() {
              getAllKeysCount++;
              const rq = { result: Array.from(idbData.keys()), onsuccess: null, onerror: null };
              Promise.resolve().then(() => { if (rq.onsuccess) rq.onsuccess(); });
              return rq;
            },
            get(k) {
              storeGetCount++;
              const rq = { result: idbData.get(k) || null, onsuccess: null, onerror: null };
              Promise.resolve().then(() => { if (rq.onsuccess) rq.onsuccess(); });
              return rq;
            }
          };
        }
      };
      Promise.resolve().then(() => { if (txObj.oncomplete) txObj.oncomplete(); });
      return txObj;
    }
  };

  const ctx = loadVm([
    'const ttsMetaMap = new Map();',
    'let ttsMetaHydrated = false;',
    extractFunction(htmlSrc, 'idbDelBatch'),
    extractFunction(htmlSrc, 'trimTtsCache'),
    'this.idbDelBatch = idbDelBatch;',
    'this.trimTtsCache = trimTtsCache;',
    'this.ttsMetaMap = ttsMetaMap;',
    'this.isHydrated = () => ttsMetaHydrated;'
  ].join('\n'), {
    window: {},
    idb: async () => fakeDb
  });

  // 1. 驗證 60 個音訊鍵透過 idbDelBatch 僅開啟 1 次 readwrite 交易（取代過往 60 次獨立交易）
  const keys60 = Array.from({ length: 60 }, (_, idx) => 'my:rec_' + idx);
  await ctx.idbDelBatch(['', null, ...keys60]);
  assert.equal(readwriteTxCount, 1, '60 個鍵必須在單一 readwrite 交易內批次刪除');
  assert.equal(storeDeleteCount, 60);
  assert.equal(idbData.size, 0);

  // 2. 冷啟動首次水合：寫入 6 筆含模擬肥大 Blob 的 TTS 快取項目，首次 trimTtsCache(10) 水合後不淘汰
  for (let i = 1; i <= 6; i++) {
    idbData.set('tts:en-GB:k' + i, { blob: new Uint8Array(32768), t: 1000 + i * 10, text: 'phrase ' + i });
  }
  txCount = 0;
  storeGetCount = 0;
  await ctx.trimTtsCache(10);
  assert.equal(ctx.isHydrated(), true, '首次呼叫後 ttsMetaHydrated 應設為 true');
  assert.equal(ctx.ttsMetaMap.size, 6);

  // 3. 已水合且未超限（size=6 <= limit=10）：必須 O(1) 短路返回，0 次 IDB 交易、0 次讀取！
  txCount = 0;
  getAllKeysCount = 0;
  storeGetCount = 0;
  await ctx.trimTtsCache(10);
  assert.equal(txCount, 0, '未超限時 trimTtsCache 必須達成 0 次 IndexedDB 交易');
  assert.equal(getAllKeysCount, 0);
  assert.equal(storeGetCount, 0);

  // 4. 已水合且新增 2 筆新快取（共 8 筆），裁剪至 limit=5：必須淘汰最舊 3 筆（k1, k2, k3），且 0 次 store.get（零 Blob 反序列化）！
  for (let i = 7; i <= 8; i++) {
    const key = 'tts:en-GB:k' + i;
    const ts = 1000 + i * 10;
    idbData.set(key, { blob: new Uint8Array(32768), t: ts, text: 'phrase ' + i });
    ctx.ttsMetaMap.set(key, ts);
  }
  txCount = 0;
  readwriteTxCount = 0;
  storeGetCount = 0;
  await ctx.trimTtsCache(5);

  assert.equal(storeGetCount, 0, '已水合淘汰時絕不可呼叫 store.get 反序列化音訊 Blob');
  assert.equal(readwriteTxCount, 1, '淘汰最舊 3 筆必須合併於單一 idbDelBatch 交易');
  assert.equal(ctx.ttsMetaMap.size, 5);
  assert.equal(idbData.has('tts:en-GB:k1'), false);
  assert.equal(idbData.has('tts:en-GB:k2'), false);
  assert.equal(idbData.has('tts:en-GB:k3'), false);
  assert.equal(idbData.has('tts:en-GB:k4'), true);
  assert.equal(idbData.has('tts:en-GB:k8'), true);
  console.log('[Perf P2] 60-key delete txCount=1 (vs 60); hydrated trimTtsCache storeGetCount=0, txCount=1');
});

/* =========================================================================
 * P3: filterStreamLines 串流雙語過濾與參考實作 100% 輸出等價性
 * ========================================================================= */
test('P3 filterStreamLines: 跨多行英文、> 中文譯文、全形空白、空字串與邊界條件與舊版 split/filter/join 100% 等價', () => {
  const ctx = loadVm([
    extractFunction(htmlSrc, 'filterStreamLines'),
    'this.filterStreamLines = filterStreamLines;'
  ].join('\n'));

  const legacyFilter = (content, hideZh, hideDe) =>
    String(content == null ? '' : content)
      .split('\n')
      .filter(line => (line.trimStart().startsWith('>') ? !hideZh : !hideDe))
      .join('\n');

  const samples = [
    '',
    null,
    undefined,
    '\n',
    '\n\n',
    'Mind the gap, please.',
    '> 請小心月台空隙。',
    'Could I grab a flat white, please?\n> 請問我可以要一杯馥芮白嗎？\nCheers, mate!\n   > 唔該晒，朋友！',
    '\t  > 帶縮排引用譯文\n\u3000> 全形空白開頭引用\nNormal English line with > inside\nTrailing newline\n',
    'Line 1\n\n> 譯文 1\n\nLine 2'
  ];
  const flagCombos = [
    [false, false],
    [true, false],
    [false, true],
    [true, true]
  ];

  for (const sample of samples) {
    for (const [hideZh, hideDe] of flagCombos) {
      const actual = ctx.filterStreamLines(sample, hideZh, hideDe);
      const expected = legacyFilter(sample, hideZh, hideDe);
      assert.equal(actual, expected, `不匹配：hideZh=${hideZh}, hideDe=${hideDe}, sample=${JSON.stringify(sample)}`);
    }
  }
});

/* =========================================================================
 * P4: 2,000 筆練習紀錄之弱點雷達與練習統計版本號記憶化基準測試
 * ========================================================================= */
test('P4 analyzeUserPhonemeWeaknesses & computeConvPracticeStats: 2,000 筆紀錄與未快取結果 100% 一致，100 次快取命中 < 5ms，版本遞增即時重算', () => {
  // 建構 100 段對話 × 20 筆練習紀錄 = 2,000 筆真實結構紀錄
  const phonemePool = ['θ', 'ð', 'v', 'ɫ', 'ɒ', 'iː', 'ʔ'];
  const confusedPool = ['s', 'd', 'w', 'u', 'ɔː', 'ɪ', 't'];
  const convs = [];
  let tsSeq = 1700000000000;
  for (let ci = 0; ci < 100; ci++) {
    const recs = [];
    for (let ri = 0; ri < 20; ri++) {
      tsSeq += 1000;
      const idxA = (ci + ri) % phonemePool.length;
      const idxB = (ci * 3 + ri) % phonemePool.length;
      recs.push({
        id: `rec_${ci}_${ri}`,
        t: tsSeq,
        score: 68 + ((ci + ri) % 25),
        fluency: 70 + ((ci * 2 + ri) % 20),
        prosody: 72 + ((ci + ri * 2) % 18),
        words: [
          {
            w: 'think_' + idxA,
            phonemes: [
              { p: phonemePool[idxA], s: 52 + (ri % 20), h: confusedPool[idxA] },
              { p: 'n', s: 92, h: 'n' }
            ]
          },
          {
            w: 'water_' + idxB,
            phonemes: [
              { p: phonemePool[idxB], s: 60 + (ci % 14), h: confusedPool[idxB] }
            ]
          }
        ]
      });
    }
    convs.push({ id: 'conv_' + ci, records: recs });
  }

  let currentRev = 1;
  const winMock = {
    getPracticeRecordsRev: () => currentRev,
    getConvs: () => convs
  };

  const ctx = loadVm([
    'const _weaknessMemo = new Map();',
    'let _weaknessMemoRev = -1;',
    'let _convStatsMemo = null;',
    extractFunction(engineSrc, 'resolvePhoneticGuideKey'),
    extractFunction(engineSrc, 'analyzeUserPhonemeWeaknesses'),
    extractFunction(engineSrc, 'computeConvPracticeStats'),
    'this.analyzeUserPhonemeWeaknesses = analyzeUserPhonemeWeaknesses;',
    'this.computeConvPracticeStats = computeConvPracticeStats;'
  ].join('\n'), {
    window: winMock,
    getPracticeRecordsRev: () => currentRev,
    getConvs: () => convs
  });

  // 1. 對比傳入淺拷貝陣列（強制繞過 liveConvs 快取走完整計算）與快取版結果 100% 一致
  const uncachedFresh = ctx.analyzeUserPhonemeWeaknesses(convs.slice(), 30);
  const firstMemoized = ctx.analyzeUserPhonemeWeaknesses(convs, 30);
  assert.deepEqual(JSON.parse(JSON.stringify(firstMemoized)), JSON.parse(JSON.stringify(uncachedFresh)));
  assert.ok(firstMemoized.length > 0, '應識別出弱點音素');

  // 2. 100 次重複呼叫（getPracticeRecordsRev 未變）：必須命中 O(1) 記憶化且總耗時 < 5ms！
  const memoStart = performance.now();
  for (let i = 0; i < 100; i++) {
    const res = ctx.analyzeUserPhonemeWeaknesses(convs, 30);
    assert.equal(res, firstMemoized, '版本未變時應回傳同一快取陣列參考');
  }
  const memoWeaknessMs = performance.now() - memoStart;
  assert.ok(memoWeaknessMs < 5, `100 次快取命中耗時應 < 5ms（實際：${memoWeaknessMs.toFixed(3)}ms）`);

  const statsFirst = ctx.computeConvPracticeStats(convs);
  assert.equal(statsFirst.totalPracticeCount, 2000);
  const statsStart = performance.now();
  for (let i = 0; i < 100; i++) {
    const st = ctx.computeConvPracticeStats(convs);
    assert.equal(st, statsFirst);
  }
  const memoStatsMs = performance.now() - statsStart;
  assert.ok(memoStatsMs < 5, `100 次統計快取命中耗時應 < 5ms（實際：${memoStatsMs.toFixed(3)}ms）`);

  // 3. 新增一筆極低分 /ʔ/ 練習紀錄並遞增 currentRev：必須立即失效舊快取並重新計算！
  const prevGlottal = firstMemoized.find(item => item.phoneme === 'ʔ');
  const prevGlottalCount = prevGlottal ? prevGlottal.count : 0;
  convs[99].records.push({
    id: 'rec_new_2001',
    t: tsSeq + 99999,
    score: 55,
    fluency: 58,
    prosody: 60,
    words: [
      {
        w: 'bottle',
        phonemes: [
          { p: 'ʔ', s: 30, h: 't' },
          { p: 'ʔ', s: 35, h: 't' },
          { p: 'ʔ', s: 40, h: 't' }
        ]
      }
    ]
  });
  currentRev++;

  const recomputed = ctx.analyzeUserPhonemeWeaknesses(convs, 30);
  assert.notEqual(recomputed, firstMemoized, '版本號遞增後必須重新計算而非回傳舊快取');
  const newGlottal = recomputed.find(item => item.phoneme === 'ʔ');
  assert.ok(newGlottal && newGlottal.count > prevGlottalCount, '新增最新紀錄後 /ʔ/ 弱點次數必須反映變化');
  const statsUpdated = ctx.computeConvPracticeStats(convs);
  assert.equal(statsUpdated.totalPracticeCount, 2001, '練習總數必須立即更新為 2,001 筆');
  console.log(`[Perf P4] 2,000 records x 100 cached calls: weakness=${memoWeaknessMs.toFixed(3)}ms, stats=${memoStatsMs.toFixed(3)}ms`);
});

/* =========================================================================
 * P5: calcEnvelope 480,000 取樣點（30s @ 16kHz）數學等價性（< 1e-12）與效能基準
 * ========================================================================= */
test('P5 calcEnvelope: 480,000 點 Int16Array 全部 60 格與舊版除以 32768 演算法誤差 < 1e-12，並通過 50 次迭代效能測試', () => {
  const ctx = loadVm([
    extractFunction(htmlSrc, 'calcEnvelope'),
    'this.calcEnvelope = calcEnvelope;'
  ].join('\n'));

  // 舊版參考演算法（含 subarray 配置與逐點 sample / 32768 除法）
  function legacyCalcEnvelope(pcm16, bins = 60) {
    if (!pcm16 || !pcm16.length) return new Float32Array(bins);
    let start = 0;
    let end = pcm16.length - 1;
    const silenceThresh = 250;
    while (start < pcm16.length && Math.abs(pcm16[start]) < silenceThresh) start++;
    while (end > start && Math.abs(pcm16[end]) < silenceThresh) end--;
    const active = pcm16.subarray(start, end + 1);
    if (!active.length) return new Float32Array(bins);

    const step = active.length / bins;
    const env = new Float32Array(bins);
    let maxRms = 0.0001;
    for (let i = 0; i < bins; i++) {
      const sIdx = Math.floor(i * step);
      const eIdx = Math.min(active.length, Math.floor((i + 1) * step));
      let sumSq = 0;
      const count = eIdx - sIdx;
      for (let j = sIdx; j < eIdx; j++) {
        const sample = active[j] / 32768;
        sumSq += sample * sample;
      }
      const rms = count > 0 ? Math.sqrt(sumSq / count) : 0;
      env[i] = rms;
      if (rms > maxRms) maxRms = rms;
    }
    for (let i = 0; i < bins; i++) env[i] = env[i] / maxRms;
    return env;
  }

  // 產生擬真 30 秒 16kHz（480,000 點）語音訊號：前段靜音、多段語音共振包絡、極值點 (-32768 / 32767) 與尾段靜音
  const N = 480000;
  const pcm16 = new Int16Array(N);
  for (let i = 0; i < N; i++) {
    if (i < 16000 || i >= N - 16000) {
      pcm16[i] = (i % 7) - 3; // 底噪 < 250
    } else {
      const envMod = 0.35 + 0.65 * Math.abs(Math.sin(i / 11000));
      const carrier = Math.sin(i * 0.137) * 0.7 + Math.cos(i * 0.053) * 0.3;
      pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(envMod * carrier * 28000)));
    }
  }
  pcm16[120000] = -32768;
  pcm16[240000] = 32767;

  const expectedEnv = legacyCalcEnvelope(pcm16, 60);
  const actualEnv = ctx.calcEnvelope(pcm16, 60);
  assert.equal(actualEnv.length, 60);

  let maxDelta = 0;
  for (let i = 0; i < 60; i++) {
    assert.equal(Number.isNaN(actualEnv[i]), false);
    const delta = Math.abs(actualEnv[i] - expectedEnv[i]);
    if (delta > maxDelta) maxDelta = delta;
    assert.ok(delta < 1e-12, `第 ${i} 格誤差過大：actual=${actualEnv[i]}, expected=${expectedEnv[i]}, delta=${delta}`);
  }

  // 全靜音訊號邊界檢查
  const silentEnv = ctx.calcEnvelope(new Int16Array(8000), 60);
  assert.equal(silentEnv.every(v => v === 0), true);

  // 50 次迭代計時對比
  const legT0 = performance.now();
  for (let r = 0; r < 50; r++) legacyCalcEnvelope(pcm16, 60);
  const legacy50Ms = performance.now() - legT0;

  const optT0 = performance.now();
  for (let r = 0; r < 50; r++) ctx.calcEnvelope(pcm16, 60);
  const opt50Ms = performance.now() - optT0;

  console.log(`[Perf P5] 50x calcEnvelope(480k samples): opt=${opt50Ms.toFixed(2)}ms vs legacy=${legacy50Ms.toFixed(2)}ms, maxDelta=${maxDelta}`);
});

/* =========================================================================
 * P6: 靜態英音特訓手風琴 DOM 複用、語塊本事件委派與重溫徽章計算去重
 * ========================================================================= */
test('P6 renderStagesDashboard & renderPhrasebookList: XP 變動不重建 #drillsAccordion 子節點、語系切換自動重繪、語塊本單一委派支援播放與刪除', () => {
  const domMap = Object.create(null);
  const mockDoc = {
    getElementById(id) {
      return domMap[id] || null;
    },
    createElement(tag) {
      return makeDomNode(tag, mockDoc);
    },
    createDocumentFragment() {
      const frag = makeDomNode('#fragment', mockDoc);
      frag.isFragment = true;
      return frag;
    }
  };

  [
    'stageBadgeIcon', 'stageNameTitle', 'stageDescText', 'xpLabel', 'xpFill',
    'dailyQuestsList', 'stageTargetsList', 'stageMissionsList', 'stageMissionsProgress',
    'drillsAccordion', 'phrasebookList', 'dueBadge', 'dueCountLabel',
    'masteredCountLabel', 'totalReviewCount', 'streakDaysLabel',
    'activeReviewCard', 'reviewEmptyCard'
  ].forEach(id => {
    const el = makeDomNode('div', mockDoc);
    el.id = id;
    domMap[id] = el;
  });

  let currentUiLang = 'zh';
  const playedTexts = [];
  const lsStore = Object.create(null);

  const ctx = loadVm([
    "const LS_PROGRESSION = 'uk_progression_state';",
    "const LS_REVIEWS = 'uk_reviews_deck';",
    'let _progressionCache = null;',
    "let _progressionDay = '';",
    'let _drillsRenderedDataRef = null;',
    "let _drillsRenderedLang = '';",
    'let reviewsCache = [];',
    'let reviewsIdbOk = true;',
    'let activeReviewItem = null;',
    "let phrasebookSearchQuery = '';",
    'let phrasebookRenderLimit = 50;',
    'const ukStagesData = [{ level: 1, name: "Survival UK", badge: "🥉", xpRequired: 300, targets: { conversations: 5 }, missions: [{ id: "m1", title: "買咖啡", category: "日常", xp: 40 }] }];',
    'const ukDrillsData = [{ category: "Linking R", description: "詞尾 r 連音", examples: [{ text: "Far away", note: "far‿away" }] }];',
    extractFunction(engineSrc, 'localDayStr'),
    extractFunction(engineSrc, 'getProgressionState'),
    extractFunction(engineSrc, 'saveProgressionState'),
    extractFunction(engineSrc, 'addProgressionXp'),
    extractFunction(engineSrc, 'computeConvPracticeStats'),
    extractFunction(engineSrc, 'renderDrillsAccordion'),
    extractFunction(engineSrc, 'renderStagesDashboard'),
    extractFunction(engineSrc, 'getDueReviews'),
    extractFunction(engineSrc, 'updateDueBadge'),
    extractFunction(engineSrc, 'persistReviewsCache'),
    extractFunction(engineSrc, 'deleteReviewItem'),
    extractFunction(engineSrc, 'renderReviewStudio'),
    extractFunction(engineSrc, 'renderPhrasebookList'),
    'this.renderStagesDashboard = renderStagesDashboard;',
    'this.addProgressionXp = addProgressionXp;',
    'this.renderPhrasebookList = renderPhrasebookList;',
    'this.setReviews = (arr) => { reviewsCache = arr; };',
    'this.getReviews = () => reviewsCache;'
  ].join('\n'), {
    document: mockDoc,
    window: {},
    localStorage: {
      getItem: (k) => lsStore[k] || null,
      setItem: (k, v) => { lsStore[k] = String(v); }
    },
    peekSettings: () => ({ uiLang: currentUiLang }),
    getSettings: () => ({ uiLang: currentUiLang }),
    t: (k) => (currentUiLang === 'en' ? 'Load into Practice' : '載入句子練習'),
    esc: (s) => String(s == null ? '' : s),
    renderPersonalWeaknessRadar: () => {},
    renderActiveReviewCard: () => {},
    launchStageMission: () => {},
    switchTab: () => {},
    selectSentence: () => {},
    playUkVoice: (txt) => { playedTexts.push(txt); },
    idbReviewDel: async () => {},
    idbReviewPut: async () => {},
    idbReviewsSyncBatch: async () => true
  });

  // 1. 首次渲染儀表板建立 #drillsAccordion 節點；隨後連續增加 XP 重繪，子節點參考與展開狀態必須 100% 保留！
  ctx.renderStagesDashboard();
  assert.equal(domMap.drillsAccordion.children.length, 1);
  const firstDrillBlock = domMap.drillsAccordion.children[0];
  firstDrillBlock._userExpandedState = true;

  ctx.addProgressionXp(25, '完成跟讀');
  ctx.addProgressionXp(30, '完成重溫');
  ctx.renderStagesDashboard();

  assert.equal(domMap.drillsAccordion.children.length, 1);
  assert.equal(domMap.drillsAccordion.children[0], firstDrillBlock, '語系未變時多次重繪不得銷毀重建 #drillsAccordion 子節點');
  assert.equal(domMap.drillsAccordion.children[0]._userExpandedState, true, '使用者展開之手風琴狀態必須保留');
  assert.ok(domMap.xpLabel.textContent.includes('115 / 300 XP'), 'XP 標籤應正常更新（60 + 25 + 30 = 115）');

  // 切換介面語系（zh -> en）時應觸發重繪更新按鈕文案
  currentUiLang = 'en';
  ctx.renderStagesDashboard();
  assert.notEqual(domMap.drillsAccordion.children[0], firstDrillBlock, '切換語系後應重新渲染特訓手風琴');

  // 2. 驗證語塊本（Phrasebook）單一容器事件委派支援 play 與 del
  ctx.setReviews([
    { id: 'card_1', text: 'Bob’s your uncle!', translation: '萬事搞掂！', reps: 4, dueDate: Date.now() - 1000 },
    { id: 'card_2', text: 'It’s chucking it down.', translation: '出面落緊傾盆大雨。', reps: 1, dueDate: Date.now() - 1000 }
  ]);
  ctx.renderPhrasebookList();
  assert.equal(domMap.phrasebookList._pbDelegated, true, '#phrasebookList 應標記已掛載單一委派監聽器');
  assert.equal(domMap.phrasebookList.children.length, 2);

  const firstRowPlayBtn = domMap.phrasebookList.children[0].querySelector('button[data-pb-act]');
  assert.ok(firstRowPlayBtn);
  domMap.phrasebookList.dispatchEvent({ type: 'click', target: firstRowPlayBtn });
  assert.deepEqual(playedTexts, ['Bob’s your uncle!']);

  // 觸發第二列刪除按鈕（[data-pb-act="del"]）
  const secondRowActions = domMap.phrasebookList.children[1].children[1];
  const secondRowDelBtn = secondRowActions.children[2];
  assert.equal(secondRowDelBtn.getAttribute('data-pb-act'), 'del');
  domMap.phrasebookList.dispatchEvent({ type: 'click', target: secondRowDelBtn });
  assert.equal(ctx.getReviews().length, 1);
  assert.equal(ctx.getReviews()[0].id, 'card_1');
  assert.equal(domMap.dueBadge.textContent, 1);
});

/* =========================================================================
 * P7: estTokens、annotateConnectedSpeech、detectCardPhoneticGuides 等價檢驗
 * ========================================================================= */
test('P7 estTokens / annotateConnectedSpeech / detectCardPhoneticGuides: 與舊版正規表達式實作在英中日韓、Emoji、連音、弱讀與 7 大口型提示 100% 等價', () => {
  const escLineMatch = /^const esc\s*=\s*.*$/m.exec(htmlSrc);
  assert.ok(escLineMatch, '找不到 const esc 宣告');
  const ctx = loadVm([
    escLineMatch[0],
    extractFunction(htmlSrc, 'estTokens'),
    'const CONN_WEAK_WORDS_SET = new Set(["to", "for", "of", "and", "from", "at", "can", "have", "has", "was", "than", "a", "an"]);',
    'const CONN_SPLIT_WS_RE = /(\\s+)/;',
    'const CONN_HAS_WORD_RE = /\\w+/;',
    "const CONN_TRIM_NON_ALPHA_RE = /^[^a-zA-Z']+|[^a-zA-Z']+$/g;",
    'const CONN_SENT_END_WORD_RE = /[.!?]["\')\\]]*$/;',
    'const CONN_SENT_END_SEP_RE = /[.!?]/;',
    'const CONN_LEAD_QUOTE_RE = /^["\'(\\[]+/;',
    'const CONN_ONLY_WS_RE = /^\\s+$/;',
    "const CONN_LINK_R_PREV_RE = /^[a-zA-Z'-]*(?:r|re)$/i;",
    'const CONN_LINK_R_NEXT_RE = /^[aeiou]/i;',
    'const CONN_HTML_ESC_RE = /[&<>"\']/g;',
    "const CONN_HTML_ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' };",
    extractFunction(engineSrc, 'annotateConnectedSpeech'),
    extractFunction(engineSrc, 'detectCardPhoneticGuides'),
    'this.estTokens = estTokens;',
    'this.annotateConnectedSpeech = annotateConnectedSpeech;',
    'this.detectCardPhoneticGuides = detectCardPhoneticGuides;',
    'this.esc = esc;'
  ].join('\n'));

  // 1. estTokens 對照舊版逐字正規表達式
  function legacyEstTokens(s) {
    s = String(s || '');
    let cjk = 0;
    let other = 0;
    for (const ch of s) {
      if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff\uff40-\uffef]/.test(ch)) cjk++;
      else other++;
    }
    return Math.ceil(cjk + other / 4);
  }

  const tokenSamples = [
    '',
    'Good morning from London! 🇬🇧☕🔥',
    '請問去倫敦地鐵站點行？Mind the gap!',
    'ひらがな カタカナ 한글 㐀㑧 豈更 Ｆｕｌｌｗｉｄｔｈ 12345',
    '𠜎𠜱𠝹𠱓 Surrogate pairs mix 測試文本'
  ];
  for (const s of tokenSamples) {
    assert.equal(ctx.estTokens(s), legacyEstTokens(s), `estTokens 不一致：${s}`);
  }

  // 2. annotateConnectedSpeech 對照舊版函式內建 Set/RegExp 實作（涵蓋句中弱讀、句尾強讀保留、Linking R、引號與連續呼叫無 lastIndex 污染）
  function legacyAnnotateConnectedSpeech(sent, enabled) {
    const weakSet = new Set(['to', 'for', 'of', 'and', 'from', 'at', 'can', 'have', 'has', 'was', 'than', 'a', 'an']);
    const parts = String(sent || '').split(/(\s+)/);
    let lastWordIdx = -1;
    for (let k = parts.length - 1; k >= 0; k--) {
      if (/\w+/.test(parts[k])) { lastWordIdx = k; break; }
    }
    let out = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      if (/\w+/.test(part)) {
        const cleanLower = part.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '').toLowerCase();
        const nextSep = parts[i + 1] || '';
        const beforeSentEnd = (i === lastWordIdx) || /[.!?]["')\]]*$/.test(part) || /[.!?]/.test(nextSep);
        let cls = 'rd-word';
        let titleAttr = '';
        if (enabled && weakSet.has(cleanLower) && !beforeSentEnd) {
          cls += ' rd-weak';
          titleAttr = ' title="英式虛詞弱讀 (Weak Form)：輕讀短促 /ə/"';
        }
        out += `<span class="${cls}" style="cursor:pointer"${titleAttr}>${ctx.esc(part)}</span>`;
      } else {
        const prevPart = i > 0 ? parts[i - 1] : '';
        const nextPart = i + 1 < parts.length ? parts[i + 1] : '';
        const prevClean = prevPart.replace(/^["'(\[]+/, '');
        const isLinkingR = enabled
          && /^\s+$/.test(part)
          && prevClean.length >= 2
          && /^[a-zA-Z'-]*(?:r|re)$/i.test(prevClean)
          && /^[aeiou]/i.test(nextPart);
        if (isLinkingR) {
          out += ' <span class="conn-link-r" title="英式連音 Linking R：詞尾 r 與下一個母音連讀">‿r</span> ';
        } else {
          out += ctx.esc(part);
        }
      }
    }
    return out;
  }

  const connSentences = [
    'Far away from a cup of tea, what is it for?',
    '"More apples and a pear," said Arthur at once!',
    'Can you have a look at the car engine <script>alert(1)</script>?'
  ];
  for (let round = 0; round < 5; round++) {
    for (const sent of connSentences) {
      assert.equal(ctx.annotateConnectedSpeech(sent, true), legacyAnnotateConnectedSpeech(sent, true));
      assert.equal(ctx.annotateConnectedSpeech(sent, false), legacyAnnotateConnectedSpeech(sent, false));
    }
  }

  // 3. detectCardPhoneticGuides 7 組發音提示全覆蓋與舊版正規表達式實作 100% 等價驗證
  function legacyDetectCardPhoneticGuides(text) {
    const str = (text || '').toLowerCase();
    const guides = [];
    const voicedThRegex = /\b(the|this|that|these|those|there|their|theirs|they|them|then|than|though|although|brother|mother|father|weather|leather|feather|together|breathe|with|either|neither|other|another|smooth)\b/i;
    const anyThRegex = /\b\w*th\w*\b/i;
    const isVoicedTh = voicedThRegex.test(str);
    const hasTh = anyThRegex.test(str);
    if (isVoicedTh || str.includes('ð')) guides.push({ ph: 'ð', label: '👅 口型圖 /ð/' });
    if ((hasTh && !isVoicedTh) || str.includes('θ')) guides.push({ ph: 'θ', label: '👅 口型圖 /θ/' });
    if (/\b\w*v\w*\b/i.test(str) || str.includes('v')) guides.push({ ph: 'v', label: '👅 口型圖 /v/' });
    if (/[aeiou]l(?![aeiou])/i.test(str) || str.includes('ɫ') || str.includes('l_dark')) guides.push({ ph: 'l_dark', label: '👅 口型圖 [ɫ]' });
    if (/(?:ee|ea)|\b(?:sheet|shit|beach|bitch|seat|sit|leave|live|ship|sheep)\b/i.test(str) || str.includes('iː') || str.includes('ɪ')) guides.push({ ph: 'iː', label: '👅 口型圖 /iː/' });
    if (/\b(?:hot|cost|coffee|doctor|holiday|bottle|lot|pot|shop|clock|sock)\b/i.test(str) || str.includes('ɒ')) guides.push({ ph: 'ɒ', label: '👅 口型圖 /ɒ/' });
    if (/wa['’]er|bo['’]le|bu['’]er/i.test(str) || str.includes('ʔ')) guides.push({ ph: 'ʔ', label: '👅 口型圖 /ʔ/' });
    return guides;
  }

  const guideCases = [
    { txt: 'The weather in this smooth village is lovely.', expectedPh: ['ð', 'v', 'l_dark', 'iː'] },
    { txt: 'Think through three hot coffee bottles and cold milk!', expectedPh: ['θ', 'l_dark', 'iː', 'ɒ'] },
    { txt: "Pass a full bo'le of wa'er and a sheet of paper, please.", expectedPh: ['l_dark', 'iː', 'ʔ'] },
    { txt: 'IPA symbols /ð/ /θ/ /v/ [ɫ] /iː/ /ɒ/ /ʔ/', expectedPh: ['ð', 'θ', 'v', 'l_dark', 'iː', 'ɒ', 'ʔ'] }
  ];
  for (let round = 0; round < 5; round++) {
    for (const c of guideCases) {
      const actualGuides = JSON.parse(JSON.stringify(ctx.detectCardPhoneticGuides(c.txt)));
      const legacyGuides = legacyDetectCardPhoneticGuides(c.txt);
      assert.deepEqual(actualGuides, legacyGuides, `與舊版實作不一致：${c.txt}`);
      assert.deepEqual(actualGuides.map(g => g.ph), c.expectedPh, `口型識別不符：${c.txt}`);
    }
  }
});

/* =========================================================================
 * P8: PREHEAT_CONCURRENCY = 3 有界併發預熱池驗證與取消測試
 * ========================================================================= */
test('P8 runPreheatPool: PREHEAT_CONCURRENCY=3 於 12 句（30ms 延遲）嚴格維持 2<=maxActive<=3，完整處理 12 句且支援中途取消', async () => {
  let activeCount = 0;
  let maxActive = 0;
  const processed = [];

  const winMock = {
    ttsCached: async (sentence) => {
      activeCount++;
      if (activeCount > maxActive) maxActive = activeCount;
      await new Promise(resolve => setTimeout(resolve, 30));
      processed.push(sentence);
      activeCount--;
      return { cached: false };
    }
  };

  const ctx = loadVm([
    'const PREHEAT_CONCURRENCY = 3;',
    extractFunction(engineSrc, 'runPreheatPool'),
    'this.PREHEAT_CONCURRENCY = PREHEAT_CONCURRENCY;',
    'this.runPreheatPool = runPreheatPool;'
  ].join('\n'), {
    window: winMock
  });

  assert.equal(ctx.PREHEAT_CONCURRENCY, 3);

  const sentences12 = Array.from({ length: 12 }, (_, idx) => `Sentence #${idx + 1} for Tube preheating.`);
  const progressSteps = [];
  const wallStart = performance.now();
  const result = await ctx.runPreheatPool(
    sentences12,
    () => false,
    (completed, total, okCount) => {
      progressSteps.push({ completed, total, okCount });
    }
  );
  const wallMs = performance.now() - wallStart;

  assert.equal(result.completedCount, 12);
  assert.equal(result.successCount, 12);
  assert.equal(result.aborted, false);
  assert.equal(processed.length, 12);
  assert.equal(progressSteps.length, 12);
  assert.deepEqual(progressSteps[11], { completed: 12, total: 12, okCount: 12 });
  assert.ok(maxActive <= 3 && maxActive >= 2, `併發峰值必須介乎 2..3（實際 maxActive=${maxActive}）`);

  // 驗證中途取消（isAborted 轉為 true 時立即停止後續拉取）
  let abortFlag = false;
  let callsAfterStart = 0;
  winMock.ttsCached = async () => {
    callsAfterStart++;
    if (callsAfterStart >= 3) abortFlag = true;
    await new Promise(resolve => setTimeout(resolve, 15));
  };
  const abortedRes = await ctx.runPreheatPool(sentences12, () => abortFlag);
  assert.equal(abortedRes.aborted, true, '清空句子觸發取消時 aborted 應為 true');
  assert.ok(callsAfterStart < 12, `取消後不應繼續拉取剩餘句子（實際呼叫 ${callsAfterStart}/12）`);
  console.log(`[Perf P8] 12x30ms preheat pool: wall=${wallMs.toFixed(1)}ms (vs ~360ms+ sequential), maxActive=${maxActive}`);
});

/* =========================================================================
 * P9: wrapLines 前綴和（nonSpPrefix）與字寬 Map 快取等價性測試
 * ========================================================================= */
test('P9 wrapLines: 中英混排、標點避讓與多空白字串於貪心及均衡模式與舊版 .slice().every() 100% 等價，且快取重複權杖寬度', () => {
  const ctx = loadVm([
    extractFunction(htmlSrc, 'wrapLines'),
    'this.wrapLines = wrapLines;'
  ].join('\n'));

  // 舊版參考實作（含動態規劃內層 items.slice(cuts[i - 1], j).every(x => x.sp)）
  function legacyWrapLines(g, text, maxW, balance) {
    const tokens = String(text || '').match(/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+|\s+|[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g) || [];
    const items = [];
    for (const tk of tokens) {
      if (/^\s+$/.test(tk)) {
        if (items.length && !items[items.length - 1].sp) items.push({ t: ' ', sp: true });
      } else {
        items.push({ t: tk, sp: false });
      }
    }
    const spaceW = g.measureText(' ').width;
    items.forEach(it => { it.w = it.sp ? spaceW : g.measureText(it.t).width; });
    const pretty = arr => arr.map(x => x.t).join('').trim();

    const greedyCuts = [0];
    let lw = 0;
    for (let k = 0; k < items.length; k++) {
      const it = items[k];
      if (!it.sp && lw > 0 && lw + it.w > maxW) { greedyCuts.push(k); lw = 0; }
      lw += it.w;
    }
    greedyCuts.push(items.length);
    const n = greedyCuts.length - 1;
    if (!balance || n < 2) {
      const gl = [];
      for (let i = 0; i < n; i++) gl.push(pretty(items.slice(greedyCuts[i], greedyCuts[i + 1])));
      return gl;
    }

    const CLOSE_P = '。？！；：，、）》」…—·';
    const OPEN_P = '（《「『【';
    const cum = [0];
    items.forEach(it => cum.push(cum[cum.length - 1] + it.w));
    const total = cum[cum.length - 1];
    const cuts = [0];
    for (let i = 1; i < n; i++) {
      const goal = total * i / n;
      let best = cuts[i - 1] + 1;
      let bd = Infinity;
      for (let j = cuts[i - 1] + 1; j <= items.length - (n - i); j++) {
        if (items.slice(cuts[i - 1], j).every(x => x.sp)) continue;
        const lineW = cum[j] - cum[cuts[i - 1]];
        const restW = total - cum[j];
        let d = Math.abs(cum[j] - goal);
        if (lineW > maxW) d += 1000;
        if (restW > (n - i) * maxW) d += 1000;
        const next = items[j];
        const prev = items[j - 1];
        if (next && !next.sp && CLOSE_P.includes(next.t)) d += 60;
        if (prev && !prev.sp && OPEN_P.includes(prev.t)) d += 60;
        if (d < bd) { bd = d; best = j; }
      }
      cuts.push(best);
    }
    cuts.push(items.length);
    const lines = [];
    for (let i = 0; i < n; i++) lines.push(pretty(items.slice(cuts[i], cuts[i + 1])));
    let ok = true;
    for (let i = 0; i < n; i++) {
      if (!lines[i]) { ok = false; break; }
      let w = 0;
      for (let k = cuts[i]; k < cuts[i + 1]; k++) w += items[k].w;
      if (w > maxW + 1) {
        const widest = Math.max.apply(null, items.slice(cuts[i], cuts[i + 1]).filter(it => !it.sp).map(it => it.w));
        if (widest <= maxW) { ok = false; break; }
      }
    }
    if (!ok) {
      const gl = [];
      for (let i = 0; i < n; i++) gl.push(pretty(items.slice(greedyCuts[i], greedyCuts[i + 1])));
      return gl;
    }
    return lines;
  }

  let measureCalls = 0;
  const mockGraphics = {
    measureText(str) {
      measureCalls++;
      let width = 0;
      for (const ch of String(str)) {
        width += ch.charCodeAt(0) > 255 ? 18 : 9.5;
      }
      return { width };
    }
  };

  const wrapSamples = [
    '',
    '   ',
    'Short quote.',
    '在倫敦地鐵（Tube）聽到「Mind the gap, please!」，其實承載住半個世紀嘅英倫廣播歷史。',
    'Practice   makes   perfect:   repeat   the   phrase,   listen   to   the   rhythm,   and   keep   going！',
    '「英式委婉語（Understatement）」——當英國人講『Not too bad』，意思往往係「非常好」！'
  ];

  for (const sample of wrapSamples) {
    for (const maxW of [140, 220, 320]) {
      for (const bal of [false, true]) {
        const actual = Array.from(ctx.wrapLines(mockGraphics, sample, maxW, bal));
        const expected = legacyWrapLines(mockGraphics, sample, maxW, bal);
        assert.deepEqual(actual, expected, `wrapLines 斷行不一致：balance=${bal}, maxW=${maxW}, sample=${sample}`);
      }
    }
  }

  // 驗證重複單詞字寬快取（重複 20 次 'the' 只應呼叫 measureText('the') 1 次 + 空白 1 次 = 2 次）
  measureCalls = 0;
  const repeatedText = Array.from({ length: 20 }, () => 'the').join(' ');
  ctx.wrapLines(mockGraphics, repeatedText, 120, true);
  assert.equal(measureCalls, 2, `20 個重複單詞與空白只應觸發 2 次 measureText（實際：${measureCalls}）`);
});

/* =========================================================================
 * P10: sw.js CACHE='sprechmate-uk-v12' 與 getAppCache() 單例控制代碼記憶化
 * ========================================================================= */
test('P10 sw.js: CACHE=sprechmate-uk-v12、跨 install 與多次 fetch 僅呼叫 caches.open 1 次，且開啟失敗時自動重置重試', async () => {
  const listeners = Object.create(null);
  const storedEntries = new Map();
  let openCalls = 0;
  let shouldFailFirstOpen = true;
  let fetchImpl = null;

  const mockCacheHandle = {
    async addAll(assets) {
      assets.forEach(a => storedEntries.set('http://127.0.0.1:8000/' + a.replace(/^\.\//, ''), { status: 200, body: 'precached:' + a }));
    },
    async match(req) {
      const key = typeof req === 'string'
        ? ('http://127.0.0.1:8000/' + req.replace(/^\.\//, ''))
        : req.url;
      return storedEntries.get(key) || null;
    },
    async put(req, res) {
      storedEntries.set(req.url, res);
    }
  };

  const swCtx = loadVm(swSrc + '\nthis.CACHE = CACHE;\nthis.getAppCache = getAppCache;', {
    AbortController,
    Response: class {
      constructor(body, init) {
        this.body = body;
        this.status = (init && init.status) || 200;
        this.ok = this.status >= 200 && this.status < 300;
        this.headers = { get: () => 'text/plain' };
      }
    },
    self: {
      location: { origin: 'http://127.0.0.1:8000' },
      skipWaiting: () => {},
      clients: { claim: () => {} },
      addEventListener: (ev, fn) => { listeners[ev] = fn; }
    },
    caches: {
      open: async (cacheName) => {
        assert.equal(cacheName, 'sprechmate-uk-v12');
        openCalls++;
        if (shouldFailFirstOpen) {
          shouldFailFirstOpen = false;
          throw new Error('Transient IDB lock');
        }
        return mockCacheHandle;
      },
      keys: async () => ['sprechmate-uk-v11', 'sprechmate-uk-v12'],
      delete: async () => true
    },
    fetch: (req, init) => fetchImpl(req, init)
  });

  assert.equal(swCtx.CACHE, 'sprechmate-uk-v12');

  // 1. 若首次 caches.open 暫態失敗，cachePromise 必須重置為 null，使後續呼叫可成功自癒
  await assert.rejects(() => swCtx.getAppCache(), /Transient IDB lock/);
  assert.equal(openCalls, 1);

  // 2. 自癒後執行 install + 連續 5 次正常網絡寫回 + 3 次離線回退，全程只應再呼叫 caches.open 1 次（累計 openCalls === 2，穩態 === 1）！
  openCalls = 0;
  let installPromise = null;
  listeners.install({ waitUntil: (p) => { installPromise = p; } });
  await installPromise;
  assert.equal(openCalls, 1, 'install 應開啟並記憶化 Cache 控制代碼');

  fetchImpl = async (req) => ({
    ok: true,
    status: 200,
    type: 'basic',
    redirected: false,
    body: 'fresh:' + req.url,
    headers: { get: (h) => (h.toLowerCase() === 'content-type' ? 'application/javascript' : '') },
    clone() { return Object.assign({}, this); }
  });

  for (let i = 0; i < 5; i++) {
    let resPromise = null;
    const bgTasks = [];
    listeners.fetch({
      request: { url: 'http://127.0.0.1:8000/uk_engine.js', method: 'GET', mode: 'cors' },
      respondWith: (p) => { resPromise = p; },
      waitUntil: (p) => { bgTasks.push(p); }
    });
    const res = await resPromise;
    await Promise.all(bgTasks);
    assert.equal(res.body, 'fresh:http://127.0.0.1:8000/uk_engine.js');
  }

  // 模擬離線失敗：走 getCachedFallback 直接讀取已記憶化 mockCacheHandle.match
  fetchImpl = async () => { throw new Error('Offline'); };
  for (let i = 0; i < 3; i++) {
    let resPromise = null;
    listeners.fetch({
      request: { url: 'http://127.0.0.1:8000/uk_engine.js', method: 'GET', mode: 'cors' },
      respondWith: (p) => { resPromise = p; },
      waitUntil: () => {}
    });
    const fallbackRes = await resPromise;
    assert.equal(fallbackRes.body, 'fresh:http://127.0.0.1:8000/uk_engine.js');
  }

  assert.equal(openCalls, 1, `跨 install + 8 次 fetch 事件，caches.open(CACHE) 只應執行 1 次（實際：${openCalls}）`);
  console.log('[Perf P10] sw.js v12 getAppCache(): openCalls=1 across install + 8 fetch events');
});
