# 📜 變更日誌 (Changelog)

本專案遵循 [Semantic Versioning 2.0.0](https://semver.org/lang/zh-TW/) 語意化版本規範，並採用 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 格式記錄變更。

## [1.6.2] - 2026-11-12

### ⚡ 全鏈路執行期效能最佳化與零冗餘 I/O 重構 (P1–P10 Runtime Performance & Memory Optimization)
- **P1 進階狀態 Write-Through `O(1)` 記憶體快取 (`getProgressionState` & `invalidateProgressionCache`)**：
  - 引入 `_progressionCache` 與本地日曆日 `_progressionDay` 寫穿式快取，消除任務結算、分頁切換與儀表板更新時高頻重複呼叫 `localStorage.getItem` 與 `JSON.parse` 之同步阻塞開銷，並透過 `storage` 事件監聽與 `invalidateProgressionCache()` 維持跨視窗／備份匯入狀態一致性。
- **P2 IndexedDB 單一交易批次刪除與零 Blob 反序列化淘汰 (`idbDelBatch` & `ttsMetaMap`)**：
  - 新增 `idbDelBatch(keys)` 將 `deleteConvAudios`、`applyHistoryLimits` 與 `savePracticeRecord` 之多鍵刪除合併於單一 `'readwrite'` 交易完成，徹底消除 N+1 交易風暴。
  - 建立記憶體時間戳索引 `ttsMetaMap`（`'tts:...' -> timestamp`），使 `trimTtsCache(limit)` 於未超限時達成 `O(1)` 零 IndexedDB I/O 短路返回；超限淘汰時直接於記憶體排序時間戳並呼叫 `idbDelBatch`，免除反序列化二進位音訊 `Blob` 之記憶體與磁碟開銷。
- **P3 AI 對話串流 DOM 參考快取與條件式智慧捲動 (`sendChatCore`、`lastBubble` & `filterStreamLines`)**：
  - 於 SSE 串流開始前快取 `#chatList` 與最末訊息氣泡節點（最佳化 `lastBubble()` 優先查詢 `#chatList > :last-child .bubble`），抽離等價純函式 `filterStreamLines(content, hideZh, hideDe)`，並於更新氣泡文字前先判定使用者是否位於底部區域（`nearBottom < 120px`）方觸發自動捲動，消除每幀全域 `querySelectorAll` 與回看對話時被強制拉回底部之干擾。
- **P4 練習紀錄版本號記憶化快取 (`_practiceRecordsRev`、`analyzeUserPhonemeWeaknesses` & `computeConvPracticeStats`)**：
  - 於對話與錄音紀錄載入、新增、裁剪、刪除或匯入時遞增版本計數器 `getPracticeRecordsRev()`，為個人發音弱點雷達與「🇬🇧 進階之路」練習統計提供版本鍵值記憶化（Memoization），避免每次 XP 變動或切換分頁時重複掃描數千筆歷史音素紀錄。
- **P5 韻律鏡像包絡線快取與代數無除法正規化 (`calcEnvelope`、`lastRefEnv` & `lastUserEnv`)**：
  - 重構 `calcEnvelope(pcm16, bins)` 直接以索引區間步進累加 `sample * sample`（零 `pcm16.subarray()` 切片配置），利用均方根比例尺度不變性省去每個採樣點除以 `32768` 之浮點運算（維持 `< 1e-12` 嚴格數學等價），並快取 `lastRefEnv` 與 `lastUserEnv` 避免重繪時重複計算包絡線。
- **P6 `DocumentFragment` 離線批次掛載、詞庫事件委派、靜態特訓手風琴複用與搜尋防抖**：
  - 於 `renderConvList`、`renderSearchHits`、`renderHistory`、`renderStagesDashboard` 及 `renderPhrasebookList` 全面採用 `DocumentFragment` 單次掛載；將生詞本按鈕改為 `#phrasebookList` 容器級 `[data-pb-act]` 事件委派，並去重單次互動內重複之 `getDueReviews()`／`updateDueBadge()` 掃描。
  - 為 `#convSearch` 與 `#phrasebookSearch` 加入 `120ms` 輸入防抖（清空搜尋框時即時更新）；同時於 `renderDrillsAccordion` 快取資料與語系參考，使獲得 XP 或重繪儀表板時完整保留已展開之英音特訓手風琴 DOM 狀態。
- **P7 靜態 `Set`／預編譯 `RegExp` 常數提升與零正規表達式 Token 估算 (`estTokens`)**：
  - 將 `CONN_WEAK_WORDS_SET`、連音標註規則與 `CARD_PHONETIC_RULES` 提升至 `uk_engine.js` 模組頂層（零單次呼叫正規表達式／集合配置），並將 `estTokens(s)` 改寫為 Unicode 碼點區間直判快徑，消除逐字元正規表達式 `.test()` 開銷。
- **P8 音訊預熱有界併發工作池 (`PREHEAT_CONCURRENCY = 3` & `runPreheatPool`)**：
  - 新增共享 3 路併發佇列 `runPreheatPool`，重構精讀整篇預熱（`preheatReadingSentences`）與地鐵特訓包預熱（`preheatDrillsPack`），在完整保留進度顯示、取消中斷與單句容錯之前提下將批次 TTS 預快取速度提升近 3 倍。
- **P9 打卡卡片斷行前綴和與字寬快取最佳化 (`wrapLines`)**：
  - 於 `wrapLines(g, text, maxW, balance)` 內快取重複權杖之 `measureText` 寬度（`Map`），並預先建立非空白權杖前綴和陣列 `nonSpPrefix`（`Int32Array`），以 `O(1)` 差值查詢取代動態規劃內層迴圈之 `.slice().every()` 二次方陣列配置。
- **P10 Service Worker 快取控制代碼記憶化與版本升級 (`sw.js` `sprechmate-uk-v12` & `getAppCache`)**：
  - 升級快取版本至 `sprechmate-uk-v12`，新增模組級 `getAppCache()` 記憶化單例 `caches.open(CACHE)` Promise（失敗自動重置），於 `install`、`getCachedFallback(req)` 與背景寫回直接操作已開啟之 `Cache` 控制代碼而非每次攔截掃描全域 `CacheStorage`，並 100% 保留 Captive Portal `text/html` 防污染、`AbortController` 逾時中止與同源 `GET` 安全防線。
- **P1–P10 等價性與微基準測試網 (`tests/perf_optimization.test.js`)**：
  - 新增 10 組涵蓋 `P1`–`P10` 行為／數學等價性與 `performance.now()` 微基準測試套件，全倉庫自動化測試擴充至 **70 / 70 項全數通過**（`45` 核心單元測試 + `15` AppSec 回歸測試 + `10` 效能與等價基準測試，零 `eval`／`new Function`）。

---

## [1.6.1] - 2026-11-12

### 🛡️ 全鏈路應用安全加固、音訊生命週期治理與渲染效能最佳化 (AppSec Hardening, Audio Lifecycle & Runtime Optimization)
- **#1 API 端點驗證、設定白名單隔離與憑證防洩漏 (`normalizeChatBaseUrl`、`importSettingsFile`、`chatHeaders` & `isSafeAzureVoiceName`)**：
  - 實作 `normalizeChatBaseUrl(raw)`，以標準 `URL` 解析器嚴格拒絕 `javascript:`／非本機回環 `http://`、內嵌帳密（`username`/`password`）及 Query／Hash 參數，僅允許合法 `https://` 或本機回環（`127.0.0.1`、`localhost`）端點。
  - 加固 `importSettingsFile`：僅白名單合併 `DEFAULTS` 已知鍵名；當匯入檔變更或缺省回退 `chatBaseUrl` 且未附帶新 `chatKey` 時，強制清空舊 `chatKey`，杜絕惡意設定檔將既有 Bearer 金鑰導向外部伺服器。
  - 收緊 `chatHeaders(s)`：`HTTP-Referer` 僅於主機名為 `openrouter.ai` 或 `*.openrouter.ai` 時傳送純淨 `location.origin`（絕不外洩完整 `location.href` 或匹配偽造子字串網域）。
  - 新增 `isSafeAzureVoiceName(v)` 並於 `azureTtsBlob` 對語音角色名稱強制執行白名單校驗與 `escapeXml()` 轉義，阻斷 SSML／XML 屬性注入。
- **#2 雙層內容安全政策（CSP）、HTTP 安全標頭與 Worker 記憶體回收 (`index.html`、`_headers` & `qr-scanner-worker.min.js`)**：
  - 於 `index.html` 注入嚴格 `<meta http-equiv="Content-Security-Policy">`（鎖定 `default-src 'self'`、`object-src 'none'`、`base-uri 'self'`、`form-action 'self'` 與受控雲端語音／AI 連線白名單）及 `<meta name="referrer" content="no-referrer"/>`，並為外部連結補齊 `rel="noopener noreferrer"`。
  - 新增 Cloudflare Pages `_headers` 設定檔，補齊 `X-Frame-Options: DENY`、`X-Content-Type-Options: nosniff`、`Referrer-Policy: no-referrer`、`Permissions-Policy: camera=(self), microphone=(self), geolocation=()` 與 HTTP 層 `frame-ancestors 'none'`。
  - 修復 `qr-scanner-worker.min.js` 之 `createWorker()` 內嵌腳本 `URL.createObjectURL` 洩漏，於 Worker 首次 `message`／`error` 事件（`{ once: true }`）及 `5000ms` 逾時兜底雙路徑自動呼叫 `URL.revokeObjectURL`。
- **#3 Markdown 行內連結與網址字元無損渲染 (`mdInline`)**：
  - 重構 `mdInline(s)` 採用「行內碼保護 ➔ 連結提取與網址獨立轉義 ➔ 粗斜體／刪除線渲染 ➔ 佔位符還原」四段式流水線，徹底修復含底線 `_`、星號 `*` 或波浪號 `~` 之網址（如 Wikipedia 條目連結）遭誤拆為斜體／刪除線標籤之問題，同時支援 `[**粗體連結**](https://...)` 並嚴格攔截偽協定。
- **#4 Web Audio 錄音互斥中止與 iOS 背景喚醒自癒 (`abortActiveRecording` & `startMeter`)**：
  - 新增 `abortActiveRecording()`：當用戶於錄音中途切換分頁（`switchTab`）、開啟設定（`openSettings`）、切換對話或頁面隱藏／關閉（`visibilitychange`／`pagehide`）時，立即設定丟棄旗標、停止 `MediaRecorder` 與實體麥克風軌道並回收頻譜分析器，絕不將半截錄音誤送評測或寫入歷史紀錄。
  - `startMeter` 於複用全站單例 `AudioContext` 時自動檢測 `'suspended'` 狀態並執行 `resume()`，修復行動裝置鎖屏返回後音量條凍結問題。
- **#5、`#6`、`#10` 狀態快取、IndexedDB 防抖寫入與長文精讀分批渲染最佳化**：
  - **設定讀取 `O(1)` 快取 (`peekSettings`)**：新增唯讀快取存取器 `peekSettings()`，讓高頻介面多語系查詢 `t()` 免除每次 `JSON.parse` 與淺拷貝配置開銷，同時保留 `getSettings()` 回傳隔離副本之安全語意。
  - **對話寫入合併與韻律波形去重解碼 (`saveConvs`、`flushConvsNow` & `lastRefPcm16`)**：為 `saveConvs()` 引入 `convsDirty` 髒旗標與 `80ms` 防抖合併寫入（同時維持回傳 Promise 於實際寫盤完成後 resolve 及 `QuotaExceededError` 自癒契約），於 `pagehide`／`visibilitychange` 主動呼叫 `flushConvsNow()`，並透過 `lastRefPcm16` 快取避免原聲 WAV 於每次評測後重複 `decodeAudioData`。
  - **長文精讀分批渲染與事件委派 (`renderReadingStudio`)**：單次初始渲染上限設為 80 個語塊並提供「⬇️ 載入更多句子」按鈕，將句卡按鈕全面改為容器級 `[data-rd-act]` 事件委派，且「🎧 影子連播電台」跨過第 80 句時自動平滑擴展後續語塊。
- **#7、`#8`、`#9`、`#11`、`#12` 離線快取防毒、彈窗堆疊無障礙、TTS 音訊相容與自動化驗證網**：
  - **Service Worker 快取防污染升級 (`sw.js` `sprechmate-uk-v11`)**：新增 `AbortController` 逾時主動 `abort()`、攔截公共 Wi-Fi Captive Portal 將 `text/html` 登入頁寫入 `.js`／`.css`／`.json` 快取之攻擊向量，並以 `e.waitUntil` 保護背景 `cache.put`。
  - **堆疊彈窗 `Escape` 頂層路由與 ARIA 無障礙 (`isTopOverlay`)**：實作 `isTopOverlay(ov)` 確保多層彈窗（如於 `#phoneticModal` 上疊加確認框或同步碼彈窗）按下 `Escape` 時僅關閉最頂層彈窗，補齊關閉回呼冪等保護與 `role="dialog"` + `aria-modal="true"`。
  - **Gemini TTS 多格式相容與暫態冷卻自癒 (`base64AudioToBlob` & `geminiTtsBlob`)**：自動識別 `OggS`（`audio/ogg`）、解析 `audio/pcm;rate=16000` 動態採樣率寫入 WAV 標頭、對齊奇數 PCM 位元組長度，並將 Interactions API 暫態錯誤改為 60 秒冷卻重試而非永久停用。
  - **進度匯入數值夾制與本地日曆日校準 (`importReviewsJson` & `clampFinite`)**：全面夾制 `NaN`／`Infinity`／越界之 `easeFactor`、`interval`、`xp`、`streakDays`，去重閃卡與任務 ID，並統一以本地日曆日 `localDayStr()` 取代 UTC 日期切片。
  - **零動態執行語法檢查與 60 項自動化測試網 (`tests/check-syntax.js` & `tests/appsec_remediation.test.js`)**：以 `node:vm` `new vm.Script()` 取代舊式字串建構語法檢查，全庫達成零 `eval`／`new Function`；校準 `manifest.json` 快捷入口 `./?checkin=1` 與 `start-uk.ps1` 純港式繁體輸出，並擴充自動化測試至 **60 項全數通過**。

---

## [1.6.0] - 2026-11-12

### 🧠 AI 個人化靶向私教、英式連音標註與全鏈路正確性加固 (Adaptive Phonetic Coaching, Connected Speech & Core Reliability)
- **F1 個人化發音弱點雷達與 AI 靶向餵招閉環 (`analyzeUserPhonemeWeaknesses` & `getPhoneticCoachingPromptHint`)**：
  - 自動聚合用戶歷史錄音評分之音素表現，於「🇬🇧 進階之路」動態渲染 `#personalWeaknessRadar` 個人弱點雷達卡片，並高亮標記低分音素專屬解剖晶片（`.is-personal-weak`）。
  - 打通「評測診斷 ➔ AI 對話靶向餵招」閉環：透過 `getPhoneticCoachingPromptHint()` 將用戶最需加強之英音弱項音素自動注入系統提示詞，讓 AI 私教於日常對話回覆中自然融入對應練習詞彙。
- **F2 長文精讀「英式連音 (`‿r`) 與虛詞弱讀 (`Weak Forms`)」智慧標註層 (`annotateConnectedSpeech` & `#toggleConnSpeechBtn`)**：
  - 於「📖 精讀工作坊」工具列新增 `#toggleConnSpeechBtn`（🔗 連音標註）一鍵開關，支援即時解析並視覺化標示英式英語（Non-rhotic RP / SSBE）跨詞母音連讀 `Linking R`（`‿r`）與高頻功能詞弱讀（`Weak Forms` 虛線底線提示），同時完整保留單擊查詞互動。
- **F3 15 大英國生存任務與 AI 情境劇本雙向聯動 (`UK_STAGE_MISSION_PROMPTS`、`launchStageMission` & `activateMissionRoleplay`)**：
  - 為 `uk_stages.json` 全部 15 個英國實戰生存任務建立專屬 AI 角色扮演劇本（`UK_STAGE_MISSION_PROMPTS`），點擊任務即可透過 `launchStageMission(missionId)` 聯動 `activateMissionRoleplay(tplId, openerText, autoSend)` 自動創建／切換對應情境對話並掛載目標開場白。
  - 於「💬 對話跟讀」頂部新增 `#activeMissionBanner` 實戰任務進度橫幅，清晰展示當前挑戰任務、過關門檻（跟讀評分 ≥75 分）與一鍵退出機制。
- **F4 精讀查詞彈窗「✨ AI 語境精解」與一鍵閃卡收錄 (`askAiContextualExplain` & `#popoverAiBtn`)**：
  - 於精讀查詞彈窗 `#wordPopover` 新增 `#popoverAiBtn`（✨ AI 語境精解）及記憶體快取 `aiWordExplainCache`，結合原句上下文即時由 Gemini 解析地道英式語氣、潛台詞與用法，並自動將 AI 精解同步寫入「➕ 加入重溫」之 SM-2 閃卡背面筆記。
- **E1–E5 技術架構與正確性加固 (Engineering & Reliability Hardening)**：
  - **E1 修復影子電台搶跑與併發競態 (`playUkVoice` 真實播放完成契約 & `shadowRadioSeq`)**：重構 `playUkVoice` 回傳於音訊真正播放結束（`onended` / `speechSynthesis` `end`）時才 resolve 之 `Promise<{ durationMs, interrupted }>`，配合 `shadowRadioSeq` 輪次鎖與跨分頁／清空文章自動停播清理，徹底解決 Reading Studio「🎧 影子連播電台」搶跑與背景殘留播放問題。
  - **E2 歷史錄音雙軌語調鏡像與時間軸無損還原 (`restoreRecord` & `restoreSeq`)**：`simplifyWords` 與 `paLikeFromRec` 完整持久化並還原單詞級 `Offset`（`o`）與 `Duration`（`d`），`restoreRecord` 新增 `restoreSeq` 併發防抖鎖、載入前清空舊 PCM 與 `refPlayer`／`myPlayer` 狀態並重新解碼繪製 `drawProsodyMirror`，根除快速切換歷史紀錄或缺失音訊時殘留舊聲軌與波形錯位。
  - **E3 每日 5 語塊重溫進度計數與 100 XP 閉環校準 (`dailyReviewsDone`)**：精準追蹤當日實際完成重溫張數 `dailyReviewsDone`，滿 5 個語塊（或待重溫清零）方解鎖每日重溫任務獎勵，並校準每日修煉任務 100 XP 閉環（30+35+35）與儀表板進度顯示。
  - **E4 對話儲存 IndexedDB 配額滿載自癒 (`saveConvs`)**：當 `idbSet('json:convs', payload)` 遭遇 `QuotaExceededError` 時，動態依 `idbCount('tts:')` 自動觸發 `trimTtsCache` 清理一半 TTS 語音快取並以最新 `convsCache` 無感重試一次；同時升級 `sw.js` 快取版本至 `sprechmate-uk-v10`。
  - **E5 工程規格單一事實來源校準 (`AGENT_CONTEXT.md`)**：全面對齊 `v1.6.0` 真實 IndexedDB（`'deutsch-audio'` v2：`audios` + `reviews`）、`localStorage` 鍵名、SM-2 間隔參數（Easy 首兩次 `4 / 7` 天；語音自測 `85 / 70 / 55` 分門檻）與多引擎雲端架構契約。

---

## [1.5.0] - 2026-11-01

### 🛡️ Phase 1 ~ Phase 4：系統盲點獵殺、防禦加固與高槓桿戰略演進 (Stability Hardening & Strategic Evolution)
- **Phase 1 止血與防禦加固 (Zero Architecture Change)**：
  - **修復全域多語系 `t(key)` 變數遮蔽**：修正 `index.html` 與 `uk_engine.js` 內多處以 `t` 命名參數之閉包（如 `clipboard.readText().then(clipText => ...)`），根絕空剪貼簿觸發 `TypeError: t is not a function` 並誤報權限拒絕之問題。
  - **錄音前全域音訊互斥阻斷 (`stopAllAudioPlayback`)**：錄音前強制停止 `refPlayer`、`myPlayer`、`currentUkAudio`、`shadowRadio` 與 `speechSynthesis`，並自增序號作廢飛行中的 TTS 請求，徹底消除外放聲音串音至麥克風造成評分失真之缺陷。
  - **發音解剖圖精確路由與通用兜底**：重構 `showPhoneticModal` 與 `resolvePhoneticGuideKey`，非特定 7 大音素時動態渲染通用口型 SVG 並顯示正確音標，徹底杜絕「萬物皆 `/θ/`」誤導；練習跳轉按鈕改用乾淨發音標記 (`sampleVoiceText`)。
  - **安全發布隔離 (`.assetsignore`)**：根目錄新增 `.assetsignore`，完全排除 `.git`、`*.md`、`tests`、`package.json`、`wrangler.config.ts` 等內部審查與敏感工具腳本打包至 Cloudflare Pages 公開資產。
- **Phase 2 痛點根治與架構減負 (Subtractive Design)**：
  - **離線與弱網秒級自癒**：TTS 模組加入 `navigator.onLine` 前置短路判定，無網狀態下零等待直接切換為本機離線英式語音（`en-GB`）；`sw.js` 導航請求加入 3 秒競速超時，擺脫地鐵弱網 26 秒假死。
  - **徹底清理跨語系快取與遺留檔案**：移除 `ttsFindByTextOtherLocale` 跨語系快取回退邏輯，杜絕 `en-GB` 播放非英式口音；刪除根目錄殘留之 65KB 德語 `quotes.csv`。
  - **修正英文介面系統提示詞衝突**：`buildDefaultPrompt` 及各場景提示詞於 `uiLang === 'en'` 時，明確允許在指導說明中使用英文，解決 AI 語言分裂。
  - **強化錯題本與進度匯入安全**：`importReviewsJson` 補齊大小限制、原型鏈污染防禦、`confirmDlg` 二次確認、結構驗證與 `input.value = ''` 重置。
- **Phase 3 自癒與免維護設計 (Automation & Tests)**：
  - **自動化回歸測試網 (28 Suites Passed)**：擴充 `tests/unit.test.js`，全面覆蓋變數遮蔽靜態掃描、發音導引解析、IPA 啟發式分流、`.assetsignore` 白名單、Service Worker 本地快取檔案存在性校驗、Stage 任務結構完整性與防作弊防刷分邏輯。
- **Phase 4 高槓桿戰略演進 (High-Leverage Evolution)**：
  - **打通 15 大英國實戰任務通關閉環**：接通 `uk_stages.json` 15 大場景生存任務與開場白，在跟讀評分達標（≥75 分）時自動觸發通關校驗、累加階梯 XP，並在階梯儀表板展示真實流利度與長文精讀完成數。
  - **地鐵特訓離線預快取 (Tube Pack)**：新增「⚡ 預熱特訓包」功能，一鍵批次預快取 `uk_drills.json` 12 大連讀弱讀示範原聲至 IndexedDB，在地鐵隧道中無網依然流暢播放。
  - **雙波形語調對齊視覺化 (Prosody Mirror)**：實作 `drawProsodyMirror`，在評分完成後繪製原聲與用戶發音之雙向 RMS 能量包絡線，並根據單詞時間戳動態標註對齊虛線與單詞標籤。

## [1.4.0] - 2026-10-14

### 🎙️ Gemini 3.8 多引擎雲端語音合成與模型全面升級 (Multi-Engine Cloud TTS & Gemini 3.8 Upgrade)
- **整合 `gemini-3.8-flash-lite-tts` 與 `gemini-3.8-flash-tts` 原生語音合成引擎**：
  - 支援直接呼叫 Google Gemini 3.8 官方 `/v1beta/interactions`（並向下兼容 `:generateContent`）端點合成 24kHz 16-bit WAV 原聲，內建 `speech_metadata` 英式英語（Modern RP / `en-GB`）口音與語氣引導指令，以及裸 PCM (`audio/l16`) 自動補齊 44-byte RIFF WAV 標頭防呆機制。
  - 新增 10 款 Studio Prebuilt 語音角色選單（`Kore`、`Puck`、`Charon`、`Zephyr`、`Aoede`、`Fenrir`、`Leda`、`Sulafat`、`Schedar`、`Orus`）。
- **四段式多引擎智慧路由與跨雲端自動備援 (`resolveTtsEngine` & `ttsBlob`)**：
  - 設定頁新增「原聲 TTS 朗讀引擎」選擇器（`智能自動` / `Gemini 3.8 Flash-Lite TTS` / `Gemini 3.8 Flash TTS` / `Azure Speech Neural TTS`）。
  - **開箱即用零額外配置**：自動共用上方對話介面之 Gemini API Key（或選填獨立 Gemini TTS Key），無須額外申請 Azure 帳號即可享受高品質英式 AI 朗讀。
  - **三層無縫降級保護**：當主雲端引擎（如 Gemini TTS）發生網路波動或配額限制時，若已配置副雲端引擎（Azure Speech）則自動跨雲端切換；若雙雲端皆不可用（如倫敦地鐵無網環境），則於超時後自動降級至瀏覽器離線系統英式語音（`speechSynthesis` `en-GB`）。
- **升級預設對話模型至 `gemini-3.8-flash`**：
  - `DEFAULTS.chatModel` 由舊版淘汰之 `gemini-2.5-flash` 全面升級為最新一代 **`gemini-3.8-flash`**，並在 `getSettings()` 中為存量用戶提供平滑自動遷移。
- **完善 WAV / MP3 智慧副檔名下載與快取隔離**：
  - `ttsCached()` 針對不同引擎與語音角色建立獨立快取命名空間（如 `en-GB-gem-lite-Kore`、`en-GB-gem-flash-Kore`、`en-GB-SoniaNeural`），並讓 `uk_engine.js` 的 `playUkVoice()` 全面接入多引擎快取。
  - `downloadRefAudio()` 根據音訊 `Blob.type` 自動判斷匯出 `.wav` 或 `.mp3` 副檔名。

---

## [1.3.0] - 2026-10-14

### 🎯 Phase 1 & Phase 2：用戶核心痛點根治與高穩定減法重構 (Pain-Point Resolution & Architecture Simplification)
- **[P0] 打通 SM-2 閃卡「語音自測 ➔ 自動評分 ➔ 倒數排程」完整閉環**：
  - 於 `uk_engine.js` 新增 `pendingReviewAssessmentId` 狀態追蹤與 `window.completeReviewVoiceAssessment(overallScore, accScore, fluScore)` 回調，並在 `index.html` 的 `renderResult()` 結尾自動觸發。
  - 完成錄音評測後自動切回「🧠 智能重溫」分頁、翻開卡片背面、於 `#reviewAssessmentResult` 顯示總分與建議評級（`≥85` 熟練 Easy、`≥70` 良好 Good、`≥55` 勉強 Hard、`<55` 忘記 Again），並啟動 2.5 秒可隨時取消之 `reviewAutoTimer` 自動排程倒數。
- **[P0] 倫敦地鐵弱網防死鎖（`AbortController` 連線與串流心跳超時保護）**：
  - `sendChatCore()` 新增 `AbortController` 15 秒初始連線超時與 20 秒 SSE 串流 Chunk 心跳超時，並暴露 `window.abortChatStream()`，徹底解決地鐵／弱網切換下 TCP 半開連線導致 `chatSending` 永久鎖死對話 UI 之問題。
  - `ttsBlob()` 新增 6 秒 `AbortController` 超時限制，確保弱網下 `playUkVoice()` 與 `genRefAudio()` 於 6 秒內快速降級至離線系統英式語音（`en-GB`），告別 60 秒盲等。
- **[P1] 精讀工作坊「單擊查詞 + 內建英式生活詞典 + 閃卡背面自動帶入與編輯」**：
  - 將精讀工作坊 `.rd-word` 由僅支援 `ondblclick` 升級為支援單擊（`onclick`），全面修復手機觸控螢幕無法查詞之問題，並採用 `getBoundingClientRect()` 精準定位彈窗。
  - 內建 `UK_GLOSSARY`（涵蓋租屋、NHS 醫療、Council Tax、能源帳單、英國央行通脹與 Pub 社交高頻詞彙之英式音標與繁中詳解）、`lookupUkWord()` 與 `extractSentenceNotes()`，使精讀單詞收錄、整句收錄與跟讀弱項收錄自動生成結構化背面釋義，並於閃卡背面新增「✏️ 編輯筆記」按鈕。
- **[P1] 解除詞庫 50 筆截斷並根除 IndexedDB 全表游標掃描風暴**：
  - `renderPhrasebookList()` 新增 `#phrasebookSearch` 即時關鍵字過濾（支援英文、中文釋義與語境搜尋）與「⬇️ 載入更多」分批載入機制，解除 `.slice(0, 50)` 硬編碼限制。
  - 重構 `trimTtsCache()` 與 `ttsFindByTextOtherLocale()`，改用 `store.getAllKeys()` 先在記憶體過濾 `tts:` 鍵名，未超限時**零二進位 Blob 反序列化**，避免每次 TTS 合成觸發全庫讀取 `'json:convs'` 與錄音 Blob 之記憶體風暴。
- **[P2] 開箱零配置優化、清理德語死代碼與單一事實來源統一**：
  - `DEFAULTS` 預設 AI 端點與模型更新為 Google Gemini（`gemini-2.5-flash`）；`genRefAudio()` 在未填寫 Azure Key 時平滑降級至瀏覽器內建 `en-GB` 語音朗讀。
  - 移除 `index.html` 中殘留未使用的 90 行德語發音規則 `germanG2P()` 死代碼，並讓 `renderStagesDashboard()` 直接驅動自 `uk_stages.json`（`ukStagesData`）。

---

## [1.2.0] - 2026-10-14

### 🛡️ 應用程式安全、穩定性、效能與架構深度重構 (AppSec & Architecture Hardening)
- **[Critical] 修復四大核心功能分頁與口型彈窗初始化斷裂**：
  - 於 `index.html` 的 `init()` 結尾正式掛載 `initUkSuite()`，並引入外部 `<script src="uk_engine.js"></script>`，徹底修復頂部 4 大導航分頁（`#appTabs`）、長文精讀工作室（`initReadingStudio`）、SM-2 智能重溫本（`initReviewsStore`）、4 階晉級儀表板（`loadStagesAndDrills`）與口型解剖彈窗（`#phoneticModal`）關閉按鈕（含背景點擊與 `Escape` 鍵）未綁定之核心阻斷問題。
- **[High] 修復設定檔匯入安全漏洞與 API 端點驗證**：
  - `getSettings()` 新增 `azureRegion` 對照 `REGIONS` 白名單校驗，防止透過惡意設定檔篡改 `https://${s.azureRegion}.tts.speech.microsoft.com` 目標網域竊取 `Ocp-Apim-Subscription-Key`。
  - `getSettings()` 與 `importSettingsFile()` 新增 `chatBaseUrl` HTTPS 協定白名單驗證、10MB 檔案上限攔截、`JSON.parse` 原型鏈污染過濾（`__proto__`、`constructor`、`prototype`），以及當匯入配置變更 `chatBaseUrl` 且未附帶新金鑰時自動清空本地 `chatKey` 之防洩漏保護。
- **[High] 消除 `showRetryCard()` DOM 型 XSS 注入風險**：
  - 將 `index.html` 中 `showRetryCard(msg)` 的 `innerHTML` 字串拼接重構為安全 DOM API（`document.createElement` + `textContent`）。
- **[High] 消除 1,382 行重複代碼與全域雜湊函式命名衝突**：
  - 移除 `index.html` 內嵌與 `uk_engine.js` 完全重複的 1,382 行代碼，統一由 `uk_engine.js` 模組化載入。
  - 移除 `index.html` 中未使用的第一處 `hashStr(s)`（FNV-1a）重複宣告，保留與 TTS 快取鍵值相容之 DJB2 base36 `hashStr(s)` 實作。
- **[High] 修復 Service Worker (`sw.js`) 快取污染與離線資源回退錯誤**：
  - 升級快取版本至 `sprechmate-uk-v4`，將 `uk_engine.js` 與 `favicon-32.png` 納入預快取清單 `ASSETS`。
  - 新增 `res && res.ok && res.status === 200` 檢查，防止將 HTTP 4xx/5xx 錯誤回應寫入持久化快取。
  - 離線回退邏輯改為僅在 `e.request.mode === 'navigate'` 時回退至 `index.html`，避免非頁面請求（`.json`、`.js`、圖片）離線時收到 HTML 導致解析崩潰。
- **[High] 補齊音訊 `ObjectURL` 生命週期釋放**：
  - 修復 `downloadRefAudio()` 與 `testTts()` 中 `URL.createObjectURL(blob)` 未配對呼叫 `URL.revokeObjectURL()` 之記憶體洩漏，並將測試語句改為英式英語示範句。
- **[Medium] 修復 IndexedDB 批次寫入 (N+1 交易風暴)、SM-2 預覽天數、長文斷句與進度連勝邏輯**：
  - 新增 `idbReviewsSyncBatch(items, clearFirst)`，將 `persistReviewsCache()` 的 N 次獨立 IndexedDB 交易合併為單一 `readwrite` 批次交易，並在匯入備份時支援先清空舊紀錄。
  - `renderActiveReviewCard()` 改為透過 `calcNextReview(item, r).interval` 動態計算並顯示真實預覽天數（取代寫死的 `1天 / 2天 / 4天 / 7天`）。
  - `analyzeReadingText()` 新增常見英文縮寫（`Mr.`, `Dr.`, `U.K.`, `e.g.` 等）與小數點保護機制，避免長文精讀錯誤切碎句子。
  - `getProgressionState()` 跨日重置時自動計算並累加 `streakDays` 連勝天數並持久化；`renderResult()` 在發音評分 $\ge 75$ 分時自動觸發 `markDailyQuest('chat')` 與 XP 獎勵。
- **[Low] 本機啟動腳本回環位址一致性**：
  - `start-uk.ps1` 啟動網址由 `http://localhost:8000` 統一改為 `http://127.0.0.1:8000`，確保與 `--bind 127.0.0.1` 完全一致。

---

## [1.1.0] - 2026-10-12

### 🌐 香港繁體中文在地化 (Hong Kong Traditional Chinese Localization)
- **全面完成全專案介面港式繁體中文轉化**：
  - `index.html`：將 `<html lang="zh-CN">` 更新為 `<html lang="zh-HK">`，頁面標題改為《SprechMate UK 英國英音私教》。
  - 全數靜態 HTML、對話清單、抽屜、設定面版、跟讀卡片與錄音糾音評分元件全面換裝香港繁體語彙（如「對話清單」、「搜尋」、「匯出／匯入」、「儲存」、「設定」、「評分」、「錄音」、「網絡」、「快取」、「繁體中文 (香港)」、「水電煤氣」等）。
  - 全面更新 `STR.zh` 雙語本地化字典（300+ 鍵值），消除簡體字及大陸用語。
  - 將 5 大情境提示詞範本（NHS 預約、市政稅與垃圾回收、租屋維修交涉、Pub 社交文化、新聞閱讀助教）全面轉化為道地港式繁體。
  - `manifest.json`：PWA 應用程式名稱、描述及快捷操作全面支援香港繁體中文。
  - `quotes.js` & `quotes.csv`：400 則名言庫全面轉化為香港繁體中文，打卡卡片視覺生成文字一致。
  - 語音與地區清單：Azure Speech 伺服器地區名稱與語音角色標籤全面港化。

---

## [1.0.0] - 2026-10-12

### 🚀 新增功能 (Added)
- **英國標準英音 (RP / Modern SSBE) 發音核心體系**：
  - 專門針對 Received Pronunciation 與現代南部標準英音設計，涵蓋短元音、長元音、雙元音、塞音、擦音、塞擦音、鼻音與近音。
  - 收錄 **84 組英音音標與最小對立體 (Minimal Pairs)**（`uk_drills.json`），提供高頻詞彙與地道對比發音。
  - 建構 **5 大進階階梯學習課程**（`uk_stages.json`）：從「單音精確爆破」到「長文連音節奏律動」。
- **動態發音器官解剖向量圖引擎 (Dynamic Phonetic SVG Anatomy)**：
  - 以原生 SVG 向量技術即時繪製發音矢狀切面（Sagittal Cross-Section）。
  - 動態標示齒齦 (Alveolar Ridge)、硬腭 (Hard Palate)、軟腭 (Velum)、雙唇 (Lips) 與舌位 (Tongue Position) 座標變化。
  - 動態展示清濁音聲帶震動標誌與爆破/摩擦/鼻腔之氣流路徑箭頭。
- **SuperMemo SM-2 間隔重複記憶演算法 (Spaced Repetition Engine)**：
  - 完整實作 SM-2 演算法數學模型，動態計算容易度因子（$EF$）與複習間隔（$Interval$）。
  - 整合 IndexedDB v2 存儲結構，新增 `reviews` 物件倉庫持久化每一次發音自評（0~5 分）。
  - 提供專屬「智能複習 (Review Due)」工作流與複習統計儀表板。
- **Reading Studio 長文智能切片與英倫連音標註**：
  - 長篇演講與文學作品智能句切片引擎，保留英式標點與段落格式。
  - 自動連音高亮標註：符號連音 (Linking R)、插入連音 (Intrusive R) 及弱讀 (Weak Forms)。
  - 支援單句循環跟讀、波形錄音對比與切片進度記憶。
- **雙軌語音合成架構 (Dual-Track TTS)**：
  - **雲端軌**：整合 Azure Cognitive Services Speech REST API，支援 `en-GB-SoniaNeural`、`en-GB-RyanNeural`、`en-GB-LibbyNeural`、`en-GB-MaisieNeural`、`en-GB-ThomasNeural`、`en-GB-OliverNeural` 6 大英國口音角色。
  - **離線軌**：無網環境自動平滑降級為瀏覽器本地 `speechSynthesis`，零網絡依賴。
- **Google Gemini AI 英音口語私教**：
  - 經由 Google Gemini OpenAI 相容端點（`v1beta/openai/chat/completions`）提供即時英式表達評估。
  - 支援糾正美式拼寫/詞彙（如 apartment $\to$ flat, elevator $\to$ lift），提供 RP 發音提示。
- **倫敦地鐵離線模式 (Tube Mode PWA)**：
  - 透過 Service Worker（`sw.js`）與 Cache API 快取所有 HTML、JS、JSON 題庫與圖標。
  - 在完全無網之地下鐵環境下，支援全部音標訓練、口型展示、SM-2 複習與錄音功能。

### 🛡️ 安全加固與性能守護 (Security & Performance Hardening)
- **CSP 零違規與消除行內事件**：
  - 全面清除 HTML 模板與 DOM 動態字串中之 `onclick`、`onerror` 屬性，改為純原生 `addEventListener` 與事件委派，嚴格遵循內容安全策略 (CSP)。
- **音訊 Blob 記憶體洩漏防護**：
  - 實作 Blob URL 配對銷毀機制（14 處創建 / 17 處銷毀防護），切換題目、重新錄音或播放結束時強制執行 `URL.revokeObjectURL`，徹底根絕長時間練習造成的瀏覽器音訊解碼緩存內存洩漏。
  - 錄音完畢即時停止 `MediaStreamTrack` 釋放硬體麥克風指示燈。
- **API 憑證動態化與零洩漏**：
  - 嚴格禁止在代碼中硬編碼任何 API Key。金鑰僅存於使用者本機 `localStorage`，絕不上傳雲端，日誌中絕不列印金鑰明文。
- **Google Gemini CORS 請求純淨規範**：
  - 嚴格排除任何非標準自定義 HTTP 請求標頭（如 `x-ms-...`），僅傳遞標準 `Authorization: Bearer` 與 `Content-Type: application/json`，避免觸發瀏覽器 Preflight `OPTIONS` 攔截錯誤。
- **本地伺服器回環隔離**：
  - 啟動腳本 `start-uk.ps1` 強制綁定 `127.0.0.1` 本機回環位址，嚴禁綁定 `0.0.0.0`，杜絕同一局域網未授權探測。
- **備份匯入容量與原型鏈防禦**：
  - 匯入進度與錄音 JSON 設置 10MB 容量上限，並遞歸過濾 `__proto__`、`constructor`、`prototype`。
