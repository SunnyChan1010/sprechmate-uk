# 📜 變更日誌 (Changelog)

本專案遵循 [Semantic Versioning 2.0.0](https://semver.org/lang/zh-TW/) 語意化版本規範，並採用 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 格式記錄變更。

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
