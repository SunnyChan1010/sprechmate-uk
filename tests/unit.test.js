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
  const assets = new Function(`return [${m[1]}];`)();
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
  const openers = new Function(`return {${openerMatch[1]}};`)();
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
  const envFn = new Function(`return (${m[1].replace(/;\s*$/, '')});`)();

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



