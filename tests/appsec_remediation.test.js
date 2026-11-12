'use strict';
/* v1.6.1 AppSec & Architecture Remediation Regression Suite (#1–#12)
 * Zero runtime dependencies: uses Node built-in node:test, node:assert/strict, and node:vm. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'uk_engine.js'), 'utf8');
const swSrc = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const qrWorkerSrc = fs.readFileSync(path.join(root, 'qr-scanner-worker.min.js'), 'utf8');

function extractFunction(src, name) {
  const m = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\(').exec(src);
  assert.ok(m, 'function not found: ' + name);
  let i = src.indexOf('{', m.index);
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) return src.slice(m.index, j + 1);
  }
  throw new Error('unbalanced braces: ' + name);
}

function extractConstBlock(src, constName, endToken) {
  const start = src.indexOf('const ' + constName + ' =');
  assert.ok(start >= 0, 'const not found: ' + constName);
  const end = src.indexOf(endToken, start);
  assert.ok(end > start, 'end token not found for: ' + constName);
  return src.slice(start, end + endToken.length);
}

function extractLine(src, re) {
  const m = re.exec(src);
  assert.ok(m, 'line not found: ' + re);
  return m[0];
}

function load(code, extra) {
  const ctx = vm.createContext(Object.assign({ console, URL, Uint8Array, ArrayBuffer, DataView, Int16Array, Float32Array, Blob, atob, btoa }, extra || {}));
  vm.runInContext(code, ctx);
  return ctx;
}

/* =========================================================================
 * #1 [Critical] Endpoint Normalization, Settings Import Whitelist, Origin Referer & SSML Escaping
 * ========================================================================= */
test('#1 normalizeChatBaseUrl: 攔截偽協定、非 loopback HTTP、帳密、Query/Hash，並正規化合法端點', () => {
  const ctx = load([
    extractFunction(html, 'normalizeChatBaseUrl'),
    'this.normalizeChatBaseUrl = normalizeChatBaseUrl;'
  ].join('\n'));

  assert.equal(ctx.normalizeChatBaseUrl('javascript:alert(1)'), '');
  assert.equal(ctx.normalizeChatBaseUrl('data:text/html,<h1>x</h1>'), '');
  assert.equal(ctx.normalizeChatBaseUrl('http://evil.com/v1'), '');
  assert.equal(ctx.normalizeChatBaseUrl('https://user:pass@api.openai.com/v1'), '');
  assert.equal(ctx.normalizeChatBaseUrl('https://api.openai.com/v1?leak=1'), '');
  assert.equal(ctx.normalizeChatBaseUrl('https://api.openai.com/v1#frag'), '');
  assert.equal(ctx.normalizeChatBaseUrl('https://evil.com/v1"bad'), '');
  assert.equal(ctx.normalizeChatBaseUrl(''), '');
  assert.equal(ctx.normalizeChatBaseUrl(null), '');

  assert.equal(
    ctx.normalizeChatBaseUrl('  https://generativelanguage.googleapis.com/v1beta/openai/  '),
    'https://generativelanguage.googleapis.com/v1beta/openai'
  );
  assert.equal(
    ctx.normalizeChatBaseUrl('http://127.0.0.1:11434/v1/'),
    'http://127.0.0.1:11434/v1'
  );
  assert.equal(
    ctx.normalizeChatBaseUrl('http://localhost:8080/v1'),
    'http://localhost:8080/v1'
  );
});

test('#1 importSettingsFile: 白名單過濾未知屬性，且變更/回退 chatBaseUrl 未帶新 Key 時強制清空舊 chatKey', async () => {
  let savedSettings = null;
  let curSettings = null;
  const alerts = [];

  class MockFileReader {
    readAsText(file) {
      this.result = file._content;
      if (this.onload) this.onload();
    }
  }

  const defaultsBlock = extractConstBlock(html, 'DEFAULTS', '\n};');
  const providersLine = extractLine(html, /^const TTS_PROVIDERS = .*$/m);
  const geminiVoicesBlock = extractConstBlock(html, 'GEMINI_VOICES', '\n];');
  const regionsBlock = extractConstBlock(html, 'REGIONS', '\n];');

  const ctx = load([
    defaultsBlock,
    providersLine,
    geminiVoicesBlock,
    regionsBlock,
    extractFunction(html, 'normalizeChatBaseUrl'),
    extractFunction(html, 'isSafeAzureVoiceName'),
    extractFunction(html, 'importSettingsFile'),
    'this.importSettingsFile = importSettingsFile;',
    'this.DEFAULTS = DEFAULTS;'
  ].join('\n'), {
    FileReader: MockFileReader,
    getSettings: () => JSON.parse(JSON.stringify(curSettings)),
    saveSettings: (s) => { savedSettings = s; },
    confirmDlg: async () => true,
    fillSettingsForm: () => {},
    refreshConvPromptSel: () => {},
    refreshStorageStats: () => {},
    alertDlg: (msg) => { alerts.push(msg); },
    t: (k) => k
  });

  // 情境 A：本機原為第三方 Gateway + 私鑰，匯入惡意設定檔將 chatBaseUrl 設為空字串（回退至預設端點）或新網域且未附新 chatKey -> 必須清空 chatKey！
  curSettings = Object.assign({}, ctx.DEFAULTS, {
    chatBaseUrl: 'https://gateway.internal.corp/v1',
    chatKey: 'sk-corp-secret-token',
    azureKey: 'az-keep-key'
  });
  const maliciousPayload = JSON.stringify({
    chatBaseUrl: '',
    voice: "en-GB' name='evil/><audio src='https://evil.com/a.wav'/>",
    azureRegion: 'evil.attacker.com#',
    unexpectedAdminFlag: true,
    chatModel: { badType: 1 }
  });
  ctx.importSettingsFile({ size: maliciousPayload.length, _content: maliciousPayload });
  await new Promise(r => setImmediate(r));

  assert.ok(savedSettings, 'saveSettings 應被呼叫');
  assert.equal(savedSettings.chatBaseUrl, 'https://generativelanguage.googleapis.com/v1beta/openai');
  assert.equal(savedSettings.chatKey, '', '端點發生改變且未附帶新 chatKey 時必須清空舊金鑰防外洩');
  assert.equal(savedSettings.azureKey, 'az-keep-key', '未變更之 Azure Key 應保留');
  assert.equal(savedSettings.voice, 'en-GB-SoniaNeural', '非法 Azure Voice 名稱應回退至安全預設值');
  assert.equal(savedSettings.azureRegion, 'uksouth', '非法 Azure Region 應回退至白名單預設值');
  assert.equal(savedSettings.chatModel, 'gemini-3.8-flash', '非字串欄位應被過濾並回退預設值');
  assert.equal('unexpectedAdminFlag' in savedSettings, false, '非 DEFAULTS 白名單鍵必須丟棄');

  // 情境 B：端點相同（僅尾部斜線差異）且匯入無金鑰範本 -> 保留既有 chatKey
  savedSettings = null;
  const benignPayload = JSON.stringify({
    chatBaseUrl: 'https://gateway.internal.corp/v1///',
    uiLang: 'zh'
  });
  ctx.importSettingsFile({ size: benignPayload.length, _content: benignPayload });
  await new Promise(r => setImmediate(r));
  assert.equal(savedSettings.chatBaseUrl, 'https://gateway.internal.corp/v1');
  assert.equal(savedSettings.chatKey, 'sk-corp-secret-token', '正規化後端點一致時應保留本機金鑰');
});

test('#1 chatHeaders: 僅對 openrouter.ai / *.openrouter.ai 傳送 location.origin（絕不洩漏完整 href 給偽造子字串網域）', () => {
  const ctx = load([
    extractFunction(html, 'chatHeaders'),
    'this.chatHeaders = chatHeaders;'
  ].join('\n'), {
    location: {
      origin: 'https://uk.sprechmate.app',
      href: 'https://uk.sprechmate.app/?text=private-shared-note'
    },
    peekSettings: () => ({ chatBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai' })
  });

  const spoof1 = ctx.chatHeaders('k1', 'https://evil.com/v1?target=openrouter.ai');
  assert.equal(spoof1['HTTP-Referer'], undefined);
  assert.equal(spoof1['X-Title'], undefined);

  const spoof2 = ctx.chatHeaders('k1', 'https://fake-openrouter.ai/api/v1');
  assert.equal(spoof2['HTTP-Referer'], undefined);

  const legitRoot = ctx.chatHeaders('k1', 'https://openrouter.ai/api/v1');
  assert.equal(legitRoot['HTTP-Referer'], 'https://uk.sprechmate.app');
  assert.equal(legitRoot['X-Title'], 'SprechMate UK');

  const legitSub = ctx.chatHeaders('k1', 'https://eu.openrouter.ai/api/v1');
  assert.equal(legitSub['HTTP-Referer'], 'https://uk.sprechmate.app');
});

test('#1 azureTtsBlob & isSafeAzureVoiceName: 阻擋 Azure Voice SSML/XML 屬性注入並強制 escapeXml', async () => {
  let capturedReq = null;
  const defaultsBlock = extractConstBlock(html, 'DEFAULTS', '\n};');
  const regionsBlock = extractConstBlock(html, 'REGIONS', '\n];');
  const ctx = load([
    defaultsBlock,
    regionsBlock,
    extractLine(html, /^const escapeXml = .*$/m),
    extractFunction(html, 'isSafeAzureVoiceName'),
    extractFunction(html, 'azureTtsBlob'),
    'this.isSafeAzureVoiceName = isSafeAzureVoiceName;',
    'this.azureTtsBlob = azureTtsBlob;'
  ].join('\n'), {
    AbortController,
    setTimeout,
    clearTimeout,
    learnLocale: () => "en-GB' bad='1",
    peekSettings: () => ({
      azureKey: 'az-test-key',
      azureRegion: 'uksouth',
      voice: "en-GB' name='injected><audio src='https://evil.example/x.mp3'/>"
    }),
    isValidAudioBlob: () => true,
    t: (k) => k,
    fetch: async (url, init) => {
      capturedReq = { url, init };
      return {
        ok: true,
        status: 200,
        blob: async () => new Blob([new Uint8Array(64)], { type: 'audio/mpeg' })
      };
    }
  });

  assert.equal(ctx.isSafeAzureVoiceName('en-GB-SoniaNeural'), true);
  assert.equal(ctx.isSafeAzureVoiceName("en-GB' name='x"), false);
  assert.equal(ctx.isSafeAzureVoiceName('<voice>'), false);

  await ctx.azureTtsBlob("Fish & chips <today> 'cheers'", "en-GB'><lexicon uri='https://evil.com'/>");
  assert.ok(capturedReq);
  assert.equal(capturedReq.url, 'https://uksouth.tts.speech.microsoft.com/cognitiveservices/v1');
  assert.ok(capturedReq.init.body.includes("name='en-GB-SoniaNeural'"), '惡意 voice 參數應安全降級為預設 en-GB-SoniaNeural');
  assert.ok(!capturedReq.init.body.includes('lexicon'), 'SSML 絕不可包含注入標籤');
  assert.ok(capturedReq.init.body.includes('Fish &amp; chips &lt;today&gt; &apos;cheers&apos;'));
});

/* =========================================================================
 * #2 [High] Meta CSP, Referrer, External noreferrer, _headers & Worker Blob URL Revocation
 * ========================================================================= */
test('#2 CSP & Security Headers: index.html meta CSP/referrer、_headers 標頭與 qr-scanner-worker ObjectURL 回收', () => {
  const cspMatch = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"\s*\/>/i);
  assert.ok(cspMatch, 'index.html 必須包含 <meta http-equiv="Content-Security-Policy">');
  const csp = cspMatch[1];
  assert.ok(csp.includes("default-src 'self'"));
  assert.ok(csp.includes("script-src 'self' 'unsafe-inline'"));
  assert.ok(csp.includes("worker-src 'self' blob:"));
  assert.ok(csp.includes("object-src 'none'"));
  assert.ok(!csp.includes('frame-ancestors'), 'meta CSP 不得包含無效且會觸發瀏覽器警告的 frame-ancestors');

  assert.ok(/<meta\s+name="referrer"\s+content="no-referrer"\s*\/>/i.test(html), '必須宣告 referrer no-referrer');
  assert.ok(/class="ver-link"[^>]*rel="noopener noreferrer"/i.test(html), '外部連結必須包含 rel="noopener noreferrer"');
  assert.ok(html.includes('v1.6.1'), 'index.html 版本號應更新為 v1.6.1');

  const headersPath = path.join(root, '_headers');
  assert.ok(fs.existsSync(headersPath), '根目錄必須存在 Cloudflare Pages _headers');
  const headersTxt = fs.readFileSync(headersPath, 'utf8');
  assert.ok(headersTxt.includes('X-Frame-Options: DENY'));
  assert.ok(headersTxt.includes('X-Content-Type-Options: nosniff'));
  assert.ok(headersTxt.includes('Referrer-Policy: no-referrer'));
  assert.ok(headersTxt.includes("frame-ancestors 'none'"));

  const assetsIgnore = fs.readFileSync(path.join(root, '.assetsignore'), 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
  assert.equal(assetsIgnore.includes('_headers'), false, '_headers 不得被 .assetsignore 排除');

  // 驗證 qr-scanner-worker.min.js 配對釋放 Blob URL 且具備冪等性
  assert.ok(qrWorkerSrc.includes('URL.createObjectURL') && qrWorkerSrc.includes('URL.revokeObjectURL'));
  const created = [];
  const revoked = [];
  const listeners = {};
  let scheduledFn = null;
  const workerCjs = qrWorkerSrc.replace(/^export\s+const\s+createWorker\s*=/, 'this.createWorker =');
  const wCtx = load(workerCjs, {
    Blob: class { constructor(parts, opts) { this.parts = parts; this.opts = opts; } },
    URL: {
      createObjectURL: () => { const u = 'blob:qr-1'; created.push(u); return u; },
      revokeObjectURL: (u) => { revoked.push(u); }
    },
    Worker: class {
      constructor(u) { this.url = u; }
      addEventListener(ev, fn) { listeners[ev] = fn; }
    },
    setTimeout: (fn) => { scheduledFn = fn; return 99; },
    clearTimeout: () => {}
  });
  wCtx.createWorker();
  assert.equal(created.length, 1);
  assert.equal(revoked.length, 0);
  listeners.message();
  if (scheduledFn) scheduledFn();
  assert.deepEqual(revoked, ['blob:qr-1'], 'Blob URL 必須在首次事件或逾時後精準釋放一次（冪等）');
});

/* =========================================================================
 * #3 [High] Two-Stage Placeholder Tokenization in mdInline
 * ========================================================================= */
test('#3 mdInline: 保護網址內的底線/星號/波浪號，支援連結文字粗斜體，並拒絕偽協定', () => {
  const ctx = load([
    extractLine(html, /^const esc = s =>.*$/m),
    extractFunction(html, 'mdInline'),
    'this.mdInline = mdInline;'
  ].join('\n'));

  const wiki = ctx.mdInline('[link](https://en.wikipedia.org/wiki/Received_Pronunciation_test_page)');
  assert.equal(
    wiki,
    '<a href="https://en.wikipedia.org/wiki/Received_Pronunciation_test_page" target="_blank" rel="noopener noreferrer">link</a>'
  );

  const tildeStar = ctx.mdInline('[x](https://a.com/~user/a*b*c~d)');
  assert.equal(
    tildeStar,
    '<a href="https://a.com/~user/a*b*c~d" target="_blank" rel="noopener noreferrer">x</a>'
  );

  const boldLabel = ctx.mdInline('[**bold**](https://example.com/a_b_c)');
  assert.equal(
    boldLabel,
    '<a href="https://example.com/a_b_c" target="_blank" rel="noopener noreferrer"><strong>bold</strong></a>'
  );

  const codeProtected = ctx.mdInline('Use `foo_bar_baz * a * b` here');
  assert.equal(codeProtected, 'Use <code>foo_bar_baz * a * b</code> here');

  const jsUrl = ctx.mdInline('[**click**](javascript:void0)');
  assert.ok(!jsUrl.includes('<a'), 'javascript: 連結必須被拒絕');
  assert.equal(jsUrl, '<strong>click</strong>');
  assert.ok(!ctx.mdInline('[**click**](javascript:alert(1))').includes('<a'));
});

/* =========================================================================
 * #4 [High] Recording Lifecycle: abortActiveRecording, Stream Cleanup & AudioContext.resume()
 * ========================================================================= */
test('#4 Recording Lifecycle: abortActiveRecording 丟棄半截錄音並停軌、openSettings/switchTab 觸發中止、startMeter 喚醒 suspended AudioContext', async () => {
  let trackStops = 0;
  let resumeCalls = 0;
  let meterStops = 0;
  let savedBlobCount = 0;

  // 1. 驗證 startMeter 在 AudioContext suspended 時呼叫 resume()
  const meterSandbox = load([
    'let meterCtx = null, meterRaf = 0;',
    'function stopMeter() { meterStops++; }',
    extractFunction(html, 'startMeter'),
    'this.startMeter = startMeter;'
  ].join('\n'), {
    meterStops: 0,
    window: {
      AudioContext: class {
        constructor() { this.state = 'suspended'; }
        resume() { resumeCalls++; return Promise.resolve(); }
        createMediaStreamSource() { return { connect() {} }; }
        createAnalyser() {
          return {
            fftSize: 0,
            getByteTimeDomainData() {}
          };
        }
      }
    },
    $: () => ({ style: {}, dataset: {}, textContent: '' }),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
    performance: { now: () => 0 },
    SPEECH_RMS: 0.015,
    REC_SILENCE_MS: 10000,
    recT0: 0,
    fmtRecTime: () => '0:00',
    t: (k) => k
  });
  meterSandbox.startMeter({});
  assert.equal(resumeCalls, 1, 'WebKit suspended AudioContext 必須呼叫 resume()');

  // 2. 驗證 abortActiveRecording 停止錄音機與麥克風軌道，且不會誤存半截錄音
  const recBtn = {
    disabled: false,
    classes: new Set(['recording']),
    classList: {
      add(c) { recBtn.classes.add(c); },
      remove(c) { recBtn.classes.delete(c); },
      contains(c) { return recBtn.classes.has(c); }
    }
  };
  let recorderStopped = 0;
  const recSandbox = load([
    'let recSession = null, recBusy = false, recStarting = false, recStartSeq = 0;',
    'const REC_MAX_MS = 30000;',
    extractFunction(html, 'setRecHint'),
    extractFunction(html, 'setRecUI'),
    extractFunction(html, 'abortActiveRecording'),
    extractFunction(html, 'stopRecording'),
    'this.abortActiveRecording = abortActiveRecording;',
    'this.stopRecording = stopRecording;',
    'this.seedSession = s => { recSession = s; };',
    'this.getSession = () => recSession;'
  ].join('\n'), {
    $: (id) => (id === 'recBtn' ? recBtn : { classList: { add() {}, remove() {} }, textContent: '', dataset: {} }),
    stopMeter: () => { meterStops++; },
    navigator: {},
    clearTimeout,
    setTimeout,
    idbSet: async () => { savedBlobCount++; },
    t: (k) => k
  });

  const activeSession = {
    recorder: {
      state: 'recording',
      ondataavailable: () => {},
      onstop: () => {},
      stop() { this.state = 'inactive'; recorderStopped++; }
    },
    stream: {
      getTracks: () => [{ stop() { trackStops++; } }, { stop() { trackStops++; } }]
    },
    chunks: [{ size: 512 }],
    text: 'Test sentence',
    maxTimer: 999,
    _discarded: false
  };
  recSandbox.seedSession(activeSession);
  recSandbox.abortActiveRecording();
  await recSandbox.stopRecording();

  assert.equal(recSandbox.getSession(), null);
  assert.equal(activeSession._discarded, true);
  assert.equal(recorderStopped, 1);
  assert.equal(trackStops, 2, '所有 MediaStreamTrack 必須被 stop()');
  assert.equal(savedBlobCount, 0, '被中止的半截錄音不得進入儲存與評分流程');
  assert.equal(recBtn.classes.has('recording'), false);

  // 3. 驗證 openSettings() 與 switchTab('reading') 皆會呼叫 abortActiveRecording()
  let abortCalls = 0;
  const openSetCtx = load([
    extractFunction(html, 'openSettings'),
    'this.openSettings = openSettings;'
  ].join('\n'), {
    abortActiveRecording: () => { abortCalls++; },
    adaptSyncScanBtn: () => {},
    $: () => ({ offsetWidth: 36, style: {}, classList: { add() {}, remove() {} } }),
    document: { getElementById: () => ({ classList: { add() {}, remove() {} } }) },
    fillSettingsForm: () => {},
    refreshStorageStats: () => {},
    refreshUsageUI: () => {},
    window: { scrollTo: () => {} }
  });
  openSetCtx.openSettings();
  assert.equal(abortCalls, 1, 'openSettings() 必須中止進行中的錄音');

  const tabCtx = load([
    "let currentActiveTab = 'practice';",
    'let reviewAutoTimer = null;',
    'let pendingReviewAssessmentId = "rev1";',
    'let ukReadingPresets = [{ id: "p1" }];',
    extractFunction(engine, 'switchTab'),
    'this.switchTab = switchTab;'
  ].join('\n'), {
    window: {
      abortActiveRecording: () => { abortCalls++; },
      scrollTo: () => {}
    },
    document: {
      querySelectorAll: () => [],
      getElementById: () => ({ classList: { add() {}, remove() {}, toggle() {}, contains: () => true } })
    },
    renderReadingStudio: () => {},
    analyzeReadingText: () => {}
  });
  tabCtx.switchTab('reading');
  assert.equal(abortCalls, 2, "switchTab('reading') 離開跟讀分頁時必須呼叫 window.abortActiveRecording()");

  // 4. 驗證 startRecording() 當 MediaRecorder 建構拋出例外時，catch 區塊必定停止已取得的麥克風軌道
  let leakedTracksStopped = 0;
  const errSandbox = load([
    'let recSession = null, recBusy = false, recStarting = false, recStartSeq = 0;',
    'const REC_MAX_MS = 30000;',
    extractFunction(html, 'setRecHint'),
    extractFunction(html, 'setRecUI'),
    extractFunction(html, 'startRecording'),
    'this.startRecording = startRecording;'
  ].join('\n'), {
    $: (id) => (id === 'sentenceText'
      ? { value: 'Lovely weather today.' }
      : { classList: { add() {}, remove() {}, contains: () => false }, textContent: '', dataset: {} }),
    window: { stopAllAudioPlayback: () => {} },
    getSettings: () => ({ azureKey: 'az-key', azureRegion: 'uksouth' }),
    navigator: {
      mediaDevices: {
        getUserMedia: async () => ({
          getTracks: () => [{ stop() { leakedTracksStopped++; } }]
        })
      }
    },
    MediaRecorder: class {
      constructor() { throw new Error('NotSupportedError: codec unavailable'); }
    },
    stopMeter: () => { meterStops++; },
    dlg: () => {},
    t: (k) => k
  });
  await errSandbox.startRecording();
  assert.equal(leakedTracksStopped, 1, 'MediaRecorder 初始化失敗時必須在 catch 釋放麥克風軌道');
});

/* =========================================================================
 * #5 [High] Zero-Allocation peekSettings() vs Deep-Clone getSettings()
 * ========================================================================= */
test('#5 peekSettings & getSettings: peekSettings 回傳 O(1) 同一參考，getSettings 回傳隔離深拷貝', () => {
  const defaultsBlock = extractConstBlock(html, 'DEFAULTS', '\n};');
  const providersLine = extractLine(html, /^const TTS_PROVIDERS = .*$/m);
  const geminiVoicesBlock = extractConstBlock(html, 'GEMINI_VOICES', '\n];');
  const regionsBlock = extractConstBlock(html, 'REGIONS', '\n];');
  const langsBlock = extractConstBlock(html, 'LANGS', '\n];');
  const voicesBlock = extractConstBlock(html, 'VOICES', '\n};');

  const ctx = load([
    "const LS_SETTINGS = 'deutsch.settings.v1';",
    defaultsBlock,
    providersLine,
    geminiVoicesBlock,
    regionsBlock,
    langsBlock,
    voicesBlock,
    'let _settingsCache = null;',
    extractFunction(html, 'clampInt'),
    extractFunction(html, 'normalizeChatBaseUrl'),
    extractFunction(html, 'isSafeAzureVoiceName'),
    extractFunction(html, 'computeSettings'),
    extractFunction(html, 'peekSettings'),
    extractFunction(html, 'getSettings'),
    'this.peekSettings = peekSettings;',
    'this.getSettings = getSettings;'
  ].join('\n'), {
    localStorage: { getItem: () => null, setItem: () => {} },
    navigator: { language: 'zh-HK' },
    langOf: (code) => ({ code: code || 'en-GB', locale: 'en-GB', zh: '英式英語', en: 'English (UK)' }),
    defaultPromptName: () => 'Default',
    customsPromptName: () => 'Customs',
    buildDefaultPrompt: () => 'default prompt',
    buildCustomsPrompt: () => 'customs prompt',
    getUKTemplates: () => [{ id: 'uk_gp', name: 'GP', content: 'gp' }],
    t: (k) => k
  });

  const p1 = ctx.peekSettings();
  const p2 = ctx.peekSettings();
  assert.equal(p1, p2, 'peekSettings() 連續呼叫必須回傳同一個快取物件參考');

  const g1 = ctx.getSettings();
  assert.notEqual(g1, p1, 'getSettings() 必須回傳全新深拷貝副本');
  g1.chatKey = 'mutated-in-memory';
  assert.equal(ctx.peekSettings().chatKey, '', '修改 getSettings() 回傳物件不得污染 peekSettings() 快取');
});

/* =========================================================================
 * #6 [High] Coalesced saveConvs + Dirty Flag + lastRefPcm16 Cache
 * ========================================================================= */
test('#6 saveConvs & flushConvsNow: 合併高頻連續寫入、convsDirty 略過乾淨寫盤，且 lastRefPcm16 避免重複解碼', async () => {
  const writes = [];
  const saveCtx = load([
    "const IDB_CONVS_KEY = 'json:convs';",
    'let convsCache = null;',
    'let convsLoaded = true;',
    'let convsSaveWarned = false;',
    'let convsDirty = false;',
    'let convsSaveTimer = 0;',
    'let convsPendingResolvers = [];',
    extractFunction(html, 'flushConvsNow'),
    extractFunction(html, 'saveConvs'),
    'this.saveConvs = saveConvs;',
    'this.flushConvsNow = flushConvsNow;'
  ].join('\n'), {
    setTimeout,
    clearTimeout,
    idbSet: async (k, v) => { writes.push([k, v]); },
    idbCount: async () => 0,
    trimTtsCache: async () => {},
    alertDlg: () => {},
    t: (k) => k
  });

  // 連續突發 5 次 saveConvs：應合併為單次 IndexedDB 寫入（最新第 5 筆資料），且全部 Promise 均正常 resolve
  const pA = saveCtx.saveConvs([{ id: '1', step: 1 }]);
  const pB = saveCtx.saveConvs([{ id: '1', step: 2 }]);
  const pC = saveCtx.saveConvs([{ id: '1', step: 3 }]);
  const pD = saveCtx.saveConvs([{ id: '1', step: 4 }]);
  const pE = saveCtx.saveConvs([{ id: '1', step: 5 }]);
  await Promise.all([pA, pB, pC, pD, pE]);

  assert.equal(writes.length, 1, '80ms 視窗內的 5 次突發寫入必須合併為 1 次 idbSet');
  assert.deepEqual(JSON.parse(writes[0][1]), [{ id: '1', step: 5 }]);

  // 乾淨狀態下觸發 flushConvsNow（如 pagehide / visibilitychange）不得重複序列化寫盤
  await saveCtx.flushConvsNow();
  assert.equal(writes.length, 1, 'convsDirty 為 false 時不得重複寫入 IndexedDB');

  // 驗證 drawProsodyMirror 複用 lastRefPcm16，不重複呼叫 decodeToPcm16k
  let decodeCalls = 0;
  const fakeCanvasCtx = {
    scale() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    fillRect() {}, fillText() {}, setLineDash() {}
  };
  const fakeCanvas = {
    clientWidth: 320,
    width: 320,
    height: 92,
    getBoundingClientRect: () => ({ width: 320, height: 92 }),
    getContext: () => fakeCanvasCtx
  };
  const mirrorWrap = { classList: { add() {}, remove() {} } };

  const prosodyCtx = load([
    'let lastRefBlob = { id: "ref-blob-1" };',
    'let lastRefPcm16 = null;',
    'let lastUserPcm16 = new Int16Array(1600);',
    extractFunction(html, 'drawProsodyMirror'),
    'this.drawProsodyMirror = drawProsodyMirror;',
    'this.resetRef = b => { lastRefBlob = b; lastRefPcm16 = null; };'
  ].join('\n'), {
    $: (id) => (id === 'prosodyMirrorWrap' ? mirrorWrap : fakeCanvas),
    window: { devicePixelRatio: 1 },
    decodeToPcm16k: async () => {
      decodeCalls++;
      return new Int16Array(1600);
    }
  });

  await prosodyCtx.drawProsodyMirror([]);
  await prosodyCtx.drawProsodyMirror([]);
  assert.equal(decodeCalls, 1, '同一份 lastRefBlob 重複繪製波形時只應解碼一次');
  prosodyCtx.resetRef({ id: 'ref-blob-2' });
  await prosodyCtx.drawProsodyMirror([]);
  assert.equal(decodeCalls, 2, '更換 lastRefBlob 並清空 lastRefPcm16 後應重新解碼');
});

/* =========================================================================
 * #7 [Medium] Service Worker v11, AbortController, Captive Portal Guard & waitUntil
 * ========================================================================= */
test('#7 sw.js: CACHE=sprechmate-uk-v11、攔截 Captive Portal text/html 污染非 HTML 資產、逾時 abort 與 e.waitUntil', async () => {
  const listeners = {};
  const cacheMap = new Map();
  cacheMap.set('http://127.0.0.1:8000/uk_engine.js', { status: 200, body: '/* cached js */' });
  cacheMap.set('http://127.0.0.1:8000/uk_stages.json', { status: 200, body: '[]' });

  let fetchImpl = null;
  const swCtx = load(swSrc + '\nthis.CACHE = CACHE;', {
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
      open: async () => ({
        addAll: async () => {},
        put: async (req, res) => { cacheMap.set(req.url, res); }
      }),
      keys: async () => [],
      delete: async () => {},
      match: async (req) => cacheMap.get(typeof req === 'string' ? ('http://127.0.0.1:8000/' + req) : req.url) || null
    },
    fetch: (req, init) => fetchImpl(req, init),
    setTimeout,
    clearTimeout
  });

  assert.equal(swCtx.CACHE, 'sprechmate-uk-v11');

  // 1. Captive Portal 測試：請求 .js 卻收到 200 text/html 登入頁 -> 必須拒絕寫入快取並回退既有快取
  let putCount = 0;
  fetchImpl = async () => ({
    ok: true,
    status: 200,
    type: 'basic',
    redirected: false,
    headers: { get: (h) => (h.toLowerCase() === 'content-type' ? 'text/html; charset=utf-8' : '') },
    clone() { putCount++; return this; }
  });
  let responded = null;
  const waitUntilPromises = [];
  listeners.fetch({
    request: { url: 'http://127.0.0.1:8000/uk_engine.js', method: 'GET', mode: 'cors' },
    respondWith: (p) => { responded = p; },
    waitUntil: (p) => { waitUntilPromises.push(p); }
  });
  const portalRes = await responded;
  assert.equal(portalRes.body, '/* cached js */', 'Captive Portal 回傳 HTML 給 .js 時必須回退安全快取');
  assert.equal(putCount, 0, '絕不可將 text/html 寫入 .js 快取');

  // 2. 正常 JSON 回應：應透過 e.waitUntil 寫入快取
  fetchImpl = async () => ({
    ok: true,
    status: 200,
    type: 'basic',
    redirected: false,
    body: '[{"level":1}]',
    headers: { get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : '') },
    clone() { return Object.assign({}, this); }
  });
  listeners.fetch({
    request: { url: 'http://127.0.0.1:8000/uk_drills.json', method: 'GET', mode: 'cors' },
    respondWith: (p) => { responded = p; },
    waitUntil: (p) => { waitUntilPromises.push(p); }
  });
  await responded;
  assert.equal(waitUntilPromises.length, 1, '快取寫入必須包裹於 e.waitUntil 保護生命週期');
  await Promise.all(waitUntilPromises);
  assert.equal(cacheMap.get('http://127.0.0.1:8000/uk_drills.json').body, '[{"level":1}]');

  // 3. 驗證 AbortController 訊號傳遞與超時中止
  assert.ok(swSrc.includes('new AbortController()') && swSrc.includes('ac.abort()'));
});

/* =========================================================================
 * #8 [Medium] Stacked Modal Escape Ordering (isTopOverlay), Idempotent Close & ARIA
 * ========================================================================= */
test('#8 Modal Stack & ARIA: Escape 僅關閉最頂層彈窗（含單獨 #phoneticModal 與堆疊 dlg/showSyncQr），且關閉具冪等保護', async () => {
  const openModals = [];
  const keyListeners = [];
  let scrollLocks = 0;

  function makeElem(tag) {
    const classes = new Set();
    const attrs = {};
    const children = [];
    const el = {
      tagName: String(tag || 'div').toUpperCase(),
      id: '',
      textContent: '',
      value: '',
      style: {},
      parentNode: null,
      children,
      set className(v) {
        classes.clear();
        String(v || '').split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
      },
      get className() { return Array.from(classes).join(' '); },
      classList: {
        add(c) { classes.add(c); },
        remove(c) { classes.delete(c); },
        contains(c) { return classes.has(c); }
      },
      setAttribute(k, v) { attrs[k] = String(v); },
      getAttribute(k) { return attrs[k] || null; },
      appendChild(child) {
        child.parentNode = el;
        children.push(child);
        return child;
      },
      removeChild(child) {
        const idx = children.indexOf(child);
        if (idx >= 0) { children.splice(idx, 1); child.parentNode = null; }
      },
      remove() {
        if (el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
      },
      addEventListener(ev, fn) { el['_on' + ev] = fn; },
      querySelector(sel) {
        if (sel === '.dlg-cancel') return { onclick: null };
        if (sel === '.sync-qr') return { remove() {} };
        if (sel === '.sync-sub') return { textContent: '' };
        return null;
      },
      focus() {},
      select() {},
      _innerHTML: '',
      set innerHTML(v) { el._innerHTML = v; },
      get innerHTML() { return el._innerHTML; }
    };
    return el;
  }

  const body = makeElem('body');
  const phModal = makeElem('div');
  phModal.id = 'phoneticModal';
  phModal.className = 'dlg-ov hidden';
  body.appendChild(phModal);

  const doc = {
    body,
    createElement: makeElem,
    getElementById: (id) => (id === 'phoneticModal' ? phModal : null),
    querySelectorAll: (sel) => {
      if (sel === '.dlg-ov:not(.hidden)') {
        return body.children.filter(ch => ch.classList.contains('dlg-ov') && !ch.classList.contains('hidden'));
      }
      return [];
    },
    addEventListener: (ev, fn) => {
      if (ev === 'keydown') keyListeners.push(fn);
    },
    removeEventListener: (ev, fn) => {
      if (ev === 'keydown') {
        const i = keyListeners.indexOf(fn);
        if (i >= 0) keyListeners.splice(i, 1);
      }
    }
  };

  function pressEscape() {
    let stopped = false;
    const ev = {
      key: 'Escape',
      preventDefault() {},
      stopImmediatePropagation() { stopped = true; }
    };
    for (const fn of [...keyListeners]) {
      fn(ev);
      if (stopped) break;
    }
  }

  const win = {};
  const modalCtx = load([
    extractLine(html, /^const esc = s =>.*$/m),
    extractFunction(html, 'isTopOverlay'),
    'window.isTopOverlay = isTopOverlay;',
    extractFunction(html, 'dlg'),
    extractFunction(html, 'showSyncQr'),
    extractFunction(engine, 'closePhoneticModal'),
    'this.isTopOverlay = isTopOverlay;',
    'this.dlg = dlg;',
    'this.showSyncQr = showSyncQr;',
    'this.closePhoneticModal = closePhoneticModal;'
  ].join('\n'), {
    window: win,
    document: doc,
    lockScroll: () => { scrollLocks++; },
    unlockScroll: () => { scrollLocks--; },
    loadScript: async () => {},
    drawSyncQr: () => {},
    syncPayload: () => '{}',
    requestAnimationFrame: (fn) => fn(),
    t: (k) => k
  });

  // 模擬 initUkSuite 註冊之 #phoneticModal Escape 監聽器
  doc.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape'
      && phModal
      && !phModal.classList.contains('hidden')
      && (!win.isTopOverlay || win.isTopOverlay(phModal))
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      modalCtx.closePhoneticModal();
    }
  });

  // 情境 A：單獨開啟 #phoneticModal 時按 Escape 應正常關閉 #phoneticModal
  phModal.classList.remove('hidden');
  assert.equal(modalCtx.isTopOverlay(phModal), true);
  pressEscape();
  assert.equal(phModal.classList.contains('hidden'), true, '單獨開啟 #phoneticModal 時按 Escape 必須關閉它');

  // 情境 B：開啟 #phoneticModal 後再疊加開啟 dlg() -> 按第 1 次 Escape 僅關閉頂層 dlg，第 2 次 Escape 才關閉底層 #phoneticModal
  phModal.classList.remove('hidden');
  const dlgPromise = modalCtx.dlg({ title: 'Top Alert', message: 'Stacked dialog', cancel: true });
  assert.equal(body.children.length, 2);
  assert.equal(modalCtx.isTopOverlay(phModal), false, '上層有 dlg 時 #phoneticModal 不再是頂層');

  const topDlgOv = body.children[1];
  assert.equal(modalCtx.isTopOverlay(topDlgOv), true);

  pressEscape(); // 第 1 次 Escape：只關閉 dlg
  const dlgResult = await dlgPromise;
  assert.equal(dlgResult, false);
  assert.equal(body.children.length, 1, '頂層 dlg 應已被移除');
  assert.equal(phModal.classList.contains('hidden'), false, '底層 #phoneticModal 必須保持開啟，不得跟著崩塌');
  assert.equal(scrollLocks, 0, 'unlockScroll 計數必須平衡');

  pressEscape(); // 第 2 次 Escape：關閉 #phoneticModal
  assert.equal(phModal.classList.contains('hidden'), true, '第 2 次按 Escape 應關閉底層 #phoneticModal');

  // 情境 C：開啟 #phoneticModal 後疊加 showSyncQr()，驗證 Escape 僅關閉 QR 彈窗，且重複點擊取消按鈕具冪等保護
  phModal.classList.remove('hidden');
  let cancelBtnObj = null;
  const origQuery = doc.createElement;
  doc.createElement = (tag) => {
    const el = origQuery(tag);
    if (tag === 'div') {
      el.querySelector = (sel) => {
        if (sel === '.dlg-cancel') {
          if (!cancelBtnObj) cancelBtnObj = { onclick: null };
          return cancelBtnObj;
        }
        if (sel === '.sync-qr') return { remove() {} };
        if (sel === '.sync-sub') return { textContent: '' };
        return null;
      };
    }
    return el;
  };
  const qrPromise = modalCtx.showSyncQr();
  assert.equal(body.children.length, 2);
  pressEscape(); // 關閉頂層 showSyncQr
  await qrPromise;
  assert.equal(body.children.length, 1);
  assert.equal(phModal.classList.contains('hidden'), false, '關閉頂層 showSyncQr 時底層 #phoneticModal 必須維持開啟');
  if (cancelBtnObj && cancelBtnObj.onclick) cancelBtnObj.onclick(); // 重複觸發 close() 測試冪等鎖
  assert.equal(scrollLocks, 0, '重複呼叫 close() 不得導致 unlockScroll 負數失衡');
  pressEscape();
  assert.equal(phModal.classList.contains('hidden'), true);
  doc.createElement = origQuery;

  // 驗證靜態 ARIA 標記存在於自訂彈窗與 #phoneticModal
  assert.ok(/id="phoneticModal"[\s\S]{0,160}role="dialog"\s+aria-modal="true"/.test(html));
  for (const fnName of ['showSyncQr', 'showCameraScan', 'previewCheckinCard']) {
    const fnBody = extractFunction(html, fnName);
    assert.ok(fnBody.includes('role="dialog"') && fnBody.includes('aria-modal="true"'), `${fnName} 必須具備 role="dialog" 與 aria-modal="true"`);
  }
});

/* =========================================================================
 * #9 [Medium] base64AudioToBlob Container/SampleRate/Alignment & Gemini TTS 60s Cooldown
 * ========================================================================= */
test('#9 base64AudioToBlob & geminiTtsBlob: 支援 OggS 識別、16kHz PCM 採樣率寫入、奇數位元組對齊與 60s 網路冷卻', async () => {
  const audioCtx = load([
    extractFunction(html, 'base64AudioToBlob'),
    'this.base64AudioToBlob = base64AudioToBlob;'
  ].join('\n'));

  // 1. OggS 標頭自動識別為 audio/ogg
  const oggBytes = Uint8Array.from([0x4F, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00]);
  const oggB64 = Buffer.from(oggBytes).toString('base64');
  const oggBlob = audioCtx.base64AudioToBlob(oggB64, 'audio/ogg');
  assert.equal(oggBlob.type, 'audio/ogg');
  assert.equal(oggBlob.size, 8);

  // 2. audio/pcm;rate=16000 且輸入為奇數 5 bytes -> 對齊為 4 bytes PCM + 44 bytes WAV header = 48 bytes，sampleRate=16000
  const oddPcm = Uint8Array.from([0x10, 0x01, 0x20, 0x02, 0xFF]);
  const pcmB64 = Buffer.from(oddPcm).toString('base64');
  const wavBlob = audioCtx.base64AudioToBlob(pcmB64, 'audio/pcm;rate=16000');
  assert.equal(wavBlob.type, 'audio/wav');
  assert.equal(wavBlob.size, 48, '5 bytes 奇數長度應偶數對齊為 4 bytes + 44 bytes WAV 標頭');
  const wavBuf = await wavBlob.arrayBuffer();
  const dv = new DataView(wavBuf);
  assert.equal(dv.getUint32(24, true), 16000, 'WAV 標頭 offset 24 採樣率必須為 16000');
  assert.equal(dv.getUint32(28, true), 32000, 'WAV 標頭 offset 28 byteRate 必須為 32000');
  assert.equal(dv.getUint32(40, true), 4, 'WAV data chunk 長度必須為對齊後的 4');

  // 3. geminiTtsBlob 網路波動 60 秒暫時冷卻（而非永久關閉 Interactions API）
  let fakeNow = 1000000;
  const hitUrls = [];
  let failInteractionsNetwork = true;
  const validPcm64 = Buffer.alloc(120, 1).toString('base64');

  const gemCtx = load([
    'let geminiInteractionsSupported = true;',
    'let geminiInteractionsCooldownUntil = 0;',
    extractFunction(html, 'buildGeminiStylePrompt'),
    extractFunction(html, 'extractGeminiAudioBase64'),
    extractFunction(html, 'base64AudioToBlob'),
    extractFunction(html, 'geminiTtsBlob'),
    'this.geminiTtsBlob = geminiTtsBlob;',
    'this.getState = () => ({ geminiInteractionsSupported, geminiInteractionsCooldownUntil });'
  ].join('\n'), {
    Date: { now: () => fakeNow },
    AbortController,
    setTimeout,
    clearTimeout,
    isValidAudioBlob: (b) => b && b.size > 44,
    t: (k) => k,
    fetch: async (url) => {
      hitUrls.push(url);
      if (url.includes('/interactions')) {
        if (failInteractionsNetwork) throw new Error('Transient Tube network drop');
        return {
          ok: true,
          status: 200,
          json: async () => ({ output_audio: { data: validPcm64, mime_type: 'audio/pcm;rate=24000' } })
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ inlineData: { data: validPcm64, mimeType: 'audio/pcm;rate=24000' } }] } }]
        })
      };
    }
  });

  // 第 1 次：Interactions 網路失敗 -> 降級走 generateContent，設定 60s 冷卻，但 geminiInteractionsSupported 仍為 true！
  await gemCtx.geminiTtsBlob('Mind the gap', 'gemini-3.8-flash-lite-tts', 'Kore', 'en-GB', 'gem-key');
  assert.equal(gemCtx.getState().geminiInteractionsSupported, true, '網路逾時不得永久關閉 geminiInteractionsSupported');
  assert.equal(gemCtx.getState().geminiInteractionsCooldownUntil, fakeNow + 60000);
  assert.equal(hitUrls.length, 2);

  // 第 2 次（30 秒後，仍在冷卻期內）：跳過 Interactions 直走 generateContent
  fakeNow += 30000;
  failInteractionsNetwork = false;
  await gemCtx.geminiTtsBlob('Mind the gap', 'gemini-3.8-flash-lite-tts', 'Kore', 'en-GB', 'gem-key');
  assert.equal(hitUrls.length, 3);
  assert.ok(hitUrls[2].includes(':generateContent'));

  // 第 3 次（滿 61 秒，冷卻結束）：自動恢復優先使用 /v1beta/interactions！
  fakeNow += 31000;
  await gemCtx.geminiTtsBlob('Mind the gap', 'gemini-3.8-flash-lite-tts', 'Kore', 'en-GB', 'gem-key');
  assert.equal(hitUrls.length, 4);
  assert.ok(hitUrls[3].includes('/v1beta/interactions'), '冷卻期結束後必須自動恢復探測 Interactions API');
});

/* =========================================================================
 * #10 [Medium] Reading Studio 80-Sentence Pagination, Delegation & Shadow Radio Auto-Expand
 * ========================================================================= */
test('#10 Reading Studio: >80 句時分批渲染 80 句 + [data-rd-act="more"] 委派載入，且 Shadow Radio 自動擴展跨頁語塊', async () => {
  function makeNode(tag) {
    return {
      tagName: tag,
      id: '',
      className: '',
      textContent: '',
      innerHTML: '',
      style: {},
      dataset: {},
      disabled: false,
      attrs: {},
      children: [],
      setAttribute(k, v) { this.attrs[k] = String(v); },
      getAttribute(k) { return this.attrs[k] || null; },
      appendChild(ch) {
        if (ch && ch.isFragment) {
          ch.children.forEach(c => this.children.push(c));
        } else {
          this.children.push(ch);
        }
        return ch;
      },
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      scrollIntoView() {}
    };
  }

  const container = makeNode('div');
  let listClickHandler = null;
  container.addEventListener = (ev, fn) => { if (ev === 'click') listClickHandler = fn; };
  container.contains = () => true;

  const sentences190 = Array.from({ length: 190 }, (_, i) => `Sentence number ${i + 1} for UK reading practice.`);

  const rdCtx = load([
    'const READING_PAGE_SIZE = 80;',
    'let readingRenderLimit = READING_PAGE_SIZE;',
    `let currentReadingSentences = ${JSON.stringify(sentences190)};`,
    'let connSpeechEnabled = false;',
    'let isShadowRadioActive = false;',
    'let shadowRadioTimer = null;',
    'let shadowRadioResolver = null;',
    'let shadowRadioSeq = 0;',
    extractLine(html, /^const esc = s =>.*$/m),
    extractFunction(engine, 'annotateConnectedSpeech'),
    extractFunction(engine, 'renderReadingStudio'),
    extractFunction(engine, 'initReadingStudio'),
    extractFunction(engine, 'stopShadowRadio'),
    extractFunction(engine, 'toggleShadowRadio'),
    'this.renderReadingStudio = renderReadingStudio;',
    'this.initReadingStudio = initReadingStudio;',
    'this.toggleShadowRadio = toggleShadowRadio;',
    'this.getLimit = () => readingRenderLimit;',
    'this.setLimit = v => { readingRenderLimit = v; };'
  ].join('\n'), {
    document: {
      createElement: (tag) => makeNode(tag),
      createDocumentFragment: () => ({ isFragment: true, children: [], appendChild(c) { this.children.push(c); } }),
      getElementById: (id) => {
        if (id === 'readingSentencesList') return container;
        if (id && id.startsWith('rd-item-')) {
          return container.children.find(c => c.id === id) || null;
        }
        if (id === 'shadowRadioBtn') return makeNode('button');
        return null;
      },
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    loadReadingPresets: async () => {},
    rewardReadingEngagement: () => {},
    playUkVoice: async (txt) => {
      // 當讀到第 81 句（index 80）時即可停止連播
      if (txt.includes('number 81 ')) {
        return { durationMs: 0, interrupted: true };
      }
      return { durationMs: 0, interrupted: false };
    },
    stopCurrentUkAudio: () => {},
    setTimeout: (fn) => { fn(); return 1; },
    clearTimeout: () => {},
    t: (k) => k
  });

  rdCtx.initReadingStudio();
  container.children = [];
  rdCtx.renderReadingStudio(sentences190);

  const initialItems = container.children.filter(c => c.className === 'reading-sentence-item');
  assert.equal(initialItems.length, 80, '初次渲染應限制為 80 個語塊');
  assert.ok(initialItems[0].innerHTML.includes('data-rd-act="play"'), '語塊按鈕必須採用 data-rd-act 事件委派');

  const moreWrap = container.children[80];
  assert.ok(moreWrap && moreWrap.children[0].getAttribute('data-rd-act') === 'more', '超過 80 句時必須渲染載入更多按鈕');
  assert.ok(moreWrap.children[0].textContent.includes('110'));

  // 模擬點擊 [data-rd-act="more"] 事件委派按鈕 -> 擴展至 160 句
  const moreBtn = moreWrap.children[0];
  moreBtn.closest = (sel) => (sel === 'button[data-rd-act]' ? moreBtn : null);
  container.children = [];
  listClickHandler({ target: moreBtn, stopPropagation() {} });
  assert.equal(rdCtx.getLimit(), 160);
  assert.equal(container.children.filter(c => c.className === 'reading-sentence-item').length, 160);

  // 重設為 80 句並測試 toggleShadowRadio 推進超過第 80 句時自動擴展
  rdCtx.setLimit(80);
  container.children = [];
  rdCtx.renderReadingStudio(sentences190);
  await rdCtx.toggleShadowRadio();
  assert.equal(rdCtx.getLimit(), 160, 'Shadow Radio 播放至第 81 句時必須自動擴展 readingRenderLimit');
  assert.ok(container.children.some(c => c.id === 'rd-item-80'), '自動擴展後 DOM 中必須存在 #rd-item-80');
});

/* =========================================================================
 * #11 [Medium] importReviewsJson Finite Clamping, Deduplication & Local Date
 * ========================================================================= */
test('#11 importReviewsJson: 夾制 NaN/Infinity/負數、去重卡片與任務 ID，並採用本地日曆日 localDayStr()', async () => {
  const lsStore = {};
  let syncedClearFirst = false;

  class MockFileReader {
    readAsText(file) {
      this.result = file._content;
      if (this.onload) this.onload({ target: { result: file._content } });
    }
  }

  const ctx = load([
    "const LS_PROGRESSION = 'uk_progression_state';",
    'let reviewsCache = [];',
    extractFunction(engine, 'clampFinite'),
    extractFunction(engine, 'importReviewsJson'),
    'this.importReviewsJson = importReviewsJson;',
    'this.getReviews = () => reviewsCache;'
  ].join('\n'), {
    FileReader: MockFileReader,
    localDayStr: () => '2026-11-12',
    localStorage: {
      setItem: (k, v) => { lsStore[k] = String(v); },
      getItem: (k) => lsStore[k] || null
    },
    confirmDlg: async () => true,
    persistReviewsCache: (clearFirst) => { syncedClearFirst = clearFirst; },
    renderReviewStudio: () => {},
    renderStagesDashboard: () => {},
    alertDlg: () => {}
  });

  const dirtyBackup = JSON.stringify({
    reviews: [
      { id: 'dup-1', text: 'Cheers mate', easeFactor: 'NaN', interval: -99, reps: 1e9, lastScore: 150 },
      { id: ' dup-1 ', text: 'Duplicate card should be dropped', easeFactor: 2.5, interval: 3, reps: 1 },
      { id: 'card-2', text: 'Mind the gap', ef: 0.2, interval: 'Infinity', rep: -5, lastScore: -10 }
    ],
    progression: {
      xp: 1e20,
      level: 99,
      streakDays: -7,
      dailyDate: 'invalid-date',
      dailyReviewsDone: 'NaN',
      quests: { review: 'yes', reading: 0, chat: 1 },
      completedMissions: ['m1', 'm1', 'm15', 'm16', 'm0', 'hack', 123]
    }
  });

  ctx.importReviewsJson({ size: dirtyBackup.length, _content: dirtyBackup });
  await new Promise(r => setImmediate(r));

  assert.equal(syncedClearFirst, true);
  const revs = JSON.parse(JSON.stringify(ctx.getReviews()));
  assert.equal(revs.length, 2, '重複的卡片 ID dup-1 必須去重');
  assert.equal(revs[0].easeFactor, 2.5, 'NaN easeFactor 應回退預設 2.5');
  assert.equal(revs[0].interval, 0, '負數 interval 應夾制為 >= 0');
  assert.equal(revs[0].reps, 1000, '超大 reps 應夾制上限 1000');
  assert.equal(revs[0].lastScore, 100, '超過 100 的分數應夾制為 100');

  assert.equal(revs[1].easeFactor, 1.3, '低於 1.3 的 ef 應夾制下限 1.3');
  assert.equal(revs[1].interval, 0, 'Infinity interval 應安全回退為 0');
  assert.equal(revs[1].reps, 0);
  assert.equal(revs[1].lastScore, 0);

  const prog = JSON.parse(lsStore.uk_progression_state);
  assert.equal(prog.xp, 10000000, '超大 XP 應夾制上限 10,000,000');
  assert.equal(prog.level, 4, '超過 4 的等級應夾制為 4');
  assert.equal(prog.streakDays, 0, '負數連勝天數應夾制為 >= 0');
  assert.equal(prog.dailyDate, '2026-11-12', '缺漏或非法日期必須採用本地時區 localDayStr() 而非 UTC');
  assert.equal(prog.dailyReviewsDone, 0);
  assert.deepEqual(prog.quests, { review: true, reading: false, chat: true });
  assert.deepEqual(prog.completedMissions, ['m1', 'm15'], 'completedMissions 必須去重且僅保留 m1..m15');
});

/* =========================================================================
 * #12 [Low] Manifest Subpath, Repo-Wide Dynamic Code Ban, Zero t Shadowing & start-uk.ps1 zh-HK
 * ========================================================================= */
test('#12 Tooling, Manifest & Static Gates: manifest ./?checkin=1、全庫零動態字串執行、零局部 t 遮蔽、start-uk.ps1 純港式繁體', () => {
  // 1. manifest.json 子路徑相對捷徑
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.shortcuts[0].url, './?checkin=1');

  // 2. 全儲存庫零動態代碼求值（動態組裝正規表達式，避免測試檔自身包含敏感字面量）
  const dynExecRe = new RegExp('\\b' + 'ev' + 'al\\s*\\(|new\\s+' + 'Func' + 'tion\\s*\\(');
  const targets = [
    'index.html',
    'uk_engine.js',
    'sw.js',
    'qr-scanner-worker.min.js',
    'quotes.js',
    'qrgen.js',
    'package.json',
    ...fs.readdirSync(path.join(root, 'tests')).map(f => path.join('tests', f))
  ];
  const dynHits = [];
  for (const rel of targets) {
    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    content.split(/\r?\n/).forEach((line, idx) => {
      if (dynExecRe.test(line)) dynHits.push(`${rel}:${idx + 1}: ${line.trim()}`);
    });
  }
  assert.equal(dynHits.length, 0, 'Repo must contain zero dynamic code execution calls:\n' + dynHits.join('\n'));

  // 3. index.html 與 uk_engine.js 零單字母 t 局部變數或參數遮蔽（除了全域 function t(key, params) 本身）
  const tShadowHits = [];
  for (const rel of ['index.html', 'uk_engine.js']) {
    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    content.split(/\r?\n/).forEach((line, idx) => {
      if (/^function\s+t\s*\(\s*key\b/.test(line.trim())) return;
      if (/\b(?:const|let|var)\s+t\b|,\s*t\s*=|\b(?:t\s*=>|\(\s*t\s*\)\s*=>|function\s*\w*\s*\([^)]*\bt\b|catch\s*\(\s*t\b)/.test(line)) {
        tShadowHits.push(`${rel}:${idx + 1}: ${line.trim()}`);
      }
    });
  }
  assert.equal(tShadowHits.length, 0, 'Found single-letter t shadowing:\n' + tShadowHits.join('\n'));

  // 4. start-uk.ps1 嚴格綁定 127.0.0.1、具備 TcpClient 就緒輪詢且純 zh-HK 無簡體字
  const ps1 = fs.readFileSync(path.join(root, 'start-uk.ps1'), 'utf8');
  assert.ok(ps1.includes('$bindHost = "127.0.0.1"'), 'start-uk.ps1 必須綁定 127.0.0.1');
  assert.ok(!ps1.includes('0.0.0.0'), 'start-uk.ps1 嚴禁出現 0.0.0.0');
  assert.ok(ps1.includes('System.Net.Sockets.TcpClient'), 'start-uk.ps1 必須具備 TCP 埠口就緒輪詢');
  assert.equal(/[启动检测请装传浏览务专开]/u.test(ps1), false, 'start-uk.ps1 不得殘留簡體中文字元');
});
