# 🏛️ SprechMate UK 全庫深度體檢、痛點逆向推導與戰略演進藍圖 (`AUDIT_AND_ROADMAP.md`)

> **審查角色**：首席系統架構師 & 技術產品總監  
> **審查基準版本**：`v1.4.0`（現行工作區完整代碼基線：`index.html` 5,533 行、`uk_engine.js` 1,779 行、`sw.js` 58 行）  
> **審查模式**：唯讀靜態偵察（Read-Only Reconnaissance）與全鏈路逆向推導  
> **核心原則**：證據導向（100% 精確標註真實 `檔案路徑:行號`）、減法設計（Subtractive Design）、無聊技術（Boring Technology）、高價值槓桿（20% 成本撬動 80% 價值）

---

### 一、 逆向推導：用戶核心痛點全景圖

透過從瀏覽器事件入口（DOM Click / Touch / MediaRecorder / Clipboard）一路追蹤至 Web Audio 解碼、IndexedDB 持久層、Service Worker 與雲端 API（Google Gemini 3.8 / Azure Speech），我們從當前 `v1.4.0` 代碼實現中逆向推導出 **5 個最令真實用戶崩潰的體驗災難**：

---

#### 痛點 1：「萬物皆咬舌音 `/θ/`」的教學誤導災難 —— 點擊任何紅字錯音都被強制顯示為「咬舌頭 `/θ/`」
*   **痛點現象描述**（從用戶視角描述挫折感）：
    用戶在錄音跟讀後拿到了發音診斷卡，看到單詞 `"rent"` 的 `/r/`、`"bath"` 的 `/ɑː/` 或 `"sister"` 的 `/s/` 被標成紅色低分。由於每個音標上都顯示手型游標並提示「`點擊查看口型圖解`」，用戶滿懷期待地點擊紅色的 `/r/` 或 `/ɑː/` 想看舌位圖。結果彈出的解剖圖視窗竟然**永遠顯示「咬舌尖清擦音 `/θ/`：將舌尖輕輕伸出上下門牙之間、聲帶不要震動」**，連點擊「🔊 聽示範音」播出的也是 `"think through bath"`！更離譜的是，在閃卡頁面遇到 `"the"`、`"there"`、`"brother"`（濁音 `/ð/`）時，系統生成的提示按鈕竟也標示為清音 `👅 口型圖 /θ/`；遇到 `"London"`、`"like"`（詞首清晰 Clear L）卻叫用戶發「詞尾 Dark L 舌根軟顎化」。初學者照著練反而把原本對的發音徹底練歪！
*   **技術病灶定位**：
    *   `index.html:L5034-L5039`、`index.html:L5078-L5086`（`renderResult` 對所有音素無差別綁定 `showPhoneticModal(sym, wWord)`）
    *   `uk_engine.js:L240-L260`（`showPhoneticModal` 將未匹配音素一律預設降級為 `let key = 'θ'`）
    *   `uk_engine.js:L232-L237`（`renderPhoneticSvg` 底部的通用口型圖分支因上方預設 `'θ'` 而淪為 100% 死代碼）
    *   `uk_engine.js:L659-L670`（`renderActiveReviewCard` 用 `item.text.toLowerCase().includes(ph)` 對英文拼寫直接匹配 IPA 符號）
*   **觸發鏈路分析**：
    1. 在 `index.html:L5035` 中，系統為 Azure 返回的每一個 IPA 音素（包含 44 個英音音素如 `/r/`, `/s/`, `/t/`, `/ɑː/`, `/ə/`, `/æ/` 等）都加上了 `data-sym` 與 `title="點擊查看口型圖解"`。
    2. 然而在 `uk_engine.js:L245-L255` 的 `showPhoneticModal(symbol, word)` 中，首行寫死了 `let key = 'θ';`，接著僅用 `if / else if` 檢查了 7 個音素（`θ`, `ð`, `v/w`, `l/ɫ`, `iː/ɪ`, `ɒ/ɔː`, `ʔ`）。當傳入其餘 37+ 種英音音素時，所有條件皆為 `false`，`key` 原封不動保持為 `'θ'`！
    3. 同時在 `uk_engine.js:L659-L661` 中，`trickyList = ['θ', 'ð', 'v', 'l', 'iː', 'ɒ', 'ʔ']` 直接對英文原文句子 `item.text` 執行 `.includes(ph)`。由於英文句子是拉丁字母而非 IPA 音標，`'ð'`, `'iː'`, `'ɒ'`, `'ʔ'` **永遠不可能命中**；而 `ph === 'θ' && item.text.toLowerCase().includes('th')` 則把所有含 `th` 的高頻功能詞（`the`, `this`, `that`, `there`, `with`）全部誤判為清音 `/θ/`；`includes('l')` 則把所有含字母 `l` 的單詞全部誤判為詞尾 Dark L `[ɫ]`。
    4. 此外，當用戶在口型彈窗點擊「🎙️ 立即跟讀特訓」（`uk_engine.js:L1653-L1665`）且當前音素為 `/ʔ/` 或 `/iː/` 時，`info.sampleWord.split(',')[0].trim()`（`uk_engine.js:L1658`）會將非標準拼寫 `"wa'er"`（`uk_engine.js:L83`）或對比字串 `"sheet vs shit"`（`uk_engine.js:L58`）塞進 `#sentenceText` 送交 Azure 評分，導致識別與打分失準。

---

#### 痛點 2：錄音時「AI 原聲從喇叭竄入麥克風」與「跨分頁跟讀半截隱形」—— 雙播放器無互斥與 DOM 狀態漏同步
*   **痛點現象描述**（從用戶視角描述挫折感）：
    1. 用戶在閃卡點擊「🎙️ 智能發音自測」或在對話點擊句子後，系統開始合成並自動播放 AI 示範原聲。用戶看到提示「請點擊開始錄音朗讀」，便立即按下「開始錄音」。此時**喇叭裡的 AI 示範音竟然還在繼續大聲播放**（或者因網路延遲 1.5 秒才剛載入完畢並突然在錄音中途炸響），直接被手機麥克風錄了進去，把用戶自己的發音完全蓋過！
    2. 當用戶在「📖 長文精讀」挑選了一句 30 個單詞的 GOV.UK 租屋條款並點擊「🎙️ 跟讀特訓」時，畫面切換到實戰頁，但卻**被強制捲動到最頂端的聊天室**（根本看不到下方的跟讀框）；等用戶手動往下滑到跟讀框時，發現**句子只顯示了前兩行，後半截文字完全被吃掉看不見**，根本沒法完整朗讀！
*   **技術病灶定位**：
    *   `index.html:L4745-L4766`（`startRecording` 開啟 `echoCancellation: false` 卻未停止任何正在播放的音訊或進行中的 TTS 自動播放）
    *   `index.html:L4530-L4559`（`genRefAudio` 非同步完成後無條件觸發 `refPlayer.load(..., true)`，未檢查是否正處於 `recSession` 錄音中）
    *   `uk_engine.js:L1714-L1726`（`stopCurrentUkAudio` 未呼叫 `window.speechSynthesis.cancel()`，亦未與 `refPlayer` / `myPlayer` 互斥）
    *   `uk_engine.js:L1280-L1287`（精讀 `#rd-shadow-${idx}`）、`uk_engine.js:L1550-L1557`（`drillShadowSentence`）、`uk_engine.js:L1653-L1665`（`#phModalPracticeBtn`）
    *   `index.html:L73`（`textarea#sentenceText { overflow: hidden }`）與 `uk_engine.js:L1606`（`switchTab` 強制 `window.scrollTo({ top: 0 })`）
*   **觸發鏈路分析**：
    1. 為保留摩擦音細節，`startRecording()`（`index.html:L4754`）刻意關閉了瀏覽器回音消除（`echoCancellation: false`）。然而專案內同時存在三套獨立的發聲源：`refPlayer` / `myPlayer`（`index.html:L4051-L4052`）、`currentUkAudio`（`uk_engine.js:L1710`）與 `window.speechSynthesis`（`uk_engine.js:L1777`）。`startRecording()` 啟動時**既沒有暫停這三套播放器，也沒有遞增 `refGenSeq` / `ukVoiceSeq` 取消在途的 TTS 自動播放請求**，導致喇叭放出來的 AI 原聲直接被無回音消除的麥克風收錄。
    2. 在 `uk_engine.js:L1281-L1286`、`L1551-L1556` 與 `L1657-L1663` 三處「跟讀特訓」跳轉邏輯中，開發者僅寫了 `stBox.value = sent; switchTab('practice');`，**漏掉了呼叫 `autoGrowTextarea(stBox)` 與 `refreshSentenceBlur()`**。由於 `index.html:L73` 設定了 `textarea#sentenceText { resize: none; overflow: hidden }`，未觸發 `autoGrowTextarea` 的長句會被固定在 2 行高度內截斷隱藏。同時 `switchTab('practice')` 在 `uk_engine.js:L1606` 無條件執行 `window.scrollTo({ top: 0 })`，將用戶拉回頁面最頂端而非跟讀卡片區。

---

#### 痛點 3：倫敦地鐵離線與弱網下的「26 秒假死黑盒」—— SW 無超時攔截 + 雙雲端三層串聯盲等
*   **痛點現象描述**（從用戶視角描述挫折感）：
    本專案主打「🚇 倫敦地鐵離線模式 (Tube Mode)」。然而當用戶走進倫敦地鐵月台（手機處於無訊號或僅有微弱假訊號 Lie-Fi 狀態），打開 App 或點擊「🔊 聽英式原聲」時：
    1. 若剛進地鐵微弱訊號區，畫面在啟動時會因為等待網路回應而白屏卡死數十秒；
    2. 若在已開啟的頁面上點擊「🔊 朗讀」一句新語塊（同時配置了 Gemini 與 Azure Key），按鈕按下後**整整 20~26 秒完全沒有任何聲音與回饋**，等用戶以為壞掉準備關掉 App 時，系統才突然冒出機械音！
*   **技術病灶定位**：
    *   `sw.js:L43-L56`（Service Worker `fetch(e.request)` 採用無超時限制的純 Network-First）
    *   `index.html:L4259`（`geminiTtsBlob` Step 1 `/v1beta/interactions` 10 秒超時）
    *   `index.html:L4308`（`geminiTtsBlob` Step 2 `:generateContent` 10 秒超時）
    *   `index.html:L4346`（`azureTtsBlob` 6 秒超時）
    *   `index.html:L4371-L4398`（`ttsBlob` 未檢查 `navigator.onLine`，在離線或弱網下將三個超時串聯累加）
    *   `index.html:L4531-L4540`（`genRefAudio` 僅檢查 `!canUseCloudTts(s)`，未檢查 `!navigator.onLine`）
*   **觸發鏈路分析**：
    1. 當用戶在飛行模式或完全斷網（`navigator.onLine === false`）下點擊跟讀區的「生成原聲」（`genRefAudio`，`index.html:L4531`）或閃卡的「聽英式原聲」（`playUkVoice`，`uk_engine.js:L1728`）時，因為 `canUseCloudTts(s)`（`index.html:L4119-L4122`）只看 `localStorage` 有沒有存 API Key，不看 `navigator.onLine`，程式仍會強行進入 `ttsCached()` $\to$ `ttsBlob()` 發起雲端請求。
    2. 在地鐵弱網（TCP 封包黑洞）環境下，`geminiTtsBlob()` 先在 Step 1 等待 **10 秒**（`index.html:L4259`），超時後進入 `catch`（`index.html:L4271`）**卻未將 `geminiInteractionsSupported` 設為 `false`**，緊接著在 Step 2 又等待 **10 秒**（`index.html:L4308`）；若用戶同時填了備援的 Azure Key，`ttsBlob()` 的 `catch`（`index.html:L4381-L4385`）會再發起 `azureTtsBlob()` 等待 **6 秒**（`index.html:L4346`）。單次點擊最長需乾等 **10 + 10 + 6 = 26 秒** 才會落入離線 `speechSynthesis` 兜底！
    3. 同理，`sw.js:L44` 的 `fetch(e.request)` 沒有設定任何 `AbortController` 超時，在手機假訊號（Lie-Fi）下會無限期等待瀏覽器底層 TCP 超時（30~60 秒），使離線快取形同虛設。

---

#### 痛點 4：剪貼簿同步與空白範本的「指鹿為馬」崩潰 —— 局部變數 `t` 遮蔽全域翻譯函式 `t(key)`
*   **痛點現象描述**（從用戶視角描述挫折感）：
    1. 桌機或無鏡頭設備用戶在設定頁點擊「從剪貼簿同步」，若當時剪貼簿剛好是空的（尚未複製同步碼），系統非但沒有提示「`剪貼簿為空，請先複製同步碼`」，反而彈出錯誤視窗指責用戶：**「`剪貼簿權限被拒絕，請點擊網址列左側圖示，在網站設定中允許後重試`」**！用戶去瀏覽器設定裡反覆檢查，明明已經允許了剪貼簿權限，卻始終被這個假錯誤搞得一頭霧水。
    2. 當用戶匯入一份第三方設定檔，若其中某個提示詞範本缺少 `name` 欄位（或將範本名稱清空），整個設定頁與聊天介面會瞬間拋出未捕獲異常而中斷渲染。
*   **技術病灶定位**：
    *   `index.html:L3089-L3097`（`pasteTextFlow` 中 `.then(t => { ... alertDlg(t('set.clipEmpty')); })`）
    *   `index.html:L1966-L1970`（`refreshPromptUI` 中 `.forEach(t => { ... t.name || t('set.tplUnnamed'); })`）
    *   `index.html:L3592-L3597`（`refreshConvPromptSel` 中 `.forEach(t => { ... t.name || t('set.tplUnnamed'); })`）
    *   `index.html:L2386-L2388`（`importSettingsFile` 中 `.forEach(t => { ... throw new Error(t('set.importBadTplItem')); })`）
*   **觸發鏈路分析**：
    1. 全域多語系翻譯函式命名為單字母 `t(key, params)`（`index.html:L1782`）。
    2. 在 `pasteTextFlow()`（`index.html:L3091`）中，開發者將 `readText().then(t => ...)` 的回調參數也命名為 **`t`**（代表剪貼簿字串）。當剪貼簿為空時，`t` 的值為空字串 `""`，此時執行第 3093 行的 `alertDlg(t('set.clipEmpty'))`，在 JavaScript 引擎中實際執行的是 `""('set.clipEmpty')`，當場拋出 **`TypeError: t is not a function`**！
    3. 該 `TypeError` 隨即被第 3095 行的 `.catch(() => alertDlg(t('set.clipDenied')))` 捕獲，導致系統把「程式碼自身的 `TypeError`」張冠李戴報成「使用者拒絕了剪貼簿權限」！
    4. 完全相同的變數遮蔽（Variable Shadowing）還潛伏在 `index.html:L1969`、`L2387`、`L3595` 三處，只要進入 fallback 分支就會立即拋出 `TypeError: t is not a function`。

---

#### 痛點 5：晉級與任務體系「假閉環與無限刷分」—— 點舊紀錄無限加 XP、點精讀分頁即通關、15 個英國任務全隱形
*   **痛點現象描述**（從用戶視角描述挫折感）：
    用戶想認真按照「🎯 晉級通關」的 4 階體系（Level 1 生存突破 $\to$ Level 4 文化融入）循序漸進學習，卻發現整個進度與任務系統充滿荒謬的邏輯破洞：
    1. **不看文章直接通關**：用戶只是好奇點了一下頂部的「📖 長文精讀」分頁，**連一個字都還沒讀**，「今日修煉任務」裡的「`✅ 完成 1 篇英國長文精讀 (+35 XP)`」就已經自動打勾完成，且每按一次「開始智慧斷句精讀」按鈕就白送 `+20 XP`！
    2. **點歷史紀錄無限刷滿級**：用戶在實戰頁下方點擊一條以前錄過的 80 分練習紀錄想回聽自己的發音，每點一次歷史紀錄就白拿 `+10 XP`（連點 250 下直接從 Level 1 升到滿級 Level 4），甚至還會誤觸發閃卡自測完成！
    3. **任務文字與實際條件不符、15 個核心關卡消失**：介面寫著「`晨間重溫 5 個在地語塊 (+30 XP)`」，實際上只複習 **1 個**語塊就馬上打勾並加了 `35 XP`；而 `uk_stages.json` 中精心設計的 **15 個英國實戰任務（超市自助結賬、Pret 點餐、Royal Mail 退貨、NHS 8:00 AM 掛號、DPS 押金抗辯等）** 在介面上竟然完全沒有渲染出來！
*   **技術病灶定位**：
    *   `index.html:L5231-L5238`（`restoreRecord` 呼叫 `renderResult` 時未傳入第 3 參數 `skipScroll = true`）
    *   `index.html:L5090-L5096`（`renderResult` 僅依賴 `!skipScroll` 判斷是否發放 XP、完成每日任務與結算閃卡自測）
    *   `uk_engine.js:L1598-L1604`（`switchTab('reading')` 首次載入自動執行 `analyzeReadingText`）與 `uk_engine.js:L1238-L1239`（`analyzeReadingText` 無條件呼叫 `addProgressionXp(20)` 與 `markDailyQuest('reading')`）
    *   `uk_engine.js:L828`（`applyReviewRating` 複習 1 張即觸發 `markDailyQuest('review')`）與 `uk_engine.js:L1470`（文案寫「重溫 5 個 (+30 XP)」）
    *   `uk_engine.js:L1425-L1491`（`renderStagesDashboard` 完全忽略 `uk_stages.json:L9-L79` 中的 `missions` 與 `targets` 欄位）
*   **觸發鏈路分析**：
    1. `renderResult(pa, recognized, skipScroll)`（`index.html:L5002`）把「是否滾動畫面（`skipScroll`）」與「是否為本次新產生的錄音評測」混為一談。當 `restoreRecord()`（`index.html:L5237`）載入歷史紀錄時呼叫了 `renderResult(paLikeFromRec(rec), rec.recognizedText || '')`，因 `skipScroll` 為 `undefined`，直接觸發了 `index.html:L5090-L5096` 的獎勵與閃卡回調邏輯。
    2. `analyzeReadingText()`（`uk_engine.js:L1216-L1240`）將「字串切句渲染」與「發放精讀獎勵」耦合在一起，導致 `switchTab('reading')` 自動預載預設文章時直接觸發通關。

---

### 二、 系統盲點、致命缺陷與樂觀假設清單

按嚴重度（**P0 致命** / **P1 嚴重** / **P2 警告**）排列：

*   **[P0 致命] Cloudflare 部署配置（`assetsDirectory: "."`）缺乏 `.assetsignore`，將本地機密審計與工程規範檔公開發佈至公網 CDN**（類別：致命缺陷 / 架構與維運盲點）
    *   **代碼證據**：
        *   `wrangler.config.ts:L3-L5`（`"assetsDirectory": "."`）
        *   `.gitignore:L14-L28`（明文標註 `PROJECT_METRICS_AUDIT.md`、`AGENT_CONTEXT.md`、`*AUDIT*.md`、`.agentrules`、`.cursorrules`、`CODE_RULES.md` 為 `LOCAL_ONLY (DO NOT SYNC TO GITHUB)`）
        *   `.cloudflare/output/v0/workers/default/assets/`（既有建置產物目錄中已實際包含 `PROJECT_METRICS_AUDIT.md`、`AGENT_CONTEXT.md`、`CODE_RULES.md`、`.agentrules`、`.cursorrules`、`package.json`、`start-uk.ps1` 與 40 張已廢棄的德國風景圖）
    *   **爆炸場景推演**：開發者誤以為寫進 `.gitignore` 的本地隱私審計帳本（`PROJECT_METRICS_AUDIT.md`）與內部系統架構提示詞（`AGENT_CONTEXT.md`、`AUDIT_AND_ROADMAP.md`）不會外洩。然而執行 `npm run deploy`（`cf deploy`，`package.json:L12`）時，Cloudflare Workers Static Assets 會將 `assetsDirectory: "."` 下的所有檔案（若無 `.assetsignore` 排除）打包上傳至公網域名，任何人訪問 `https://<domain>/PROJECT_METRICS_AUDIT.md` 或 `/AGENT_CONTEXT.md` 即可直接下載讀取！
    *   **維護成本評估**：構成直接的內部工程文件與審計數據洩漏風險，且每次部署額外上傳數 MB 無用檔案，處理安全事件與清理快取需耗費 **4~8 小時**。

*   **[P0 致命] 局部變數 `t` 遮蔽全域 i18n 函式 `t(key)`，引發 `TypeError: t is not a function` 與錯誤歸因誤導**（類別：致命缺陷）
    *   **代碼證據**：
        *   `index.html:L3091-L3095`（`pasteTextFlow`：`navigator.clipboard.readText().then(t => { ... alertDlg(t('set.clipEmpty')); })`）
        *   `index.html:L1966-L1970`（`refreshPromptUI`：`(s.promptTemplates || []).forEach(t => { ... t.name || t('set.tplUnnamed'); })`）
        *   `index.html:L3592-L3597`（`refreshConvPromptSel`：`ts.forEach(t => { ... t.name || t('set.tplUnnamed'); })`）
        *   `index.html:L2386-L2388`（`importSettingsFile`：`obj.promptTemplates.forEach(t => { ... throw new Error(t('set.importBadTplItem')); })`）
    *   **爆炸場景推演**：當剪貼簿為空、匯入損壞的提示詞範本或範本名稱為空字串時，回調參數 `t` 覆蓋了 `window.t` 翻譯函式，呼叫 `t('...')` 必定拋出 `TypeError: t is not a function`。在 `pasteTextFlow` 中更會落入 `.catch()` 謊報「剪貼簿權限被拒絕」，外加第 3094 行 `finishPaste(t, close)` 誤傳入 `window.close`。
    *   **維護成本評估**：極具迷惑性的「假權限錯誤」與隨機崩潰，每月消耗 **2~4 小時** 排查。

*   **[P0 致命] 錄音期間未互斥停止播放器與在途 TTS，導致无回音消除（`echoCancellation: false`）下喇叭原聲直接灌入評分麥克風**（類別：致命缺陷 / 狀態撕裂）
    *   **代碼證據**：
        *   `index.html:L4745-L4766`（`startRecording`）
        *   `index.html:L4531-L4550`（`genRefAudio`）
        *   `uk_engine.js:L1714-L1778`（`stopCurrentUkAudio` 與 `playUkVoice`）
    *   **爆炸場景推演**：用戶點擊氣泡或「智能發音自測」後立即按下「開始錄音（或按 D 鍵）」，此時正在播放的 `refPlayer`、`myPlayer`、`currentUkAudio` 或 `window.speechSynthesis` 未被停止，或在途的 `genRefAudio` 剛好合成完畢自動呼叫 `refPlayer.load(lastRefUrl, true)`。由於 `startRecording` 設定了 `echoCancellation: false`（`index.html:L4754`），AI 的聲音被原封不動錄進 `MediaRecorder`，導致發音評估測出虛高假分或因雙聲重疊而識別失敗。
    *   **維護成本評估**：直接破壞核心發音評分準確性，每月消耗 **3~5 小時** 處理評分異常反饋。

*   **[P0 致命] `showPhoneticModal` 預設降級至 `/θ/` 且 `renderActiveReviewCard` 對拉丁字母做 IPA 字串匹配，造成嚴重教學誤導**（類別：致命缺陷 / 樂觀假設）
    *   **代碼證據**：
        *   `uk_engine.js:L240-L260`（`showPhoneticModal` 中 `let key = 'θ'` 吞噬所有非 7 大特訓音素）
        *   `uk_engine.js:L659-L670`（`renderActiveReviewCard` 中 `item.text.toLowerCase().includes(ph)`）
        *   `uk_engine.js:L1653-L1665`（`phModalPracticeBtn` 將 `"wa'er"` 或 `"sheet vs shit"` 寫入 `#sentenceText`）
        *   `index.html:L5035`（`renderResult` 為所有音素渲染可點擊口型圖提示）
    *   **爆炸場景推演**：用戶在發音評分卡點擊任何非 7 大音素（如 `/r/`, `/s/`, `/t/`, `/ɑː/`, `/e/`, `/ʌ/`），100% 彈出「咬舌音 `/θ/`」解剖圖；閃卡背面把 `"the"` / `"this"` 標為清音 `/θ/`，把 `"like"` 標為詞尾 Dark L `[ɫ]`。
    *   **維護成本評估**：直接影響產品專業公信力與教學正確性，屬核心價值主張缺陷。

*   **[P1 嚴重] 英文介面（`uiLang === 'en'`）下 System Prompt 自我矛盾：「全程用英式英語對話，但禁止在引用行外寫英文」**（類別：致命缺陷 / 樂觀假設）
    *   **代碼證據**：
        *   `index.html:L848-L860`（`buildDefaultPrompt`：`Converse mainly in English (UK)... Don't write English outside quote lines.`）
        *   `index.html:L893-L903`（`buildCustomsPrompt`）
        *   `index.html:L955-L966`（`buildUKCouncilPrompt`）
        *   `index.html:L983-L994`（`buildUKTenancyPrompt`）
        *   `index.html:L1011-L1022`（`buildUKBanterPrompt`）
    *   **爆炸場景推演**：當用戶在設定中將「介面語言（UI Language）」切換為 `English` 時，上述 5 個核心範本的英文版 Prompt 一方面要求 AI `"Converse in British English"`，另一方面卻保留了德語版時代遺留的禁令 `"Don't write English outside quote lines"`（原意為「除 `>` 翻譯行外只准寫德文，不准寫英文」）。這導致 Gemini 模型收到自相矛盾的指令，要麼把整段對話都縮進 `>` 引用塊內（導致 `targetLangText` 把整段回覆當成譯文濾空，無法朗讀與跟讀！），要麼拒絕正常輸出。
    *   **維護成本評估**：英文介面下 AI 對話與跟讀鏈路直接損壞，每月消耗 **2~3 小時**。

*   **[P1 嚴重] `ttsFindByTextOtherLocale` 跨語言快取兜底反噬：切換口音或學習語言後仍強制播放舊語言／美音快取**（類別：樂觀假設 / 狀態撕裂）
    *   **代碼證據**：`index.html:L4424-L4446`（`ttsFindByTextOtherLocale`）與 `index.html:L4468-L4470`（`ttsCached`）
    *   **爆炸場景推演**：`ttsCached` 在當前口音（如 `en-GB`）未命中快取時，會呼叫 `ttsFindByTextOtherLocale(txt, 'en-GB')` 尋找其他語言（如 `en-US` 美式英語或 `de-DE` 德語）下相同文本的快取並直接返回！這導致用戶若曾用 `en-US` 聽過某句話，切換回 `en-GB` 英式英語想聽英音對比時，系統竟永遠播放舊的美音快取，甚至在 `restoreRecord(convId, recId)`（`index.html:L5242`）與 `savePracticeRecord`（`index.html:L5184` 僅存 `s.voice` 未存 `resolveTtsEngine(s).cacheVoice`）之間造成快取鍵錯位。
    *   **維護成本評估**：排查「為什麼換了英音角色還是發出美音」需深入追蹤 IDB 快取鍵，每月消耗 **2~3 小時**。

*   **[P1 嚴重] 進度備份匯入（`importReviewsJson`）無覆寫確認、無結構校驗且無法重複選取同檔**（類別：樂觀假設 / 資料損毀）
    *   **代碼證據**：`uk_engine.js:L962-L1012`（`importReviewsJson`）、`uk_engine.js:L1672-L1680`（`importBackupFileInput.onchange`）
    *   **爆炸場景推演**：
        1. 用戶在「我的英式在地語塊本」點擊「還原／匯入進度」時，一旦選中檔案，**沒有任何 `confirmDlg` 二次確認**，便直接執行 `persistReviewsCache(true)` 清空並覆寫本機所有閃卡！
        2. 若用戶誤選了「設定備份檔（`sprechmate-uk-settings-*.json`）」或任意不含 `reviews`／`progression` 的 JSON 檔，`importReviewsJson` 什麼都沒匯入，卻依然彈出 `alertDlg('✅ 進度備份已安全驗證並成功還原！')`（`uk_engine.js:L1006`）。
        3. `importInput.onchange`（`uk_engine.js:L1675`）未重置 `e.target.value = ''`，導致同一檔案無法再次選擇觸發。
    *   **維護成本評估**：一旦誤操作即造成用戶累積數月的閃卡被無預警覆寫，每月消耗 **2~3 小時**。

*   **[P1 嚴重] 歷史紀錄點擊刷分漏洞（`restoreRecord`）、精讀切換自動通關與 `uk_stages.json` 任務斷頭**（類別：致命缺陷 / 狀態撕裂）
    *   **代碼證據**：`index.html:L5237`、`index.html:L5090-L5096`、`uk_engine.js:L1238-L1239`、`uk_engine.js:L1598-L1604`、`uk_engine.js:L828`、`uk_engine.js:L1425-L1491`
    *   **爆炸場景推演**：點擊歷史練習紀錄會重複觸發 `addProgressionXp(10)`、`markDailyQuest('chat')` 與 `completeReviewVoiceAssessment()`；切換到精讀分頁自動獲得 `+55 XP`；`uk_stages.json` 的 15 個英國生存任務從未渲染或綁定。
    *   **維護成本評估**：遊戲化激勵機制完全失效，每月消耗 **2~3 小時**。

*   **[P1 嚴重] 單體巨型對話持久化（`IDB_CONVS_KEY = 'json:convs'`）：每次發訊息或打分都在主執行緒 `JSON.stringify` 全量對話與音素樹**（類別：重度用戶效能懸崖）
    *   **代碼證據**：`index.html:L2212`、`index.html:L2240-L2261`（`saveConvs` 與 `persistConv`）、`index.html:L5165-L5207`（`savePracticeRecord` 將完整 `words` 與 `phonemes` 樹存入 `conv.records`）
    *   **爆炸場景推演**：設定允許保留最多 `1,000` 個對話（`convLimit: 1000`，`index.html:L1872`），每個對話保留最多 `200` 條訊息與 `200` 條含完整音素陣列的練習紀錄。當重度用戶累積百餘個對話後，每發送一條聊天訊息、每改一個標題或每完成一次錄音打分，`persistConv(c)` 都會同步執行 `JSON.stringify(convsCache)` 序列化數十 MB 的巨型陣列並重寫單一 IndexedDB 鍵 `'json:convs'`，造成主執行緒嚴重掉幀與阻塞。
    *   **維護成本評估**：重度用戶使用 1~3 個月後必遇的性能高牆，每月消耗 **3~4 小時**。

*   **[P2 警告] 根目錄殘留 400 條德語諺語 `quotes.csv`（65KB）及 README 截圖未隔離、文檔版本號與實際架構失步**（類別：架構與維護盲點）
    *   **代碼證據**：
        *   `quotes.csv:L1-L400`（65,251 bytes 的純德語諺語 CSV，全庫無任何引用）
        *   `AGENT_CONTEXT.md:L3, L35-L41, L48-L59`（仍記載版本 `1.2.0`、仍記載已刪除的 `uk_prompts.json`、錯誤記載 IndexedDB 表名為 `'blobs'` 與 `'convs'`，而實際代碼 `index.html:L5105-L5116` 為 `'deutsch-audio'` 下的 `'audios'` 與 `'reviews'`；錯誤記載 `localStorage` 鍵名為 `'deutsch_practice_settings_v2'` 與 `'sprechmate_uk_reviews_v1'`，而實際代碼 `index.html:L838` 與 `uk_engine.js:L305` 為 `'deutsch.settings.v1'` 與 `'uk_reviews_deck'`）
        *   `PROJECT_METRICS_AUDIT.md:L5, L28`（仍停留在 `v1.2.0`，未同步 `v1.3.0` 與 `v1.4.0`）
    *   **爆炸場景推演**：`AGENT_CONTEXT.md` 作為聲明中的「AI Agent 唯一事實來源（Single Source of Truth）」，其記錄的 IndexedDB Store 名稱（`blobs`/`convs`）與 `localStorage` Key 名稱與真實代碼**完全不一致**！任何後續 AI Agent 若依據 `AGENT_CONTEXT.md` 編寫資料遷移或查詢代碼，將 100% 讀寫到錯誤的 Store 與 Key 上，引發災難性 Bug。
    *   **維護成本評估**：誤導所有後續開發者與 AI 代理，每月浪費 **3~5 小時**。

---

### 三、 升級路線圖 (Roadmap：Phase 1 ~ Phase 3)

| 階段 | 階段目標 | 改造任務 | 對應消除的用戶痛點 / P0-P2 缺陷 | 預期降低的維運負擔 |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1**<br>止血與防禦加固<br>（零架構變動） | 消除所有 P0 致命崩潰、教學誤導、錄音串音、雲端部署洩漏與離線 26 秒假死 | 1. **新增 `.assetsignore` 並清理根目錄死檔案 `quotes.csv`**：阻斷 Cloudflare 部署外洩 `PROJECT_METRICS_AUDIT.md`、`AGENT_CONTEXT.md`、`.agentrules`、`tests/` 等內部檔案。<br>2. **根除 4 處 `t` 變數遮蔽（Shadowing）**：修復 `pasteTextFlow`、`refreshPromptUI`、`refreshConvPromptSel`、`importSettingsFile` 中遮蔽全域 `t(key)` 的致命 `TypeError`。<br>3. **錄音與多軌播放器全局互斥（Audio Mutex）**：抽離 `stopAllAudioPlayback()`，在 `startRecording()` 時強制停止 `refPlayer`、`myPlayer`、`currentUkAudio`、`speechSynthesis` 並取消在途自動播放；`genRefAudio` 完成時若處於錄音狀態則僅載入不自動播放。<br>4. **修正音素口型圖精準匹配與跟讀跳轉 UI**：非 7 大特訓音素在 `renderResult` 不偽裝成 `/θ/`；修正閃卡 `th`（區分 `/θ/` 與 `/ð/`）與詞尾 Dark L 匹配；補齊 3 處「跟讀特訓」跳轉的 `autoGrowTextarea` 與自動滾動定位。<br>5. **離線秒級短路與 TTS 超時收斂**：`ttsBlob` / `genRefAudio` 檢測 `!navigator.onLine` 立即直走離線英音；`geminiTtsBlob` 超時縮短為 6 秒且超時後當次直接記憶切換，消除 26 秒串聯盲等。 | • 消除痛點 1（萬物皆 `/θ/` 教學誤導）<br>• 消除痛點 2（錄音喇叭串音與跟讀框截斷）<br>• 消除痛點 3（倫敦地鐵離線 26 秒假死）<br>• 消除痛點 4（剪貼簿同步假報權限錯誤）<br>• 消除全部 4 項 P0 致命缺陷 | 消除 **90% 以上** 的執行期崩潰、核心功能誤導與安全外洩風險，每月節省 **15~20 小時** 線上排障時間。 |
| **Phase 2**<br>痛點根治與架構減負<br>（做減法） | 根治任務刷分破洞、修復英文介面 Prompt 自相矛盾、移除跨語言錯配快取、同步權威文檔 | 1. **修復 `restoreRecord` 刷分與精讀假通關**：`restoreRecord` 傳入獨立標記避免重複發放 XP 與誤觸發閃卡自測；將精讀 XP 與每日任務移至實際點擊句子「🔊 朗讀」或「🎙️ 跟讀」時觸發；落地渲染 `uk_stages.json` 的 15 個英國生存任務。<br>2. **修復英文介面 Prompt 矛盾與備份還原防呆**：修正 5 個內建 Prompt 在 `uiLang === 'en'` 下 `"Don't write English outside quote lines"` 的自相矛盾指令；為 `importReviewsJson` 加上結構校驗、`confirmDlg` 二次確認與 `e.target.value = ''` 重置。<br>3. **砍掉跨語言錯配快取 `ttsFindByTextOtherLocale`**：刪除將德語／美語快取當成英音播放的約 25 行遺留邏輯；在 `savePracticeRecord` 記錄真實 `cacheVoice`。<br>4. **校準 `AGENT_CONTEXT.md` 與 `PROJECT_METRICS_AUDIT.md`**：修正所有失真的 IndexedDB Store 名稱與 `localStorage` 鍵名契約。 | • 消除痛點 5（晉級任務假閉環與無限刷分）<br>• 消除 P1 英文介面 Prompt 崩壞<br>• 消除 P1 閃卡匯入誤覆寫與跨口音錯配<br>• 消除 P2 文檔契約失真 | 砍掉無用歷史包袱代碼與死檔案 **70KB+**，讓文檔與代碼 100% 對齊，每月節省 **8~10 小時** 維護心智負擔。 |
| **Phase 3**<br>自癒能力與免維護設計<br>（自動化） | 解決 Service Worker 假訊號白屏、對話單鍵膨脹與回歸測試守門自動化 | 1. **Service Worker 導航與靜態資源 3 秒超時快取回退**：為 `sw.js` 的 `fetch(e.request)` 加上 3 秒競賽超時，解決地鐵微弱假訊號（Lie-Fi）下白屏卡死。<br>2. **IndexedDB 配額滿載自癒與巨型對話瘦身**：當 `idbSet` 遭遇 `QuotaExceededError` 時自動裁剪舊 TTS 快取並重試；限制單一對話內儲存的歷史音素明細深度。<br>3. **擴充 `tests/unit.test.js` 靜態守門員**：加入變數遮蔽掃描、`.assetsignore` 完整性檢查與 `sw.js` 資產存在性自動化測試。 | • 徹底根除長期使用後的儲存死鎖、Lie-Fi 白屏與回歸缺陷 | 達成系統長期「零人工干預、無人值守」運行。 |

---

### 四、 代碼級實施計畫 (Implementation Plan)

針對 Phase 1 與 Phase 2 的關鍵改造任務，提供可直接作為下一階段 AI 編碼指令的精確規格：

---

#### 任務 1：封堵 Cloudflare 部署機密外洩（`.assetsignore`）與根除 4 處 `t` 變數遮蔽
1.  **目標檔案與函數**：
    *   新增根目錄 `.assetsignore`，並刪除無用遺留檔 `quotes.csv`
    *   `index.html:refreshPromptUI`（`L1961-L1975`）
    *   `index.html:importSettingsFile`（`L2371-L2409`）
    *   `index.html:pasteTextFlow`（`L3089-L3097`）
    *   `index.html:refreshConvPromptSel`（`L3586-L3606`）
2.  **極簡重構方案（含刪除冗餘檔案）**：
    *   **刪除冗餘檔案**：直接刪除根目錄下 65KB 未被任何代碼引用的德語名言表 `quotes.csv`。
    *   **建立 `.assetsignore`**：在專案根目錄建立 `.assetsignore`，明確排除所有非前端運行時必需的工程、審計與配置檔：
        ```gitignore
        .git
        .gitignore
        .agentrules
        .cursorrules
        .cloudflare
        .wrangler
        node_modules
        tests
        *.md
        package.json
        package-lock.json
        cloudflare.config.ts
        wrangler.config.ts
        start-uk.ps1
        quotes.csv
        en0.png
        en1.png
        ```
    *   **消除變數遮蔽**：將 4 處與全域 `t(key)` 衝突的局部變數 `t` 重命名為 `tpl` 或 `clipText`，並移除 `pasteTextFlow` 中多餘的 `close` 參數：
        ```javascript
        // 1. index.html:L1966-L1970 (refreshPromptUI) & L3592-L3597 (refreshConvPromptSel)
        (s.promptTemplates || []).forEach(tpl => {
          const o = document.createElement('option');
          o.value = tpl.id;
          o.textContent = tpl.name || t('set.tplUnnamed');
          sel.appendChild(o);
        });

        // 2. index.html:L2386-L2388 (importSettingsFile)
        obj.promptTemplates.forEach(tpl => {
          if (!tpl || typeof tpl.id !== 'string' || typeof tpl.name !== 'string' || typeof tpl.content !== 'string') {
            throw new Error(t('set.importBadTplItem'));
          }
        });

        // 3. index.html:L3089-L3097 (pasteTextFlow)
        function pasteTextFlow() {
          if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(clipText => {
              clipText = (clipText || '').trim();
              if (!clipText) { alertDlg(t('set.clipEmpty')); return; }
              finishPaste(clipText);
            }).catch(() => alertDlg(t('set.clipDenied')));
          } else alertDlg(t('set.clipNoSupport'));
        }
        ```
3.  **驗證與邊界測試標準**：
    *   清空系統剪貼簿後點擊「從剪貼簿同步」，驗證精確彈出「`剪貼簿為空，請先複製同步碼`」，不再誤報權限拒絕。
    *   將任一提示詞範本的 `name` 設為 `""` 後呼叫 `refreshPromptUI()`，驗證下拉選單正常顯示「`未命名`」且不拋出 `TypeError`。

---

#### 任務 2：建立全局音訊互斥鎖（Audio Mutex）與離線／弱網快速降級防線
1.  **目標檔案與函數**：
    *   `index.html:createPlayer`（`L4007-L4052`）、`index.html:genRefAudio`（`L4531-L4560`）、`index.html:startRecording`（`L4745-L4772`）
    *   `index.html:geminiTtsBlob`（`L4224-L4335`）、`index.html:ttsBlob`（`L4371-L4398`）、`index.html:ttsCached`（`L4457-L4498`）
    *   `uk_engine.js:stopCurrentUkAudio`（`L1714-L1726`）、`uk_engine.js:playUkVoice`（`L1728-L1779`）
2.  **極簡重構方案（含刪除冗餘代碼）**：
    *   **刪除 `ttsFindByTextOtherLocale`（`index.html:L4424-L4446` 及 `L4468-L4470`）**：直接砍掉這段會把德語／美語快取當成英音播放的 25 行遺留代碼。
    *   **全局音訊互斥 `window.stopAllAudioPlayback()`**：
        *   在 `createPlayer` 返回物件中新增 `pause() { audio.pause(); }`。
        *   定義 `window.stopAllAudioPlayback = function() { refGenSeq++; refPlayer.pause(); myPlayer.pause(); if (typeof stopCurrentUkAudio === 'function') stopCurrentUkAudio(); if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} } };`。
        *   在 `startRecording()` 開頭立即呼叫 `window.stopAllAudioPlayback()`；且在 `genRefAudio()` 取得音訊後檢查 `const canAutoPlay = autoplay !== false && !recSession && !recBusy;`，**嚴禁在錄音進行中自動播放原聲**！
        *   在 `stopCurrentUkAudio()` 中同步加上 `if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }`。
    *   **離線短路與超時收斂**：
        *   在 `canUseCloudTts(s)`（`index.html:L4119`）或 `genRefAudio` / `playUkVoice` / `ttsBlob` 入口檢查 `if (!navigator.onLine)`：若處於離線狀態且本地 IndexedDB 快取未命中，`ttsBlob` **立即拋出離線錯誤（0 秒等待）**，讓 `genRefAudio` 與 `playUkVoice` 瞬間切換至瀏覽器離線 `speechSynthesis`（`en-GB`）。
        *   在 `geminiTtsBlob` 中將 Step 1 與 Step 2 超時由 10,000ms 收斂至 **6,000ms**，且當 Step 1 發生網路／超時異常（`catch (e1)`）時同步將 `geminiInteractionsSupported = false`，避免弱網下每次都連撞兩次超時。
3.  **驗證與邊界測試標準**：
    *   點擊閃卡「智能發音自測」後在 0.2 秒內立即按下「開始錄音」，驗證 AI 示範音立即靜音，且在途合成完成的原聲不會在錄音期間播放。
    *   開啟瀏覽器 DevTools `Offline` 模式點擊未快取句子的「🔊 朗讀」，驗證在 `< 100ms` 內立即由系統離線英音讀出，零等待。

---

#### 任務 3：修復音素口型圖 `/θ/` 誤導、跟讀特訓長句截斷與晉級任務閉環
1.  **目標檔案與函數**：
    *   `uk_engine.js:showPhoneticModal`（`L240-L296`）、`uk_engine.js:renderActiveReviewCard`（`L659-L670`）、`uk_engine.js:initUkSuite`（`L1653-L1665`）
    *   `uk_engine.js:renderReadingStudio`（`L1280-L1287`）、`uk_engine.js:drillShadowSentence`（`L1550-L1557`）
    *   `index.html:renderResult`（`L5002-L5098`）、`index.html:restoreRecord`（`L5231-L5260`）
    *   `uk_engine.js:analyzeReadingText`（`L1216-L1240`）、`uk_engine.js:renderStagesDashboard`（`L1425-L1491`）
2.  **極簡重構方案**：
    *   **精準匹配 7 大特訓音素（拒絕張冠李戴）**：
        *   在 `uk_engine.js` 新增輔助函式 `resolvePhoneticGuideKey(sym)`，僅在音素明確屬於 `θ`, `ð`, `v`/`w`, `l`/`ɫ`/`l_dark`, `iː`/`ɪ`, `ɒ`/`ɔː`, `ʔ` 時返回對應 key，否則返回 `null`。
        *   在 `index.html:L5034-L5036` 的 `renderResult` 中，僅當 `resolvePhoneticGuideKey(pc)` 非空時才加上 `data-sym` 與 `title="點擊查看口型圖解"`；若用戶在 `showPhoneticModal` 傳入未支援音素，則回退至 `renderPhoneticSvg('')` 通用口型圖並動態顯示該音素符號，絕不冒充 `/θ/`！
        *   在 `renderActiveReviewCard`（`uk_engine.js:L659-L670`）中，修正啟發式檢測：若含 `\b(the|this|that|these|those|there|their|they|them|then|than|though|brother|mother|father|weather|other|with)\b` 則提示濁音 `/ð/`；其餘含 `th` 單詞才提示 `/θ/`；含詞尾或子音前 `l`（`/[aeiou]l(?:[^aeiou]|$)/i`）才提示 Dark L `[ɫ]`。
        *   在 `phModalPracticeBtn`（`uk_engine.js:L1658`）中，改用 `info.sampleVoiceText`（標準英語完整示範詞句，如 `'a bottle of water, not that important, get out'`）取代含音標簡寫的 `info.sampleWord`。
    *   **統一跟讀跳轉入口**：在 `uk_engine.js:L1280`、`L1550`、`L1656` 三處跟讀跳轉中，統一先呼叫 `switchTab('practice')`，再呼叫 `selectSentence(text, true)`（自動完成賦值、`autoGrowTextarea`、`refreshSentenceBlur`、`genRefAudio` 與平滑捲動至 `#sentenceCard`）。
    *   **封堵歷史紀錄刷分與精讀假通關**：
        *   在 `restoreRecord`（`index.html:L5237`）呼叫 `renderResult(paLikeFromRec(rec), rec.recognizedText || '', true)` 傳入第 3 參數 `true`（代表僅還原視圖、非新評測），再於第 5259 行自行捲動至 `#recordCard`。
        *   將 `analyzeReadingText`（`uk_engine.js:L1238-L1239`）中的 `addProgressionXp(20)` 與 `markDailyQuest('reading')` 移至用戶實際點擊精讀句子的「🔊 朗讀」或「🎙️ 跟讀特訓」時觸發（每篇文章限領一次）。
        *   在 `renderStagesDashboard()`（`uk_engine.js:L1489`）中，將 `stageObj.missions`（`uk_stages.json` 中的 15 個英國生存任務）渲染為可點擊的任務列表，點擊任務自動切換至對應的英國情境角色扮演並填入開場白！
3.  **驗證與邊界測試標準**：
    *   點擊歷史練習紀錄 10 次，驗證 XP 與每日任務狀態維持不變，不會重複加分。
    *   在「長文精讀」點擊任一超過 30 詞的長句「🎙️ 跟讀特訓」，驗證切換至實戰頁後文本框自動撐開顯示完整 4 行文字，並精準捲動至跟讀卡。

---

#### 任務 4：修復英文介面 Prompt 自相矛盾與進度備份匯入防呆
1.  **目標檔案與函數**：
    *   `index.html:buildDefaultPrompt`（`L845-L860`）、`buildCustomsPrompt`（`L890-L903`）、`buildUKCouncilPrompt`（`L955-L967`）、`buildUKTenancyPrompt`（`L983-L995`）、`buildUKBanterPrompt`（`L1011-L1023`）
    *   `uk_engine.js:importReviewsJson`（`L962-L1012`）、`uk_engine.js:initUkSuite`（`L1672-L1680`）
2.  **極簡重構方案**：
    *   在 `buildDefaultPrompt` 與 `buildCustomsPrompt` 中，當 `uiLang === 'en'` 且學習語言為英語（`learnLang.startsWith('en')`）時，將 `"Don't write English outside quote lines."` 替換為 `"Keep all coaching explanations and tips strictly inside the final '>' quote line."`；在 `buildUKCouncilPrompt`、`buildUKTenancyPrompt`、`buildUKBanterPrompt` 的 `uiLang === 'en'` 分支中，將 `"Don't write English outside quote lines."` 修正為 `"Keep meta-commentary and vocabulary explanations strictly inside the final '>' quote line."`。
    *   在 `importReviewsJson(file)` 中：
        1. 在 `importBackupFileInput.onchange` 中補上 `e.target.value = '';`。
        2. 解析 JSON 後先檢查 `const hasReviews = Array.isArray(data && data.reviews); const hasProg = !!(data && data.progression && typeof data.progression === 'object'); if (!hasReviews && !hasProg) { alertDlg('匯入失敗：此檔案不包含有效的語塊或進度備份資料'); return; }`。
        3. 在覆寫前呼叫 `if (!await confirmDlg('匯入將覆蓋目前的語塊重溫本與通關進度，確定要繼續嗎？', '確定還原')) return;`。
3.  **驗證與邊界測試標準**：
    *   切換介面語言為 `English` 並檢視 7 個內建範本內容，驗證不再出現 `"Don't write English outside quote lines"`。
    *   在「我的英式在地語塊本」匯入一份設定檔 `sprechmate-uk-settings.json`，驗證系統攔截並提示檔案格式不符，既有閃卡零損毀。

---

### 五、 未來戰略演進藍圖 (Phase 4：Future Evolution Directions)

在完成 Phase 1~3 地基加固後，基於專案現有的 **Web Audio 16kHz PCM 解碼管線**、**音素級 NBest 混淆矩陣數據**、**SM-2 演算法** 與 **零依賴靜態 PWA 架構**，規劃以下 4 個具備極高投資報酬率（20% 開發與維護成本撬動 80% 核心用戶價值）的戰略升級方向：

---

#### 方向 1：基於 NBestPhonemes 混淆矩陣的「個人化發音弱點雷達與 AI 靶向造句閉環」
*   **類型**：自動化與智能賦能 / 產品價值延伸
*   **現有代碼切入點**：
    *   `index.html:L4944-L4954`、`index.html:L4993-L5000`（`assessPcm` 與 `phonemeHeard` 已從 Azure 提取每個音素的 `AccuracyScore` 與 `NBestPhonemes` 實際聽感音素，並由 `simplifyWords` 持久化於 `conv.records[].words[].phonemes` 中）
    *   `index.html:L3806-L3807`（`sendChatCore` 組裝 `apiMsgs` 的 `system` 提示詞入口）
    *   `uk_engine.js:L3-L93`（`PHONETIC_GUIDE` 港人音素盲點知識庫）
*   **核心價值與體驗躍升**：
    目前每次錄音的音素錯誤明細（例如把 `/θ/` 讀成 `/f/`、把 `/v/` 讀成 `/w/`、把 `/ɪ/` 讀成 `/iː/`）都已經存在 `conv.records` 裡，但評完分就被封存，未能轉化為後續教學行動。只需聚合用戶最近 20 次練習紀錄中的音素混淆對（Phoneme Confusion Matrix），就能：
    1. 在「🎯 晉級通關」頁動態高亮「**你的專屬 Top 3 發音痛點**」（取代目前人人相同的靜態按鈕）；
    2. 在 AI 角色扮演對話時，自動在 System Prompt 尾部注入 1 行隱式指令（如：`[Phonetic Target]: Naturally weave 1-2 everyday UK words containing /θ/ vs /f/ (e.g. three/free, thirst/first) into your reply`），讓 AI 陪練在不知不覺中針對用戶最弱的音素餵招！
*   **極簡實現路徑**：
    零外部依賴、零新存儲表，直接掃描現有 `getConvs()` 中最近 20 筆 `records` 的 `words[].phonemes`（耗時 `< 1ms`），統計 `s < 75 && h && h !== p` 的頻次，透過 30 行純函式注入 `sendChatCore` 與 `renderStagesDashboard`。
*   **啟動觸發條件 (When to Build)**：
    當 Phase 1 的音素口型圖匹配修復完成，且活躍用戶平均累積練習紀錄達 **15 條以上** 時啟動。

---

#### 方向 2：基於現成 PCM 陣列的「原聲 vs 我的錄音」雙軌語調包絡與節奏對齊視圖（Prosody & Rhythm Mirror）
*   **類型**：產品價值延伸
*   **現有代碼切入點**：
    *   `index.html:L4861-L4884`（`decodeToPcm16k(blob)` 已將音訊解碼為標準 16kHz 單聲道 `Int16Array` PCM 採樣）
    *   `index.html:L4544`（`lastRefBlob` 已在記憶體中持有當前句子的標準英音原聲 `Blob`）
    *   `index.html:L4974-L4975`（Azure 對 `en-GB` 不返回 `ProsodyScore` 韻律分，僅對 `en-US` 返回）
*   **核心價值與體驗躍升**：
    香港母語者講英文容易帶有「字字頓讀（Syllable-timed）」的廣東話節奏，而地道英音（RP / SSBE）的核心靈魂是「重音等時節奏（Stress-timed）與降調起伏」。然而微軟 Azure Speech 對 `en-GB` 並不提供韻律評分（`hasProsody` 在 `en-GB` 下恆為 `false`）。透過直接複用 `lastRefBlob` 與用戶錄音 `pcm16`，用原生 `<canvas>` 繪製上下鏡像的 **60 格能量包絡線（RMS Envelope）+ 單詞時間軸對齊條（Word Offset/Duration Bars，直接取自 `index.html:L4958` 已解析卻未使用的 `w.Offset` 與 `w.Duration`）**，用戶能一眼看出自己哪個虛詞（`to`, `for`, `of`）唸得太重、哪個重讀實詞長度不夠，徹底填補 `en-GB` 缺乏韻律視覺回饋的空白！
*   **極簡實現路徑**：
    無需引入任何第三方波形庫（如 WaveSurfer.js），僅用約 45 行原生 Canvas 2D 代碼將 `lastRefBlob` 與 `pcm16` 去除首尾靜音後歸一化為 60 個柱狀包絡，並疊加 `w.Offset / w.Duration` 標記，嵌入 `#resultCard` 頂部。
*   **啟動觸發條件 (When to Build)**：
    當用戶單詞準確度（`AccuracyScore`）普遍突破 **80 分**，開始追求英式連讀弱讀節奏感（Connected Speech Rhythm）時啟動。

---

#### 方向 3：長文精讀「通勤電台連播 + 留白影子跟讀流（Tube Shadowing Radio）」與離線批次預熱
*   **類型**：產品價值延伸 / 自動化與智能賦能
*   **現有代碼切入點**：
    *   `uk_engine.js:L1227-L1303`（`currentReadingSentences` 切句陣列與 `renderReadingStudio`）
    *   `index.html:L4457-L4498`（`ttsCached` IndexedDB 語音快取）
    *   `uk_engine.js:L1728-L1779`（`playUkVoice` 雙軌播放器）
*   **核心價值與體驗躍升**：
    目前用戶在進地鐵前若想在車上練習一篇 12 句的 BBC 新聞或 NHS 指南，必須在有網路時手動把 12 個句子的「🔊 朗讀」逐一點開一遍才能快取到本地；閱讀時也必須每讀完一句手動伸手點下一句。只需在精讀工作坊頂部新增兩個高槓桿按鈕：
    1. **「⚡ 一鍵離線預熱全文」**：背景依序靜默呼叫 `ttsCached(sent)` 將整篇文章的雲端高音質原聲寫入 IndexedDB，進地鐵後 100% 享受真人級 Gemini/Azure 原聲而非系統機械音；
    2. **「🎧 影子跟讀連播（每句留白 1.2x 時長）」**：播完第 $i$ 句後自動高亮並留白對應秒數供用戶小聲跟讀，隨後自動接續播放第 $i+1$ 句。
*   **極簡實現路徑**：
    在 `#readingStudioCard`（`index.html:L470`）新增兩個按鈕，於 `uk_engine.js` 用一個 40 行的非同步迴圈串接 `ttsCached` 與 `playUkVoice` 完成回調，零新依賴。
*   **啟動觸發條件 (When to Build)**：
    當 Phase 1 的音訊互斥鎖完成，且用戶使用長文精讀的單篇句子數常態超過 **8 句** 時啟動。

---

#### 方向 4：Zero-Build 架構下的「對話分片存儲（Per-Conversation IDB Store）」與靜態語料抽離
*   **類型**：架構擴展演進
*   **現有代碼切入點**：
    *   `index.html:L2212-L2261`（`initConvsStore`、`saveConvs`、`persistConv`）
    *   `index.html:L5102-L5122`（`idbOpen` IndexedDB schema 升級入口）
    *   `uk_engine.js:L3-L93`（`PHONETIC_GUIDE`）、`uk_engine.js:L1019-L1078`（`UK_GLOSSARY`）、`index.html:L845-L1074`（Prompt 範本群）
*   **核心價值與體驗躍升**：
    1. **O(1) 對話寫入效能**：將目前所有對話塞在單一 `'audios'` 表 `'json:convs'` 鍵下的 O(N) 全量序列化模式，平滑升級至 IndexedDB v3 獨立的 `'convs'` Object Store（`keyPath: 'id'`）。此後 `persistConv(c)` 每次僅寫入當前變動的 **1 個對話物件**（資料量從數十 MB 降至數 KB），徹底消滅重度用戶的 I/O 卡頓，同時讓真實代碼與 `AGENT_CONTEXT.md:L51` 的架構設計完全一致。
    2. **主邏輯與語料庫解耦**：在不引入任何打包工具（保持 100% Vanilla JS Zero-Build）的前提下，將持續膨脹的純靜態字典（`UK_GLOSSARY`、`PHONETIC_GUIDE`、內建 Prompt 文本）抽離為獨立的 `uk_corpus.js`，使 `index.html` 與 `uk_engine.js` 純粹聚焦於狀態機與 UI 邏輯。
*   **極簡實現路徑**：
    將 `indexedDB.open('deutsch-audio', 3)` 升級為 version `3`，在 `onupgradeneeded` 建立 `'convs'` store；`initConvsStore()` 首次檢測到舊 `'json:convs'` 時自動批次寫入 `'convs'` store 並刪除舊鍵，耗時僅 30 行代碼。
*   **啟動觸發條件 (When to Build)**：
    當用戶平均留存對話數超過 **50 個**（或 `'json:convs'` 單鍵體積突破 **1 MB**），以及 `UK_GLOSSARY` 詞條擴充超過 **200 條** 時正式啟動。
