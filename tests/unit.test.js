'use strict';
/* 零依賴單元測試：node --test tests/
 * index.html / uk_engine.js 是瀏覽器腳本，這裡用「按名稱抽取函式原始碼 + vm 沙盒」載入純函式，不需改動產品代碼。 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'uk_engine.js'), 'utf8');

/* 抽取 `function name(...) { ... }`（以大括號配對；被抽函式內大括號須成對） */
function extractFunction(src, name) {
  const m = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(').exec(src);
  assert.ok(m, 'function not found: ' + name);
  let i = src.indexOf('{', m.index), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) return src.slice(m.index, j + 1);
  }
  throw new Error('unbalanced braces: ' + name);
}
function extractLine(src, re) {
  const m = re.exec(src);
  assert.ok(m, 'line not found: ' + re);
  return m[0];
}
function load(code, extra) {
  const ctx = vm.createContext(Object.assign({ console }, extra || {}));
  vm.runInContext(code, ctx);
  return ctx;
}

/* ---------- SM-2：calcNextReview ---------- */
const sm2 = load(extractFunction(engine, 'calcNextReview') + '\nthis.calcNextReview = calcNextReview;');
const base = { reps: 0, interval: 0, easeFactor: 2.5, lapses: 0 };

test('calcNextReview: Again 重置 reps、+1 lapse、降低 easeFactor（不低於 1.3）', () => {
  const r = sm2.calcNextReview({ reps: 5, interval: 20, easeFactor: 1.35, lapses: 0 }, 1);
  assert.equal(r.reps, 0);
  assert.equal(r.interval, 1);
  assert.equal(r.lapses, 1);
  assert.equal(r.easeFactor, 1.3);
});
test('calcNextReview: Good 首兩次固定 1、3 天，之後按 easeFactor 放大', () => {
  const a = sm2.calcNextReview(base, 3);
  assert.equal(a.interval, 1);
  const b = sm2.calcNextReview(a, 3);
  assert.equal(b.interval, 3);
  const c = sm2.calcNextReview(b, 3);
  assert.equal(c.interval, Math.round(3 * 2.5));
});
test('calcNextReview: Easy 首兩次 4、7 天且 easeFactor 上升', () => {
  const a = sm2.calcNextReview(base, 4);
  assert.equal(a.interval, 4);
  assert.equal(a.easeFactor, 2.65);
  assert.equal(sm2.calcNextReview(a, 4).interval, 7);
});
test('calcNextReview: 缺欄位（舊資料）有安全預設，dueDate 在未來', () => {
  const r = sm2.calcNextReview({}, 3);
  assert.equal(r.easeFactor, 2.5);
  assert.ok(r.dueDate > Date.now());
});

/* ---------- Markdown / XSS：mdInline ---------- */
const mdCtx = load([
  extractLine(html, /const esc = s =>.*$/m),
  extractFunction(html, 'mdInline'),
  'this.mdInline = mdInline; this.esc = esc;'
].join('\n'));

test('esc: 轉義 & < > " \' 五個字元', () => {
  assert.equal(mdCtx.esc(`&<>"'`), '&amp;&lt;&gt;&quot;&#39;');
});
test('mdInline: <script> 與 HTML 屬性逃逸被轉義', () => {
  const out = mdCtx.mdInline('<img src=x onerror=alert(1)> "q" \'s\'');
  assert.ok(!out.includes('<img'));
  assert.ok(!out.includes('"q"'));
});
test('mdInline: javascript:/data: 連結被丟棄，不產生 <a>', () => {
  assert.equal(mdCtx.mdInline('[x](javascript:void0)'), 'x');
  assert.equal(mdCtx.mdInline('[x](data:text/html,hi)'), 'x');
  assert.ok(!mdCtx.mdInline('[x](javascript:alert(1))').includes('<a')); // 巢狀括號：殘留 ")" 但無連結
});
test('mdInline: https 連結保留，且 & 只轉義一次（不出現 &amp;amp;）', () => {
  const out = mdCtx.mdInline('[go](https://a.com/?x=1&y=2)');
  assert.ok(out.includes('href="https://a.com/?x=1&amp;y=2"'));
  assert.ok(!out.includes('&amp;amp;'));
  assert.ok(out.includes('rel="noopener noreferrer"'));
});
test('mdInline: 粗體/斜體/行內碼', () => {
  assert.equal(mdCtx.mdInline('**b** *i* `c`'), '<strong>b</strong> <em>i</em> <code>c</code>');
});

/* ---------- 中英混排：isCjkDominant ---------- */
const cjk = load(extractFunction(html, 'isCjkDominant') + '\nthis.f = isCjkDominant;');
test('isCjkDominant: 中文點評行 true、英文句 false、短中文雜訊 false', () => {
  assert.equal(cjk.f('這句話的發音要注意連讀和語調'), true);
  assert.equal(cjk.f('Could you give me a hand with the self-checkout?'), false);
  assert.equal(cjk.f('好的'), false);
});

/* ---------- 同步碼：applySyncCode（原型污染 / 數值注入） ---------- */
function makeSync() {
  const store = {};
  const ctx = load([
    extractFunction(html, 'applySyncCode'),
    'this.applySyncCode = applySyncCode;'
  ].join('\n'), {
    deviceId: () => 'dlocaldevice01',
    loadRemoteSync: () => store,
    saveRemoteSync: () => {},
    refreshUsageUI: () => {}
  });
  return { ctx, store };
}
const GOOD = { id: 'dremotedev001', d: '2026-10-16', c: [1, 2, 3] };

test('applySyncCode: 合法載荷寫入遠端並回傳 ok', () => {
  const { ctx, store } = makeSync();
  assert.equal(ctx.applySyncCode(JSON.stringify(GOOD)), 'ok');
  assert.deepEqual(JSON.parse(JSON.stringify(store.dremotedev001)), { d: '2026-10-16', c: [1, 2, 3] });
});
test('applySyncCode: 本機 id 回傳 self', () => {
  const { ctx } = makeSync();
  assert.equal(ctx.applySyncCode(JSON.stringify({ ...GOOD, id: 'dlocaldevice01' })), 'self');
});
test('applySyncCode: __proto__ / 非法 id / 非法日期 / 長度不對 / 超長 / 非 JSON 一律 bad', () => {
  const { ctx, store } = makeSync();
  const bad = [
    '{"id":"__proto__","d":"2026-10-16","c":[9,9,9]}',
    JSON.stringify({ ...GOOD, id: 'x y' }),
    JSON.stringify({ ...GOOD, d: 'yesterday' }),
    JSON.stringify({ ...GOOD, c: [1, 2] }),
    'x'.repeat(600),
    'not json',
    null
  ];
  bad.forEach(p => assert.equal(ctx.applySyncCode(p), 'bad', String(p).slice(0, 40)));
  assert.equal(({}).polluted, undefined);
  assert.equal(Object.keys(store).length, 0);
});
test('applySyncCode: 計數被夾在 0–100000（負數、Infinity、字串）', () => {
  const { ctx, store } = makeSync();
  ctx.applySyncCode('{"id":"dremotedev002","d":"2026-10-16","c":[-5,1e308,"7"]}');
  assert.deepEqual(JSON.parse(JSON.stringify(store.dremotedev002.c)), [0, 100000, 7]);
});
test('applySyncCode: 遠端設備上限 20 台', () => {
  const { ctx, store } = makeSync();
  for (let i = 0; i < 25; i++) {
    ctx.applySyncCode(JSON.stringify({ ...GOOD, id: 'ddevice' + String(i).padStart(3, '0') }));
  }
  assert.ok(Object.keys(store).length <= 20);
});

/* ---------- Anki 匯出：sanitizeAnkiField ---------- */
const anki = load([
  extractLine(html, /const esc = s =>.*$/m),
  extractFunction(engine, 'sanitizeAnkiField'),
  'this.f = sanitizeAnkiField;'
].join('\n'));
test('sanitizeAnkiField: Tab/換行不會破壞 TSV 結構', () => {
  const out = anki.f('a\tb\r\nc\nd');
  assert.ok(!/[\t\r\n]/.test(out));
  assert.equal(out, 'a b<br>c<br>d');
});
test('sanitizeAnkiField: 公式前綴被中和、HTML 被轉義', () => {
  ['=SUM(A1)', '+1', '-1', '@x'].forEach(s => assert.ok(anki.f(s).startsWith(' ')));
  assert.equal(anki.f('<b>x</b>'), '&lt;b&gt;x&lt;/b&gt;');
});

/* ---------- 變數遮蔽檢驗：index.html & uk_engine.js ---------- */
test('變數遮蔽回歸檢驗: index.html 與 uk_engine.js 內不得有箭頭函式、參數或 catch (t) 遮蔽多語言全域函式 t(key, def)', () => {
  const checkSrc = (src, filename) => {
    const lines = src.split('\n');
    const violations = [];
    lines.forEach((line, idx) => {
      if (/\b(?:t\s*=>|\(t\)\s*=>|function\s*\(\s*t\b|catch\s*\(\s*t\b)/.test(line)) {
        violations.push(`${filename}:${idx + 1}: ${line.trim()}`);
      }
    });
    return violations;
  };
  const violations = [...checkSrc(html, 'index.html'), ...checkSrc(engine, 'uk_engine.js')];
  assert.equal(violations.length, 0, 'Found variable shadowing of t:\n' + violations.join('\n'));
});

/* ---------- 發音導引鍵值解析：resolvePhoneticGuideKey ---------- */
const phKeyCtx = load(extractFunction(engine, 'resolvePhoneticGuideKey') + '\nthis.resolve = resolvePhoneticGuideKey;');
test('resolvePhoneticGuideKey: 正確對應 7 組英音目標音素鍵值', () => {
  assert.equal(phKeyCtx.resolve('θ'), 'θ');
  assert.equal(phKeyCtx.resolve('/θ/'), 'θ');
  assert.equal(phKeyCtx.resolve('[θ]'), 'θ');
  assert.equal(phKeyCtx.resolve('ð'), 'ð');
  assert.equal(phKeyCtx.resolve('/ð/'), 'ð');
  assert.equal(phKeyCtx.resolve('v'), 'v');
  assert.equal(phKeyCtx.resolve('w'), 'v');
  assert.equal(phKeyCtx.resolve('l_dark'), 'l_dark');
  assert.equal(phKeyCtx.resolve('ɫ'), 'l_dark');
  assert.equal(phKeyCtx.resolve('l'), 'l_dark');
  assert.equal(phKeyCtx.resolve('iː'), 'iː');
  assert.equal(phKeyCtx.resolve('ɪ'), 'iː');
  assert.equal(phKeyCtx.resolve('i:'), 'iː');
  assert.equal(phKeyCtx.resolve('ɒ'), 'ɒ');
  assert.equal(phKeyCtx.resolve('ɔː'), 'ɒ');
  assert.equal(phKeyCtx.resolve('ʔ'), 'ʔ');
});

test('resolvePhoneticGuideKey: 非英音目標音素或空值回傳 null（不誤判為 θ）', () => {
  assert.equal(phKeyCtx.resolve('r'), null);
  assert.equal(phKeyCtx.resolve('s'), null);
  assert.equal(phKeyCtx.resolve('k'), null);
  assert.equal(phKeyCtx.resolve('m'), null);
  assert.equal(phKeyCtx.resolve(''), null);
  assert.equal(phKeyCtx.resolve(null), null);
  assert.equal(phKeyCtx.resolve(undefined), null);
});

/* ---------- 閃卡發音導引啟發式分類：detectCardPhoneticGuides ---------- */
const phDetectCtx = load(extractFunction(engine, 'detectCardPhoneticGuides') + '\nthis.detect = detectCardPhoneticGuides;');
test('detectCardPhoneticGuides: 濁齒擦音 /ð/ 與清齒擦音 /θ/ 精確分流', () => {
  const voiced = phDetectCtx.detect('the weather is rather soothing');
  const voicedKeys = voiced.map(g => g.ph);
  assert.ok(voicedKeys.includes('ð'), '濁輔音詞彙應包含 ð');
  assert.ok(!voicedKeys.includes('θ'), '純濁輔音詞彙不應誤判為 θ');

  const unvoiced = phDetectCtx.detect('think three things');
  const unvoicedKeys = unvoiced.map(g => g.ph);
  assert.ok(unvoicedKeys.includes('θ'), '清輔音詞彙應包含 θ');
  assert.ok(!unvoicedKeys.includes('ð'), '純清輔音詞彙不應誤判為 ð');
});

test('detectCardPhoneticGuides: Dark L [ɫ]、/v/、/ɒ/、/iː/、/ʔ/ 識別', () => {
  const darkL = phDetectCtx.detect('milk bottle full').map(g => g.ph);
  assert.ok(darkL.includes('l_dark'), 'milk 應識別出 Dark L');

  const vPh = phDetectCtx.detect('very vibrant voice').map(g => g.ph);
  assert.ok(vPh.includes('v'), 'very 應識別出 /v/');

  const oPh = phDetectCtx.detect('hot coffee shop').map(g => g.ph);
  assert.ok(oPh.includes('ɒ'), 'hot 應識別出 /ɒ/');

  const iPh = phDetectCtx.detect('please meet the team').map(g => g.ph);
  assert.ok(iPh.includes('iː'), 'please 應識別出 /iː/');

  const glottal = phDetectCtx.detect("wa'er bo'le").map(g => g.ph);
  assert.ok(glottal.includes('ʔ'), "wa'er bo'le 應識別出 /ʔ/ 喉塞音");
});

/* ---------- Cloudflare Pages 排除清單：.assetsignore ---------- */
test('.assetsignore: 存在且包含所有非靜態發佈檔案', () => {
  const ignorePath = path.join(root, '.assetsignore');
  assert.ok(fs.existsSync(ignorePath), '.assetsignore 必須存在於根目錄');
  const content = fs.readFileSync(ignorePath, 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const required = [
    '.git',
    '.gitignore',
    '.agentrules',
    '.cursorrules',
    '.cloudflare',
    '.wrangler',
    'node_modules',
    'tests',
    '*.md',
    'package.json',
    'package-lock.json',
    'cloudflare.config.ts',
    'wrangler.config.ts',
    'start-uk.ps1',
    'quotes.csv',
    'en0.png',
    'en1.png'
  ];
  required.forEach(rule => {
    assert.ok(lines.includes(rule), `Missing ignore rule: ${rule}`);
  });
});

/* ---------- Service Worker 離線資產檢驗：sw.js ---------- */
test('Service Worker: ASSETS 預快取清單中所有檔案必須存在於本地', () => {
  const swCode = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const m = swCode.match(/const ASSETS = \[([\s\S]*?)\];/);
  assert.ok(m, 'sw.js 必須包含 ASSETS 陣列');
  const assets = vm.runInNewContext(`[${m[1]}]`);
  assets.forEach(asset => {
    if (asset !== './') {
      const filePath = path.join(root, asset);
      assert.ok(fs.existsSync(filePath), `sw.js 快取檔案不存在: ${asset}`);
    }
  });
});

/* ---------- 英國實戰任務體系：uk_stages.json & UK_STAGE_MISSION_OPENERS ---------- */
test('uk_stages.json: 完整涵蓋 15 大生存任務且 UK_STAGE_MISSION_OPENERS 均有開場白', () => {
  const stagesPath = path.join(root, 'uk_stages.json');
  assert.ok(fs.existsSync(stagesPath), 'uk_stages.json 必須存在');
  const stages = JSON.parse(fs.readFileSync(stagesPath, 'utf8'));
  let missionCount = 0;
  const missionIds = [];
  stages.forEach(stg => {
    assert.ok(Array.isArray(stg.missions), `Stage ${stg.level} 必須包含 missions 陣列`);
    stg.missions.forEach(m => {
      missionCount++;
      missionIds.push(m.id);
      assert.ok(m.title, `Mission ${m.id} 必須有標題`);
      assert.ok(typeof m.xp === 'number' && m.xp > 0, `Mission ${m.id} 必須有正數 XP`);
    });
  });
  assert.equal(missionCount, 15, '英國生存情境必須恰好有 15 個實戰任務');

  // 驗證 uk_engine.js 內的 UK_STAGE_MISSION_OPENERS 涵蓋所有任務
  const openerMatch = engine.match(/const UK_STAGE_MISSION_OPENERS = \{([\s\S]*?)\};/);
  assert.ok(openerMatch, 'uk_engine.js 必須定義 UK_STAGE_MISSION_OPENERS');
  const openers = vm.runInNewContext(`({${openerMatch[1]}})`);
  missionIds.forEach(id => {
    assert.ok(openers[id], `Mission ${id} 缺少對應開場白`);
    assert.ok(openers[id].length > 10, `Mission ${id} 開場白長度不足`);
  });
});

/* ---------- 連讀與弱讀特訓包：uk_drills.json ---------- */
test('uk_drills.json: 包含 4 大英音特訓分類且每個分類具備示範語句', () => {
  const drillsPath = path.join(root, 'uk_drills.json');
  assert.ok(fs.existsSync(drillsPath), 'uk_drills.json 必須存在');
  const drills = JSON.parse(fs.readFileSync(drillsPath, 'utf8'));
  assert.equal(drills.length, 4, '應有 4 大連讀弱讀分類');
  drills.forEach(d => {
    assert.ok(d.category, '特訓分類必須有名稱');
    assert.ok(Array.isArray(d.examples) && d.examples.length >= 3, `${d.category} 示範例句數量不足`);
    d.examples.forEach(ex => {
      assert.ok(ex.text && ex.note, '例句必須有 text 與 note');
    });
  });
});

/* ---------- 英國實戰任務完成與 XP 計算：completeStageMission ---------- */
test('completeStageMission: 完成任務累加對應 XP 且防重複刷分 (防作弊)', () => {
  let mockState = { xp: 100, level: 1, completedMissions: [] };
  const stagesData = JSON.parse(fs.readFileSync(path.join(root, 'uk_stages.json'), 'utf8'));
  const fnCode = extractFunction(engine, 'completeStageMission');
  const missionCtx = load([
    `let ukStagesData = ${JSON.stringify(stagesData)};`,
    `let activeStageMissionId = null;`,
    fnCode,
    'this.completeStageMission = completeStageMission;'
  ].join('\n'), {
    getProgressionState: () => mockState,
    saveProgressionState: (st) => { mockState = st; },
    renderStagesDashboard: () => {},
    alertDlg: () => {}
  });

  // 完成 m1 (xp: 30)
  missionCtx.completeStageMission('m1');
  assert.equal(mockState.xp, 130);
  assert.deepEqual(mockState.completedMissions, ['m1']);

  // 重複完成 m1，XP 不應重複累加
  missionCtx.completeStageMission('m1');
  assert.equal(mockState.xp, 130);
  assert.equal(mockState.completedMissions.length, 1);

  // 完成 m5 (Level 2, xp: 40)
  missionCtx.completeStageMission('m5');
  assert.equal(mockState.xp, 170);
  assert.deepEqual(mockState.completedMissions, ['m1', 'm5']);
});

/* ---------- 韻律鏡像包絡線演算法檢驗：calcEnvelope ---------- */
test('calcEnvelope: 靜音無 NaN、音訊能量精確歸一化為 60 格包絡', () => {
  const envSrc = extractFunction(html, 'drawProsodyMirror');
  const m = envSrc.match(/const calcEnvelope = ([\s\S]*?\n  \});/);
  assert.ok(m, 'drawProsodyMirror 內必須包含 calcEnvelope 定義');
  const envFn = vm.runInNewContext(`(${m[1].replace(/;\s*$/, '')})`, { Int16Array, Float32Array, Math });

  // 1. 空或全靜音 PCM
  const silentPcm = new Int16Array(16000);
  const silentEnv = envFn(silentPcm, 60);
  assert.equal(silentEnv.length, 60);
  assert.ok(Array.from(silentEnv).every(v => v === 0 && !isNaN(v)));

  // 2. 音訊信號
  const tonePcm = new Int16Array(16000);
  for (let i = 0; i < tonePcm.length; i++) {
    tonePcm[i] = Math.round(10000 * Math.sin(2 * Math.PI * 440 * (i / 16000)));
  }
  const toneEnv = envFn(tonePcm, 60);
  assert.equal(toneEnv.length, 60);
  assert.ok(Array.from(toneEnv).every(v => v >= 0 && v <= 1 && !isNaN(v)));
  assert.ok(Math.max(...toneEnv) >= 0.99, '峰值必須歸一化至 1.0');
});

/* ---------- E1：playUkVoice & stopCurrentUkAudio 播放完成/中斷 Promise 契約 ---------- */
function makeAudioSandbox(opts = {}) {
  const createdUrls = [];
  const revokedUrls = [];
  let lastAudio = null;
  let lastUtterance = null;
  let recordingActive = !!opts.recordingActive;

  class MockAudio {
    constructor(url) {
      this.src = url;
      this.duration = opts.audioDuration !== undefined ? opts.audioDuration : 2.25;
      this.onended = null;
      this.onerror = null;
      this.onpause = null;
      this.paused = false;
      lastAudio = this;
    }
    play() {
      if (opts.playReject) return Promise.reject(new Error('NotAllowedError'));
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
  }

  class MockUtterance {
    constructor(txt) {
      this.text = txt;
      this.lang = '';
      this.voice = null;
      this.onend = null;
      this.onerror = null;
      lastUtterance = this;
    }
  }

  const speechSynth = {
    canceledCount: 0,
    cancel() { this.canceledCount++; },
    getVoices() { return [{ lang: 'en-GB', name: 'UK Offline' }]; },
    speak(utt) { lastUtterance = utt; }
  };

  const win = {
    isAudioRecordingActive: () => recordingActive,
    speechSynthesis: speechSynth
  };

  const ctx = load([
    'let currentUkAudio = null;',
    'let currentUkAudioUrl = null;',
    'let currentUkAudioDone = null;',
    'let ukVoiceSeq = 0;',
    extractFunction(engine, 'stopCurrentUkAudio'),
    extractFunction(engine, 'playUkVoice'),
    'this.playUkVoice = playUkVoice;',
    'this.stopCurrentUkAudio = stopCurrentUkAudio;'
  ].join('\n'), {
    window: win,
    navigator: { onLine: opts.onLine !== undefined ? opts.onLine : true },
    Audio: MockAudio,
    SpeechSynthesisUtterance: MockUtterance,
    URL: {
      createObjectURL: () => {
        const u = 'blob:uk-' + (createdUrls.length + 1);
        createdUrls.push(u);
        return u;
      },
      revokeObjectURL: (u) => { revokedUrls.push(u); }
    },
    getSettings: () => (opts.settings || { azureKey: 'az-key', azureRegion: 'uksouth' }),
    canUseCloudTts: opts.canUseCloudTts || (s => !!(s && s.azureKey && s.azureRegion)),
    ttsCached: opts.ttsCached || (async () => ({ blob: { mock: true } })),
    setTimeout,
    clearTimeout
  });

  return {
    ctx,
    createdUrls,
    revokedUrls,
    speechSynth,
    getLastAudio: () => lastAudio,
    getLastUtterance: () => lastUtterance,
    setRecordingActive: (val) => { recordingActive = val; }
  };
}

test('E1 playUkVoice: 雲端 Audio 必須等待 onended 才 resolve { durationMs, interrupted: false } 並釋放 Blob URL', async () => {
  const sb = makeAudioSandbox({ audioDuration: 2.4 });
  let resolved = false;
  const p = sb.ctx.playUkVoice('Mind the gap, please.').then(res => {
    resolved = true;
    return res;
  });

  await new Promise(r => setImmediate(r));
  assert.equal(resolved, false, 'a.play() 啟動後、onended 觸發前 Promise 不得提前完成');
  assert.equal(sb.createdUrls.length, 1);

  sb.getLastAudio().onended();
  const res = await p;
  assert.equal(resolved, true);
  assert.deepEqual(JSON.parse(JSON.stringify(res)), { durationMs: 2400, interrupted: false });
  assert.deepEqual(sb.revokedUrls, sb.createdUrls, '播放結束必須呼叫 URL.revokeObjectURL');
});

test('E1 stopCurrentUkAudio: 中途停止播放時立即 resolve { durationMs: 0, interrupted: true } 不懸掛', async () => {
  const sb = makeAudioSandbox({ audioDuration: 3.5 });
  const p = sb.ctx.playUkVoice('Lovely weather for ducks.');
  await new Promise(r => setImmediate(r));
  assert.ok(sb.getLastAudio(), '應已建立 Audio 實例');

  sb.ctx.stopCurrentUkAudio();
  const res = await p;
  assert.deepEqual(JSON.parse(JSON.stringify(res)), { durationMs: 0, interrupted: true });
  assert.equal(sb.getLastAudio().paused, true);
  assert.deepEqual(sb.revokedUrls, sb.createdUrls, '中斷播放亦須釋放 Blob URL');
});

test('E1 playUkVoice: 離線 speechSynthesis 完成與中斷契約、以及錄音中互斥守衛', async () => {
  const sb = makeAudioSandbox({ onLine: false });
  const p1 = sb.ctx.playUkVoice('Cheers mate', true);
  await new Promise(r => setImmediate(r));
  const utt1 = sb.getLastUtterance();
  assert.ok(utt1 && utt1.lang === 'en-GB');
  utt1.onend();
  const res1 = await p1;
  assert.equal(res1.interrupted, false);
  assert.equal(typeof res1.durationMs, 'number');

  const p2 = sb.ctx.playUkVoice('Fancy a cuppa?', true);
  await new Promise(r => setImmediate(r));
  sb.ctx.stopCurrentUkAudio();
  const res2 = await p2;
  assert.deepEqual(JSON.parse(JSON.stringify(res2)), { durationMs: 0, interrupted: true });

  sb.setRecordingActive(true);
  const resRec = await sb.ctx.playUkVoice('Should not speak while recording');
  assert.deepEqual(JSON.parse(JSON.stringify(resRec)), { durationMs: 0, interrupted: true });

  sb.setRecordingActive(false);
  const resEmpty = await sb.ctx.playUkVoice('');
  assert.deepEqual(JSON.parse(JSON.stringify(resEmpty)), { durationMs: 0, interrupted: false });
});

/* ---------- E2：simplifyWords & paLikeFromRec 單詞時間軸無損保存與還原 ---------- */
test('E2 simplifyWords & paLikeFromRec: 無損保存與還原單詞 Offset (o) 與 Duration (d) 時間軸', () => {
  const e2Ctx = load([
    extractFunction(html, 'phonemeSym'),
    extractFunction(html, 'phonemeHeard'),
    extractFunction(html, 'simplifyWords'),
    extractFunction(html, 'paLikeFromRec'),
    'this.simplifyWords = simplifyWords; this.paLikeFromRec = paLikeFromRec;'
  ].join('\n'));

  const mockPa = {
    detailResult: {
      Words: [
        {
          Word: 'spot',
          Offset: 1200000,
          Duration: 3400000,
          PronunciationAssessment: { AccuracyScore: 91.6, ErrorType: 'None' },
          Phonemes: [
            {
              Phoneme: 'ɒ',
              PronunciationAssessment: {
                AccuracyScore: 68.4,
                NBestPhonemes: [{ Phoneme: 'ɔː' }, { Phoneme: 'ɒ' }]
              }
            }
          ]
        },
        {
          Word: 'on',
          Offset: 4800000,
          Duration: 2100000,
          PronunciationAssessment: { AccuracyScore: 95, ErrorType: 'None' },
          Phonemes: []
        },
        {
          Word: 'mate',
          PronunciationAssessment: { AccuracyScore: 80, ErrorType: 'None' }
        }
      ]
    }
  };

  const simplified = JSON.parse(JSON.stringify(e2Ctx.simplifyWords(mockPa)));
  assert.equal(simplified.length, 3);
  assert.equal(simplified[0].w, 'spot');
  assert.equal(simplified[0].o, 1200000);
  assert.equal(simplified[0].d, 3400000);
  assert.equal(simplified[0].score, 92);
  assert.equal(simplified[0].phonemes[0].h, 'ɔː');
  assert.equal(simplified[1].o, 4800000);
  assert.equal(simplified[1].d, 2100000);
  assert.equal(simplified[2].o, 0, '缺少 Offset 時安全預設為 0');
  assert.equal(simplified[2].d, 0, '缺少 Duration 時安全預設為 0');

  const restored = JSON.parse(JSON.stringify(e2Ctx.paLikeFromRec({
    score: 90,
    accuracy: 89,
    fluency: 92,
    completeness: 100,
    words: simplified
  })));
  assert.equal(restored.pronunciationScore, 90);
  assert.equal(restored.accuracyScore, 89);
  assert.equal(restored.detailResult.Words[0].Offset, 1200000);
  assert.equal(restored.detailResult.Words[0].Duration, 3400000);
  assert.equal(restored.detailResult.Words[0].Phonemes[0].PronunciationAssessment.NBestPhonemes[0].Phoneme, 'ɔː');
  assert.equal(restored.detailResult.Words[1].Offset, 4800000);
  assert.equal(restored.detailResult.Words[1].Duration, 2100000);
});

/* ---------- E3：applyReviewRating & markDailyQuest 每日 5 語塊計數與 100 XP 閉環 ---------- */
function makeProgressionSandbox(initialDeck) {
  const lsMap = Object.create(null);
  const localStorageMock = {
    getItem: (k) => (k in lsMap ? lsMap[k] : null),
    setItem: (k, v) => { lsMap[k] = String(v); }
  };

  const ctx = load([
    "const LS_PROGRESSION = 'uk_progression_state';",
    'let reviewAutoTimer = null;',
    `let reviewsCache = ${JSON.stringify(initialDeck || [])};`,
    extractFunction(engine, 'localDayStr'),
    extractFunction(engine, 'getProgressionState'),
    extractFunction(engine, 'saveProgressionState'),
    extractFunction(engine, 'addProgressionXp'),
    extractFunction(engine, 'markDailyQuest'),
    extractFunction(engine, 'getDueReviews'),
    extractFunction(engine, 'calcNextReview'),
    extractFunction(engine, 'applyReviewRating'),
    'this.getProgressionState = getProgressionState;',
    'this.saveProgressionState = saveProgressionState;',
    'this.markDailyQuest = markDailyQuest;',
    'this.applyReviewRating = applyReviewRating;',
    'this.getDeck = () => reviewsCache;'
  ].join('\n'), {
    localStorage: localStorageMock,
    usageDay: () => '2026-11-12',
    persistReviewsCache: () => {},
    renderReviewStudio: () => {},
    renderStagesDashboard: () => {},
    clearTimeout,
    setTimeout
  });

  return { ctx, lsMap };
}

test('E3 markDailyQuest: 三項日常任務獎勵精準校準為 30 + 35 + 35 = 100 XP 且不重複發放', () => {
  const { ctx } = makeProgressionSandbox([]);
  const initXp = ctx.getProgressionState().xp; // 60 XP
  ctx.markDailyQuest('review');
  assert.equal(ctx.getProgressionState().xp, initXp + 30, 'review 任務應獎勵 +30 XP');
  ctx.markDailyQuest('review');
  assert.equal(ctx.getProgressionState().xp, initXp + 30, '同一日重入不得重複加分');

  ctx.markDailyQuest('reading');
  assert.equal(ctx.getProgressionState().xp, initXp + 30 + 35, 'reading 任務應獎勵 +35 XP');

  ctx.markDailyQuest('chat');
  assert.equal(ctx.getProgressionState().xp, initXp + 100, '三項日常任務合計應恰好為 100 XP');
});

test('E3 applyReviewRating: dailyReviewsDone 逐張遞增，滿 5 張或待重溫歸零時觸發 review 任務，跨日自動歸零', () => {
  const now = Date.now();
  const sixDueCards = Array.from({ length: 6 }, (_, i) => ({
    id: 'c' + (i + 1),
    text: 'chunk ' + (i + 1),
    dueDate: now - 60000,
    reps: 0,
    interval: 0,
    easeFactor: 2.5,
    lapses: 0,
    history: []
  }));
  const { ctx } = makeProgressionSandbox(sixDueCards);

  // 前 4 張（尚有剩餘到期卡）：dailyReviewsDone 遞增至 4，每張 +15 XP，尚未觸發 review 任務 (+30 XP)
  for (let i = 0; i < 4; i++) {
    ctx.applyReviewRating(ctx.getDeck()[i], 3, 82);
    const st = ctx.getProgressionState();
    assert.equal(st.dailyReviewsDone, i + 1);
    assert.equal(st.quests.review, false, `第 ${i + 1} 張時尚有未重溫卡，不應提前完成任務`);
  }
  assert.equal(ctx.getProgressionState().xp, 60 + 4 * 15);

  // 第 5 張（尚餘第 6 張到期卡）：達成 5 張門檻，觸發 review 任務 (+30 XP)
  ctx.applyReviewRating(ctx.getDeck()[4], 4, 90);
  const stAfter5 = ctx.getProgressionState();
  assert.equal(stAfter5.dailyReviewsDone, 5);
  assert.equal(stAfter5.quests.review, true, '完成第 5 張應觸發 review 任務');
  assert.equal(stAfter5.xp, 60 + 5 * 15 + 30);

  // 情境 B：若總到期卡僅 2 張，全數重溫完畢（getDueReviews().length === 0）即完成任務
  const twoCards = [
    { id: 'only1', text: 'cheers', dueDate: now - 1000, reps: 0, interval: 0, easeFactor: 2.5, lapses: 0 },
    { id: 'only2', text: 'ta', dueDate: now - 1000, reps: 0, interval: 0, easeFactor: 2.5, lapses: 0 }
  ];
  const sbShort = makeProgressionSandbox(twoCards);
  sbShort.ctx.applyReviewRating(sbShort.ctx.getDeck()[0], 3, 80);
  assert.equal(sbShort.ctx.getProgressionState().quests.review, false);
  sbShort.ctx.applyReviewRating(sbShort.ctx.getDeck()[1], 3, 85);
  assert.equal(sbShort.ctx.getProgressionState().dailyReviewsDone, 2);
  assert.equal(sbShort.ctx.getProgressionState().quests.review, true, '所有到期卡清空時應自動完成晨間重溫任務');

  // 跨日重置檢驗
  const stOldDay = sbShort.ctx.getProgressionState();
  stOldDay.dailyDate = '2026-11-11';
  sbShort.ctx.saveProgressionState(stOldDay);
  const rolled = sbShort.ctx.getProgressionState();
  assert.equal(rolled.dailyDate, '2026-11-12');
  assert.equal(rolled.dailyReviewsDone, 0);
  assert.equal(rolled.quests.review, false);
});

/* ---------- E4：saveConvs IndexedDB QuotaExceededError 自癒機制 ---------- */
test('E4 saveConvs: 遭遇 QuotaExceededError 時動態依 idbCount("tts:") 減半裁剪，並以最新 convsCache 單次重試成功', async () => {
  const calls = [];
  const writtenPayloads = [];
  let alerts = 0;
  let attempt = 0;

  const quotaCtx = load([
    "const IDB_CONVS_KEY = 'json:convs';",
    'let convsCache = null;',
    'let convsLoaded = true;',
    'let convsSaveWarned = false;',
    extractFunction(html, 'saveConvs'),
    'this.saveConvs = saveConvs;',
    'this.getWarned = () => convsSaveWarned;',
    'this.setLoaded = v => { convsLoaded = v; };',
    'this.mutateCache = v => { convsCache = v; };'
  ].join('\n'), {
    idbCount: async (prefix) => {
      calls.push(['idbCount', prefix]);
      return 18; // 即使快取條數 <= 50，仍能精準釋放一半 (9 條)
    },
    trimTtsCache: async (keepCount) => {
      calls.push(['trimTtsCache', keepCount]);
      // 模擬裁剪等待期間使用者新增了訊息，更新了記憶體中的 convsCache
      quotaCtx.mutateCache([{ id: 'conv_1', messages: [{ role: 'user', content: 'newer' }] }]);
    },
    idbSet: async (key, val) => {
      attempt++;
      calls.push(['idbSet', key, attempt]);
      writtenPayloads.push(val);
      if (attempt === 1) {
        const qErr = new Error('The quota has been exceeded.');
        qErr.name = 'QuotaExceededError';
        throw qErr;
      }
    },
    alertDlg: () => { alerts++; },
    t: (k) => k
  });

  await quotaCtx.saveConvs([{ id: 'conv_1', messages: [] }]);
  assert.deepEqual(calls, [
    ['idbSet', 'json:convs', 1],
    ['idbCount', 'tts:'],
    ['trimTtsCache', 9],
    ['idbSet', 'json:convs', 2]
  ]);
  assert.deepEqual(
    JSON.parse(writtenPayloads[1]),
    [{ id: 'conv_1', messages: [{ role: 'user', content: 'newer' }] }],
    '重試寫盤時必須序列化最新 convsCache，不得以舊快照覆寫新訊息'
  );
  assert.equal(alerts, 0, '自癒重試成功時不得彈出 storageFull 警告');
  assert.equal(quotaCtx.getWarned(), false);

  // 未載入完成前呼叫 saveConvs 不得觸碰 IndexedDB
  quotaCtx.setLoaded(false);
  await quotaCtx.saveConvs([{ id: 'conv_2', messages: [] }]);
  assert.equal(calls.length, 4, 'convsLoaded 為 false 時禁止寫入 IndexedDB');
});

test('E4 saveConvs: 若裁剪快取後重試依然滿載（含僅剩 1 筆快取歸零），僅彈出一次 storageFull 警告', async () => {
  let alerts = 0;
  let trimArg = null;
  const failCtx = load([
    "const IDB_CONVS_KEY = 'json:convs';",
    'let convsCache = null;',
    'let convsLoaded = true;',
    'let convsSaveWarned = false;',
    extractFunction(html, 'saveConvs'),
    'this.saveConvs = saveConvs;'
  ].join('\n'), {
    idbCount: async () => 1,
    trimTtsCache: async (keepCount) => { trimArg = keepCount; },
    idbSet: async () => {
      const err = new Error('Quota exceeded');
      err.name = 'QuotaExceededError';
      throw err;
    },
    alertDlg: () => { alerts++; },
    t: (k) => k
  });

  await failCtx.saveConvs([{ id: 'c1' }]);
  await failCtx.saveConvs([{ id: 'c1' }]);
  assert.equal(trimArg, 0, 'floor(1 / 2) 應為 0，連最後 1 條快取亦可釋放');
  assert.equal(alerts, 1, '連續失敗僅提示一次，不洗版');
});

/* ---------- F1：analyzeUserPhonemeWeaknesses & getPhoneticCoachingPromptHint ---------- */
test('F1 analyzeUserPhonemeWeaknesses & getPhoneticCoachingPromptHint: 聚合 <75 分音素混淆、排序與 count>=2 靶向提示門檻', () => {
  let mockConvs = [];
  const f1Ctx = load([
    extractFunction(engine, 'resolvePhoneticGuideKey'),
    extractFunction(engine, 'analyzeUserPhonemeWeaknesses'),
    extractFunction(engine, 'getPhoneticCoachingPromptHint'),
    'this.analyze = analyzeUserPhonemeWeaknesses;',
    'this.getHint = getPhoneticCoachingPromptHint;'
  ].join('\n'), {
    getConvs: () => mockConvs
  });

  // 僅出現 1 次的低分音素：analyze 可見，但 getPhoneticCoachingPromptHint 不應觸發（需 count >= 2）
  mockConvs = [{
    records: [
      {
        t: 1000,
        words: [
          { w: 'think', phonemes: [{ p: 'θ', s: 60, h: 's' }, { p: 'ɪ', s: 88, h: 'ɪ' }] }
        ]
      }
    ]
  }];
  const singleRes = JSON.parse(JSON.stringify(f1Ctx.analyze(mockConvs, 30)));
  assert.equal(singleRes.length, 1);
  assert.equal(singleRes[0].phoneme, 'θ');
  assert.equal(singleRes[0].count, 1);
  assert.equal(f1Ctx.getHint(), '', 'count < 2 時不應輸出教練靶向提示詞');

  // 多筆紀錄：驗證 <75 過濾（排除 s=0 與 s>=75）、混淆統計、頻次優先/均分次之排序、以及 maxRecords 截斷
  mockConvs = [
    {
      records: [
        {
          t: 3000,
          words: [
            { w: 'think', phonemes: [{ p: 'θ', s: 58, h: 's' }] },
            { w: 'three', phonemes: [{ p: 'θ', s: 62, h: 'f' }] },
            { w: 'very', phonemes: [{ p: 'v', s: 50, h: 'w' }] }
          ]
        },
        {
          t: 2000,
          words: [
            { w: 'through', phonemes: [{ p: 'θ', s: 60, h: 's' }] },
            { w: 'voice', phonemes: [{ p: 'v', s: 54, h: 'w' }] },
            { w: 'this', phonemes: [{ p: 'ð', s: 65, h: 'd' }, { p: 'ɪ', s: 90, h: 'ɪ' }, { p: 's', s: 0, h: '' }] }
          ]
        },
        {
          t: 1500,
          words: [
            { w: 'brother', phonemes: [{ p: 'ð', s: 69, h: 'd' }] }
          ]
        },
        {
          t: 100, // 超出 maxRecords=3 時應被忽略的舊紀錄
          words: [
            { w: 'milk', phonemes: [{ p: 'ɫ', s: 40, h: 'u' }, { p: 'ɫ', s: 42, h: 'u' }, { p: 'ɫ', s: 44, h: 'u' }, { p: 'ɫ', s: 46, h: 'u' }] }
          ]
        }
      ]
    }
  ];

  const limited = JSON.parse(JSON.stringify(f1Ctx.analyze(mockConvs, 3)));
  assert.equal(limited.some(x => x.phoneme === 'ɫ'), false, '超出最近 maxRecords 筆的舊紀錄不得納入統計');
  assert.equal(limited[0].phoneme, 'θ', '出現 3 次的 /θ/ 應排第一');
  assert.equal(limited[0].count, 3);
  assert.equal(limited[0].avgScore, 60);
  assert.equal(limited[0].topConfusedWith, 's');
  assert.equal(limited[0].topConfusedCount, 2);
  assert.deepEqual(limited[0].sampleWords, ['think', 'three', 'through']);

  // /v/ 與 /ð/ 皆為 count=2，但 /v/ avgScore=52 低於 /ð/ avgScore=67，故 /v/ 應排第二
  assert.equal(limited[1].phoneme, 'v');
  assert.equal(limited[1].avgScore, 52);
  assert.equal(limited[1].guideKey, 'v');
  assert.equal(limited[2].phoneme, 'ð');
  assert.equal(limited[2].avgScore, 67);

  const hint = f1Ctx.getHint();
  assert.ok(hint.startsWith('[Phonetic Coaching Target]:'), '應產生英文靶向教練提示');
  assert.ok(hint.includes('/θ/ (confused with /s/)'), '提示應包含最高頻弱項與常見誤讀音');
});

/* ---------- F2：annotateConnectedSpeech 英式連音 (‿r) 與虛詞弱讀標註 ---------- */
const f2Ctx = load([
  extractLine(html, /const esc = s =>.*$/m),
  extractFunction(engine, 'annotateConnectedSpeech'),
  'this.annotate = annotateConnectedSpeech;'
].join('\n'));

test('F2 annotateConnectedSpeech: 準確標註 Linking R (‿r) 與非句尾 Weak Forms，並保留所有 .rd-word 查詞節點', () => {
  // "far away" & "more apples" 觸發 Linking R；非句尾 "for" / "a" / "of" 觸發 .rd-weak；句尾 "for?" 不得弱讀
  const out = f2Ctx.annotate('Wait for a cup of tea far away, what is it for?', true);
  assert.ok(out.includes('class="conn-link-r"'), 'far away 之間應標註英式連音 .conn-link-r');
  assert.ok(out.includes('>‿r<'), '應渲染連音符號 ‿r');
  assert.ok(out.includes('<span class="rd-word rd-weak" style="cursor:pointer" title="英式虛詞弱讀 (Weak Form)：輕讀短促 /ə/">for</span>'), '句中 for 應標為弱讀');
  assert.ok(out.includes('<span class="rd-word rd-weak" style="cursor:pointer" title="英式虛詞弱讀 (Weak Form)：輕讀短促 /ə/">of</span>'), '句中 of 應標為弱讀');
  assert.ok(out.includes('<span class="rd-word" style="cursor:pointer">for?</span>'), '句尾強讀虛詞 for? 絕不可標為 .rd-weak');

  // 逗號阻斷連音：far, away 不應出現 ‿r
  const commaBlocked = f2Ctx.annotate('So far, away from home', true);
  assert.ok(!commaBlocked.includes('conn-link-r'), '詞尾帶逗號時不得標註 Linking R');
  // 無標點句尾虛詞亦不可弱讀
  const bareEndWeak = f2Ctx.annotate('Who did you speak to', true);
  assert.ok(bareEndWeak.endsWith('<span class="rd-word" style="cursor:pointer">to</span>'), '句末最後一詞 to 不應標為 .rd-weak');

  // 關閉開關時：無 .conn-link-r 與 .rd-weak，但完整保留 .rd-word
  const disabledOut = f2Ctx.annotate('far away for you', false);
  assert.ok(!disabledOut.includes('conn-link-r'));
  assert.ok(!disabledOut.includes('rd-weak'));
  assert.equal((disabledOut.match(/class="rd-word"/g) || []).length, 4);
});

test('F2 annotateConnectedSpeech: 惡意 XSS 載荷必須完整 HTML 轉義（零原生標籤或事件屬性洩漏）', () => {
  const xssSent = 'far <img src=x onerror=alert(1)> away & "quotes"';
  const rendered = f2Ctx.annotate(xssSent, true);
  assert.ok(!rendered.includes('<img'), '<img 標籤必須被轉義為 &lt;img');
  assert.ok(!/<[^/!][^>]*\bonerror\s*=/i.test(rendered), '不得產生任何真實帶 onerror 屬性的 HTML 元素');
  assert.ok(rendered.includes('&lt;img'));
  assert.ok(rendered.includes('&amp;'));
  assert.ok(rendered.includes('&quot;quotes&quot;'));
});

/* ---------- F3：UK_STAGE_MISSION_PROMPTS 15 任務映射與 index.html 跨檔 DOM 容器檢驗 ---------- */
test('F3 UK_STAGE_MISSION_PROMPTS & DOM: 完整映射 m1..m15 至合法劇本 ID 且 index.html 具備全部 v1.6.0 容器', () => {
  const stages = JSON.parse(fs.readFileSync(path.join(root, 'uk_stages.json'), 'utf8'));
  const missionIds = [];
  stages.forEach(stg => stg.missions.forEach(m => missionIds.push(m.id)));
  assert.equal(missionIds.length, 15);

  const promptMapMatch = engine.match(/const UK_STAGE_MISSION_PROMPTS = \{([\s\S]*?)\};/);
  assert.ok(promptMapMatch, 'uk_engine.js 必須定義 UK_STAGE_MISSION_PROMPTS');
  const promptMap = vm.runInNewContext(`({${promptMapMatch[1]}})`);

  const tplCtx = load([
    extractFunction(html, 'ukGpPromptName'),
    extractFunction(html, 'buildUKGpPrompt'),
    extractFunction(html, 'ukCouncilPromptName'),
    extractFunction(html, 'buildUKCouncilPrompt'),
    extractFunction(html, 'ukTenancyPromptName'),
    extractFunction(html, 'buildUKTenancyPrompt'),
    extractFunction(html, 'ukBanterPromptName'),
    extractFunction(html, 'buildUKBanterPrompt'),
    extractFunction(html, 'ukReadingPromptName'),
    extractFunction(html, 'buildUKReadingPrompt'),
    extractFunction(html, 'getUKTemplates'),
    'this.ukIds = getUKTemplates("zh").map(x => x.id);'
  ].join('\n'));
  const validTemplateIds = new Set(['default', 'customs', ...tplCtx.ukIds]);

  missionIds.forEach(id => {
    assert.ok(promptMap[id], `Mission ${id} 必須在 UK_STAGE_MISSION_PROMPTS 中配置劇本 ID`);
    assert.ok(validTemplateIds.has(promptMap[id]), `Mission ${id} 映射的劇本 ID "${promptMap[id]}" 不存在於 index.html 內建範本`);
  });

  // 靜態跨檔 DOM 容器契約檢驗
  const requiredDomIds = [
    'activeMissionBanner',
    'toggleConnSpeechBtn',
    'personalWeaknessRadar',
    'popoverAiBtn',
    'popoverAiResult'
  ];
  requiredDomIds.forEach(domId => {
    assert.ok(
      new RegExp(`id=["']${domId}["']`).test(html),
      `index.html 必須定義 DOM 容器 #${domId}`
    );
  });
});

/* ---------- F4：askAiContextualExplain 守衛、Rule R5 純淨 CORS 與 JSON/純文字雙模解析 ---------- */
function makeExplainSandbox(opts = {}) {
  const fetchCalls = [];
  let trackedUsage = null;
  const settings = Object.assign({
    chatBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    chatModel: 'gemini-3.8-flash',
    chatKey: 'test-gemini-key',
    uiLang: 'zh'
  }, opts.settings || {});

  const ctx = load([
    extractFunction(html, 'chatHeaders'),
    extractFunction(html, 'askAiContextualExplain'),
    'this.askAiContextualExplain = askAiContextualExplain;'
  ].join('\n'), {
    window: {},
    navigator: { onLine: opts.onLine !== undefined ? opts.onLine : true },
    AbortController,
    setTimeout,
    clearTimeout,
    location: { href: 'http://127.0.0.1:8000/' },
    getSettings: () => settings,
    trackChatFromUsage: (u) => { trackedUsage = u; },
    t: (k) => (k === 'misc.colon' ? '：' : k),
    fetch: async (url, init) => {
      fetchCalls.push({ url, init });
      if (opts.fetchImpl) return opts.fetchImpl(url, init);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          usage: { prompt_tokens: 42, completion_tokens: 28, total_tokens: 70 },
          choices: [{ message: { content: opts.replyContent || '{"ipa":"/ˈnækəd/","meaning":"筋疲力盡","tip":"英式口語極常用"}' } }]
        })
      };
    }
  });

  return { ctx, fetchCalls, getTrackedUsage: () => trackedUsage };
}

test('F4 askAiContextualExplain: 嚴格攔截未設 API Key 與離線狀態（不發出任何網路請求）', async () => {
  const noKeySb = makeExplainSandbox({ settings: { chatKey: '', uiLang: 'zh' } });
  await assert.rejects(
    () => noKeySb.ctx.askAiContextualExplain('knackered', 'I am utterly knackered.'),
    /API Key/
  );
  assert.equal(noKeySb.fetchCalls.length, 0);

  const offlineSb = makeExplainSandbox({ onLine: false, settings: { uiLang: 'en' } });
  await assert.rejects(
    () => offlineSb.ctx.askAiContextualExplain('knackered', 'I am utterly knackered.'),
    /Offline mode/
  );
  assert.equal(offlineSb.fetchCalls.length, 0);
});

test('F4 askAiContextualExplain: 遵守 Rule R5 純淨 CORS 標頭，支援 ```json 圍欄剝離與純文字回退解析', async () => {
  const fencedJson = '```json\n{"ipa":"/ˈɡʌtɪd/","meaning":"極度失望、沮喪","tip":"日常口語高頻詞，相當於 devastated"}\n```';
  const sb = makeExplainSandbox({ replyContent: fencedJson });
  const res = await sb.ctx.askAiContextualExplain('gutted', 'I was absolutely gutted when the train was cancelled.');

  assert.equal(sb.fetchCalls.length, 1);
  const call = sb.fetchCalls[0];
  assert.equal(call.url, 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
  assert.equal(call.init.method, 'POST');

  // Rule R5 驗證：Gemini 端點僅允許 Content-Type 與 Authorization，嚴禁自訂 x-* 標頭觸發預檢失敗
  const headerKeys = Object.keys(call.init.headers).sort();
  assert.deepEqual(headerKeys, ['Authorization', 'Content-Type']);
  assert.equal(call.init.headers.Authorization, 'Bearer test-gemini-key');
  assert.equal(call.init.headers['Content-Type'], 'application/json');

  const body = JSON.parse(call.init.body);
  assert.equal(body.stream, false);
  assert.equal(body.model, 'gemini-3.8-flash');

  assert.equal(res.ipa, '/ˈɡʌtɪd/');
  assert.equal(res.meaning, '極度失望、沮喪');
  assert.equal(res.tip, '日常口語高頻詞，相當於 devastated');
  assert.ok(res.formatted.includes('/ˈɡʌtɪd/') && res.formatted.includes('英式用法：'));
  assert.equal(sb.getTrackedUsage().prompt_tokens, 42);

  // 非 JSON 純文字回覆安全降級（不拋錯）
  const plainSb = makeExplainSandbox({
    settings: { uiLang: 'en' },
    replyContent: 'Colloquial British adjective meaning completely exhausted after work.'
  });
  const plainRes = await plainSb.ctx.askAiContextualExplain('knackered', 'I am knackered.');
  assert.equal(plainRes.ipa, '');
  assert.equal(plainRes.tip, '');
  assert.equal(plainRes.meaning, 'Colloquial British adjective meaning completely exhausted after work.');
  assert.equal(plainRes.formatted, 'Colloquial British adjective meaning completely exhausted after work.');
});

/* ---------- E2 併發與狀態清理：restoreRecord restoreSeq 防抖與缺 Blob 播放器重置 ---------- */
test('E2 restoreRecord: 快速連點 Record A -> B 時丟棄 A 過期回呼，且缺失 Blob 時清空 refPlayer/myPlayer', async () => {
  let resolveSlowTtsA = null;
  const refPlayerState = { src: 'blob:old-ref', cleared: 0, loads: [] };
  const myPlayerState = { src: 'blob:old-my', cleared: 0, loads: [] };
  const mirrorCalls = [];
  const sentenceBox = { value: '' };
  let stopAllCount = 0;

  const convsData = [{
    id: 'c1',
    records: [
      { id: 'recA', text: 'Slow sentence A', voice: 'en-GB-SoniaNeural', score: 80, accuracy: 80, fluency: 80, completeness: 80, words: [{ w: 'Slow', o: 100, d: 200, score: 80, err: 'None', phonemes: [] }] },
      { id: 'recB', text: 'Fast sentence B', voice: 'en-GB-SoniaNeural', score: 92, accuracy: 92, fluency: 92, completeness: 92, words: [{ w: 'Fast', o: 300, d: 400, score: 92, err: 'None', phonemes: [] }] },
      { id: 'recEmpty', text: 'Evicted blobs C', voice: 'en-GB-SoniaNeural', score: 75, accuracy: 75, fluency: 75, completeness: 75, words: [] }
    ]
  }];

  const restoreCtx = load([
    'let restoreSeq = 0;',
    'let refGenSeq = 0;',
    'let lastUserPcm16 = null;',
    'let lastRefBlob = null;',
    'let lastRefText = "";',
    'let lastRefUrl = "blob:prev-ref";',
    'let myRecordingUrl = "blob:prev-my";',
    extractFunction(html, 'paLikeFromRec'),
    extractFunction(html, 'restoreRecord'),
    'this.restoreRecord = restoreRecord;',
    'this.getState = () => ({ lastRefText, lastRefUrl, myRecordingUrl, lastUserPcm16 });'
  ].join('\n'), {
    window: { stopAllAudioPlayback: () => { stopAllCount++; } },
    getConvs: () => convsData,
    $: (id) => (id === 'sentenceText' ? sentenceBox : { scrollIntoView: () => {} }),
    autoGrowTextarea: () => {},
    renderResult: () => {},
    URL: {
      createObjectURL: (b) => 'blob:' + b.tag,
      revokeObjectURL: () => {}
    },
    refPlayer: {
      clear() { refPlayerState.src = ''; refPlayerState.cleared++; },
      load(u, auto) { refPlayerState.src = u; refPlayerState.loads.push([u, auto]); }
    },
    myPlayer: {
      clear() { myPlayerState.src = ''; myPlayerState.cleared++; },
      load(u, auto) { myPlayerState.src = u; myPlayerState.loads.push([u, auto]); }
    },
    idbGet: async (k) => {
      if (k === 'my:recA') return { tag: 'myA' };
      if (k === 'my:recB') return { tag: 'myB' };
      return null;
    },
    ttsCached: (txt) => {
      if (txt === 'Slow sentence A') {
        return new Promise(res => { resolveSlowTtsA = () => res({ blob: { tag: 'refA' } }); });
      }
      if (txt === 'Fast sentence B') {
        return Promise.resolve({ blob: { tag: 'refB' } });
      }
      return Promise.reject(new Error('offline'));
    },
    decodeToPcm16k: async (b) => b.tag + '-pcm',
    drawProsodyMirror: async (words) => { mirrorCalls.push(words[0] && words[0].Word); }
  });

  // 先點 Record A（卡在慢速網路 TTS），隨即點 Record B（快取秒回）
  const pA = restoreCtx.restoreRecord('c1', 'recA');
  await new Promise(r => setImmediate(r));
  const pB = restoreCtx.restoreRecord('c1', 'recB');
  await pB;

  // 此時才讓 Record A 的慢請求返回，不得覆蓋 Record B 的播放器與波形
  resolveSlowTtsA();
  await pA;

  assert.equal(stopAllCount, 2);
  assert.equal(sentenceBox.value, 'Fast sentence B');
  assert.equal(refPlayerState.src, 'blob:refB', 'Record A 慢回呼不得覆寫 Record B 的原聲播放器');
  assert.equal(myPlayerState.src, 'blob:myB', 'Record A 不得覆寫 Record B 的錄音播放器');
  assert.equal(restoreCtx.getState().lastUserPcm16, 'myB-pcm');
  assert.deepEqual(mirrorCalls, ['Fast'], 'drawProsodyMirror 僅能繪製最新選中的 Record B');

  // 點擊 Blob 已被淘汰/離線缺失的 recEmpty：兩個播放器必須處於清空狀態（不得殘留 recB 音訊）
  await restoreCtx.restoreRecord('c1', 'recEmpty');
  assert.equal(refPlayerState.src, '', '缺失 refBlob 時 refPlayer 必須被 clear()');
  assert.equal(myPlayerState.src, '', '缺失 myBlob 時 myPlayer 必須被 clear()');
  assert.equal(restoreCtx.getState().lastUserPcm16, null);
});

/* ---------- E1 併發與分頁清理：toggleShadowRadio shadowRadioSeq 與 switchTab 連動 ---------- */
test('E1 toggleShadowRadio & switchTab: Start->Stop->Start 舊輪次不誤殺新輪次，切離 reading 分頁自動停播並收起查詞彈窗', async () => {
  const voiceResolvers = [];
  const btnEl = { textContent: '🎧 影子連播電台' };
  const popEl = {
    hidden: false,
    classList: {
      add(c) { if (c === 'hidden') popEl.hidden = true; },
      remove(c) { if (c === 'hidden') popEl.hidden = false; },
      contains(c) { return c === 'hidden' ? popEl.hidden : false; }
    }
  };
  let abortCalled = 0;

  const radioCtx = load([
    "let currentActiveTab = 'reading';",
    'let reviewAutoTimer = null;',
    'let pendingReviewAssessmentId = null;',
    "let currentReadingSentences = ['First chunk.', 'Second chunk.'];",
    'let isShadowRadioActive = false;',
    'let shadowRadioTimer = null;',
    'let shadowRadioResolver = null;',
    'let shadowRadioSeq = 0;',
    'let popoverAiAbort = { abort() { onAbort(); } };',
    'let popoverHideTimer = null;',
    extractFunction(engine, 'cancelPopoverPending'),
    extractFunction(engine, 'dismissWordPopover'),
    extractFunction(engine, 'stopShadowRadio'),
    extractFunction(engine, 'toggleShadowRadio'),
    extractFunction(engine, 'switchTab'),
    'this.toggleShadowRadio = toggleShadowRadio;',
    'this.stopShadowRadio = stopShadowRadio;',
    'this.switchTab = switchTab;',
    'this.isActive = () => isShadowRadioActive;'
  ].join('\n'), {
    window: { scrollTo: () => {} },
    onAbort: () => { abortCalled++; },
    document: {
      getElementById: (id) => {
        if (id === 'shadowRadioBtn') return btnEl;
        if (id === 'wordPopover') return popEl;
        return { classList: { add() {}, remove() {}, toggle() {}, contains: () => true } };
      },
      querySelectorAll: () => []
    },
    rewardReadingEngagement: () => {},
    stopCurrentUkAudio: () => {},
    playUkVoice: (sent) => new Promise(res => { voiceResolvers.push({ sent, res }); }),
    setTimeout,
    clearTimeout
  });

  // 1. 啟動 Run #1（停在 playUkVoice）
  const run1 = radioCtx.toggleShadowRadio();
  await new Promise(r => setImmediate(r));
  assert.equal(radioCtx.isActive(), true);
  assert.equal(voiceResolvers.length, 1);

  // 2. 點擊停止，並立即啟動 Run #2
  await radioCtx.toggleShadowRadio(); // Stop Run #1
  assert.equal(radioCtx.isActive(), false);
  const run2 = radioCtx.toggleShadowRadio(); // Start Run #2
  await new Promise(r => setImmediate(r));
  assert.equal(radioCtx.isActive(), true);
  assert.equal(voiceResolvers.length, 2);

  // 3. 此時 Run #1 的過期 playUkVoice 才以 interrupted:true 結算：絕不可把 Run #2 關掉！
  voiceResolvers[0].res({ durationMs: 0, interrupted: true });
  await run1;
  assert.equal(radioCtx.isActive(), true, 'Run #1 退出時不得誤殺正在執行的 Run #2');
  assert.ok(btnEl.textContent.includes('朗讀中'), 'Run #2 按鈕狀態應保持朗讀中');

  // 4. 切換至 practice 分頁：應立即停止 Run #2 並取消/隱藏 #wordPopover
  radioCtx.switchTab('practice');
  assert.equal(radioCtx.isActive(), false, '離開精讀分頁時必須自動停止影子電台');
  assert.equal(btnEl.textContent, '🎧 影子連播電台');
  assert.equal(popEl.hidden, true, '離開精讀分頁時必須隱藏 #wordPopover');
  assert.equal(abortCalled, 1, '離開精讀分頁時必須中止在途 AI 查詞請求');

  voiceResolvers[1].res({ durationMs: 0, interrupted: true });
  await run2;
});

/* ---------- F3 互動回饋：activateMissionRoleplay 無 Key 時觸發 sendChat 提示並保留開場白 ---------- */
test('F3 activateMissionRoleplay: autoSend=true 且未設 API Key 時仍呼叫 sendChat 彈出引導，並完整保留輸入框開場白', async () => {
  const alerts = [];
  const inputEl = { value: '', focused: false, focus() { this.focused = true; }, blur() {} };
  let convObj = { id: 'c1', promptId: 'default', messages: [] };

  const f3RoleCtx = load([
    'let dictFocusAfter = true;',
    'let dictRec = null;',
    extractFunction(html, 'sendChat'),
    extractFunction(html, 'activateMissionRoleplay'),
    'this.activateMissionRoleplay = activateMissionRoleplay;'
  ].join('\n'), {
    document: { querySelector: () => null },
    $: (id) => (id === 'chatInput' ? inputEl : null),
    autoGrowTextarea: () => {},
    getSettings: () => ({
      chatBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      chatModel: 'gemini-3.8-flash',
      chatKey: '',
      promptTemplates: [{ id: 'uk_gp', name: 'GP', content: 'GP prompt' }]
    }),
    activeConv: () => convObj,
    newConversation: () => {},
    persistConv: () => {},
    refreshConvPromptSel: () => {},
    renderConvList: () => {},
    renderChat: () => {},
    sendChatCore: async () => { throw new Error('Should not call sendChatCore without key'); },
    alertDlg: async (msg) => { alerts.push(msg); },
    t: (k) => k
  });

  const opener = "Hello, I'd like to book an appointment with a GP, please.";
  await f3RoleCtx.activateMissionRoleplay('uk_gp', opener, true);
  assert.deepEqual(alerts, ['chat.noKey'], '未填 API Key 點擊「載入劇本並與 AI 對練」必須彈出 chat.noKey 提示');
  assert.equal(inputEl.value, opener, '彈出無 Key 提示後輸入框內的任務開場白必須保留，不得被清空');
  assert.equal(convObj.promptId, 'uk_gp');
});





