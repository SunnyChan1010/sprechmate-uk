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

function resolvePhoneticGuideKey(sym) {
  if (!sym) return null;
  const s = String(sym).toLowerCase().replace(/[\/\[\]]/g, '').trim();
  if (s === 'θ') return 'θ';
  if (s === 'ð') return 'ð';
  if (s === 'v' || s === 'w') return 'v';
  if (s === 'l' || s === 'ɫ' || s === 'l_dark') return 'l_dark';
  if (s === 'iː' || s === 'ɪ' || s === 'i:' || s === 'i') return 'iː';
  if (s === 'ɒ' || s === 'ɔː' || s === 'ɔ:' || s === 'o') return 'ɒ';
  if (s === 'ʔ') return 'ʔ';
  return null;
}

let activePhKey = 'θ';
function showPhoneticModal(symbol, word) {
  const modal = document.getElementById('phoneticModal');
  if (!modal) return;
  
  const key = resolvePhoneticGuideKey(symbol);
  activePhKey = key || '';

  const cleanSym = String(symbol || '').replace(/[\/\[\]]/g, '').trim() || (key ? PHONETIC_GUIDE[key].badge : '音素');
  const info = key ? PHONETIC_GUIDE[key] : {
    title: `標準發音口型與舌位 /${cleanSym}/`,
    badge: `/${cleanSym}/`,
    sampleWord: word || cleanSym,
    sampleVoiceText: word || cleanSym,
    cantonesePitfall: '💡 提示：點擊上方示範詞或下方例詞可直接聆聽標準英音發音。',
    tips: [
      '保持喉部放鬆，注意口腔共鳴與元音長度。',
      '點擊例詞聆聽標準英式發音（RP/SSBE）並仔細對比。'
    ],
    examples: word ? [word] : []
  };

  document.getElementById('phModalTitle').textContent = info.title;
  document.getElementById('phModalBadge').textContent = info.badge;
  document.getElementById('phModalWord').textContent = word || info.sampleWord;
  document.getElementById('phDiagramSvgWrap').innerHTML = renderPhoneticSvg(key || '');

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

function analyzeUserPhonemeWeaknesses(convs, maxRecords) {
  if (!Array.isArray(convs)) return [];
  const resolveKey = (typeof resolvePhoneticGuideKey === 'function')
    ? resolvePhoneticGuideKey
    : (sym => {
        if (!sym) return null;
        const s = String(sym).toLowerCase().replace(/[\/\[\]]/g, '').trim();
        if (s === 'θ') return 'θ';
        if (s === 'ð') return 'ð';
        if (s === 'v' || s === 'w') return 'v';
        if (s === 'l' || s === 'ɫ' || s === 'l_dark') return 'l_dark';
        if (s === 'iː' || s === 'ɪ' || s === 'i:' || s === 'i') return 'iː';
        if (s === 'ɒ' || s === 'ɔː' || s === 'ɔ:' || s === 'o') return 'ɒ';
        if (s === 'ʔ') return 'ʔ';
        return null;
      });

  const allRecords = [];
  convs.forEach(conv => {
    if (conv && Array.isArray(conv.records)) {
      conv.records.forEach(rec => {
        if (rec && Array.isArray(rec.words)) allRecords.push(rec);
      });
    }
  });
  allRecords.sort((a, b) => (Number(b.t) || 0) - (Number(a.t) || 0));
  const limit = (typeof maxRecords === 'number' && maxRecords > 0) ? maxRecords : 30;
  const recent = allRecords.slice(0, limit);

  const statsMap = Object.create(null);
  recent.forEach(rec => {
    (rec.words || []).forEach(wordObj => {
      if (!wordObj || !Array.isArray(wordObj.phonemes)) return;
      const wordStr = String(wordObj.w || '').trim();
      wordObj.phonemes.forEach(phObj => {
        if (!phObj) return;
        const ph = String(phObj.p || '').trim();
        const sc = phObj.s;
        if (!ph || typeof sc !== 'number' || !(sc > 0 && sc < 75)) return;
        if (!statsMap[ph]) {
          statsMap[ph] = {
            count: 0,
            scoreSum: 0,
            confusions: Object.create(null),
            sampleWords: []
          };
        }
        const entry = statsMap[ph];
        entry.count += 1;
        entry.scoreSum += sc;
        const heard = phObj.h ? String(phObj.h).trim() : '';
        if (heard && heard !== ph) {
          entry.confusions[heard] = (entry.confusions[heard] || 0) + 1;
        }
        if (wordStr && entry.sampleWords.length < 3 && !entry.sampleWords.some(sw => sw.toLowerCase() === wordStr.toLowerCase())) {
          entry.sampleWords.push(wordStr);
        }
      });
    });
  });

  const results = Object.keys(statsMap).map(phoneme => {
    const entry = statsMap[phoneme];
    let topConfusedWith = null;
    let topConfusedCount = 0;
    Object.keys(entry.confusions).forEach(hKey => {
      const cnt = entry.confusions[hKey];
      if (cnt > topConfusedCount) {
        topConfusedCount = cnt;
        topConfusedWith = hKey;
      }
    });
    return {
      phoneme,
      guideKey: resolveKey(phoneme),
      count: entry.count,
      avgScore: Math.round(entry.scoreSum / entry.count),
      topConfusedWith,
      topConfusedCount,
      sampleWords: entry.sampleWords
    };
  });

  results.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (a.avgScore !== b.avgScore) return a.avgScore - b.avgScore;
    return a.phoneme.localeCompare(b.phoneme);
  });

  return results;
}
if (typeof window !== 'undefined') window.analyzeUserPhonemeWeaknesses = analyzeUserPhonemeWeaknesses;

function getPhoneticCoachingPromptHint() {
  const convs = (typeof getConvs === 'function') ? (getConvs() || []) : [];
  const weaknesses = analyzeUserPhonemeWeaknesses(convs, 30);
  const topItems = weaknesses.filter(it => it.count >= 2).slice(0, 2);
  if (!topItems.length) return '';
  return '[Phonetic Coaching Target]: Based on recent pronunciation assessments, the learner frequently struggles with '
    + topItems.map(it => '/' + it.phoneme + '/' + (it.topConfusedWith ? ' (confused with /' + it.topConfusedWith + '/)' : '')).join(' and ')
    + '. Naturally weave 1-2 everyday British words containing these target sounds into your reply while staying in character.';
}
if (typeof window !== 'undefined') window.getPhoneticCoachingPromptHint = getPhoneticCoachingPromptHint;

function renderPersonalWeaknessRadar() {
  if (typeof document === 'undefined') return;
  const convs = (typeof getConvs === 'function') ? (getConvs() || []) : [];
  let totalRecords = 0;
  convs.forEach(c => {
    if (c && Array.isArray(c.records)) totalRecords += c.records.length;
  });
  const weaknesses = analyzeUserPhonemeWeaknesses(convs, 30);
  const weakGuideKeys = new Set(weaknesses.map(it => it.guideKey).filter(Boolean));

  document.querySelectorAll('.weakness-chip').forEach(chip => {
    const phKey = chip.dataset ? chip.dataset.ph : '';
    chip.classList.toggle('is-personal-weak', !!(phKey && weakGuideKeys.has(phKey)));
  });

  const radarBox = document.getElementById('personalWeaknessRadar');
  if (!radarBox) return;
  radarBox.innerHTML = '';

  if (weaknesses.length > 0) {
    const headerEl = document.createElement('div');
    headerEl.style.cssText = 'font-weight:600;color:#9a3412;margin-bottom:6px';
    headerEl.textContent = '🔥 您的個人高頻發音盲點雷達（基於最近練習）：';
    radarBox.appendChild(headerEl);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center';
    weaknesses.slice(0, 3).forEach(it => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-sm';
      btn.style.cssText = 'border-color:#fdba74;background:#ffffff;color:#9a3412;font-size:12px';
      const confLabel = it.topConfusedWith ? `（常誤讀為 /${it.topConfusedWith}/）` : '';
      btn.textContent = `/${it.phoneme}/${confLabel} · ${it.count}次 · 均分 ${it.avgScore}`;
      if (it.sampleWords && it.sampleWords.length) {
        btn.title = '常見失誤詞：' + it.sampleWords.join(', ') + '（點擊查看口型圖解）';
      }
      btn.onclick = () => showPhoneticModal(it.guideKey || it.phoneme, (it.sampleWords && it.sampleWords[0]) || '');
      btnRow.appendChild(btn);
    });
    radarBox.appendChild(btnRow);

    const hintEl = document.createElement('div');
    hintEl.style.cssText = 'font-size:11px;color:#c2410c;margin-top:6px';
    hintEl.textContent = '💡 AI 對話教練已自動鎖定高頻弱項音素，將於情境對話中自然融入對應英式詞彙。';
    radarBox.appendChild(hintEl);
    radarBox.classList.remove('hidden');
  } else if (totalRecords > 0) {
    const okEl = document.createElement('div');
    okEl.style.cssText = 'color:#15803d;font-weight:500';
    okEl.textContent = '✨ 最近跟讀表現理想，暫無低於 75 分的音素盲點！繼續保持地道英式語感。';
    radarBox.appendChild(okEl);
    radarBox.classList.remove('hidden');
  } else {
    radarBox.classList.add('hidden');
  }
}
if (typeof window !== 'undefined') window.renderPersonalWeaknessRadar = renderPersonalWeaknessRadar;

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
let pendingReviewAssessmentId = null;
let phrasebookRenderLimit = 50;
let phrasebookSearchQuery = '';

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
    if (!db.objectStoreNames.contains('reviews')) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');
        if (clearFirst) store.clear();
        (items || []).forEach(item => store.put(item));
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch (e) { resolve(false); }
    });
  } catch (e) { return false; }
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

let reviewsIdbOk = false; // IndexedDB 'reviews' 可用且已完成遷移：之後不再雙寫 localStorage

async function initReviewsStore() {
  let loaded = await idbReviewGetAll();
  const idbAvailable = Array.isArray(loaded);
  const fromIdb = idbAvailable && loaded.length > 0;
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
  if (fromIdb || (idbAvailable && await idbReviewsSyncBatch(reviewsCache))) {
    reviewsIdbOk = true;
    try { localStorage.removeItem(LS_REVIEWS); } catch (e) {} // 確認寫入成功後才清掉舊副本
  } else {
    try { localStorage.setItem(LS_REVIEWS, JSON.stringify(reviewsCache)); } catch (e) {}
  }
  updateDueBadge();
}

/* changedItems：只寫入這些卡片（增量）；不傳則全表同步（匯入 / 遷移用） */
function persistReviewsCache(clearFirst = false, changedItems = null) {
  if (reviewsIdbOk) {
    if (Array.isArray(changedItems) && !clearFirst) {
      changedItems.forEach(it => { if (it) idbReviewPut(it).catch(() => {}); });
    } else {
      idbReviewsSyncBatch(reviewsCache, clearFirst).catch(() => {});
    }
  } else {
    try { localStorage.setItem(LS_REVIEWS, JSON.stringify(reviewsCache)); } catch (e) {}
    idbReviewsSyncBatch(reviewsCache, clearFirst).catch(() => {});
  }
  updateDueBadge();
}

async function addReviewItem({ text, translation, context, type, stage, score, overwriteTranslation }) {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();
  const resolvedTrans = (translation && translation.trim())
    ? translation.trim()
    : (typeof extractSentenceNotes === 'function' ? extractSentenceNotes(cleanText) : '');
  let existing = reviewsCache.find(r => r.text.toLowerCase() === cleanText.toLowerCase());
  if (existing) {
    existing.dueDate = Date.now();
    if (score) existing.lastScore = score;
    if (resolvedTrans && (overwriteTranslation || !existing.translation)) {
      existing.translation = resolvedTrans;
    }
    persistReviewsCache(false, [existing]);
    renderReviewStudio();
    return existing;
  }
  const newItem = {
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    text: cleanText,
    translation: resolvedTrans,
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
  persistReviewsCache(false, [newItem]);
  renderReviewStudio();
  return newItem;
}

function deleteReviewItem(id) {
  reviewsCache = reviewsCache.filter(r => r.id !== id);
  idbReviewDel(id).catch(() => {});
  persistReviewsCache(false, []);
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

function detectCardPhoneticGuides(text) {
  const str = (text || '').toLowerCase();
  const guides = [];
  const voicedThRegex = /\b(the|this|that|these|those|there|their|theirs|they|them|then|than|though|although|brother|mother|father|weather|leather|feather|together|breathe|with|either|neither|other|another|smooth)\b/i;
  const hasTh = /\b\w*th\w*\b/i.test(str);
  if (voicedThRegex.test(str) || str.includes('ð')) {
    guides.push({ ph: 'ð', label: '👅 口型圖 /ð/' });
  }
  if ((hasTh && !voicedThRegex.test(str)) || str.includes('θ')) {
    guides.push({ ph: 'θ', label: '👅 口型圖 /θ/' });
  }
  if (/\b\w*v\w*\b/i.test(str) || str.includes('v')) {
    guides.push({ ph: 'v', label: '👅 口型圖 /v/' });
  }
  if (/[aeiou]l(?![aeiou])/i.test(str) || str.includes('ɫ') || str.includes('l_dark')) {
    guides.push({ ph: 'l_dark', label: '👅 口型圖 [ɫ]' });
  }
  if (/(?:ee|ea)|\b(?:sheet|shit|beach|bitch|seat|sit|leave|live|ship|sheep)\b/i.test(str) || str.includes('iː') || str.includes('ɪ')) {
    guides.push({ ph: 'iː', label: '👅 口型圖 /iː/' });
  }
  if (/\b(?:hot|cost|coffee|doctor|holiday|bottle|lot|pot|shop|clock|sock)\b/i.test(str) || str.includes('ɒ')) {
    guides.push({ ph: 'ɒ', label: '👅 口型圖 /ɒ/' });
  }
  if (/wa['']er|bo['']le|bu['']er/i.test(str) || str.includes('ʔ')) {
    guides.push({ ph: 'ʔ', label: '👅 口型圖 /ʔ/' });
  }
  return guides;
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
  const fallbackNote = (typeof extractSentenceNotes === 'function') ? extractSentenceNotes(item.text) : '';
  const displayTrans = item.translation || fallbackNote || '（點擊右側「編輯筆記」可自訂中文釋義與重點提示）';

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span class="badge" style="background:#8b5cf6">Stage ${item.stage || 1} · ${esc(item.type || '語塊')}</span>
      <span class="mut" style="font-size:12px">${esc(item.context || '')}</span>
    </div>
    <div class="flashcard-box" id="flashcardBox">
      <div class="flashcard-text">${esc(item.text)}</div>
      <div class="flashcard-trans hidden" id="flashcardTrans">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px">
          <p id="flashcardTransText" style="margin:0;color:#334155;font-weight:500;flex:1">${esc(displayTrans)}</p>
          <button class="btn-sm" id="editCardTransBtn" type="button" style="flex:none;font-size:11px;padding:2px 6px">✏️ 編輯筆記</button>
        </div>
        <div class="phoneme-buttons-wrap" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>
    </div>
    <div class="btn-row" style="margin-bottom:10px">
      <button class="primary" id="reviewHearBtn" type="button"><span class="ic-play"></span> 聽英式原聲</button>
      <button id="reviewFlipBtn" type="button">👁️ 翻轉查看釋義</button>
      <button id="reviewPracticeBtn" type="button">${isOffline ? '🚇 離線自評' : '🎙️ 智能發音自測'}</button>
    </div>
    <div id="reviewAssessmentResult" class="hidden" style="margin:8px 0;padding:10px;background:#f8fafc;border-radius:10px;border:1px solid #cbd5e1"></div>
    <div class="smart-rating-row" id="smartRatingRow">
      <button class="rating-btn rec-bad" id="rateBtn1" type="button">🔴 忘記 (Again)<br><small>${d1}天</small></button>
      <button class="rating-btn rec-hard" id="rateBtn2" type="button">🟠 勉強 (Hard)<br><small>${d2}天</small></button>
      <button class="rating-btn rec-good" id="rateBtn3" type="button">🟢 良好 (Good)<br><small>${d3}天</small></button>
      <button class="rating-btn rec-master" id="rateBtn4" type="button">🔵 熟練 (Easy)<br><small>${d4}天</small></button>
    </div>
    <div id="reviewCountdownNotice" class="hint" style="text-align:center;margin-top:6px;min-height:18px"></div>
  `;

  // Safely inject phoneme buttons via DOM API to eliminate inline script injection
  const transBox = container.querySelector('#flashcardTrans');
  if (transBox) {
    const btnWrap = transBox.querySelector('.phoneme-buttons-wrap');
    if (btnWrap) {
      const guides = detectCardPhoneticGuides(item.text);
      guides.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'btn-sm';
        btn.style.cssText = 'border-color:#c4b5fd;color:#7c3aed;margin-right:6px;margin-top:4px';
        btn.textContent = g.label;
        btn.type = 'button';
        btn.onclick = (e) => { e.stopPropagation(); showPhoneticModal(g.ph, item.text); };
        btnWrap.appendChild(btn);
      });
    }
  }

  const editBtn = document.getElementById('editCardTransBtn');
  if (editBtn) {
    editBtn.onclick = async (e) => {
      e.stopPropagation();
      if (typeof promptDlg === 'function') {
        const nextVal = await promptDlg('編輯閃卡背面釋義／筆記', '', item.translation || fallbackNote || '', '輸入中文翻譯、例句或發音提示');
        if (nextVal !== null) {
          item.translation = nextVal.trim();
          persistReviewsCache(false, [item]);
          renderActiveReviewCard(item);
          const tr = document.getElementById('flashcardTrans');
          if (tr) tr.classList.remove('hidden');
          renderPhrasebookList();
        }
      }
    };
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
  pendingReviewAssessmentId = item.id;
  const stBox = document.getElementById('sentenceText');
  if (stBox) {
    stBox.value = item.text;
    if (typeof autoGrowTextarea === 'function') autoGrowTextarea(stBox);
  }

  switchTab('practice');
  const rh = document.getElementById('recHint');
  if (rh) {
    rh.textContent = '🎯 智能重溫自測模式：請點擊「開始錄音 (D)」朗讀，完成評分後將自動返回閃卡並智能評級！';
  }
  const recCard = document.getElementById('recordCard');
  if (recCard) {
    setTimeout(() => recCard.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  }
  if (typeof genRefAudio === 'function') {
    genRefAudio(item.text, true).catch(() => {});
  }
}

window.clearPendingReviewAssessment = function() { pendingReviewAssessmentId = null; };

window.completeReviewVoiceAssessment = function(overallScore, accScore, fluScore) {
  if (!pendingReviewAssessmentId) return false;
  const targetId = pendingReviewAssessmentId;
  pendingReviewAssessmentId = null;

  const item = reviewsCache.find(r => r.id === targetId);
  if (!item) return false;
  // 文本一致性防線：跟讀框已換成別的句子，則這次評分與閃卡無關
  const stBox = document.getElementById('sentenceText');
  const curText = stBox ? stBox.value.trim() : '';
  if (curText !== String(item.text || '').trim()) return false;

  const rating = overallScore >= 85 ? 4 : overallScore >= 70 ? 3 : overallScore >= 55 ? 2 : 1;
  const ratingLabels = {
    1: '🔴 忘記 (Again)',
    2: '🟠 勉強 (Hard)',
    3: '🟢 良好 (Good)',
    4: '🔵 熟練 (Easy)'
  };

  switchTab('review');
  activeReviewItem = item;
  renderActiveReviewCard(item);

  const transEl = document.getElementById('flashcardTrans');
  if (transEl) transEl.classList.remove('hidden');

  const resBox = document.getElementById('reviewAssessmentResult');
  const noticeEl = document.getElementById('reviewCountdownNotice');
  const recBtn = document.getElementById('rateBtn' + rating);
  if (recBtn) {
    recBtn.style.boxShadow = '0 0 0 2px #7c3aed';
  }

  if (resBox) {
    resBox.classList.remove('hidden');
    resBox.innerHTML = '';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap';
    const info = document.createElement('div');
    info.style.cssText = 'font-size:13px;color:#1e293b';
    const nOv = Number(overallScore) || 0;
    const nAcc = Number(accScore) || nOv;
    const nFlu = Number(fluScore) || nOv;
    const lbl = String(ratingLabels[rating] || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    info.innerHTML = `🎙️ 自測總分：<b style="color:#7c3aed;font-size:15px">${nOv}</b> 分（準確 ${nAcc} · 流暢 ${nFlu}）➔ 建議評級：<b>${lbl}</b>`;
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-sm';
    cancelBtn.type = 'button';
    cancelBtn.textContent = '⏸️ 取消自動翻頁';
    cancelBtn.onclick = () => {
      if (reviewAutoTimer) {
        clearTimeout(reviewAutoTimer);
        reviewAutoTimer = null;
      }
      if (noticeEl) noticeEl.textContent = '已暫停自動翻頁，請手動點擊上方評級按鈕。';
      cancelBtn.remove();
    };
    row.appendChild(info);
    row.appendChild(cancelBtn);
    resBox.appendChild(row);
  }

  if (noticeEl) {
    noticeEl.textContent = `⏱️ 2.5 秒後將自動以「${ratingLabels[rating]}」排程並進入下一張…`;
  }

  if (reviewAutoTimer) clearTimeout(reviewAutoTimer);
  reviewAutoTimer = setTimeout(() => {
    reviewAutoTimer = null;
    applyReviewRating(item, rating, overallScore);
  }, 2500);

  return true;
};

function applyReviewRating(item, rating, score) {
  if (reviewAutoTimer) { clearTimeout(reviewAutoTimer); reviewAutoTimer = null; }

  const updated = calcNextReview(item, rating);
  if (score) updated.lastScore = score;
  updated.history = (updated.history || []).concat({ t: Date.now(), r: rating, s: score || null }).slice(-50);

  const idx = reviewsCache.findIndex(r => r.id === item.id);
  if (idx !== -1) {
    reviewsCache[idx] = updated;
  }
  persistReviewsCache(false, [updated]);

  const st = getProgressionState();
  st.dailyReviewsDone = (st.dailyReviewsDone || 0) + 1;
  saveProgressionState(st);

  addProgressionXp(15, '完成語塊間隔重溫');
  if (st.dailyReviewsDone >= 5 || getDueReviews().length === 0) {
    markDailyQuest('review');
  }

  renderReviewStudio();
}

function renderPhrasebookList() {
  const container = document.getElementById('phrasebookList');
  if (!container) return;
  if (!reviewsCache.length) {
    container.innerHTML = '<div class="hint">您的語塊本還是空的。精讀或對話時，點擊「加入重溫」即可收錄。</div>';
    return;
  }
  const q = (phrasebookSearchQuery || '').trim().toLowerCase();
  const filtered = q
    ? reviewsCache.filter(item =>
        (item.text && item.text.toLowerCase().includes(q)) ||
        (item.translation && item.translation.toLowerCase().includes(q)) ||
        (item.context && item.context.toLowerCase().includes(q))
      )
    : reviewsCache;

  container.innerHTML = '';
  if (!filtered.length) {
    container.innerHTML = '<div class="hint">找不到符合搜尋條件的語塊。</div>';
    return;
  }

  filtered.slice(0, phrasebookRenderLimit).forEach(item => {
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

  if (filtered.length > phrasebookRenderLimit) {
    const moreWrap = document.createElement('div');
    moreWrap.style.cssText = 'text-align:center;padding:10px 0 4px';
    const moreBtn = document.createElement('button');
    moreBtn.className = 'ghost-btn';
    moreBtn.type = 'button';
    moreBtn.style.cssText = 'font-size:13px;padding:6px 16px';
    moreBtn.textContent = `⬇️ 載入更多（尚有 ${filtered.length - phrasebookRenderLimit} 筆語塊）`;
    moreBtn.onclick = () => {
      phrasebookRenderLimit += 50;
      renderPhrasebookList();
    };
    moreWrap.appendChild(moreBtn);
    container.appendChild(moreWrap);
  }
}

function sanitizeAnkiField(val) {
  let s = esc(val || '').replace(/\t+/g, ' ').replace(/\r?\n/g, '<br>');
  if (/^[=+\-@]/.test(s)) s = ' ' + s; // 防禦試算表公式注入
  return s;
}

function exportToAnki() {
  if (!reviewsCache.length) { alertDlg('目前沒有語塊可匯出'); return; }
  let tsv = '#separator:tab\n#html:true\n#tags column:3\n';
  reviewsCache.forEach(r => {
    const front = sanitizeAnkiField(r.text);
    const back = sanitizeAnkiField(r.translation || '') + '<br><small>' + sanitizeAnkiField(r.context || '') + '</small>';
    const stageNum = Math.min(4, Math.max(1, parseInt(r.stage, 10) || 1));
    const tags = `SprechMate UK_Stage_${stageNum}`;
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
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result, (k, v) =>
        (k === '__proto__' || k === 'constructor' || k === 'prototype') ? undefined : v
      );
      const hasReviews = Array.isArray(data && data.reviews);
      const hasProg = !!(data && data.progression && typeof data.progression === 'object');
      if (!hasReviews && !hasProg) {
        alertDlg('匯入失敗：此檔案不包含有效的語塊或進度備份資料');
        return;
      }
      if (typeof confirmDlg === 'function') {
        const ok = await confirmDlg('匯入將覆蓋目前的語塊重溫本與通關進度，確定要繼續嗎？', '確定還原');
        if (!ok) return;
      }
      if (hasReviews) {
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
      if (hasProg) {
        const p = data.progression;
        const sanitizedProg = {
          xp: Math.max(0, Number(p.xp) || 0),
          level: Math.min(4, Math.max(1, Number(p.level) || 1)),
          streakDays: Math.max(1, Number(p.streakDays) || 1),
          dailyDate: String(p.dailyDate || new Date().toISOString().slice(0, 10)),
          dailyReviewsDone: Math.max(0, Number(p.dailyReviewsDone) || 0),
          readingsCount: Math.max(0, Number(p.readingsCount) || 0),
          quests: p.quests || { review: false, reading: false, chat: false },
          completedMissions: Array.isArray(p.completedMissions) ? p.completedMissions : []
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

/* ================= 英國在地化：長文沉浸精讀工作室與內建英式詞庫 (Reading Studio & UK Glossary) ================= */

let currentReadingSentences = [];
let ukReadingPresets = [];

const UK_GLOSSARY = {
  'landlord': { ipa: '/ˈlæn.lɔːd/', def: '房東、業主（英國租屋核心詞，注意詞尾 r 不捲舌）' },
  'letting': { ipa: '/ˈlet.ɪŋ/', def: '出租、租賃（Letting agent = 地產租務代理）' },
  'agent': { ipa: '/ˈeɪ.dʒənt/', def: '代理人、仲介（Estates / Letting agent）' },
  'tenancy': { ipa: '/ˈten.ən.si/', def: '租約、租期（Assured Shorthold Tenancy, AST）' },
  'deposit': { ipa: '/dɪˈpɒz.ɪt/', def: '按金、押金（須存入政府認可 DPS/TDS 保護計畫）' },
  'scheme': { ipa: '/skiːm/', def: '計畫、方案（英音讀 /skiːm/，注意長元音 /iː/）' },
  'certificate': { ipa: '/səˈtɪf.ɪ.kət/', def: '證書、證明（如 Gas Safety / EPC 能源證書）' },
  'gas': { ipa: '/ɡæs/', def: '煤氣、天然氣（英國家居供暖與熱水主要能源）' },
  'energy': { ipa: '/ˈen.ə.dʒi/', def: '能源、電力與燃氣（Ofgem 監管）' },
  'performance': { ipa: '/pəˈfɔː.məns/', def: '效能、表現（EPC = Energy Performance Certificate）' },
  'confirmation': { ipa: '/ˌkɒn.fəˈmeɪ.ʃən/', def: '確認函、證明書（注意首音節英音短 o /ɒ/）' },
  'government': { ipa: '/ˈɡʌv.ən.mənt/', def: '政府（GOV.UK 官方公共服務網）' },
  'approved': { ipa: '/əˈpruːvd/', def: '經核准的、官方認可的' },
  'gp': { ipa: '/ˌdʒiːˈpiː/', def: '全科家庭醫生 (General Practitioner，NHS 看診第一站)' },
  'surgery': { ipa: '/ˈsɜː.dʒər.i/', def: '診所、門診部（英式用法：GP surgery 指家庭醫生診所）' },
  'triage': { ipa: '/ˈtriː.ɑːʒ/', def: '分診、病情輕重評估（NHS 8:00 AM 電話預約必經流程）' },
  'appointment': { ipa: '/əˈpɔɪnt.mənt/', def: '預約、門診掛號（book an appointment）' },
  'prescription': { ipa: '/prɪˈskrɪp.ʃən/', def: '醫生處方箋（可憑單至 Boots 或 Chemist 領藥）' },
  'paracetamol': { ipa: '/ˌpær.əˈsiː.tə.mɒl/', def: '撲熱息痛（英國最常用止痛退燒藥，美式稱 acetaminophen）' },
  'chemist': { ipa: '/ˈkem.ɪst/', def: '藥房、藥劑師（英式日常用語，等同 pharmacy）' },
  'pharmacy': { ipa: '/ˈfɑː.mə.si/', def: '藥房（NHS 輕症可先諮詢社區藥房 Pharmacist）' },
  'emergency': { ipa: '/ɪˈmɜː.dʒən.si/', def: '緊急情況、急症（A&E = Accident and Emergency 急症室）' },
  'symptom': { ipa: '/ˈsɪmp.təm/', def: '症狀、病徵' },
  'council': { ipa: '/ˈkaʊn.səl/', def: '地方市政廳（負責市政稅 Council Tax、垃圾回收與社區服務）' },
  'tax': { ipa: '/tæks/', def: '稅項（Council Tax 按房屋估值 Band A–H 徵收）' },
  'discount': { ipa: '/ˈdɪs.kaʊnt/', def: '折扣（獨居成人可申請 25% Single Person Discount）' },
  'wheelie': { ipa: '/ˈwiː.li/', def: '帶輪子的（wheelie bin = 英式家門口的輪式分類垃圾桶）' },
  'bin': { ipa: '/bɪn/', def: '垃圾桶（注意短元音 /ɪ/，切勿讀成長音 /iː/）' },
  'collection': { ipa: '/kəˈlek.ʃən/', def: '收集、清運（bin collection day = 垃圾清運日）' },
  'tariff': { ipa: '/ˈtær.ɪf/', def: '水電煤氣收費標準、資費方案（Fixed vs Variable tariff）' },
  'standing': { ipa: '/ˈstæn.dɪŋ/', def: '固定的（standing charge = 每日固定基本服務費）' },
  'charge': { ipa: '/tʃɑːdʒ/', def: '收費、費用（英音長元音 /ɑː/，不捲舌）' },
  'cap': { ipa: '/kæp/', def: '上限（Ofgem Energy Price Cap = 英國能源價格上限）' },
  'meter': { ipa: '/ˈmiː.tə/', def: '電錶、煤氣錶（smart meter = 智能電錶；submit meter reading）' },
  'debit': { ipa: '/ˈdeb.ɪt/', def: '扣款（Direct Debit = 銀行自動轉帳扣款，英國繳費最優惠方式）' },
  'inflation': { ipa: '/ɪnˈfleɪ.ʃən/', def: '通貨膨脹（CPI 通脹率）' },
  'interest': { ipa: '/ˈɪn.trəst/', def: '利息、利率（Bank of England Base Rate 央行基準利率）' },
  'mortgage': { ipa: '/ˈmɔː.ɡɪdʒ/', def: '房屋按揭貸款（注意 t 不發音，讀 /ˈmɔː.ɡɪdʒ/）' },
  'chancellor': { ipa: '/ˈtʃɑːn.səl.ə/', def: '英國財政大臣（Chancellor of the Exchequer）' },
  'household': { ipa: '/ˈhaʊs.həʊld/', def: '家庭、住戶（英音雙元音 /əʊ/）' },
  'budget': { ipa: '/ˈbʌdʒ.ɪt/', def: '預算、財政預算案' },
  'pint': { ipa: '/paɪnt/', def: '品脫（英國酒吧點啤酒標準容量 ≈ 568ml：a pint of lager）' },
  'round': { ipa: '/raʊnd/', def: '一輪酒（英國 Pub 文化：It\'s my round = 這輪我請客）' },
  'bar': { ipa: '/bɑː/', def: '吧台（英國 Pub 傳統需自行去吧台點單付款，不設桌邊點菜）' },
  'queue': { ipa: '/kjuː/', def: '排隊（在英國 Pub 吧台是橫向展開等候，不排單行直線）' },
  'bartender': { ipa: '/ˈbɑːˌten.də/', def: '吧台調酒師、酒保（英國亦常稱 barman / barmaid / bar staff）' },
  'contactless': { ipa: '/ˈkɒn.tækt.ləs/', def: '感應式拍卡支付（Apple Pay / 銀行卡拍卡）' },
  'cheers': { ipa: '/tʃɪəz/', def: '乾杯／謝謝／再見（極高頻英式萬用口頭禪）' },
  'mate': { ipa: '/meɪt/', def: '朋友、老兄（英式親切稱呼：Cheers mate!）' },
  'cuppa': { ipa: '/ˈkʌp.ə/', def: '一杯茶 (a cup of tea，英式日常俚語：Fancy a cuppa?)' },
  'knackered': { ipa: '/ˈnæk.əd/', def: '筋疲力盡、累垮了（極地道英式口語，等同 exhausted）' },
  'gutted': { ipa: '/ˈɡʌt.ɪd/', def: '極度失望、心碎（英式高頻俚語）' },
  'boiler': { ipa: '/ˈbɔɪ.lə/', def: '家用暖氣與熱水鍋爐（combi-boiler 故障屬緊急維修）' },
  'mould': { ipa: '/məʊld/', def: '霉菌、黑霉（英式拼法 mould；damp and mould 潮濕發霉）' },
  'damp': { ipa: '/dæmp/', def: '潮濕、濕氣' },
  'fridge': { ipa: '/frɪdʒ/', def: '雪櫃、冰箱' },
  'water': { ipa: '/ˈwɔː.tə/', def: '水（標準 RP 讀 /ˈwɔː.tə/；倫敦日常口語常帶喉塞音 /ˈwɔː.ʔə/）' },
  'bottle': { ipa: '/ˈbɒt.əl/', def: '瓶子（注意首音節英音短 o /ɒ/ 及詞尾 Dark L [ɫ]）' }
};

function lookupUkWord(rawWord, contextSentence) {
  const clean = String(rawWord || '').replace(/[^a-zA-Z'-]/g, '').trim();
  const lower = clean.toLowerCase();
  const candidates = [
    lower,
    lower.replace(/(?:s|es|ed|ing|ly)$/, ''),
    lower.replace(/ies$/, 'y')
  ];
  for (const c of candidates) {
    if (UK_GLOSSARY[c]) {
      const entry = UK_GLOSSARY[c];
      const ctxPart = contextSentence ? ` · 原句：「${contextSentence.slice(0, 90)}${contextSentence.length > 90 ? '…' : ''}」` : '';
      return {
        ipa: entry.ipa,
        def: entry.def,
        fullTranslation: `${entry.ipa} ${entry.def}${ctxPart}`
      };
    }
  }

  // Automatic UK phonetic feature hints when word is not in core glossary
  const hints = [];
  if (lower.includes('th')) hints.push('含咬舌音 /θ/ 或 /ð/（舌尖輕觸上下齒間）');
  if (/(?:er|or|ar|re)s?$/.test(lower)) hints.push('英音詞尾不捲舌，讀央元音 /ə/');
  if (/[^aeiou]l(?:e|s|d)?$/.test(lower)) hints.push('詞尾含英式 Dark L [ɫ]（舌根向軟顎微抬）');
  if (/\b(?:hot|lot|not|got|cost|stop|shop|clock|box|job|spot|on|off)\b/.test(lower)) hints.push('含英式圓唇短元音 /ɒ/');
  if (/[aeiou]t[aeiou]/.test(lower)) hints.push('母音間 /t/ 英音保持清脆或發喉塞音 /ʔ/，勿美式彈舌');

  const phSummary = hints.length ? hints.join('；') : '🇬🇧 標準英式發音語塊（RP / Modern British）';
  const ctxText = contextSentence
    ? `📖 語境例句：「${contextSentence.slice(0, 100)}${contextSentence.length > 100 ? '…' : ''}」`
    : '點擊「✏️ 編輯筆記」可補充自訂中文解釋';

  return {
    ipa: '🇬🇧 英音發音要點',
    def: `${phSummary}。${ctxText}`,
    fullTranslation: `【${phSummary}】${ctxText}`
  };
}

function extractSentenceNotes(sent) {
  if (!sent) return '';
  const words = String(sent).split(/[^a-zA-Z'-]+/).filter(Boolean);
  const matched = [];
  const seen = new Set();
  for (const w of words) {
    const lower = w.toLowerCase();
    const stem = lower.replace(/(?:s|es|ed|ing)$/, '');
    const key = UK_GLOSSARY[lower] ? lower : (UK_GLOSSARY[stem] ? stem : null);
    if (key && !seen.has(key)) {
      seen.add(key);
      matched.push(`${w} ${UK_GLOSSARY[key].ipa}：${UK_GLOSSARY[key].def.split('（')[0]}`);
      if (matched.length >= 3) break;
    }
  }
  if (matched.length) {
    return '📌 核心詞彙：' + matched.join(' ｜ ');
  }
  const phHints = [];
  if (/\b\w*th\w*\b/i.test(sent)) phHints.push('注意 th 咬舌音 /θ, ð/');
  if (/\b\w+[aeiou]r\s+[aeiou]/i.test(sent)) phHints.push('含英式連讀 Linking R (‿r)');
  if (/\b\w+l\b/i.test(sent)) phHints.push('注意詞尾 Dark L [ɫ]');
  return phHints.length
    ? '🎙️ 發音重點：' + phHints.join(' · ')
    : '🇬🇧 英式生活地道語塊（可點擊「✏️ 編輯筆記」新增個人翻譯）';
}
window.extractSentenceNotes = extractSentenceNotes;

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

let connSpeechEnabled = false;

function annotateConnectedSpeech(sent, enabled) {
  const escFn = (typeof esc === 'function')
    ? esc
    : (s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])));
  const parts = String(sent == null ? '' : sent).split(/(\s+)/);
  const weakSet = new Set(['to', 'for', 'of', 'and', 'from', 'at', 'can', 'have', 'has', 'was', 'than', 'a', 'an']);

  let lastWordIdx = -1;
  for (let k = parts.length - 1; k >= 0; k--) {
    if (/\w+/.test(parts[k])) {
      lastWordIdx = k;
      break;
    }
  }

  let htmlOut = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (/\w+/.test(part)) {
      let cls = 'rd-word';
      let titleAttr = '';
      if (enabled) {
        const cleanLower = part.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '').toLowerCase();
        const nextSep = parts[i + 1] || '';
        const beforeSentEnd = (i === lastWordIdx) || /[.!?]["')\]]*$/.test(part) || /[.!?]/.test(nextSep);
        if (weakSet.has(cleanLower) && !beforeSentEnd) {
          cls = 'rd-word rd-weak';
          titleAttr = ' title="英式虛詞弱讀 (Weak Form)：輕讀短促 /ə/"';
        }
      }
      htmlOut += `<span class="${cls}" style="cursor:pointer"${titleAttr}>${escFn(part)}</span>`;
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
        htmlOut += ' <span class="conn-link-r" title="英式連音 Linking R：詞尾 r 與下一個母音連讀">‿r</span> ';
      } else {
        htmlOut += escFn(part);
      }
    }
  }
  return htmlOut;
}
if (typeof window !== 'undefined') window.annotateConnectedSpeech = annotateConnectedSpeech;

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
      stopShadowRadio();
      dismissWordPopover();
      currentReadingSentences = [];
      document.getElementById('readingInput').value = '';
      document.getElementById('readingStudioCard').classList.add('hidden');
    };
  }

  const toggleConnBtn = document.getElementById('toggleConnSpeechBtn');
  if (toggleConnBtn) {
    toggleConnBtn.classList.toggle('active-toggle', connSpeechEnabled);
    toggleConnBtn.textContent = connSpeechEnabled ? '🔗 連音標註：開' : '🔗 連音標註';
    toggleConnBtn.onclick = () => {
      connSpeechEnabled = !connSpeechEnabled;
      toggleConnBtn.classList.toggle('active-toggle', connSpeechEnabled);
      toggleConnBtn.textContent = connSpeechEnabled ? '🔗 連音標註：開' : '🔗 連音標註';
      if (currentReadingSentences.length) {
        renderReadingStudio(currentReadingSentences);
      }
    };
  }

  const preheatBtn = document.getElementById('preheatReadingBtn');
  if (preheatBtn) preheatBtn.onclick = preheatReadingSentences;
  const shadowRadioBtn = document.getElementById('shadowRadioBtn');
  if (shadowRadioBtn) shadowRadioBtn.onclick = toggleShadowRadio;

  // 事件委派：整個精讀列表只掛一個監聽器處理查詞
  const sentList = document.getElementById('readingSentencesList');
  if (sentList) {
    sentList.addEventListener('click', (e) => {
      const wordEl = e.target.closest && e.target.closest('.rd-word');
      if (!wordEl || !sentList.contains(wordEl)) return;
      e.stopPropagation();
      const itemEl = wordEl.closest('.reading-sentence-item');
      const idx = itemEl ? parseInt(String(itemEl.id).replace('rd-item-', ''), 10) : NaN;
      const sent = !isNaN(idx) ? (currentReadingSentences[idx] || '') : '';
      showWordPopover(wordEl.textContent.trim(), e, sent);
    });
  }
}

let readingQuestRewarded = false;
function rewardReadingEngagement() {
  if (!readingQuestRewarded) {
    readingQuestRewarded = true;
    addProgressionXp(20, '精讀英國長文語塊');
    markDailyQuest('reading');
    const state = getProgressionState();
    state.readingsCount = (state.readingsCount || 0) + 1;
    saveProgressionState(state);
    renderStagesDashboard();
  }
}

let isShadowRadioActive = false;
let shadowRadioTimer = null;
let shadowRadioResolver = null;
let shadowRadioSeq = 0;

function stopShadowRadio(skipAudioStop) {
  ++shadowRadioSeq;
  if (!isShadowRadioActive && !shadowRadioTimer && !shadowRadioResolver) return;
  isShadowRadioActive = false;
  if (shadowRadioTimer) {
    clearTimeout(shadowRadioTimer);
    shadowRadioTimer = null;
  }
  if (shadowRadioResolver) {
    const res = shadowRadioResolver;
    shadowRadioResolver = null;
    res();
  }
  if (!skipAudioStop && typeof stopCurrentUkAudio === 'function') stopCurrentUkAudio();
  if (typeof document !== 'undefined') {
    document.querySelectorAll('.reading-sentence-item').forEach(el => el.classList.remove('playing'));
    const btn = document.getElementById('shadowRadioBtn');
    if (btn) btn.textContent = '🎧 影子連播電台';
  }
}
if (typeof window !== 'undefined') window.stopShadowRadio = stopShadowRadio;

async function preheatReadingSentences() {
  const btn = document.getElementById('preheatReadingBtn');
  if (!currentReadingSentences || !currentReadingSentences.length) {
    if (typeof alertDlg === 'function') alertDlg('請先輸入或載入要精讀的英語長文！');
    return;
  }
  if (typeof ttsCached !== 'function') return;
  if (btn) { btn.disabled = true; btn.textContent = '⏳ 正在預熱...'; }
  let successCount = 0;
  for (let i = 0; i < currentReadingSentences.length; i++) {
    const s = currentReadingSentences[i];
    if (btn) btn.textContent = `⏳ 預熱中 (${i + 1}/${currentReadingSentences.length})...`;
    try {
      await ttsCached(s);
      successCount++;
    } catch (e) {}
  }
  if (btn) {
    btn.textContent = `✅ 已快取 ${successCount} 句至離線庫`;
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = '⚡ 一鍵離線預熱';
    }, 3000);
  }
}

async function preheatDrillsPack() {
  const btn = document.getElementById('preheatDrillsBtn');
  if (!ukDrillsData || !ukDrillsData.length) return;
  if (typeof ttsCached !== 'function') return;
  if (btn) { btn.disabled = true; btn.textContent = '⏳ 預熱中...'; }
  
  const allExamples = [];
  ukDrillsData.forEach(d => (d.examples || []).forEach(ex => allExamples.push(ex.text)));
  let successCount = 0;
  for (let i = 0; i < allExamples.length; i++) {
    const txt = allExamples[i];
    if (btn) btn.textContent = `⏳ 預熱中 (${i + 1}/${allExamples.length})...`;
    try {
      await ttsCached(txt);
      successCount++;
    } catch (e) {}
  }
  if (btn) {
    btn.textContent = `✅ 已快取 ${successCount} 條特訓原聲`;
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = '⚡ 預熱特訓包 (Tube Pack)';
    }, 3000);
  }
}

async function toggleShadowRadio() {
  const btn = (typeof document !== 'undefined') ? document.getElementById('shadowRadioBtn') : null;
  if (isShadowRadioActive) {
    stopShadowRadio();
    return;
  }

  if (!currentReadingSentences || !currentReadingSentences.length) {
    if (typeof alertDlg === 'function') alertDlg('請先輸入或載入要精讀的英語長文！');
    return;
  }

  const myRunSeq = ++shadowRadioSeq;
  isShadowRadioActive = true;
  if (btn) btn.textContent = '⏹️ 停止電台連播';
  rewardReadingEngagement();

  let wasInterruptedExternally = false;
  for (let i = 0; i < currentReadingSentences.length; i++) {
    if (!isShadowRadioActive || myRunSeq !== shadowRadioSeq) break;
    const sent = currentReadingSentences[i];
    if (typeof document !== 'undefined') {
      const item = document.getElementById('rd-item-' + i);
      document.querySelectorAll('.reading-sentence-item').forEach(el => el.classList.remove('playing'));
      if (item) {
        item.classList.add('playing');
        if (item.scrollIntoView) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    if (btn) {
      btn.textContent = '🔊 朗讀中 (' + (i + 1) + '/' + currentReadingSentences.length + ')… — 點擊停止';
    }

    const playRes = await playUkVoice(sent);
    if (myRunSeq !== shadowRadioSeq) return;
    if (!isShadowRadioActive || (playRes && playRes.interrupted)) {
      if (playRes && playRes.interrupted) wasInterruptedExternally = true;
      break;
    }

    const wordCount = sent.split(/\s+/).filter(Boolean).length;
    const baseMs = (playRes && playRes.durationMs > 400) ? playRes.durationMs : Math.max(1800, wordCount * 360);
    const shadowDelayMs = Math.max(1800, Math.min(12000, Math.round(baseMs * 1.15)));

    if (btn) {
      btn.textContent = '🎙️ 請跟讀 (' + (i + 1) + '/' + currentReadingSentences.length + ')… — 點擊停止';
    }

    await new Promise(resolve => {
      shadowRadioResolver = resolve;
      shadowRadioTimer = setTimeout(() => {
        shadowRadioTimer = null;
        shadowRadioResolver = null;
        resolve();
      }, shadowDelayMs);
    });
    if (myRunSeq !== shadowRadioSeq) return;
  }

  if (myRunSeq === shadowRadioSeq) {
    stopShadowRadio(wasInterruptedExternally);
  }
}

function analyzeReadingText(rawText) {
  if (!rawText) return;
  stopShadowRadio();
  dismissWordPopover();
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

  readingQuestRewarded = false;
  renderReadingStudio(currentReadingSentences);
  document.getElementById('readingStudioCard').classList.remove('hidden');
}

function renderReadingStudio(sentences) {
  const container = document.getElementById('readingSentencesList');
  if (!container) return;
  container.innerHTML = '';

  sentences.forEach((sent, idx) => {
    const item = document.createElement('div');
    item.className = 'reading-sentence-item';
    item.id = 'rd-item-' + idx;

    const wrappedHtml = annotateConnectedSpeech(sent, connSpeechEnabled);

    item.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <b style="color:#7c3aed;font-size:12px">Chunk ${String(idx + 1).padStart(2, '0')}</b>
      </div>
      <div class="sentence-text-wrap" id="rd-text-${idx}">${wrappedHtml}</div>
      <div class="sentence-actions">
        <button class="btn-sm" id="rd-play-${idx}" type="button">🔊 朗讀</button>
        <button class="btn-sm" id="rd-shadow-${idx}" type="button" title="${(typeof t === 'function' ? t('sent.loadPractice') : '載入句子練習')}">🎙️ 跟讀特訓</button>
        <button class="btn-sm" id="rd-add-${idx}" type="button">⭐ 加至重溫</button>
      </div>
    `;

    item.querySelector('#rd-play-' + idx).onclick = () => {
      rewardReadingEngagement();
      document.querySelectorAll('.reading-sentence-item').forEach(el => el.classList.remove('playing'));
      item.classList.add('playing');
      playUkVoice(sent);
    };

    item.querySelector('#rd-shadow-' + idx).onclick = () => {
      rewardReadingEngagement();
      switchTab('practice');
      if (typeof selectSentence === 'function') {
        selectSentence(sent, true);
      } else {
        const stBox = document.getElementById('sentenceText');
        if (stBox) stBox.value = sent;
        if (typeof autoGrowTextarea === 'function' && stBox) autoGrowTextarea(stBox);
        if (typeof genRefAudio === 'function') genRefAudio(sent, true).catch(() => {});
      }
    };

    item.querySelector('#rd-add-' + idx).onclick = async (e) => {
      await addReviewItem({
        text: sent,
        translation: extractSentenceNotes(sent),
        context: '長文精讀 Chunk ' + (idx + 1),
        type: 'sentence',
        stage: 3
      });
      e.target.textContent = '✅ 已收錄';
      e.target.disabled = true;
    };

    container.appendChild(item);
  });
}

const aiWordExplainCache = new Map();
let popoverAiAbort = null;
let popoverHideTimer = null;

function cancelPopoverPending() {
  if (popoverAiAbort) {
    try { popoverAiAbort.abort(); } catch (e) {}
    popoverAiAbort = null;
  }
  if (popoverHideTimer) {
    clearTimeout(popoverHideTimer);
    popoverHideTimer = null;
  }
}

function dismissWordPopover() {
  cancelPopoverPending();
  if (typeof document !== 'undefined') {
    const pop = document.getElementById('wordPopover');
    if (pop) pop.classList.add('hidden');
  }
}

function buildAiCardNote(info, aiRes, contextSentence) {
  if (!aiRes) return info.fullTranslation;
  const ipaPart = aiRes.ipa ? aiRes.ipa : (info.ipa || '');
  const meaningPart = aiRes.meaning ? aiRes.meaning : (aiRes.formatted || '');
  if (!meaningPart) return info.fullTranslation;
  const tipPart = aiRes.tip ? (' ｜ 💡 ' + aiRes.tip) : '';
  const ctxPart = contextSentence ? (' · 原句：「' + contextSentence.slice(0, 90) + (contextSentence.length > 90 ? '…' : '') + '」') : '';
  return ((ipaPart ? ipaPart + ' ' : '') + meaningPart + tipPart + ctxPart).trim();
}

function renderPopoverAiExplanation(container, aiRes) {
  if (!container || !aiRes) return;
  container.innerHTML = '';
  if (aiRes.ipa) {
    const ipaLine = document.createElement('div');
    ipaLine.style.cssText = 'color:#c4b5fd;font-size:11px;margin-bottom:2px';
    ipaLine.textContent = '🇬🇧 語境音標：' + aiRes.ipa;
    container.appendChild(ipaLine);
  }
  if (aiRes.meaning) {
    const mLine = document.createElement('div');
    mLine.style.cssText = 'font-weight:600;color:#f8fafc;margin-bottom:2px';
    mLine.textContent = '✨ 語境釋義：' + aiRes.meaning;
    container.appendChild(mLine);
  }
  if (aiRes.tip) {
    const tipLine = document.createElement('div');
    tipLine.style.cssText = 'color:#cbd5e1;font-size:11px';
    tipLine.textContent = '💡 英式用法：' + aiRes.tip;
    container.appendChild(tipLine);
  }
  if (!aiRes.meaning && !aiRes.tip && aiRes.formatted) {
    const rawLine = document.createElement('div');
    rawLine.textContent = aiRes.formatted;
    container.appendChild(rawLine);
  }
  container.classList.remove('hidden');
}

function showWordPopover(word, event, contextSentence) {
  const popover = document.getElementById('wordPopover');
  if (!popover) return;
  const cleanWord = word.replace(/[^a-zA-Z'-]/g, '').slice(0, 50);
  if (!cleanWord) return;

  cancelPopoverPending();

  const info = lookupUkWord(cleanWord, contextSentence);
  const cacheKey = cleanWord.toLowerCase() + '||' + (contextSentence || '').slice(0, 120);
  const cachedAi = aiWordExplainCache.get(cacheKey) || null;
  let hasAiExplain = !!cachedAi;
  let activeCardNote = cachedAi ? buildAiCardNote(info, cachedAi, contextSentence) : info.fullTranslation;
  let wasAdded = false;

  document.getElementById('popoverWord').textContent = cleanWord;
  document.getElementById('popoverPh').textContent = (cachedAi && cachedAi.ipa) ? cachedAi.ipa : info.ipa;
  document.getElementById('popoverDef').textContent = info.def;

  const aiResEl = document.getElementById('popoverAiResult');
  const aiBtn = document.getElementById('popoverAiBtn');
  if (aiBtn) {
    aiBtn.disabled = false;
    aiBtn.textContent = '✨ AI 語境精解';
  }
  if (aiResEl) {
    if (cachedAi) {
      renderPopoverAiExplanation(aiResEl, cachedAi);
    } else {
      aiResEl.innerHTML = '';
      aiResEl.classList.add('hidden');
    }
  }

  const addBtn = document.getElementById('popoverAddBtn');
  if (addBtn) {
    addBtn.textContent = '⭐ 加至重溫';
    addBtn.disabled = false;
  }

  document.getElementById('popoverHearBtn').onclick = () => playUkVoice(cleanWord);
  if (addBtn) {
    addBtn.onclick = async () => {
      wasAdded = true;
      await addReviewItem({
        text: cleanWord,
        translation: activeCardNote,
        context: contextSentence ? `精讀語境: ${contextSentence.slice(0, 65)}${contextSentence.length > 65 ? '…' : ''}` : '精讀生詞',
        type: 'collocation',
        stage: 2,
        overwriteTranslation: hasAiExplain
      });
      addBtn.textContent = '✅ 已收錄';
      addBtn.disabled = true;
      if (!popoverAiAbort) {
        if (popoverHideTimer) clearTimeout(popoverHideTimer);
        popoverHideTimer = setTimeout(() => {
          popoverHideTimer = null;
          popover.classList.add('hidden');
        }, 450);
      }
    };
  }

  if (aiBtn) {
    aiBtn.onclick = async () => {
      if (popoverHideTimer) {
        clearTimeout(popoverHideTimer);
        popoverHideTimer = null;
      }
      const existingCached = aiWordExplainCache.get(cacheKey);
      if (existingCached) {
        hasAiExplain = true;
        activeCardNote = buildAiCardNote(info, existingCached, contextSentence);
        if (existingCached.ipa) {
          const phEl = document.getElementById('popoverPh');
          if (phEl) phEl.textContent = existingCached.ipa;
        }
        if (aiResEl) renderPopoverAiExplanation(aiResEl, existingCached);
        if (addBtn && (wasAdded || addBtn.disabled)) {
          addBtn.disabled = false;
          addBtn.textContent = '⭐ 更新重溫筆記';
        }
        return;
      }

      if (popoverAiAbort) {
        try { popoverAiAbort.abort(); } catch (e) {}
      }
      const ctrl = new AbortController();
      popoverAiAbort = ctrl;

      aiBtn.disabled = true;
      aiBtn.textContent = '⏳ 解析中…';
      if (aiResEl) {
        aiResEl.innerHTML = '';
        aiResEl.textContent = '⏳ AI 正在結合原句解析英式用法…';
        aiResEl.classList.remove('hidden');
      }

      try {
        if (typeof window === 'undefined' || typeof window.askAiContextualExplain !== 'function') {
          throw new Error('AI 語境精解服務尚未就緒');
        }
        const aiRes = await window.askAiContextualExplain(cleanWord, contextSentence || '', ctrl.signal);
        if (ctrl.signal.aborted) return;
        if (aiWordExplainCache.size >= 200) {
          const oldestKey = aiWordExplainCache.keys().next().value;
          if (oldestKey !== undefined) aiWordExplainCache.delete(oldestKey);
        }
        aiWordExplainCache.set(cacheKey, aiRes);
        hasAiExplain = true;
        activeCardNote = buildAiCardNote(info, aiRes, contextSentence);
        if (aiRes && aiRes.ipa) {
          const phEl = document.getElementById('popoverPh');
          if (phEl) phEl.textContent = aiRes.ipa;
        }
        if (aiResEl) renderPopoverAiExplanation(aiResEl, aiRes);
        aiBtn.disabled = false;
        aiBtn.textContent = '✨ AI 語境精解';
        if (addBtn && (wasAdded || addBtn.disabled)) {
          addBtn.disabled = false;
          addBtn.textContent = '⭐ 更新重溫筆記';
        }
      } catch (err) {
        if (ctrl.signal.aborted || (err && err.name === 'AbortError')) return;
        aiBtn.disabled = false;
        aiBtn.textContent = '✨ AI 語境精解';
        if (aiResEl) {
          aiResEl.innerHTML = '';
          const errSpan = document.createElement('span');
          errSpan.style.color = '#fca5a5';
          errSpan.textContent = '⚠️ ' + ((err && err.message) ? err.message : 'AI 語境解析暫時無法使用，請檢查網絡或 API 設定');
          aiResEl.appendChild(errSpan);
          aiResEl.classList.remove('hidden');
        }
      } finally {
        if (popoverAiAbort === ctrl) popoverAiAbort = null;
      }
    };
  }

  document.getElementById('popoverCloseBtn').onclick = () => {
    cancelPopoverPending();
    popover.classList.add('hidden');
  };

  const rect = event && event.target && event.target.getBoundingClientRect
    ? event.target.getBoundingClientRect()
    : { left: (event && event.clientX) || 100, bottom: (event && event.clientY) || 100 };
  const pageX = rect.left + window.scrollX;
  const pageY = rect.bottom + window.scrollY;

  popover.style.left = Math.min(window.innerWidth - 300, Math.max(10, pageX - 40)) + 'px';
  popover.style.top = (pageY + 8) + 'px';
  popover.classList.remove('hidden');
}

/* ================= 英國在地化：4階晉級通關體系與特訓 (Staged Progression) ================= */

let ukStagesData = [];
let ukDrillsData = [];

function localDayStr() {
  if (typeof usageDay === 'function') return usageDay();
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getProgressionState() {
  const today = localDayStr();
  try {
    const raw = localStorage.getItem(LS_PROGRESSION);
    if (raw) {
      const state = JSON.parse(raw);
      if (typeof state.dailyReviewsDone !== 'number' || isNaN(state.dailyReviewsDone)) {
        state.dailyReviewsDone = 0;
      }
      if (state.dailyDate !== today) {
        const prevMs = Date.parse(state.dailyDate + 'T00:00:00Z');
        const currMs = Date.parse(today + 'T00:00:00Z');
        const diffDays = !isNaN(prevMs) ? Math.round((currMs - prevMs) / 86400000) : 0;
        state.streakDays = diffDays === 1 ? (Number(state.streakDays) || 1) + 1 : 1;
        state.dailyDate = today;
        state.dailyReviewsDone = 0;
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
    dailyReviewsDone: 0,
    readingsCount: 0,
    quests: { review: false, reading: false, chat: false },
    completedMissions: []
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
    const bonusXp = questKey === 'review' ? 30 : 35;
    state.xp = (state.xp || 0) + bonusXp;
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

const UK_STAGE_MISSION_OPENERS = {
  m1: "Excuse me, could you give me a hand with the self-checkout? It's asking for approval.",
  m2: "Can I have a flat white with oat milk and a warm sausage roll, please?",
  m3: "Hi there, I've got a collection slip for a parcel, and I'd also like to return this prepaid package.",
  m4: "Excuse me, which platform is for the next train to Victoria? My Oyster card doesn't seem to tap in.",
  m5: "Good morning, I'm calling to book a triage appointment with a GP today. My name is Alex and my postcode is SW1A 1AA.",
  m6: "Hello, I'd like to report a missed wheelie bin collection on our street and check my Council Tax direct debit.",
  m7: "Hi, I'd like to open a current account and I've brought my passport and tenancy agreement as proof of address.",
  m8: "Hello, I'm calling to submit our latest electricity meter reading and report an intermittent broadband outage.",
  m9: "Good morning, our combi-boiler has completely shut down and we've had no heating or hot water for over 24 hours.",
  m10: "I'm writing regarding the proposed deductions from our tenancy deposit; the checkout inventory clearly shows this is fair wear and tear.",
  m11: "I see your point, but I'm not entirely convinced that this timeline is realistic given our current resource constraints.",
  m12: "Under the statutory tenancy regulations, the landlord is legally obligated to keep in repair the structure and exterior of the dwelling.",
  m13: "Hi mate, could I get a pint of London Pride and a packet of salt and vinegar crisps, please? Next round is on me.",
  m14: "Miserable out there, isn't it? Typical British summer! Any exciting plans for the weekend if it clears up?",
  m15: "The recent economic forecast raises fundamental questions about long-term fiscal policy and public sector investment in the UK."
};

const UK_STAGE_MISSION_PROMPTS = {
  m1: 'default', m2: 'default', m3: 'default', m4: 'default',
  m5: 'uk_gp', m6: 'uk_council', m7: 'uk_council', m8: 'uk_council',
  m9: 'uk_tenancy', m10: 'uk_tenancy', m11: 'default', m12: 'uk_reading',
  m13: 'uk_banter', m14: 'uk_banter', m15: 'uk_reading'
};
if (typeof window !== 'undefined') window.UK_STAGE_MISSION_PROMPTS = UK_STAGE_MISSION_PROMPTS;

let activeStageMissionId = null;
if (typeof window !== 'undefined') window.activeStageMissionId = null;

function renderActiveMissionBanner() {
  if (typeof document === 'undefined') return;
  const banner = document.getElementById('activeMissionBanner');
  if (!banner) return;
  if (!activeStageMissionId) {
    banner.innerHTML = '';
    banner.classList.add('hidden');
    return;
  }

  let missionTitle = '英國實戰任務 ' + String(activeStageMissionId).toUpperCase();
  let missionXp = 30;
  if (Array.isArray(ukStagesData)) {
    for (const stg of ukStagesData) {
      const found = (stg.missions || []).find(m => m.id === activeStageMissionId);
      if (found) {
        missionTitle = found.title || missionTitle;
        missionXp = found.xp || 30;
        break;
      }
    }
  }
  const tplId = UK_STAGE_MISSION_PROMPTS[activeStageMissionId] || 'default';
  const opener = UK_STAGE_MISSION_OPENERS[activeStageMissionId] || '';

  banner.innerHTML = '';
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap';

  const left = document.createElement('div');
  left.style.cssText = 'flex:1;min-width:200px';

  const titleRow = document.createElement('div');
  titleRow.style.cssText = 'font-weight:700;font-size:13px;color:#312e81;display:flex;align-items:center;gap:6px;flex-wrap:wrap';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = '🎯 實戰挑戰中：' + missionTitle;
  const xpBadge = document.createElement('span');
  xpBadge.style.cssText = 'background:#e0e7ff;color:#4338ca;font-size:11px;padding:1px 6px;border-radius:999px;font-weight:600';
  xpBadge.textContent = '+' + missionXp + ' XP';
  titleRow.appendChild(titleSpan);
  titleRow.appendChild(xpBadge);

  const subRow = document.createElement('div');
  subRow.style.cssText = 'font-size:12px;color:#475569;margin-top:3px';
  subRow.textContent = '跟讀下方開場白達 75+ 分即可通關，或點擊右側與 AI 展開實戰交涉';

  left.appendChild(titleRow);
  left.appendChild(subRow);

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap';

  const roleplayBtn = document.createElement('button');
  roleplayBtn.type = 'button';
  roleplayBtn.className = 'btn-sm primary';
  roleplayBtn.textContent = '💬 載入劇本並與 AI 對練';
  roleplayBtn.onclick = () => {
    if (typeof window !== 'undefined' && typeof window.activateMissionRoleplay === 'function') {
      Promise.resolve(window.activateMissionRoleplay(tplId, opener, true)).catch(() => {});
    }
  };

  const endBtn = document.createElement('button');
  endBtn.type = 'button';
  endBtn.className = 'btn-sm';
  endBtn.textContent = '✕ 結束挑戰';
  endBtn.onclick = () => {
    activeStageMissionId = null;
    if (typeof window !== 'undefined') window.activeStageMissionId = null;
    renderActiveMissionBanner();
  };

  actions.appendChild(roleplayBtn);
  actions.appendChild(endBtn);

  row.appendChild(left);
  row.appendChild(actions);
  banner.appendChild(row);
  banner.classList.remove('hidden');
}
if (typeof window !== 'undefined') window.renderActiveMissionBanner = renderActiveMissionBanner;

function launchStageMission(missionId) {
  const opener = UK_STAGE_MISSION_OPENERS[missionId];
  if (!opener) return;
  activeStageMissionId = missionId;
  if (typeof window !== 'undefined') window.activeStageMissionId = missionId;
  const tplId = UK_STAGE_MISSION_PROMPTS[missionId] || 'default';
  switchTab('practice');
  if (typeof renderActiveMissionBanner === 'function') renderActiveMissionBanner();
  if (typeof window !== 'undefined' && typeof window.activateMissionRoleplay === 'function') {
    Promise.resolve(window.activateMissionRoleplay(tplId, opener, false)).catch(() => {});
  }
  if (typeof selectSentence === 'function') {
    selectSentence(opener, true);
  } else {
    const stBox = document.getElementById('sentenceText');
    if (stBox) stBox.value = opener;
    if (typeof autoGrowTextarea === 'function' && stBox) autoGrowTextarea(stBox);
    if (typeof genRefAudio === 'function') genRefAudio(opener, true).catch(() => {});
  }
}

function completeStageMission(missionId) {
  if (!missionId) return;
  const state = getProgressionState();
  state.completedMissions = state.completedMissions || [];
  if (!state.completedMissions.includes(missionId)) {
    state.completedMissions.push(missionId);
    let missionXp = 30;
    if (Array.isArray(ukStagesData)) {
      for (const stg of ukStagesData) {
        const found = (stg.missions || []).find(m => m.id === missionId);
        if (found) { missionXp = found.xp || 30; break; }
      }
    }
    state.xp = (state.xp || 0) + missionXp;
    state.level = state.xp >= 2500 ? 4 : state.xp >= 1000 ? 3 : state.xp >= 300 ? 2 : 1;
    saveProgressionState(state);
    renderStagesDashboard();
    if (typeof alertDlg === 'function') {
      alertDlg(`🎉 恭喜通關英國實戰任務！獲得 +${missionXp} XP！`);
    }
  }
  activeStageMissionId = null;
  if (typeof window !== 'undefined') window.activeStageMissionId = null;
  if (typeof renderActiveMissionBanner === 'function') renderActiveMissionBanner();
}
if (typeof window !== 'undefined') window.completeStageMission = completeStageMission;

function renderStagesDashboard() {
  const state = getProgressionState();
  const xp = state.xp || 0;

  const level = xp >= 2500 ? 4 : xp >= 1000 ? 3 : xp >= 300 ? 2 : 1;
  const stageObj = Array.isArray(ukStagesData) ? ukStagesData.find(s => Number(s.level) === level) : null;

  let maxLevelXp = stageObj && stageObj.xpRequired ? stageObj.xpRequired : (level === 4 ? 5000 : level === 3 ? 2500 : level === 2 ? 1000 : 300);
  let levelName = stageObj ? `Level ${stageObj.level}: ${stageObj.name}` : 'Level 1: 英國生存突破 (Survival UK)';
  let levelDesc = stageObj ? stageObj.description : '攻克基礎生活交易，消除開口焦慮。自如應對超市、外賣、郵局與地鐵。';
  let badgeIcon = stageObj ? stageObj.badge : (level === 4 ? '💎' : level === 3 ? '🥇' : level === 2 ? '🥈' : '🥉');

  if (!stageObj) {
    if (level === 4) {
      levelName = 'Level 4: 文化融入與職場自如 (Cultural Fluency)';
      levelDesc = '融會英式委婉語與幽默自嘲，流暢自如，真正融入在地社區與英倫職場。';
    } else if (level === 3) {
      levelName = 'Level 3: 獨立維權與長文閱讀 (Autonomy & Reading)';
      levelDesc = '看懂官方規例、長篇合約與租約條款，用堅定而禮貌的英式表達捍衛權益。';
    } else if (level === 2) {
      levelName = 'Level 2: 生活事務自主 (Daily Affairs)';
      levelDesc = '掌握英國核心行政、GP 醫療、市政稅與水電公務交涉，生活無求於人。';
    }
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
    const revDone = q.review ? 5 : Math.min(5, state.dailyReviewsDone || 0);
    questsWrap.innerHTML = `
      <div class="quest-item ${q.review ? 'done' : ''}">
        <span>${q.review ? '✅' : '⭕'} 晨間重溫 5 個在地語塊 (${revDone}/5) (+30 XP)</span>
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

  // Stage Targets Checklist
  const targetsWrap = document.getElementById('stageTargetsList');
  if (targetsWrap && stageObj && stageObj.targets) {
    let totalPracticeCount = 0, totalScore = 0, scoreCount = 0;
    let totalFluency = 0, fluCount = 0;
    let totalProsody = 0, proCount = 0;
    if (typeof getConvs === 'function') {
      try {
        getConvs().forEach(c => (c.records || []).forEach(r => {
          totalPracticeCount++;
          if (typeof r.score === 'number' && r.score > 0) {
            totalScore += r.score;
            scoreCount++;
          }
          if (typeof r.fluency === 'number' && r.fluency > 0) {
            totalFluency += r.fluency;
            fluCount++;
          }
          if (typeof r.prosody === 'number' && r.prosody > 0) {
            totalProsody += r.prosody;
            proCount++;
          }
        }));
      } catch (e) {}
    }
    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    const avgFluency = fluCount > 0 ? Math.round(totalFluency / fluCount) : avgScore;
    const avgProsody = proCount > 0 ? Math.round(totalProsody / proCount) : avgScore;
    const reviewsCount = reviewsCache.length;
    const masteredCount = reviewsCache.filter(r => (r.interval || 0) >= 21 || (r.reps || 0) >= 3).length;

    const targets = stageObj.targets;
    const items = [];
    if (targets.conversations != null) {
      items.push({ label: '情境對話／跟讀次數', curr: totalPracticeCount, target: targets.conversations });
    }
    if (targets.avgScore != null) {
      items.push({ label: '平均發音準確分', curr: avgScore, target: targets.avgScore, unit: '分' });
    }
    if (targets.fluency != null) {
      items.push({ label: '流利度指標', curr: avgFluency, target: targets.fluency, unit: '分' });
    }
    if (targets.prosody != null) {
      items.push({ label: '節奏韻律指標', curr: avgProsody, target: targets.prosody, unit: '分' });
    }
    if (targets.readings != null) {
      items.push({ label: '長文精讀篇數', curr: state.readingsCount || 0, target: targets.readings, unit: '篇' });
    }
    if (targets.reviews != null) {
      items.push({ label: '收錄在地語塊', curr: reviewsCount, target: targets.reviews, unit: '條' });
    }
    if (targets.masteredPhrases != null) {
      items.push({ label: '熟練掌握語塊', curr: masteredCount, target: targets.masteredPhrases, unit: '條' });
    }

    targetsWrap.innerHTML = items.map(it => {
      const ok = it.curr >= it.target;
      const unit = it.unit || '';
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px">
        <span>${ok ? '✅' : '🎯'} ${esc(it.label)}</span>
        <span style="font-weight:600;color:${ok ? '#10b981' : '#64748b'}">${it.curr}${unit} / ${it.target}${unit}</span>
      </div>`;
    }).join('');
  }

  // 15 Stage Missions
  const missionsWrap = document.getElementById('stageMissionsList');
  if (missionsWrap && Array.isArray(ukStagesData) && ukStagesData.length) {
    const completed = state.completedMissions || [];
    const countEl = document.getElementById('stageMissionsProgress');
    if (countEl) countEl.textContent = `${completed.length} / 15 完成`;

    missionsWrap.innerHTML = '';
    ukStagesData.forEach(stg => {
      const stgBlock = document.createElement('div');
      stgBlock.style.cssText = 'margin-bottom:12px';
      const stgHeader = document.createElement('div');
      stgHeader.style.cssText = 'font-size:12px;font-weight:bold;color:#475569;margin-bottom:6px;display:flex;align-items:center;gap:6px';
      stgHeader.innerHTML = `${stg.badge} <b>Stage ${stg.level}: ${esc(stg.name)}</b>`;
      stgBlock.appendChild(stgHeader);

      (stg.missions || []).forEach(m => {
        const isDone = completed.includes(m.id);
        const mRow = document.createElement('div');
        mRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 10px;margin-bottom:6px;background:' + (isDone ? '#f0fdf4' : '#f8fafc') + ';border:1px solid ' + (isDone ? '#bbf7d0' : '#e2e8f0') + ';border-radius:6px;font-size:13px';
        mRow.innerHTML = `
          <div style="flex:1;min-width:0;margin-right:8px">
            <div style="font-weight:500;color:#1e293b;display:flex;align-items:center;gap:6px">
              <span>${isDone ? '✅' : '⭕'}</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.title)}</span>
            </div>
            <div style="font-size:11px;color:#64748b;margin-left:22px">
              <span class="badge" style="background:#e0e7ff;color:#3730a3;font-size:10px;padding:1px 5px">${esc(m.category)}</span>
              <span style="margin-left:4px">+${m.xp} XP</span>
            </div>
          </div>
          <button class="btn-sm" type="button" style="flex:none">${isDone ? '再次演練' : '🎯 挑戰'}</button>
        `;
        mRow.querySelector('button').onclick = () => launchStageMission(m.id);
        stgBlock.appendChild(mRow);
      });
      missionsWrap.appendChild(stgBlock);
    });
  }

  renderPersonalWeaknessRadar();
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
      const loadTxt = (typeof t === 'function' ? t('sent.loadPractice') : ((typeof getSettings === 'function' && getSettings().uiLang === 'en') ? 'Load into Practice' : '載入句子練習'));
      shadowBtn.title = loadTxt;
      shadowBtn.setAttribute('aria-label', loadTxt);
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
  switchTab('practice');
  if (typeof selectSentence === 'function') {
    selectSentence(text, true);
  } else {
    const stBox = document.getElementById('sentenceText');
    if (stBox) stBox.value = text;
    if (typeof autoGrowTextarea === 'function' && stBox) autoGrowTextarea(stBox);
    if (typeof genRefAudio === 'function') genRefAudio(text, true).catch(() => {});
  }
}

/* ================= 英國在地化：導航分頁與全域聯動 (Navigation & Hooks) ================= */

let currentActiveTab = 'practice';

function switchTab(tabId) {
  currentActiveTab = tabId;
  if (typeof window !== 'undefined') window.currentActiveTab = tabId;

  if (tabId !== 'reading') {
    stopShadowRadio();
    dismissWordPopover();
  }
  if (tabId !== 'review' && reviewAutoTimer) {
    clearTimeout(reviewAutoTimer);
    reviewAutoTimer = null;
  }
  if (tabId !== 'practice') pendingReviewAssessmentId = null;

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

  const pbSearch = document.getElementById('phrasebookSearch');
  if (pbSearch) {
    pbSearch.oninput = () => {
      phrasebookSearchQuery = pbSearch.value || '';
      phrasebookRenderLimit = 50;
      renderPhrasebookList();
    };
  }

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
      const info = (activePhKey && PHONETIC_GUIDE[activePhKey]) ? PHONETIC_GUIDE[activePhKey] : null;
      const textToPlay = info ? (info.sampleVoiceText || info.sampleWord) : (document.getElementById('phModalWord').textContent || 'water');
      playUkVoice(textToPlay);
    };
  }

  const pracPhBtn = document.getElementById('phModalPracticeBtn');
  if (pracPhBtn) {
    pracPhBtn.onclick = () => {
      const info = (activePhKey && PHONETIC_GUIDE[activePhKey]) ? PHONETIC_GUIDE[activePhKey] : null;
      const practiceText = info ? (info.sampleVoiceText || info.sampleWord) : (document.getElementById('phModalWord').textContent || '');
      closePhoneticModal();
      switchTab('practice');
      if (typeof selectSentence === 'function') {
        selectSentence(practiceText, true);
      } else {
        const stBox = document.getElementById('sentenceText');
        if (stBox) stBox.value = practiceText;
        if (typeof autoGrowTextarea === 'function' && stBox) autoGrowTextarea(stBox);
        if (typeof genRefAudio === 'function') genRefAudio(practiceText, true).catch(() => {});
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
      e.target.value = '';
    };
  }

  const preheatDrillsBtn = document.getElementById('preheatDrillsBtn');
  if (preheatDrillsBtn) preheatDrillsBtn.onclick = preheatDrillsPack;

  // Dismiss popover when clicking outside
  document.addEventListener('click', (e) => {
    const popover = document.getElementById('wordPopover');
    if (popover && !popover.classList.contains('hidden')) {
      if (!popover.contains(e.target) && !e.target.classList.contains('rd-word')) {
        cancelPopoverPending();
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
    renderActiveMissionBanner();
  });
}

// Memory-leak-proof Audio player with strict URL release and concurrent lock
let currentUkAudio = null;
let currentUkAudioUrl = null;
let currentUkAudioDone = null;
let ukVoiceSeq = 0; // 單調遞增請求序號：丟棄先發後至的舊請求

function stopCurrentUkAudio() {
  ++ukVoiceSeq;
  if (currentUkAudio) {
    try {
      currentUkAudio.onended = null;
      currentUkAudio.onerror = null;
      currentUkAudio.onpause = null;
      currentUkAudio.pause();
      currentUkAudio.src = '';
    } catch (e) {}
    currentUkAudio = null;
  }
  if (currentUkAudioUrl) {
    try { URL.revokeObjectURL(currentUkAudioUrl); } catch (e) {}
    currentUkAudioUrl = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }
  if (currentUkAudioDone) {
    const done = currentUkAudioDone;
    currentUkAudioDone = null;
    done({ durationMs: 0, interrupted: true });
  }
}

async function playUkVoice(text, forceOffline) {
  if (!text) return { durationMs: 0, interrupted: false };
  if (typeof window !== 'undefined' && typeof window.isAudioRecordingActive === 'function' && window.isAudioRecordingActive()) {
    return { durationMs: 0, interrupted: true };
  }

  stopCurrentUkAudio();
  const mySeq = ++ukVoiceSeq;

  const s = (typeof getSettings === 'function') ? getSettings() : {};
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const cloudReady = !forceOffline && !isOffline && ((typeof canUseCloudTts === 'function') ? canUseCloudTts(s) : !!(s.azureKey && s.azureRegion));
  if (cloudReady && typeof ttsCached === 'function') {
    try {
      const res = await ttsCached(text);
      if (mySeq !== ukVoiceSeq) return { durationMs: 0, interrupted: true };
      if (typeof window !== 'undefined' && typeof window.isAudioRecordingActive === 'function' && window.isAudioRecordingActive()) {
        return { durationMs: 0, interrupted: true };
      }

      const url = URL.createObjectURL(res.blob);
      currentUkAudioUrl = url;
      const a = new Audio(url);
      currentUkAudio = a;
      const startedAt = Date.now();

      const playOutcome = await new Promise((resolve) => {
        let settled = false;
        const finish = (outcome) => {
          if (settled) return;
          settled = true;
          if (currentUkAudioDone === finish) currentUkAudioDone = null;
          if (currentUkAudioUrl === url) {
            try { URL.revokeObjectURL(url); } catch (e) {}
            currentUkAudioUrl = null;
          }
          if (currentUkAudio === a) currentUkAudio = null;
          resolve(outcome);
        };
        currentUkAudioDone = finish;

        a.onended = () => {
          const dur = (Number.isFinite(a.duration) && a.duration > 0)
            ? Math.round(a.duration * 1000)
            : Math.max(0, Date.now() - startedAt);
          finish({ durationMs: dur, interrupted: false });
        };
        a.onerror = () => {
          finish({ durationMs: 0, interrupted: false, failed: true });
        };

        const p = a.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            finish({ durationMs: 0, interrupted: false, failed: true });
          });
        }
      });

      if (playOutcome && !playOutcome.failed) {
        return { durationMs: playOutcome.durationMs, interrupted: !!playOutcome.interrupted };
      }
      if (mySeq !== ukVoiceSeq || (playOutcome && playOutcome.interrupted)) {
        return { durationMs: 0, interrupted: true };
      }
    } catch (e) {
      if (mySeq !== ukVoiceSeq) return { durationMs: 0, interrupted: true };
      if (currentUkAudioUrl) {
        try { URL.revokeObjectURL(currentUkAudioUrl); } catch (err) {}
        currentUkAudioUrl = null;
      }
      currentUkAudio = null;
    }
  }

  if (mySeq !== ukVoiceSeq) return { durationMs: 0, interrupted: true };
  if (typeof window !== 'undefined' && typeof window.isAudioRecordingActive === 'function' && window.isAudioRecordingActive()) {
    return { durationMs: 0, interrupted: true };
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
    try { window.speechSynthesis.cancel(); } catch (e) {}
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-GB';
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const gbVoice = voices.find(v => v.lang === 'en-GB' || v.lang === 'en_GB');
    if (gbVoice) utt.voice = gbVoice;

    const startedAt = Date.now();
    const timeoutMs = Math.max(8000, text.length * 180);

    return await new Promise((resolve) => {
      let settled = false;
      let safetyTimer = null;
      const finish = (outcome) => {
        if (settled) return;
        settled = true;
        if (safetyTimer) {
          clearTimeout(safetyTimer);
          safetyTimer = null;
        }
        if (currentUkAudioDone === finish) currentUkAudioDone = null;
        resolve(outcome);
      };
      currentUkAudioDone = finish;

      safetyTimer = setTimeout(() => {
        finish({ durationMs: Math.max(0, Date.now() - startedAt), interrupted: false });
      }, timeoutMs);

      utt.onend = () => {
        finish({ durationMs: Math.max(0, Date.now() - startedAt), interrupted: false });
      };
      utt.onerror = (ev) => {
        const wasCanceled = !!(ev && (ev.error === 'canceled' || ev.error === 'interrupted'));
        finish({ durationMs: Math.max(0, Date.now() - startedAt), interrupted: wasCanceled });
      };

      try {
        window.speechSynthesis.speak(utt);
      } catch (e) {
        finish({ durationMs: 0, interrupted: false });
      }
    });
  }
  return { durationMs: 0, interrupted: false };
}
