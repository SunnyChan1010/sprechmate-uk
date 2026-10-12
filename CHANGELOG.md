# 📜 變更日誌 (Changelog)

本專案遵循 [Semantic Versioning 2.0.0](https://semver.org/lang/zh-TW/) 語意化版本規範，並採用 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 格式記錄變更。

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
