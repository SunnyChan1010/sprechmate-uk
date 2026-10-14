/* ================= 英國在地化：純向量口型與舌位圖解 (SVG Articulatory Anatomy) ================= */

const PHONETIC_GUIDE = {
  'θ': {
    title: '咬舌尖清擦音 /θ/',
    badge: '/θ/',
    sampleWord: 'think, through, bath',
    sampleVoiceText: 'think through bath three thirty',
    cantonesePitfall: '⚠️ 港人常見盲點：切勿讀成 "fink" 或 "sink"！廣東話冇咬舌音，很多人習慣用 /f/ 或 /s/ 代替。',
    tips: [
      '將舌尖輕輕伸出上下門牙之間，或舌尖輕觸上門牙背緣。',
      '牙齒放鬆，留一條微細縫隙，切忌用力咬死舌頭。',
      '聲帶【不要震動】（摸著喉嚨應無發聲麻痺感），氣流輕輕摩擦呼出。'
    ],
    examples: ['think', 'three', 'through', 'theatre', 'bath', 'path']
  },
  'ð': {
    title: '咬舌尖濁擦音 /ð/',
    badge: '/ð/',
    sampleWord: 'this, that, brother',
    sampleVoiceText: 'this that brother weather father',
    cantonesePitfall: '⚠️ 港人常見盲點：常被誤讀成 /d/ (如 "dis", "dat") 或 /l/。',
    tips: [
      '舌位與 /θ/ 完全相同（舌尖輕抵上下齒間）。',
      '在氣流擠出的同時，【聲帶強烈震動】（摸喉嚨會有明顯發聲麻痺震顫）。'
    ],
    examples: ['this', 'that', 'there', 'brother', 'mother', 'weather']
  },
  'v': {
    title: '唇齒濁擦音 /v/ (vs /w/)',
    badge: '/v/',
    sampleWord: 'very, village, voice',
    sampleVoiceText: 'very variable village voice advice',
    cantonesePitfall: '⚠️ 港人常見盲點：廣東話缺乏 /v/，極常誤讀成雙唇圓撮的 /w/（如 very 變 wary，vet 變 wet）。',
    tips: [
      '上門牙輕輕貼在【下唇內側濕潤邊緣】。',
      '聲帶震動發聲，氣流從唇齒縫隙摩擦呼出，下唇能感覺到發麻。',
      '切勿雙唇撮成圓形 O 型（那是 /w/ 音）。'
    ],
    examples: ['very', 'village', 'view', 'travel', 'advice', 'voice']
  },
  'l_dark': {
    title: '英式 Dark L [ɫ] (舌根軟顎化)',
    badge: '[ɫ]',
    sampleWord: 'milk, hotel, people',
    sampleVoiceText: 'milk hotel bottle people little',
    cantonesePitfall: '⚠️ 港人常見盲點：詞尾 L 常讀成 /o/ 或 /w/（例如 milk 讀成 "miu-k"，hotel 讀成 "hotew"），令英式發音失去厚重感。',
    tips: [
      '【動作一】：舌尖抵住上門牙後的牙肉（上齒齦）。',
      '【動作二（關鍵）】：同時舌根用力向後上方弓起靠近軟顎（如吞口水時喉嚨緊縮感）。',
      '氣流從舌頭兩側擦過，在口腔後部形成渾厚低沉的共鳴。'
    ],
    examples: ['milk', 'hotel', 'little', 'people', 'call', 'fail']
  },
  'iː': {
    title: '長短元音對比 /iː/ vs /ɪ/',
    badge: '/iː/ vs /ɪ/',
    sampleWord: 'sheet vs shit, seat vs sit',
    sampleVoiceText: 'sheet and shit, seat and sit, leave and live',
    cantonesePitfall: '⚠️ 嚴重社交尷尬避坑：sheet (床單) 與 shit、beach (海灘) 與 bitch，因長短元音不分極易引致誤會！',
    tips: [
      '【/iː/ 長元音】：嘴角向兩邊拉開呈誇張「微笑狀」，舌面肌肉繃緊貼近上顎，音長拉長。',
      '【/ɪ/ 短元音】：下巴微垂，面部放鬆，舌位偏低偏後，腹部短促發聲，短促乾脆。'
    ],
    examples: ['sheet/shit', 'beach/bitch', 'seat/sit', 'leave/live', 'sheep/ship']
  },
  'ɒ': {
    title: 'RP 標準英音短 o /ɒ/',
    badge: '/ɒ/',
    sampleWord: 'hot, coffee, cost, lot',
    sampleVoiceText: 'hot coffee cost doctor holiday bottle',
    cantonesePitfall: '⚠️ 英美音關鍵辨析：美音會把 hot, cost 口型大開讀成不圓唇長音 /ɑː/；英音必須保持圓唇、口型較小、短促發音。',
    tips: [
      '雙唇微撮成小圓形，下頜微垂。',
      '舌身平放壓低，舌後部微向咽壁靠攏。',
      '短促有力，絕不拖長。'
    ],
    examples: ['hot', 'cost', 'coffee', 'doctor', 'holiday', 'bottle']
  },
  'ʔ': {
    title: '英音倫敦腔喉塞音 /ʔ/ (Glottal Stop)',
    badge: '/ʔ/',
    sampleWord: 'wa\'er, bo\'le, bu\'er',
    sampleVoiceText: 'a bottle of water, not that important, get out',
    cantonesePitfall: '⚠️ 英國在地日常辨識：在倫敦及英格蘭東南部日常口語中，/t/ 經常由聲帶緊閉截斷代替，初來英國會聽不懂。',
    tips: [
      '舌尖【完全不需要】抬起觸碰牙齦！',
      '在喉嚨聲帶處瞬間閉氣（就像咳嗽前一剎那或腹部被重擊時短暫窒息的感覺）。',
      '在停頓瞬間截斷氣流，然後立即進入下一個音。'
    ],
    examples: ['bottle -> bo\'le', 'water -> wa\'er', 'not quite', 'get out', 'butter']
  }
};

function renderPhoneticSvg(sym) {
  sym = (sym || '').toLowerCase().replace(/[\/\[\]]/g, '');
  
  const baseHead = `
    <defs>
      <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#0284c7"/>
      </marker>
      <marker id="arr-back" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#7c3aed"/>
      </marker>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#ea580c" flood-opacity="0.5"/>
      </filter>
    </defs>
    <!-- Palate & Upper Jaw -->
    <path d="M 120 70 Q 150 68 180 75 Q 215 85 240 120" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
    <text x="160" y="65" fill="#64748b" font-size="10" font-family="sans-serif">硬顎 (Palate)</text>
    <!-- Velum & Uvula (Soft Palate) -->
    <path d="M 240 120 Q 255 135 250 155" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <text x="250" y="115" fill="#94a3b8" font-size="10" font-family="sans-serif">軟顎</text>
    <!-- Upper Lip -->
    <path d="M 80 50 Q 100 52 115 75 Q 120 85 125 95" fill="none" stroke="#fda4af" stroke-width="4"/>
    <!-- Upper Incisor -->
    <rect x="122" y="92" width="10" height="22" rx="2" fill="#ffffff" stroke="#334155" stroke-width="2"/>
    <text x="110" y="88" fill="#475569" font-size="9" font-family="sans-serif">上齒</text>
    <!-- Lower Lip -->
    <path d="M 95 145 Q 112 145 120 135" fill="none" stroke="#fda4af" stroke-width="4"/>
    <!-- Lower Incisor -->
    <rect x="120" y="125" width="10" height="20" rx="2" fill="#ffffff" stroke="#334155" stroke-width="2"/>
    <text x="105" y="158" fill="#475569" font-size="9" font-family="sans-serif">下齒</text>
    <!-- Pharynx -->
    <path d="M 270 140 Q 275 180 270 215" fill="none" stroke="#cbd5e1" stroke-width="3"/>
  `;

  if (sym.includes('θ') || sym === 'th_voiceless') {
    return `<svg viewBox="0 0 320 220" class="ph-diagram" xmlns="http://www.w3.org/2000/svg">
      ${baseHead}
      <path d="M 115 116 Q 130 112 165 125 Q 210 140 235 185 L 210 195 Q 180 160 140 145 Z" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2.5"/>
      <circle cx="120" cy="117" r="12" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="3 2" filter="url(#glow)"/>
      <path d="M 180 110 Q 150 106 95 110" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="4 2" marker-end="url(#arr)"/>
      <line x1="264" y1="190" x2="264" y2="210" stroke="#94a3b8" stroke-width="3"/>
      <text x="200" y="210" fill="#64748b" font-size="10" font-family="sans-serif">聲帶平靜 (清音)</text>
      <rect x="10" y="168" width="135" height="34" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
      <text x="16" y="182" fill="#1d4ed8" font-size="11" font-weight="bold" font-family="sans-serif">舌尖微伸出上下齒間</text>
      <text x="16" y="195" fill="#2563eb" font-size="10" font-family="sans-serif">氣流輕摩擦，勿咬死</text>
    </svg>`;
  }

  if (sym.includes('ð') || sym === 'th_voiced') {
    return `<svg viewBox="0 0 320 220" class="ph-diagram" xmlns="http://www.w3.org/2000/svg">
      ${baseHead}
      <path d="M 115 116 Q 130 112 165 125 Q 210 140 235 185 L 210 195 Q 180 160 140 145 Z" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2.5"/>
      <circle cx="120" cy="117" r="12" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="3 2" filter="url(#glow)"/>
      <path d="M 180 110 Q 150 106 95 110" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="4 2" marker-end="url(#arr)"/>
      <path d="M 258 190 Q 262 195 258 200 Q 262 205 258 210" fill="none" stroke="#eab308" stroke-width="3"/>
      <path d="M 264 190 Q 268 195 264 200 Q 268 205 264 210" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <text x="180" y="210" fill="#d97706" font-size="10" font-weight="bold" font-family="sans-serif">聲帶強烈震動 (濁音)</text>
      <rect x="10" y="168" width="135" height="34" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
      <text x="16" y="182" fill="#b45309" font-size="11" font-weight="bold" font-family="sans-serif">舌位同 /θ/ 輕咬舌尖</text>
      <text x="16" y="195" fill="#d97706" font-size="10" font-family="sans-serif">聲帶震動，喉部感麻痺</text>
    </svg>`;
  }

  if (sym.includes('v') || sym === 'w') {
    return `<svg viewBox="0 0 320 220" class="ph-diagram" xmlns="http://www.w3.org/2000/svg">
      ${baseHead}
      <path d="M 135 130 Q 165 135 200 145 Q 225 160 235 185 L 210 195 Q 170 170 140 150 Z" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2.5"/>
      <circle cx="127" cy="118" r="14" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="3 2" filter="url(#glow)"/>
      <path d="M 150 120 Q 130 115 95 125" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="4 2" marker-end="url(#arr)"/>
      <path d="M 264 190 Q 268 195 264 200 Q 268 205 264 210" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <text x="200" y="210" fill="#d97706" font-size="10" font-weight="bold" font-family="sans-serif">聲帶發聲 (濁擦音)</text>
      <rect x="10" y="168" width="145" height="34" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
      <text x="16" y="182" fill="#1d4ed8" font-size="11" font-weight="bold" font-family="sans-serif">上門牙輕觸下唇內側</text>
      <text x="16" y="195" fill="#2563eb" font-size="10" font-family="sans-serif">切勿撮圓雙唇 (避免讀成 w)</text>
    </svg>`;
  }

  if (sym.includes('l_dark') || sym.includes('ɫ') || sym === 'l') {
    return `<svg viewBox="0 0 320 220" class="ph-diagram" xmlns="http://www.w3.org/2000/svg">
      ${baseHead}
      <path d="M 132 94 Q 145 92 155 125 Q 195 105 235 130 Q 240 160 235 185 L 210 195 Q 185 165 140 140 Z" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2.5"/>
      <circle cx="132" cy="94" r="8" fill="none" stroke="#ea580c" stroke-width="2" filter="url(#glow)"/>
      <text x="80" y="105" fill="#ea580c" font-size="10" font-weight="bold" font-family="sans-serif">① 舌尖頂上齒齦</text>
      <circle cx="230" cy="130" r="12" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="3 2"/>
      <path d="M 210 150 L 225 135" fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#arr-back)"/>
      <text x="160" y="160" fill="#7c3aed" font-size="10" font-weight="bold" font-family="sans-serif">② 舌根向後上方拱起</text>
      <path d="M 190 120 Q 160 125 105 135" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="4 2" marker-end="url(#arr)"/>
      <rect x="10" y="172" width="145" height="34" rx="6" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1"/>
      <text x="16" y="186" fill="#6d28d9" font-size="11" font-weight="bold" font-family="sans-serif">英式 Dark L 雙重動作</text>
      <text x="16" y="199" fill="#7c3aed" font-size="10" font-family="sans-serif">舌根弓起，勿讀成 /o/ 或 /w/</text>
    </svg>`;
  }

  if (sym.includes('iː') || sym.includes('ɪ') || sym === 'i') {
    return `<svg viewBox="0 0 320 220" class="ph-diagram" xmlns="http://www.w3.org/2000/svg">
      ${baseHead}
      <path d="M 130 115 Q 160 90 200 115 Q 225 150 235 185 L 210 195 Q 170 160 140 140 Z" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2.5"/>
      <text x="155" y="105" fill="#f43f5e" font-size="10" font-weight="bold" font-family="sans-serif">/iː/ 舌位高而緊</text>
      <path d="M 130 125 Q 160 110 200 125 Q 225 155 235 185" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3"/>
      <text x="155" y="135" fill="#64748b" font-size="10" font-family="sans-serif">/ɪ/ 舌位稍低且放鬆</text>
      <rect x="10" y="168" width="150" height="38" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
      <text x="16" y="182" fill="#1d4ed8" font-size="11" font-weight="bold" font-family="sans-serif">/iː/ 微笑拉長 (sheet)</text>
      <text x="16" y="197" fill="#2563eb" font-size="10" font-family="sans-serif">/ɪ/ 放鬆短促 (sit, ship)</text>
    </svg>`;
  }

  if (sym.includes('ɒ') || sym === 'o_short') {
    return `<svg viewBox="0 0 320 220" class="ph-diagram" xmlns="http://www.w3.org/2000/svg">
      ${baseHead}
      <path d="M 125 140 Q 160 145 205 130 Q 230 145 235 185 L 210 195 Q 170 175 135 160 Z" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2.5"/>
      <circle cx="210" cy="135" r="10" fill="none" stroke="#ea580c" stroke-width="2" filter="url(#glow)"/>
      <text x="155" y="125" fill="#ea580c" font-size="10" font-weight="bold" font-family="sans-serif">舌身平放壓低，後部收縮</text>
      <circle cx="105" cy="115" r="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
      <text x="75" y="135" fill="#2563eb" font-size="9" font-family="sans-serif">雙唇微撮圓</text>
      <rect x="10" y="168" width="145" height="34" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
      <text x="16" y="182" fill="#1d4ed8" font-size="11" font-weight="bold" font-family="sans-serif">標準英音短 o /ɒ/</text>
      <text x="16" y="195" fill="#2563eb" font-size="10" font-family="sans-serif">口型小而圓，乾脆不拖音</text>
    </svg>`;
  }

  if (sym.includes('ʔ') || sym === 'glottal_stop') {
    return `<svg viewBox="0 0 320 220" class="ph-diagram" xmlns="http://www.w3.org/2000/svg">
      ${baseHead}
      <path d="M 125 135 Q 160 135 200 140 Q 225 155 235 185 L 210 195 Q 170 170 135 155 Z" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2.5"/>
      <text x="110" y="115" fill="#64748b" font-size="10" font-family="sans-serif">舌尖不碰牙齒！</text>
      <circle cx="265" cy="200" r="16" fill="#fee2e2" stroke="#ef4444" stroke-width="2" filter="url(#glow)"/>
      <line x1="257" y1="192" x2="273" y2="208" stroke="#dc2626" stroke-width="3"/>
      <line x1="273" y1="192" x2="257" y2="208" stroke="#dc2626" stroke-width="3"/>
      <text x="175" y="195" fill="#dc2626" font-size="11" font-weight="bold" font-family="sans-serif">聲帶瞬間緊閉憋氣 🚫</text>
      <text x="180" y="210" fill="#991b1b" font-size="10" font-family="sans-serif">截斷氣流代替 /t/</text>
      <rect x="10" y="168" width="145" height="34" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1"/>
      <text x="16" y="182" fill="#b91c1c" font-size="11" font-weight="bold" font-family="sans-serif">英音倫敦腔 /ʔ/ 喉塞音</text>
      <text x="16" y="195" fill="#dc2626" font-size="10" font-family="sans-serif">喉嚨卡頓剎車 (wa'er, bo'le)</text>
    </svg>`;
  }

  return `<svg viewBox="0 0 320 220" class="ph-diagram" xmlns="http://www.w3.org/2000/svg">
    ${baseHead}
    <path d="M 125 130 Q 160 120 200 135 Q 225 155 235 185 L 210 195 Q 170 170 135 150 Z" fill="#ffe4e6" stroke="#f43f5e" stroke-width="2.5"/>
    <rect x="10" y="170" width="140" height="30" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
    <text x="16" y="188" fill="#1d4ed8" font-size="11" font-weight="bold" font-family="sans-serif">標準發音口型與舌位</text>
  </svg>`;
}

let activePhKey = 'θ';
function showPhoneticModal(symbol, word) {
  const modal = document.getElementById('phoneticModal');
  if (!modal) return;
  
  let key = 'θ';
  const s = (symbol || '').toLowerCase();
  if (s.includes('θ')) key = 'θ';
  else if (s.includes('ð')) key = 'ð';
  else if (s.includes('v') || s.includes('w')) key = 'v';
  else if (s.includes('l') || s.includes('ɫ')) key = 'l_dark';
  else if (s.includes('iː') || s.includes('ɪ')) key = 'iː';
  else if (s.includes('ɒ') || s.includes('ɔː')) key = 'ɒ';
  else if (s.includes('ʔ')) key = 'ʔ';
  activePhKey = key;

  const info = PHONETIC_GUIDE[key] || PHONETIC_GUIDE['θ'];
  document.getElementById('phModalTitle').textContent = info.title;
  document.getElementById('phModalBadge').textContent = info.badge;
  document.getElementById('phModalWord').textContent = word || info.sampleWord;
  document.getElementById('phDiagramSvgWrap').innerHTML = renderPhoneticSvg(key);

  const guideBox = document.getElementById('phGuidanceText');
  if (guideBox) {
    guideBox.innerHTML = '';
    const pitfall = document.createElement('p');
    pitfall.style.margin = '0 0 6px';
    const pitfallB = document.createElement('b');
    pitfallB.textContent = info.cantonesePitfall;
    pitfall.appendChild(pitfallB);
    guideBox.appendChild(pitfall);

    const ol = document.createElement('ol');
    ol.style.cssText = 'margin:0 0 0 18px;padding:0';
    info.tips.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      ol.appendChild(li);
    });
    guideBox.appendChild(ol);
  }

  const exWrap = document.getElementById('phModalExamples');
  if (exWrap) {
    exWrap.innerHTML = '';
    info.examples.forEach(ex => {
      const b = document.createElement('button');
      b.className = 'btn-sm';
      b.type = 'button';
      b.textContent = ex;
      b.onclick = () => { playUkVoice(ex); };
      exWrap.appendChild(b);
    });
  }

  modal.classList.remove('hidden');
}

function closePhoneticModal() {
  const modal = document.getElementById('phoneticModal');
  if (modal) modal.classList.add('hidden');
}

/* ================= 英國在地化：間隔重複重溫引擎 (SM-2 Spaced Repetition) ================= */

const LS_REVIEWS = 'uk_reviews_deck';
const LS_PROGRESSION = 'uk_progression_state';

const DEFAULT_UK_REVIEWS = [
  {
    id: 'rev_def_1',
    text: "Could you please give me a hand with the self-checkout?",
    translation: "可以請你幫我看一下這個自助結賬機嗎？",
    context: "Level 1 · 超市購物 (Approval needed 常用語)",
    type: "sentence",
    stage: 1,
    createdAt: Date.now(),
    dueDate: Date.now(),
    interval: 0, reps: 0, easeFactor: 2.5, lapses: 0, lastScore: null, history: []
  },
  {
    id: 'rev_def_2',
    text: "Can I have a bottle of water, please?",
    translation: "我可以要一瓶水嗎？",
    context: "Connected Speech · 喉塞音 /ʔ/ 特訓 (bottle -> bo'le)",
    type: "drill",
    stage: 1,
    createdAt: Date.now(),
    dueDate: Date.now(),
    interval: 0, reps: 0, easeFactor: 2.5, lapses: 0, lastScore: null, history: []
  },
  {
    id: 'rev_def_3',
    text: "I'd like to book an appointment with a GP for a telephone triage.",
    translation: "我想預約 GP 全科家庭醫生的電話分診評估。",
    context: "Level 2 · 英國醫療 NHS 預約看診",
    type: "sentence",
    stage: 2,
    createdAt: Date.now(),
    dueDate: Date.now(),
    interval: 0, reps: 0, easeFactor: 2.5, lapses: 0, lastScore: null, history: []
  },
  {
    id: 'rev_def_4',
    text: "The combi-boiler has stopped working and there is no heating or hot water.",
    translation: "組合鍋爐停止運轉了，屋內既沒有暖氣也沒有熱水。",
    context: "Level 3 · 租屋維修催辦 (Section 11 房東法定責任)",
    type: "sentence",
    stage: 3,
    createdAt: Date.now(),
    dueDate: Date.now(),
    interval: 0, reps: 0, easeFactor: 2.5, lapses: 0, lastScore: null, history: []
  },
  {
    id: 'rev_def_5',
    text: "There are four eggs in the fridge.",
    translation: "雪櫃裏有四隻雞蛋。",
    context: "Connected Speech · 連讀 r 特訓 (there-r-are, four-r-eggs)",
    type: "drill",
    stage: 1,
    createdAt: Date.now(),
    dueDate: Date.now(),
    interval: 0, reps: 0, easeFactor: 2.5, lapses: 0, lastScore: null, history: []
  }
];

let reviewsCache = [];
let activeReviewItem = null;
let reviewAutoTimer = null;

async function idbReviewGetAll() {
  try {
    const db = await idb();
    if (!db.objectStoreNames.contains('reviews')) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('reviews', 'readonly');
        const req = tx.objectStore('reviews').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
  } catch (e) { return null; }
}

async function idbReviewPut(item) {
  try {
    const db = await idb();
    if (!db.objectStoreNames.contains('reviews')) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('reviews', 'readwrite');
        tx.objectStore('reviews').put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) { resolve(); }
    });
  } catch (e) {}
}

async function idbReviewsSyncBatch(items, clearFirst = false) {
  try {
    const db = await idb();
    if (!db.objectStoreNames.contains('reviews')) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');
        if (clearFirst) store.clear();
        (items || []).forEach(item => store.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) { resolve(); }
    });
  } catch (e) {}
}

async function idbReviewDel(id) {
  try {
    const db = await idb();
    if (!db.objectStoreNames.contains('reviews')) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('reviews', 'readwrite');
        tx.objectStore('reviews').delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) { resolve(); }
    });
  } catch (e) {}
}

async function initReviewsStore() {
  let loaded = await idbReviewGetAll();
  if (!loaded || !loaded.length) {
    try {
      const raw = localStorage.getItem(LS_REVIEWS);
      if (raw) loaded = JSON.parse(raw);
    } catch (e) {}
  }
  if (!loaded || !loaded.length) {
    loaded = JSON.parse(JSON.stringify(DEFAULT_UK_REVIEWS));
  }
  reviewsCache = loaded || [];
  persistReviewsCache();
}

function persistReviewsCache(clearFirst = false) {
  try {
    localStorage.setItem(LS_REVIEWS, JSON.stringify(reviewsCache));
  } catch (e) {}
  idbReviewsSyncBatch(reviewsCache, clearFirst).catch(() => {});
  updateDueBadge();
}

async function addReviewItem({ text, translation, context, type, stage, score }) {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();
  let existing = reviewsCache.find(r => r.text.toLowerCase() === cleanText.toLowerCase());
  if (existing) {
    existing.dueDate = Date.now();
    if (score) existing.lastScore = score;
    persistReviewsCache();
    renderReviewStudio();
    return existing;
  }
  const newItem = {
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    text: cleanText,
    translation: translation || '',
    context: context || '自主標記語塊',
    type: type || 'sentence',
    stage: stage || 1,
    createdAt: Date.now(),
    dueDate: Date.now(),
    interval: 0,
    reps: 0,
    easeFactor: 2.5,
    lapses: 0,
    lastScore: score || null,
    history: []
  };
  reviewsCache.unshift(newItem);
  persistReviewsCache();
  renderReviewStudio();
  return newItem;
}

function deleteReviewItem(id) {
  reviewsCache = reviewsCache.filter(r => r.id !== id);
  idbReviewDel(id).catch(() => {});
  persistReviewsCache();
  renderReviewStudio();
}

function getDueReviews() {
  const now = Date.now();
  const gracePeriod = 4 * 3600 * 1000;
  return reviewsCache.filter(r => (r.dueDate || 0) <= (now + gracePeriod));
}

function calcNextReview(item, rating) {
  let reps = item.reps || 0;
  let interval = item.interval || 0;
  let easeFactor = item.easeFactor || 2.5;
  let lapses = item.lapses || 0;

  if (rating === 1) {
    reps = 0;
    interval = 1;
    lapses += 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === 2) {
    reps = Math.max(1, reps);
    interval = interval === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 3) {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * easeFactor);
  } else if (rating === 4) {
    reps += 1;
    if (reps === 1) interval = 4;
    else if (reps === 2) interval = 7;
    else interval = Math.round(interval * easeFactor * 1.3);
    easeFactor = easeFactor + 0.15;
  }

  const dueDate = Date.now() + interval * 86400 * 1000;
  return {
    ...item,
    reps,
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    lapses,
    dueDate,
    lastReviewed: Date.now()
  };
}

function updateDueBadge() {
  const dues = getDueReviews();
  const badge = document.getElementById('dueBadge');
  const countLabel = document.getElementById('dueCountLabel');
  if (badge) {
    badge.textContent = dues.length;
    if (dues.length > 0) badge.classList.remove('hidden');
    else badge.classList.add('hidden');
  }
  if (countLabel) countLabel.textContent = dues.length;

  const mastered = reviewsCache.filter(r => (r.reps || 0) >= 3 && (r.interval || 0) >= 14).length;
  const masteredLabel = document.getElementById('masteredCountLabel');
  if (masteredLabel) masteredLabel.textContent = mastered;

  const totalLabel = document.getElementById('totalReviewCount');
  if (totalLabel) totalLabel.textContent = reviewsCache.length;

  const prog = getProgressionState();
  const streakLabel = document.getElementById('streakDaysLabel');
  if (streakLabel) streakLabel.textContent = prog.streakDays || 1;
}

function renderReviewStudio() {
  updateDueBadge();
  const dues = getDueReviews();
  const activeCard = document.getElementById('activeReviewCard');
  const emptyCard = document.getElementById('reviewEmptyCard');

  if (!dues.length) {
    if (activeCard) activeCard.classList.add('hidden');
    if (emptyCard) emptyCard.classList.remove('hidden');
    renderPhrasebookList();
    return;
  }

  if (emptyCard) emptyCard.classList.add('hidden');
  if (activeCard) activeCard.classList.remove('hidden');

  activeReviewItem = dues[0];
  renderActiveReviewCard(activeReviewItem);
  renderPhrasebookList();
}

function renderActiveReviewCard(item) {
  const container = document.getElementById('reviewCardContent');
  if (!container || !item) return;

  if (reviewAutoTimer) { clearTimeout(reviewAutoTimer); reviewAutoTimer = null; }

  const isOffline = !navigator.onLine;
  const d1 = calcNextReview(item, 1).interval;
  const d2 = calcNextReview(item, 2).interval;
  const d3 = calcNextReview(item, 3).interval;
  const d4 = calcNextReview(item, 4).interval;

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span class="badge" style="background:#8b5cf6">Stage ${item.stage || 1} · ${esc(item.type || '語塊')}</span>
      <span class="mut" style="font-size:12px">${esc(item.context || '')}</span>
    </div>
    <div class="flashcard-box" id="flashcardBox">
      <div class="flashcard-text">${esc(item.text)}</div>
      <div class="flashcard-trans hidden" id="flashcardTrans">
        <p style="margin:0 0 6px;color:#334155;font-weight:500">${esc(item.translation || '（點擊查詞或自測查看釋義）')}</p>
        <div class="phoneme-buttons-wrap" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>
    </div>
    <div class="btn-row" style="margin-bottom:10px">
      <button class="primary" id="reviewHearBtn" type="button"><span class="ic-play"></span> 聽英式原聲</button>
      <button id="reviewFlipBtn" type="button">👁️ 翻轉查看釋義</button>
      <button id="reviewPracticeBtn" type="button">${isOffline ? '🚇 離線自評' : '🎙️ 智能發音自測'}</button>
    </div>
    <div id="reviewAssessmentResult" class="hidden" style="margin:8px 0;padding:10px;background:#fff;border-radius:10px;border:1px solid #e2e8f0"></div>
    <div class="smart-rating-row" id="smartRatingRow">
      <button class="rating-btn rec-bad" id="rateBtn1" type="button">🔴 忘記 (Again)<br><small>${d1}天</small></button>
      <button class="rating-btn rec-hard" id="rateBtn2" type="button">🟠 勉強 (Hard)<br><small>${d2}天</small></button>
      <button class="rating-btn rec-good" id="rateBtn3" type="button">🟢 良好 (Good)<br><small>${d3}天</small></button>
      <button class="rating-btn rec-master" id="rateBtn4" type="button">🔵 熟練 (Easy)<br><small>${d4}天</small></button>
    </div>
    <div id="reviewCountdownNotice" class="hint" style="text-align:center;margin-top:6px;height:18px"></div>
  `;

  // Safely inject phoneme buttons via DOM API to eliminate inline script injection
  const transBox = container.querySelector('#flashcardTrans');
  if (transBox) {
    const btnWrap = transBox.querySelector('.phoneme-buttons-wrap');
    if (btnWrap) {
      const trickyList = ['θ', 'ð', 'v', 'l', 'iː', 'ɒ', 'ʔ'];
      trickyList.forEach(ph => {
        if (item.text.toLowerCase().includes(ph) || (ph === 'θ' && item.text.toLowerCase().includes('th'))) {
          const btn = document.createElement('button');
          btn.className = 'btn-sm';
          btn.style.cssText = 'border-color:#c4b5fd;color:#7c3aed;margin-right:6px;margin-top:4px';
          btn.textContent = `👅 口型圖 /${ph}/`;
          btn.type = 'button';
          btn.onclick = () => showPhoneticModal(ph, item.text);
          btnWrap.appendChild(btn);
        }
      });
    }
  }

  document.getElementById('reviewHearBtn').onclick = () => playUkVoice(item.text);
  document.getElementById('reviewFlipBtn').onclick = () => {
    document.getElementById('flashcardTrans').classList.toggle('hidden');
  };
  document.getElementById('flashcardBox').onclick = () => {
    document.getElementById('flashcardTrans').classList.toggle('hidden');
  };

  document.getElementById('reviewPracticeBtn').onclick = () => startReviewVoiceAssessment(item);

  [1, 2, 3, 4].forEach(r => {
    const btn = document.getElementById('rateBtn' + r);
    if (btn) btn.onclick = () => applyReviewRating(item, r);
  });
}

async function startReviewVoiceAssessment(item) {
  if (!navigator.onLine) {
    const trans = document.getElementById('flashcardTrans');
    if (trans) trans.classList.remove('hidden');
    playUkVoice(item.text);
    return;
  }
  const stBox = document.getElementById('sentenceText');
  if (stBox) stBox.value = item.text;
  
  switchTab('practice');
  if (typeof genRefAudio === 'function') {
    genRefAudio(item.text, true).catch(() => {});
  }
}

function applyReviewRating(item, rating, score) {
  if (reviewAutoTimer) { clearTimeout(reviewAutoTimer); reviewAutoTimer = null; }

  const updated = calcNextReview(item, rating);
  if (score) updated.lastScore = score;
  updated.history = updated.history || [];
  updated.history.push({ t: Date.now(), r: rating, s: score || null });

  const idx = reviewsCache.findIndex(r => r.id === item.id);
  if (idx !== -1) {
    reviewsCache[idx] = updated;
  }
  persistReviewsCache();

  addProgressionXp(15, '完成語塊間隔重溫');
  markDailyQuest('review');

  renderReviewStudio();
}

function renderPhrasebookList() {
  const container = document.getElementById('phrasebookList');
  if (!container) return;
  if (!reviewsCache.length) {
    container.innerHTML = '<div class="hint">您的語塊本還是空的。精讀或對話時，點擊「加入重溫」即可收錄。</div>';
    return;
  }
  container.innerHTML = '';
  reviewsCache.slice(0, 50).forEach(item => {
    const isMaster = (item.reps || 0) >= 3;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #f1f5f9';

    const info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;padding-right:10px';
    const title = document.createElement('div');
    title.style.cssText = 'font-size:14px;font-weight:600;color:#1e293b';
    title.textContent = item.text;
    const desc = document.createElement('div');
    desc.style.cssText = 'font-size:12px;color:#64748b';
    desc.textContent = item.translation || item.context || '';
    info.appendChild(title);
    info.appendChild(desc);

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;align-items:center;gap:6px;flex:none';

    const badge = document.createElement('span');
    badge.style.cssText = isMaster ? 'font-size:11px;padding:2px 6px;border-radius:4px;background:#dcfce7;color:#15803d' : 'font-size:11px;padding:2px 6px;border-radius:4px;background:#f1f5f9;color:#64748b';
    badge.textContent = isMaster ? '已掌握' : '溫習中';

    const playBtn = document.createElement('button');
    playBtn.className = 'btn-sm';
    playBtn.textContent = '🔊';
    playBtn.type = 'button';
    playBtn.onclick = () => playUkVoice(item.text);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-sm danger';
    delBtn.style.padding = '2px 6px';
    delBtn.textContent = '✕';
    delBtn.type = 'button';
    delBtn.onclick = () => deleteReviewItem(item.id);

    actions.appendChild(badge);
    actions.appendChild(playBtn);
    actions.appendChild(delBtn);

    row.appendChild(info);
    row.appendChild(actions);
    container.appendChild(row);
  });
}

function exportToAnki() {
  if (!reviewsCache.length) { alertDlg('目前沒有語塊可匯出'); return; }
  let tsv = '#separator:tab\n#html:true\n#tags column:3\n';
  reviewsCache.forEach(r => {
    const front = esc(r.text);
    const back = esc(r.translation || '') + '<br><small>' + esc(r.context || '') + '</small>';
    const tags = `SprechMate UK_Stage_${r.stage || 1}`;
    tsv += `${front}\t${back}\t${tags}\n`;
  });
  const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SprechMate_UK_Anki_${new Date().toISOString().slice(0, 10)}.tsv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 1000);
}

function exportReviewsJson() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    reviews: reviewsCache,
    progression: getProgressionState()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SprechMate_UK_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 1000);
}

function importReviewsJson(file) {
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    alertDlg('檔案過大（超過 10MB），請確認是否為正確的進度備份檔案');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result, (k, v) =>
        (k === '__proto__' || k === 'constructor' || k === 'prototype') ? undefined : v
      );
      if (Array.isArray(data.reviews)) {
        reviewsCache = data.reviews.map(r => ({
          id: String(r.id || ('rev_' + Math.random().toString(36).substr(2, 6))),
          text: String(r.text || '').slice(0, 1000),
          translation: String(r.translation || '').slice(0, 1000),
          context: String(r.context || '').slice(0, 200),
          type: ['sentence', 'collocation', 'drill'].includes(r.type) ? r.type : 'sentence',
          stage: Number(r.stage) || 1,
          createdAt: Number(r.createdAt) || Date.now(),
          dueDate: Number(r.dueDate) || Date.now(),
          interval: Number(r.interval) || 0,
          reps: Number(r.reps) || 0,
          easeFactor: Math.min(3.5, Math.max(1.3, Number(r.easeFactor) || 2.5)),
          lapses: Number(r.lapses) || 0,
          lastScore: r.lastScore ? Number(r.lastScore) : null,
          history: Array.isArray(r.history) ? r.history.slice(-50) : []
        })).filter(r => r.text.length > 0);
        persistReviewsCache(true);
      }
      if (data.progression && typeof data.progression === 'object') {
        const p = data.progression;
        const sanitizedProg = {
          xp: Math.max(0, Number(p.xp) || 0),
          level: Math.min(4, Math.max(1, Number(p.level) || 1)),
          streakDays: Math.max(1, Number(p.streakDays) || 1),
          dailyDate: String(p.dailyDate || new Date().toISOString().slice(0, 10)),
          quests: p.quests || { review: false, reading: false, chat: false }
        };
        localStorage.setItem(LS_PROGRESSION, JSON.stringify(sanitizedProg));
      }
      renderReviewStudio();
      renderStagesDashboard();
      alertDlg('✅ 進度備份已安全驗證並成功還原！');
    } catch (err) {
      alertDlg('匯入失敗：JSON 格式無效或檔案已損毀');
    }
  };
  reader.readAsText(file);
}

/* ================= 英國在地化：長文沉浸精讀工作室 (Reading Studio) ================= */

let currentReadingSentences = [];
let ukReadingPresets = [];

async function loadReadingPresets() {
  try {
    const res = await fetch('uk_reading_presets.json');
    if (res.ok) ukReadingPresets = await res.json();
  } catch (e) {
    ukReadingPresets = [
      {
        id: 'gov_rent',
        title: '🏠 GOV.UK 官方租房指南 (Tenancy Checklist)',
        text: 'Before you move into a rented home in England, your landlord or letting agent must give you a copy of the How to Rent guide. You must also receive a valid gas safety certificate, an Energy Performance Certificate, and confirmation that your deposit is protected in a government-approved scheme within 30 days.'
      }
    ];
  }
}

function initReadingStudio() {
  loadReadingPresets().then(() => {
    const sel = document.getElementById('readingPresetSel');
    if (sel && ukReadingPresets.length) {
      sel.innerHTML = '<option value="">-- 點此載入精選語料 --</option>';
      ukReadingPresets.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.title;
        sel.appendChild(opt);
      });
      sel.onchange = () => {
        const item = ukReadingPresets.find(x => x.id === sel.value);
        if (item) {
          document.getElementById('readingInput').value = item.text;
          analyzeReadingText(item.text);
        }
      };
    }
  });

  const analyzeBtn = document.getElementById('analyzeReadingBtn');
  if (analyzeBtn) {
    analyzeBtn.onclick = () => {
      const text = document.getElementById('readingInput').value.trim();
      if (!text) { alertDlg('請先貼上或選擇英文文章段落'); return; }
      analyzeReadingText(text);
    };
  }

  const clearBtn = document.getElementById('clearReadingBtn');
  if (clearBtn) {
    clearBtn.onclick = () => {
      document.getElementById('readingInput').value = '';
      document.getElementById('readingStudioCard').classList.add('hidden');
    };
  }
}

function analyzeReadingText(rawText) {
  if (!rawText) return;
  if (rawText.length > 50000) {
    alertDlg('文章長度過長（超過 50,000 字元），已為您截取前 50,000 字元進行精讀，以確保系統流暢。');
    rawText = rawText.slice(0, 50000);
  }
  const DOT_PLACEHOLDER = '\u0000';
  const protectedText = rawText
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Rd|Ave|No|vs|etc|e\.g|i\.e|U\.K|U\.S|a\.m|p\.m)\./gi, (m) => m.replace(/\./g, DOT_PLACEHOLDER))
    .replace(/(\d)\.(\d)/g, `$1${DOT_PLACEHOLDER}$2`);
  const rawSentences = protectedText.match(/[^.!?\n]+[.!?]+(?:\s+|$)|[^.!?\n]+$/g) || [protectedText];
  currentReadingSentences = rawSentences
    .map(s => s.replaceAll(DOT_PLACEHOLDER, '.').trim())
    .filter(s => s.length > 0);

  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  document.getElementById('readingWordCount').textContent = `共 ${wordCount} 詞`;
  document.getElementById('readingSentenceCount').textContent = `${currentReadingSentences.length} 個語塊`;

  renderReadingStudio(currentReadingSentences);
  document.getElementById('readingStudioCard').classList.remove('hidden');

  addProgressionXp(20, '開啟長文精讀');
  markDailyQuest('reading');
}

function renderReadingStudio(sentences) {
  const container = document.getElementById('readingSentencesList');
  if (!container) return;
  container.innerHTML = '';

  sentences.forEach((sent, idx) => {
    const item = document.createElement('div');
    item.className = 'reading-sentence-item';
    item.id = 'rd-item-' + idx;

    const words = sent.split(/(\s+)/);
    let wrappedHtml = '';
    words.forEach(w => {
      if (/\w+/.test(w)) {
        wrappedHtml += `<span class="rd-word" style="cursor:pointer">${esc(w)}</span>`;
      } else {
        wrappedHtml += esc(w);
      }
    });

    item.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <b style="color:#7c3aed;font-size:12px">Chunk ${String(idx + 1).padStart(2, '0')}</b>
      </div>
      <div class="sentence-text-wrap" id="rd-text-${idx}">${wrappedHtml}</div>
      <div class="sentence-actions">
        <button class="btn-sm" id="rd-play-${idx}" type="button">🔊 朗讀</button>
        <button class="btn-sm" id="rd-shadow-${idx}" type="button">🎙️ 跟讀特訓</button>
        <button class="btn-sm" id="rd-add-${idx}" type="button">⭐ 加至重溫</button>
      </div>
    `;

    item.querySelector('#rd-play-' + idx).onclick = () => {
      document.querySelectorAll('.reading-sentence-item').forEach(el => el.classList.remove('playing'));
      item.classList.add('playing');
      playUkVoice(sent);
    };

    item.querySelector('#rd-shadow-' + idx).onclick = () => {
      const stBox = document.getElementById('sentenceText');
      if (stBox) stBox.value = sent;
      switchTab('practice');
      if (typeof genRefAudio === 'function') {
        genRefAudio(sent, true).catch(() => {});
      }
    };

    item.querySelector('#rd-add-' + idx).onclick = async (e) => {
      await addReviewItem({
        text: sent,
        context: '長文精讀 Chunk ' + (idx + 1),
        type: 'sentence',
        stage: 3
      });
      e.target.textContent = '✅ 已收錄';
      e.target.disabled = true;
    };

    item.querySelectorAll('.rd-word').forEach(wordEl => {
      wordEl.ondblclick = (e) => {
        showWordPopover(wordEl.textContent.trim(), e);
      };
    });

    container.appendChild(item);
  });
}

function showWordPopover(word, event) {
  const popover = document.getElementById('wordPopover');
  if (!popover) return;
  const cleanWord = word.replace(/[^a-zA-Z'-]/g, '').slice(0, 50);
  if (!cleanWord) return;

  document.getElementById('popoverWord').textContent = cleanWord;
  document.getElementById('popoverPh').textContent = '🇬🇧 英式發音與收錄';
  document.getElementById('popoverDef').textContent = '點擊下方按鈕可直接朗讀或加至生詞重溫本';

  document.getElementById('popoverHearBtn').onclick = () => playUkVoice(cleanWord);
  document.getElementById('popoverAddBtn').onclick = async () => {
    await addReviewItem({
      text: cleanWord,
      context: '精讀生詞',
      type: 'collocation',
      stage: 2
    });
    popover.classList.add('hidden');
  };
  document.getElementById('popoverCloseBtn').onclick = () => popover.classList.add('hidden');

  popover.style.left = Math.min(window.innerWidth - 220, Math.max(10, event.pageX - 80)) + 'px';
  popover.style.top = (event.pageY + 15) + 'px';
  popover.classList.remove('hidden');
}

/* ================= 英國在地化：4階晉級通關體系與特訓 (Staged Progression) ================= */

let ukStagesData = [];
let ukDrillsData = [];

function getProgressionState() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(LS_PROGRESSION);
    if (raw) {
      const state = JSON.parse(raw);
      if (state.dailyDate !== today) {
        const prevMs = Date.parse(state.dailyDate);
        const currMs = Date.parse(today);
        const diffDays = !isNaN(prevMs) ? Math.round((currMs - prevMs) / 86400000) : 0;
        state.streakDays = diffDays === 1 ? (Number(state.streakDays) || 1) + 1 : 1;
        state.dailyDate = today;
        state.quests = { review: false, reading: false, chat: false };
        saveProgressionState(state);
      }
      return state;
    }
  } catch (e) {}
  return {
    xp: 60,
    level: 1,
    streakDays: 1,
    dailyDate: today,
    quests: { review: false, reading: false, chat: false }
  };
}

function saveProgressionState(state) {
  try {
    localStorage.setItem(LS_PROGRESSION, JSON.stringify(state));
  } catch (e) {}
}

function addProgressionXp(xp, reason) {
  const state = getProgressionState();
  state.xp = (state.xp || 0) + xp;
  state.level = state.xp >= 2500 ? 4 : state.xp >= 1000 ? 3 : state.xp >= 300 ? 2 : 1;
  saveProgressionState(state);
  renderStagesDashboard();
}

function markDailyQuest(questKey) {
  const state = getProgressionState();
  if (state.quests && !state.quests[questKey]) {
    state.quests[questKey] = true;
    state.xp += 35;
    state.level = state.xp >= 2500 ? 4 : state.xp >= 1000 ? 3 : state.xp >= 300 ? 2 : 1;
    saveProgressionState(state);
    renderStagesDashboard();
  }
}

async function loadStagesAndDrills() {
  try {
    const [resS, resD] = await Promise.all([
      fetch('uk_stages.json'),
      fetch('uk_drills.json')
    ]);
    if (resS.ok) ukStagesData = await resS.json();
    if (resD.ok) ukDrillsData = await resD.json();
  } catch (e) {}
}

function renderStagesDashboard() {
  const state = getProgressionState();
  const xp = state.xp || 0;

  let level = 1;
  let maxLevelXp = 300;
  let levelName = 'Level 1: 英國生存突破 (Survival UK)';
  let levelDesc = '攻克基礎生活交易，消除開口焦慮。自如應對超市、外賣、郵局與地鐵。';
  let badgeIcon = '🥉';

  if (xp >= 2500) {
    level = 4;
    maxLevelXp = 5000;
    levelName = 'Level 4: 文化融入與職場自如 (Cultural Fluency)';
    levelDesc = '融會英式委婉語與幽默自嘲，流暢自如，真正融入在地社區與英倫職場。';
    badgeIcon = '💎';
  } else if (xp >= 1000) {
    level = 3;
    maxLevelXp = 2500;
    levelName = 'Level 3: 獨立維權與長文閱讀 (Autonomy & Reading)';
    levelDesc = '看懂官方規例、長篇合約與租約條款，用堅定而禮貌的英式表達捍衛權益。';
    badgeIcon = '🥇';
  } else if (xp >= 300) {
    level = 2;
    maxLevelXp = 1000;
    levelName = 'Level 2: 生活事務自主 (Daily Affairs)';
    levelDesc = '掌握英國核心行政、GP 醫療、市政稅與水電公務交涉，生活無求於人。';
    badgeIcon = '🥈';
  }

  const iconEl = document.getElementById('stageBadgeIcon');
  if (iconEl) iconEl.textContent = badgeIcon;
  const titleEl = document.getElementById('stageNameTitle');
  if (titleEl) titleEl.textContent = levelName;
  const descEl = document.getElementById('stageDescText');
  if (descEl) descEl.textContent = levelDesc;

  const xpLabel = document.getElementById('xpLabel');
  if (xpLabel) xpLabel.textContent = `${xp} / ${maxLevelXp} XP`;
  const xpFill = document.getElementById('xpFill');
  if (xpFill) {
    const pct = Math.min(100, Math.round((xp / maxLevelXp) * 100));
    xpFill.style.width = pct + '%';
  }

  const questsWrap = document.getElementById('dailyQuestsList');
  if (questsWrap) {
    const q = state.quests || {};
    questsWrap.innerHTML = `
      <div class="quest-item ${q.review ? 'done' : ''}">
        <span>${q.review ? '✅' : '⭕'} 晨間重溫 5 個在地語塊 (+30 XP)</span>
        <button class="btn-sm" id="questGoReview" type="button">去重溫</button>
      </div>
      <div class="quest-item ${q.reading ? 'done' : ''}">
        <span>${q.reading ? '✅' : '⭕'} 完成 1 篇英國長文精讀 (+35 XP)</span>
        <button class="btn-sm" id="questGoReading" type="button">去精讀</button>
      </div>
      <div class="quest-item ${q.chat ? 'done' : ''}">
        <span>${q.chat ? '✅' : '⭕'} 進行 1 場情境對話且發音達標 75+ (+35 XP)</span>
        <button class="btn-sm" id="questGoChat" type="button">去對話</button>
      </div>
    `;
    const rBtn = questsWrap.querySelector('#questGoReview');
    if (rBtn) rBtn.onclick = () => switchTab('review');
    const rdBtn = questsWrap.querySelector('#questGoReading');
    if (rdBtn) rdBtn.onclick = () => switchTab('reading');
    const chBtn = questsWrap.querySelector('#questGoChat');
    if (chBtn) chBtn.onclick = () => switchTab('practice');
  }

  renderDrillsAccordion();
}

function renderDrillsAccordion() {
  const container = document.getElementById('drillsAccordion');
  if (!container || !ukDrillsData.length) return;
  container.innerHTML = '';

  ukDrillsData.forEach(drill => {
    const block = document.createElement('div');
    block.className = 'drill-block';

    const b = document.createElement('b');
    b.textContent = drill.category;
    const p = document.createElement('p');
    p.textContent = drill.description;
    block.appendChild(b);
    block.appendChild(p);

    drill.examples.forEach(ex => {
      const exRow = document.createElement('div');
      exRow.className = 'drill-ex';

      const left = document.createElement('div');
      const textDiv = document.createElement('div');
      textDiv.style.cssText = 'font-weight:500;color:#1e293b';
      textDiv.textContent = ex.text;
      const noteDiv = document.createElement('div');
      noteDiv.style.cssText = 'font-size:11px;color:#7c3aed';
      noteDiv.textContent = ex.note;
      left.appendChild(textDiv);
      left.appendChild(noteDiv);

      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:4px';

      const playBtn = document.createElement('button');
      playBtn.className = 'btn-sm';
      playBtn.textContent = '🔊';
      playBtn.type = 'button';
      playBtn.onclick = () => playUkVoice(ex.text);

      const shadowBtn = document.createElement('button');
      shadowBtn.className = 'btn-sm';
      shadowBtn.textContent = '🎙️';
      shadowBtn.type = 'button';
      shadowBtn.onclick = () => drillShadowSentence(ex.text);

      btns.appendChild(playBtn);
      btns.appendChild(shadowBtn);

      exRow.appendChild(left);
      exRow.appendChild(btns);
      block.appendChild(exRow);
    });

    container.appendChild(block);
  });
}

function drillShadowSentence(text) {
  const stBox = document.getElementById('sentenceText');
  if (stBox) stBox.value = text;
  switchTab('practice');
  if (typeof genRefAudio === 'function') {
    genRefAudio(text, true).catch(() => {});
  }
}

/* ================= 英國在地化：導航分頁與全域聯動 (Navigation & Hooks) ================= */

let currentActiveTab = 'practice';

function switchTab(tabId) {
  currentActiveTab = tabId;
  window.currentActiveTab = tabId;

  if (tabId !== 'review' && reviewAutoTimer) {
    clearTimeout(reviewAutoTimer);
    reviewAutoTimer = null;
  }

  document.querySelectorAll('#appTabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  ['practice', 'reading', 'review', 'stages'].forEach(id => {
    const view = document.getElementById('view-' + id);
    if (view) {
      view.classList.toggle('hidden', id !== tabId);
    }
  });

  const setView = document.getElementById('view-settings');
  if (setView && !setView.classList.contains('hidden')) {
    setView.classList.add('hidden');
    const tabs = document.getElementById('appTabs');
    if (tabs) tabs.classList.remove('hidden');
    document.getElementById('menuBtn').classList.remove('hidden');
    document.getElementById('navBackBtn').classList.add('hidden');
    document.getElementById('settingsBtn').classList.remove('hidden');
  }

  if (tabId === 'review') {
    renderReviewStudio();
  } else if (tabId === 'stages') {
    renderStagesDashboard();
  } else if (tabId === 'reading') {
    const inp = document.getElementById('readingInput');
    if (inp && !inp.value && ukReadingPresets.length) {
      inp.value = ukReadingPresets[0].text;
      analyzeReadingText(inp.value);
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initUkSuite() {
  document.querySelectorAll('#appTabs .tab-btn').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });

  document.querySelectorAll('.weakness-chip').forEach(chip => {
    chip.onclick = () => {
      showPhoneticModal(chip.dataset.ph);
    };
  });

  const closePh = document.getElementById('closePhModalBtn');
  if (closePh) closePh.onclick = closePhoneticModal;
  const closePh2 = document.getElementById('phModalCloseBtn');
  if (closePh2) closePh2.onclick = closePhoneticModal;
  const phModal = document.getElementById('phoneticModal');
  if (phModal) {
    phModal.addEventListener('click', (e) => {
      if (e.target === phModal) closePhoneticModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && phModal && !phModal.classList.contains('hidden')) {
      closePhoneticModal();
    }
  });

  const hearPhBtn = document.getElementById('phModalHearBtn');
  if (hearPhBtn) {
    hearPhBtn.onclick = () => {
      const info = PHONETIC_GUIDE[activePhKey] || PHONETIC_GUIDE['θ'];
      playUkVoice(info.sampleVoiceText);
    };
  }

  const pracPhBtn = document.getElementById('phModalPracticeBtn');
  if (pracPhBtn) {
    pracPhBtn.onclick = () => {
      const info = PHONETIC_GUIDE[activePhKey] || PHONETIC_GUIDE['θ'];
      const stBox = document.getElementById('sentenceText');
      if (stBox) stBox.value = info.sampleWord.split(',')[0].trim();
      closePhoneticModal();
      switchTab('practice');
      if (typeof genRefAudio === 'function') {
        genRefAudio(stBox.value, true).catch(() => {});
      }
    };
  }

  const ankiBtn = document.getElementById('exportAnkiBtn');
  if (ankiBtn) ankiBtn.onclick = exportToAnki;
  const backupBtn = document.getElementById('exportBackupJsonBtn');
  if (backupBtn) backupBtn.onclick = exportReviewsJson;
  const importBtn = document.getElementById('importBackupJsonBtn');
  const importInput = document.getElementById('importBackupFileInput');
  if (importBtn && importInput) {
    importBtn.onclick = () => importInput.click();
    importInput.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        importReviewsJson(e.target.files[0]);
      }
    };
  }

  // Dismiss popover when clicking outside
  document.addEventListener('click', (e) => {
    const popover = document.getElementById('wordPopover');
    if (popover && !popover.classList.contains('hidden')) {
      if (!popover.contains(e.target) && !e.target.classList.contains('rd-word')) {
        popover.classList.add('hidden');
      }
    }
  });

  const checkOnline = () => {
    const notice = document.getElementById('offlineTubeNotice');
    if (notice) notice.classList.toggle('hidden', navigator.onLine);
  };
  window.addEventListener('online', checkOnline);
  window.addEventListener('offline', checkOnline);
  checkOnline();

  initReadingStudio();
  initReviewsStore().then(() => {
    renderReviewStudio();
  });
  loadStagesAndDrills().then(() => {
    renderStagesDashboard();
  });
}

// Memory-leak-proof Audio player with strict URL release and concurrent lock
let currentUkAudio = null;
let currentUkAudioUrl = null;

async function playUkVoice(text) {
  if (!text) return;

  if (currentUkAudio) {
    try {
      currentUkAudio.pause();
      currentUkAudio.src = '';
    } catch (e) {}
    currentUkAudio = null;
  }
  if (currentUkAudioUrl) {
    try { URL.revokeObjectURL(currentUkAudioUrl); } catch (e) {}
    currentUkAudioUrl = null;
  }

  const s = (typeof getSettings === 'function') ? getSettings() : {};
  if (s.azureKey && s.azureRegion && typeof ttsCached === 'function') {
    try {
      const res = await ttsCached(text, s.voice || 'en-GB-SoniaNeural');
      const url = URL.createObjectURL(res.blob);
      currentUkAudioUrl = url;
      const a = new Audio(url);
      currentUkAudio = a;

      const cleanup = () => {
        if (currentUkAudioUrl === url) {
          try { URL.revokeObjectURL(url); } catch (e) {}
          currentUkAudioUrl = null;
        }
        if (currentUkAudio === a) currentUkAudio = null;
      };

      a.onended = cleanup;
      a.onerror = cleanup;
      a.onpause = () => { if (a.currentTime >= a.duration) cleanup(); };

      await a.play();
      return;
    } catch (e) {
      if (currentUkAudioUrl) {
        try { URL.revokeObjectURL(currentUkAudioUrl); } catch (err) {}
        currentUkAudioUrl = null;
      }
      currentUkAudio = null;
    }
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-GB';
    const voices = window.speechSynthesis.getVoices();
    const gbVoice = voices.find(v => v.lang === 'en-GB' || v.lang === 'en_GB');
    if (gbVoice) utt.voice = gbVoice;
    window.speechSynthesis.speak(utt);
  }
}
