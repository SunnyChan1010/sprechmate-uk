# SprechMate (芯語伴) · 英國生活與長文精讀專版 🇬🇧

> **專為現居英國學習者量身打造的英語突破神器**  
> 純靜態 PWA 架構 · 零雲端後端依賴 · 100% 本地隱私安全 · 離線地鐵可用

---

## 🌟 核心特色 (Key Features)

### 1. 💬 英國生活實戰情境對話
* 內建 5 套真實英國高頻提示詞模板：
  * 🏥 **NHS GP 8:00 AM 電話分診與預約**（DOB、Postcode、111 轉介）
  * 🏛️ **Council 市政服務**（Council Tax 25% 折扣、垃圾桶 Wheelie Bin 遺漏申訴）
  * 🏠 **租房維修交涉**（Combi-boiler 故障催修、Section 11 法定責任、DPS 押金保管）
  * 🍻 **Pub 吧台潛規則**（排隊禮儀、Round system 買輪制、英式日常寒暄）
  * 📰 **官方法規與新聞長難句解構助教**（Plain English 轉化）
* 原生相容 **Google Gemini API** (`gemini-2.5-flash` 每日 1,500 次永久免費) 及任何 OpenAI 相容端點。

### 2. 📖 英國生活長文沉浸精讀工作室 (Reading Studio)
* 預選 5 大權威英國在地語料：GOV.UK 租約、NHS 求醫、MSE 水電燃氣帳單、BBC 經濟新聞、Reddit 吧台文化。
* 支援粘貼任何英國信件、合約或新聞。
* 智能語塊切分、逐句聽原聲、點擊帶入跟讀特訓、雙擊單詞即時查詞。

### 3. 🧠 AI 發音驅動 SM-2 智能間隔重溫 (Spaced Repetition)
* 由微軟 Azure 官方發音評估（準確度、流利度、韻律分）**客觀驅動間隔重溫算法**。
* 智能判定：<60 分自動標為 Again，≥90 分自動標為 Easy。
* 倫敦地鐵離線自測模式（London Tube Offline Mode）：斷網時自動啟用快取自評。
* 支援一鍵匯出為 **Anki 單字卡 (.tsv)** 或全量進度 JSON 備份。

### 4. 👅 港人常見發音弱點 · 純向量 SVG 口型舌位圖解
* 內建完全自主繪製的純向量 SVG 解剖剖面圖（牙齒、舌位、氣流方向、聲帶震動波紋）：
  * `/θ/` vs `/ð/` 咬舌尖清濁擦音
  * `/v/` vs `/w/` 唇齒音 vs 雙唇音
  * Dark 'l' `[ɫ]` 舌尖頂齦 + 舌根軟顎化雙重動作
  * `/iː/` vs `/ɪ/` 長短元音對比
  * `/ɒ/` RP 英式小圓唇短 o
  * `/ʔ/` 英音倫敦腔聲帶瞬間截氣喉塞音

### 5. 🎯 4 階英國生活晉級通關體系
* 🥉 **Level 1: 英國生存突破 (Survival UK)**（超市自助機、外賣點餐、郵局包裹、地鐵問路）
* 🥈 **Level 2: 生活行政自理 (Daily Affairs)**（GP 電話掛號、Council Tax、銀行開戶、水電寬頻）
* 🥇 **Level 3: 獨立維權與長文閱讀 (Autonomy & Reading)**（鍋爐催修、押金爭端、職場反駁、GOV.UK 精讀）
* 💎 **Level 4: 文化融入與職場自如 (Cultural Fluency)**（雙關自嘲、英倫俚語、跨文化商務溝通）
* 每日 100 XP 任務閉環特訓。

---

## 🚀 快速上手 (Quick Start)

### 方式一：直接執行啟動腳本（推薦）
```powershell
.\start-uk.ps1
```
系統會自動在本地啟動安全隔離伺服器（僅限 `127.0.0.1` 存取），並在瀏覽器自動打開 [http://localhost:8000](http://localhost:8000)。

### 方式二：使用 npm / npx
```bash
npm start
# 或
npm run serve
```

---

## 🔑 免費 API 配置指南

打開頁面右上角 **⚙️ 設置**：

1. **對話大腦（Google Gemini - 每日 1,500 次免費）**：
   * **Base URL**：`https://generativelanguage.googleapis.com/v1beta/openai/`
   * **模型**：`gemini-2.5-flash`
   * **API Key**：至 [Google AI Studio](https://aistudio.google.com/app/apikey) 免費獲取。

2. **語音原聲與糾音（Microsoft Azure Speech - 每月 50 萬字元 + 5 小時錄音評估免費）**：
   * **Speech Key**：微軟 Azure Portal 建立 Speech Services（選擇 Free F0 層）獲取的 Key 1。
   * **Region**：建議選擇 `uksouth`（英國南部數據中心，延遲極低）。
   * **聲音**：`en-GB-SoniaNeural`（標準現代女聲）或 `en-GB-RyanNeural`（自然生活男聲）。

---

## 🛡️ 安全與隱私保障

* **零雲端中轉**：所有 API Key、對話紀錄、錄音資料均保存在本地瀏覽器 `localStorage` 及 `IndexedDB`。
* **物理網絡隔離**：啟動腳本強制綁定本機環回網卡（`127.0.0.1`），公共 Wi-Fi 或區域網其他設備完全無法掃描或連接。
* **嚴格防護**：通過代碼級 XSS 白名單過濾、無任何內聯可執行屬性，並有 Blob 記憶體洩漏自動回收機制。

---

## 📄 開源授權

本專案基於 MIT License 開源發布。
