// --- 1. Utilidades y Sistema de Notificaciones ---
function showToast(msg) {
    const area = document.getElementById('toast-area');
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = msg;
    area.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- 2. Sistema de Sonidos y Voz ---
let globalAudioCtx = null; 

function handleSoundUpload(event, type) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 1500000) {
            showToast("❌ Error: El audio es muy pesado. Usa un archivo más pequeño (<1.5MB).");
            event.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                localStorage.setItem(`duo_french_sound_${type}`, e.target.result);
                showToast(`Sonido personalizado guardado.`);
            } catch (err) {
                showToast("❌ Error: El almacenamiento del navegador está lleno. Borra el caché o usa audios más cortos.");
            }
        };
        reader.readAsDataURL(file);
    }
}

function playSound(type) {
    const customSound = localStorage.getItem(`duo_french_sound_${type}`);
    if (customSound) {
        const audio = new Audio(customSound);
        audio.play().catch(() => playFallbackSynthSound(type));
    } else {
        playFallbackSynthSound(type);
    }
}

function playFallbackSynthSound(type) {
    try {
        if (!globalAudioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            globalAudioCtx = new AudioContext();
        }
        if (globalAudioCtx.state === 'suspended') {
            globalAudioCtx.resume();
        }

        const osc = globalAudioCtx.createOscillator();
        const gain = globalAudioCtx.createGain();
        osc.connect(gain);
        gain.connect(globalAudioCtx.destination);
        const now = globalAudioCtx.currentTime;

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'incorrect') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(130, now + 0.25);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'finish') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.1);
            osc.frequency.setValueAtTime(659.25, now + 0.2);
            osc.frequency.setValueAtTime(880, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    } catch (e) {
        console.warn("Audio Context Error:", e);
    }
}

// --- 3. Base de Datos y Repetición Espaciada ---
const defaultKnowledge = {
    vocab: [
        { id: "v1", fr: "Pomme", es: "Manzana", img: "🍎", score: 0, topic: "Comida" },
        { id: "v2", fr: "Chat", es: "Gato", img: "🐱", score: 0, topic: "Animales" },
        { id: "v3", fr: "Voiture", es: "Coche / Auto", img: "🚗", score: 0, topic: "Ciudad" },
        { id: "v4", fr: "Soleil", es: "Sol", img: "☀️", score: 0, topic: "Naturaleza" },
        { id: "v5", fr: "Livre", es: "Libro", img: "📚", score: 0, topic: "Estudio" }
    ],
    phonemes: [
        { id: "p1", symbol: "ou", word: "chou", trans: "col / repollo", img: "🥬", score: 0, topic: "Fonética" },
        { id: "p2", symbol: "u", word: "lune", trans: "luna", img: "🌙", score: 0, topic: "Fonética" },
        { id: "p3", symbol: "eu", word: "fleur", trans: "flor", img: "🌸", score: 0, topic: "Fonética" },
        { id: "p4", symbol: "an / en", word: "vent", trans: "viento", img: "💨", score: 0, topic: "Fonética" },
        { id: "p5", symbol: "é", word: "café", trans: "café", img: "☕", score: 0, topic: "Fonética" }
    ],
    grammar: [
        {
            id: "g1", verb: "Parler", tense: "Présent de l'indicatif", score: 0, topic: "Verbos",
            conjugations: { je: "parle", tu: "parles", il: "parle", nous: "parlons", vous: "parlez", ils: "parlent" }
        },
        {
            id: "g2", verb: "Être", tense: "Présent de l'indicatif", score: 0, topic: "Verbos",
            conjugations: { je: "suis", tu: "es", il: "est", nous: "sommes", vous: "êtes", ils: "sont" }
        }
    ],
    fill: [
        { id: "f1", title: "Completa la frase", sentence: "Je ___ une délicieuse pomme rouge.", answer: "mange", img: "🍎", score: 0, topic: "Frases" },
        { id: "f2", title: "Completa con el artículo", sentence: "___ chat dort sur la chaise.", answer: "Le", img: "🐱", score: 0, topic: "Frases" }
    ],
    order: [
        { id: "o1", title: "Traduce: 'El gato come una manzana'", sentence: "Le chat mange une pomme", extras: ["chien", "rouge", "dans"], score: 0, topic: "Sintaxis" },
        { id: "o2", title: "Traduce: 'Nosotros hablamos francés'", sentence: "Nous parlons français", extras: ["espagnol", "êtes", "la"], score: 0, topic: "Sintaxis" }
    ]
};

let db = JSON.parse(localStorage.getItem('duo_french_db_v4')) || {};
if (!db.vocab) db.vocab = [...defaultKnowledge.vocab];
if (!db.phonemes) db.phonemes = [...defaultKnowledge.phonemes];
if (!db.grammar) db.grammar = [...defaultKnowledge.grammar];
if (!db.fill) db.fill = [...defaultKnowledge.fill];
if (!db.order) db.order = [...defaultKnowledge.order];

let sessionCount = parseInt(localStorage.getItem('duo_french_sessions_v4')) || 0;
let currentTopicFilter = 'all';

function saveDB() {
    localStorage.setItem('duo_french_db_v4', JSON.stringify(db));
    localStorage.setItem('duo_french_sessions_v4', sessionCount.toString());
    updateHeaderStats();
    renderCreatorLists();
    populateTopicDropdown();
    if (localFileHandle) {
        saveToLocalFile();
    }
}

function updateHeaderStats() {
    const statSessionsEl = document.getElementById('stat-sessions');
    if (statSessionsEl) statSessionsEl.textContent = sessionCount;
}

let sessionQueue = [];
let retryQueue = [];
let currentItem = null;
let isRetryMode = false;
let isChecked = false;
let selectedWords = [];
let speechRecognitionInstance = null;
let browserVoices = [];
let questionStartTime = 0;

let editingItemId = null;
let editingItemType = null;

let matchSelectedLeft = null;
let matchSelectedRight = null;
let matchedPairs = [];

function selectMatchItem(side, index, itemId) {
    if (matchedPairs.includes(itemId)) return;

    if (side === 'left') {
        document.querySelectorAll('[id^="match-left-"]').forEach(el => el.style.borderColor = 'var(--duo-gray-border)');
        matchSelectedLeft = { index, itemId };
        document.getElementById(`match-left-${index}`).style.borderColor = 'var(--duo-blue)';
    } else {
        document.querySelectorAll('[id^="match-right-"]').forEach(el => el.style.borderColor = 'var(--duo-gray-border)');
        matchSelectedRight = { index, itemId };
        document.getElementById(`match-right-${index}`).style.borderColor = 'var(--duo-blue)';
    }

    if (matchSelectedLeft && matchSelectedRight) {
        if (matchSelectedLeft.itemId === matchSelectedRight.itemId) {
            matchedPairs.push(matchSelectedLeft.itemId);
            const leftEl = document.getElementById(`match-left-${matchSelectedLeft.index}`);
            const rightEl = document.getElementById(`match-right-${matchSelectedRight.index}`);
            
            leftEl.style.background = 'var(--duo-green-light)';
            leftEl.style.borderColor = 'var(--duo-green)';
            leftEl.style.opacity = '0.6';
            leftEl.style.pointerEvents = 'none';

            rightEl.style.background = 'var(--duo-green-light)';
            rightEl.style.borderColor = 'var(--duo-green)';
            rightEl.style.opacity = '0.6';
            rightEl.style.pointerEvents = 'none';

            playSound('correct');
            matchSelectedLeft = null;
            matchSelectedRight = null;
        } else {
            const leftEl = document.getElementById(`match-left-${matchSelectedLeft.index}`);
            const rightEl = document.getElementById(`match-right-${matchSelectedRight.index}`);

            leftEl.style.borderColor = 'var(--duo-red)';
            leftEl.style.background = 'var(--duo-red-light)';

            rightEl.style.borderColor = 'var(--duo-red)';
            rightEl.style.background = 'var(--duo-red-light)';
            
            playSound('incorrect');

            setTimeout(() => {
                leftEl.style.borderColor = 'var(--duo-gray-border)';
                leftEl.style.background = 'white';
                rightEl.style.borderColor = 'var(--duo-gray-border)';
                rightEl.style.background = 'white';
                matchSelectedLeft = null;
                matchSelectedRight = null;
            }, 500);
        }
    }
}

// --- 4. Sistema de Voz Nativa ---
function populateBrowserVoices() {
    if ('speechSynthesis' in window) {
        let allVoices = window.speechSynthesis.getVoices();
        browserVoices = allVoices.filter(v => v.lang.toLowerCase().includes('fr'));
        if (browserVoices.length === 0) browserVoices = allVoices; 

        const select = document.getElementById('browser-voice-select');
        if (!select) return;
        select.innerHTML = '';
        if (browserVoices.length === 0) {
            select.innerHTML = '<option value="">No se encontraron voces instaladas</option>';
        } else {
            browserVoices.forEach(voice => {
                const opt = document.createElement('option');
                opt.value = voice.name;
                opt.textContent = `${voice.name} (${voice.lang})`;
                select.appendChild(opt);
            });
        }

        const savedVoice = localStorage.getItem('duo_french_browser_voice');
        if (savedVoice && browserVoices.some(v => v.name === savedVoice)) {
            select.value = savedVoice;
        } else if (browserVoices.length > 0) {
            select.value = browserVoices[0].name;
            updateVoiceSettings(); 
        }
    }
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateBrowserVoices;
    populateBrowserVoices();
}

function speakFrench(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR'; 
        utterance.rate = 1.2;
        const selectedVoiceName = localStorage.getItem('duo_french_browser_voice');
        if (selectedVoiceName && browserVoices.length > 0) {
            const found = browserVoices.find(v => v.name === selectedVoiceName);
            if (found) {
                utterance.voice = found;
                utterance.lang = found.lang; 
            }
        }
        window.speechSynthesis.speak(utterance);
    }
}

function updateVoiceSettings() {
    const browserVoice = document.getElementById('browser-voice-select').value;
    localStorage.setItem('duo_french_browser_voice', browserVoice);
    showToast("Configuración de voz guardada.");
}

function loadVoiceSettingsUI() {
    populateBrowserVoices();
}

function testSelectedVoice() {
    speakFrench("Bonjour! Bienvenue dans vos leçons de français.");
}

// --- 5. Spaced Repetition Rules (0 to 5) ---
function getRequiredDays(score) {
    if (score === 0) return 0;
    if (score === 1) return 1;
    if (score === 2) return 4;
    if (score === 3) return 12;
    if (score === 4) return 30;
    if (score === 5) return 90;
    return 999999;
}

function isItemDue(item) {
    const score = item.score || 0;
    if (score === 0) return true;
    const lastAsked = item.lastAskedDate || 0;
    const daysElapsed = (Date.now() - lastAsked) / (1000 * 60 * 60 * 24);
    return daysElapsed >= getRequiredDays(score);
}

function populateTopicDropdown() {
    const select = document.getElementById('topic-filter-select');
    if (!select) return;
    const topics = new Set(['General']);
    ['vocab', 'phonemes', 'grammar', 'fill', 'order'].forEach(cat => {
        if (db[cat]) {
            db[cat].forEach(i => {
                if (i.topic) topics.add(i.topic);
            });
        }
    });

    const currentVal = select.value;
    select.innerHTML = '<option value="all">📚 Todos los Temas</option>';
    topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = `📁 ${t}`;
        select.appendChild(opt);
    });
    select.value = topics.has(currentVal) || currentVal === 'all' ? currentVal : 'all';
}

function changeTopicFilter() {
    currentTopicFilter = document.getElementById('topic-filter-select').value;
    startNewSession();
}

// --- 6. Lógica del Modo Práctica ---
function renderIllustrationHTML(item) {
    if (item.imgDataUrl) {
        return `<div class="illustration-box"><img src="${item.imgDataUrl}" alt="Illustration"></div>`;
    } else if (item.svgCode) {
        return `<div class="illustration-box">${item.svgCode}</div>`;
    } else {
        return `<div class="vocab-image-placeholder">${item.img || '📘'}</div>`;
    }
}

function renderMiniIllustrationHTML(item) {
    if (item.imgDataUrl) return `<img src="${item.imgDataUrl}" style="height: 30px; vertical-align: middle; margin-left: 5px; border-radius: 4px;">`;
    if (item.svgCode) return `<span style="display:inline-block; width:30px; height:30px; vertical-align:middle; margin-left:5px;">${item.svgCode}</span>`;
    return `<span style="margin-left:4px; font-size:1.2rem;">${item.img || ''}</span>`;
}

function getNormalizedFillParts(sentence) {
    let s = (sentence || "").trim();
    let endingPunct = "";
    if (/[.!?]$/.test(s)) {
        endingPunct = s.slice(-1);
        s = s.slice(0, -1).trim();
    }
    s = s.replace(/[.!?]/g, '').trim();
    return { parts: s.split('___'), punct: endingPunct };
}

function startNewSession() {
    let pool = [];

    const matchesTopic = (item) => {
        if (currentTopicFilter === 'all') return true;
        return (item.topic || 'General') === currentTopicFilter;
    };

    if(db.vocab) {
        let vocabFiltered = db.vocab.filter(item => matchesTopic(item));
        vocabFiltered.forEach(item => {
            pool.push({ category: 'vocab', type: 'vocab_type', isSpeaking: false, data: item, score: item.score || 0 });
        });
        let allVocabPool = db.vocab || [];
        let vocabSource = currentTopicFilter === 'all' ? allVocabPool : allVocabPool.filter(item => matchesTopic(item));
        if (vocabSource.length >= 2) {
            let numMatchExercises = Math.min(3, Math.max(1, Math.floor(vocabSource.length / 2)));
            for (let m = 0; m < numMatchExercises; m++) {
                let shuffled = [...vocabSource].sort(() => Math.random() - 0.5);
                let chunk = shuffled.slice(0, 4);
                if (chunk.length >= 2) {
                    let avgScore = Math.round(chunk.reduce((sum, it) => sum + (it.score || 0), 0) / chunk.length);
                    pool.push({ category: 'vocab', type: 'vocab_match_fr', isSpeaking: false, items: chunk, score: avgScore });
                    pool.push({ category: 'vocab', type: 'vocab_match_audio', isSpeaking: false, items: chunk, score: avgScore });
                }
            }
        }
    }
    if(db.grammar) {
        db.grammar.forEach(item => {
            if (matchesTopic(item)) {
                pool.push({ category: 'grammar', type: 'grammar', isSpeaking: false, data: item, score: item.score || 0 });
            }
        });
    }
    if(db.fill) {
        db.fill.forEach(item => {
            if (matchesTopic(item)) {
                pool.push({ category: 'fill', type: 'fill', isSpeaking: false, data: item, score: item.score || 0 });
                const norm = getNormalizedFillParts(item.sentence);
                const answers = item.answer.split(/[,/]/).map(s => s.trim());
                let fullSentence = "";
                norm.parts.forEach((p, idx) => {
                    fullSentence += p;
                    if (idx < answers.length && idx < norm.parts.length - 1) {
                        fullSentence += (answers[idx] || answers[0]);
                    }
                });
                fullSentence += norm.punct;
                pool.push({ category: 'fill', type: 'speaking', isSpeaking: true, targetText: fullSentence.trim(), promptText: `Pronuncia la oración completa: "${item.title}"`, item: item, score: item.score || 0 });
            }
        });
    }
    if(db.order) {
        db.order.forEach(item => {
            if (matchesTopic(item)) {
                pool.push({ category: 'order', type: 'order', isSpeaking: false, data: item, score: item.score || 0 });
                pool.push({ category: 'order', type: 'speaking', isSpeaking: true, targetText: item.sentence, promptText: `Pronuncia la oración: "${item.title}"`, item: item, score: item.score || 0 });
            }
        });
    }
    if(db.phonemes) {
        db.phonemes.forEach(item => {
            if (matchesTopic(item)) {
                pool.push({ category: 'phoneme', type: 'phoneme_speak', isSpeaking: true, data: item, score: item.score || 0 });
            }
        });
    }

    let duePool = pool.filter(i => isItemDue(i.data || i.item || (i.items ? i.items[0] : null)));
    if (duePool.length === 0) {
        duePool = pool;
    }

    // Ensure at least 5 different exercise types in each session if available
    let typesMap = new Map();
    duePool.forEach(item => {
        if (!typesMap.has(item.type)) {
            typesMap.set(item.type, []);
        }
        typesMap.get(item.type).push(item);
    });

    let selected = [];
    let selectedTypes = new Set();

    for (let [type, items] of typesMap.entries()) {
        if (selectedTypes.size < 5 && items.length > 0) {
            let item = items.shift();
            selected.push(item);
            selectedTypes.add(type);
        }
    }

    let remainingPool = duePool.filter(i => !selected.includes(i));
    remainingPool.sort((a, b) => {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        if (scoreA === 0 && scoreB !== 0) return -1;
        if (scoreB === 0 && scoreA !== 0) return 1;
        return scoreA - scoreB;
    });

    while (selected.length < 15 && remainingPool.length > 0) {
        selected.push(remainingPool.shift());
    }

    // Rule: No more than 2 exercises from the same topic/block consecutively
    function orderSessionQueue(queue) {
        let result = [];
        let remaining = [...queue];

        const getItemTopic = (item) => {
            if (item.data && item.data.topic) return item.data.topic;
            if (item.item && item.item.topic) return item.item.topic;
            if (item.items && item.items[0] && item.items[0].topic) return item.items[0].topic;
            return 'General';
        };

        while (remaining.length > 0) {
            let last1 = result.length >= 1 ? getItemTopic(result[result.length - 1]) : null;
            let last2 = result.length >= 2 ? getItemTopic(result[result.length - 2]) : null;

            let validIndex = remaining.findIndex(item => {
                let t = getItemTopic(item);
                return !(last1 && last2 && t === last1 && t === last2);
            });

            if (validIndex === -1) {
                validIndex = 0;
            }

            result.push(remaining.splice(validIndex, 1)[0]);
        }
        return result;
    }

    sessionQueue = orderSessionQueue(selected);
    retryQueue = [];
    isRetryMode = false;

    loadNextQuestion();
}

function loadNextQuestion() {
    if (sessionQueue.length > 0) {
        currentItem = sessionQueue.shift();
    } else if (retryQueue.length > 0) {
        isRetryMode = true;
        currentItem = retryQueue.shift();
    } else {
        finishSession();
        return;
    }

    renderExercise(currentItem);
}

function renderExercise(item) {
    const container = document.getElementById('exercise-container');
    const drawer = document.getElementById('bottom-drawer');
    
    drawer.className = 'bottom-drawer';
    drawer.style.display = 'flex';
    document.getElementById('feedback-content').style.visibility = 'hidden';
    const actionBtn = document.getElementById('drawer-action-btn');
    actionBtn.textContent = 'COMPROBAR';
    actionBtn.className = 'check-btn';
    actionBtn.disabled = false;
    actionBtn.style.opacity = '1';
    isChecked = false;
    selectedWords = [];
    questionStartTime = null;

    const markTimerStarted = () => {
        if (!questionStartTime) {
            questionStartTime = Date.now();
        }
    };

    container.oninput = markTimerStarted;
    container.onclick = markTimerStarted;

    const totalInSession = sessionQueue.length + retryQueue.length + 1;
    const progress = Math.min(100, Math.max(5, ((20 - totalInSession) / 20) * 100));
    
    const progBar = document.getElementById('progress-bar');
    if (progBar) progBar.style.width = `${progress}%`;
    const mobileProg = document.getElementById('progress-bar-mobile');
    if (mobileProg) mobileProg.style.width = `${progress}%`;

    const isSpeakingBadge = item.isSpeaking ? 'speaking-badge' : '';
    const scoreVal = item.score || 0;
    const scoreLabel = `⭐ Dominio: ${scoreVal}/5`;
    const levelBadgeHTML = `
        <div class="level-pill ${isSpeakingBadge}">
            ${item.isSpeaking ? '🎙️ Micrófono • ' : ''}${scoreLabel} ${isRetryMode ? '• 🔁 Repaso' : ''}
        </div>`;

    const wrapTitleWithBadge = (titleText) => `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
            <h2 class="exercise-title" style="margin: 0;">${titleText}</h2>
            ${levelBadgeHTML}
        </div>
    `;

    if (item.type === 'vocab_type') {
        container.innerHTML = `
            ${wrapTitleWithBadge('Escribe la palabra en francés')}
            <div class="vocab-card">
                ${renderIllustrationHTML(item.data)}
                <button class="speaker-btn hint-btn" onmousedown="event.preventDefault()" onclick="speakFrench('${item.data.fr.replace(/'/g, "\\'")}')">💡 Escuchar Pista Audio</button>
            </div>
            <input type="text" id="user-input" class="duo-input" placeholder="Escribe en francés..." autocomplete="off">
        `;
        setTimeout(() => speakFrench(item.data.fr), 400);
    } 
    else if (item.type === 'vocab_match_fr' || item.type === 'vocab_match_audio') {
        matchSelectedLeft = null;
        matchSelectedRight = null;
        matchedPairs = [];

        const isAudioOnly = (item.type === 'vocab_match_audio');
        const shuffledRight = [...item.items].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            ${wrapTitleWithBadge(isAudioOnly ? 'Une el audio con su traducción' : 'Une la palabra con su traducción')}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="display: flex; flex-direction: column; gap: 10px;" id="match-left-column">
                    ${item.items.map((it, idx) => `
                        ${isAudioOnly ? `
                            <div class="match-tile" id="match-left-${idx}" onclick="selectMatchItem('left', ${idx}, '${it.id}'); speakFrench('${it.fr.replace(/'/g, "\\'")}')" style="background: white; border: 2px solid var(--duo-gray-border); border-bottom-width: 4px; border-radius: 12px; padding: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                                🔊
                            </div>
                        ` : `
                            <div class="match-tile" id="match-left-${idx}" onclick="selectMatchItem('left', ${idx}, '${it.id}')" style="background: white; border: 2px solid var(--duo-gray-border); border-bottom-width: 4px; border-radius: 12px; padding: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                                <span>${it.fr}</span>
                                <button class="speaker-btn" style="width: 32px; height: 32px; font-size: 1rem;" onmousedown="event.preventDefault()" onclick="event.stopPropagation(); speakFrench('${it.fr.replace(/'/g, "\\'")}')">🔊</button>
                            </div>
                        `}
                    `).join('')}
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;" id="match-right-column">
                    ${shuffledRight.map((it, idx) => `
                        <div class="match-tile" id="match-right-${idx}" onclick="selectMatchItem('right', ${idx}, '${it.id}')" style="background: white; border: 2px solid var(--duo-gray-border); border-bottom-width: 4px; border-radius: 12px; padding: 12px; font-weight: 800; cursor: pointer; text-align: center;">
                            ${it.es}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } 
    else if (item.type === 'phoneme_speak') {
        container.innerHTML = `
            ${wrapTitleWithBadge('Pronunciación de Letras y Fonemas 🎙️')}
            <div class="speaking-card">
                
                <div class="phoneme-combined-card">
                    <div class="phoneme-header-row">
                        <span class="phoneme-symbol-text">${item.data.symbol}</span>
                        <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="speakFrench('${item.data.symbol.replace(/'/g, "\\'")}')">🔊</button>
                    </div>
                    <div class="phoneme-example-row">
                        <div>
                            <span style="font-size: 0.8rem; color: var(--duo-text-muted);">Ejemplo: </span>
                            <strong style="color: var(--duo-purple-dark); font-size: 1.1rem;">${item.data.word}</strong>
                            <span style="color: var(--duo-text-muted); font-size: 0.9rem;"> (${item.data.trans})</span>
                            ${renderMiniIllustrationHTML(item.data)}
                        </div>
                        <button class="speaker-btn" style="width: 34px; height: 34px; font-size: 0.95rem;" onmousedown="event.preventDefault()" onclick="speakFrench('${item.data.word.replace(/'/g, "\\'")}')">🔊</button>
                    </div>
                </div>

                <div style="margin-top: 5px;">
                    <button class="mic-btn" id="mic-trigger-btn" onclick="toggleSpeechRecognition()">🎤</button>
                </div>
                <p id="speech-status" style="font-size: 0.85rem; color: var(--duo-text-muted);">Toca el micrófono y pronuncia "${item.data.symbol}" o "${item.data.word}"</p>

                <div class="speech-edit-container">
                    <label class="speech-edit-label">Lo que escuchó el sistema (puedes editarlo):</label>
                    <input type="text" id="user-speech-input" class="duo-input" placeholder="Haz clic en el mic o escribe aquí..." style="border-color: #ce93d8;" autocomplete="off">
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                    <button class="skip-btn" onclick="skipSpeakingExercise()">⏭️ Saltar este ejercicio</button>
                    <button class="skip-btn" style="background: #f3e5f5; border-color: #ce93d8; color: var(--duo-purple-dark);" onclick="skipAllSpeakingExercises()">⏭️ Saltar TODOS de pronunciación</button>
                </div>
            </div>
        `;
    }
    else if (item.type === 'speaking') {
        container.innerHTML = `
            ${wrapTitleWithBadge('¡Ejercicio de Pronunciación! 🎙️')}
            <div class="speaking-card">
                ${item.item ? renderIllustrationHTML(item.item) : '<div style="font-size: 3.5rem;">🗣️</div>'}
                <h3 style="font-size: 1.2rem;">${item.promptText}</h3>
                <p style="color: var(--duo-purple-dark); font-weight: 800; font-size: 1.3rem;">"${item.targetText}"</p>
                <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="speakFrench('${item.targetText.replace(/'/g, "\\'")}')">🔊</button>
                
                <div style="margin-top: 10px;">
                    <button class="mic-btn" id="mic-trigger-btn" onclick="toggleSpeechRecognition()">🎤</button>
                </div>
                <p id="speech-status" style="font-size: 0.85rem; color: var(--duo-text-muted);">Toca el micrófono para hablar en francés</p>

                <div class="speech-edit-container">
                    <label class="speech-edit-label">Lo que escuchó el sistema (puedes editarlo):</label>
                    <input type="text" id="user-speech-input" class="duo-input" placeholder="Haz clic en el mic o edita la respuesta aquí..." style="border-color: #ce93d8;" autocomplete="off">
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                    <button class="skip-btn" onclick="skipSpeakingExercise()">⏭️ Saltar este ejercicio</button>
                    <button class="skip-btn" style="background: #f3e5f5; border-color: #ce93d8; color: var(--duo-purple-dark);" onclick="skipAllSpeakingExercises()">⏭️ Saltar TODOS de pronunciación</button>
                </div>
            </div>
        `;
    }
    else if (item.type === 'grammar') {
        const prefilled = item.prefilled || {};
        container.innerHTML = `
            ${wrapTitleWithBadge('Completa la tabla de conjugación')}
            <div class="instruction-box">
                <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="speakFrench('${item.data.verb.replace(/'/g, "\\'")}')">🔊</button>
                <div>
                    <p style="color: var(--duo-text-muted); margin:0;">Verbo: <strong>${item.data.verb}</strong> | Tiempo: <strong>${item.data.tense}</strong></p>
                </div>
            </div>
            <div class="grammar-table-container">
                <div class="grammar-header">
                    <span style="font-weight: 800; color: #1899d6;">Pronombres Sujeto</span>
                    <span class="grammar-badge">${item.data.verb}</span>
                </div>
                <table class="conjugation-table">
                    <tr><td class="pronoun-cell">Je / J'</td><td><input type="text" id="gram-je" class="duo-input" value="${prefilled.je || ''}" ${prefilled.je ? 'style="border-color: var(--duo-green); background: var(--duo-green-light);" disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">Tu</td><td><input type="text" id="gram-tu" class="duo-input" value="${prefilled.tu || ''}" ${prefilled.tu ? 'style="border-color: var(--duo-green); background: var(--duo-green-light);" disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">Il / Elle / On</td><td><input type="text" id="gram-il" class="duo-input" value="${prefilled.il || ''}" ${prefilled.il ? 'style="border-color: var(--duo-green); background: var(--duo-green-light);" disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">Nous</td><td><input type="text" id="gram-nous" class="duo-input" value="${prefilled.nous || ''}" ${prefilled.nous ? 'style="border-color: var(--duo-green); background: var(--duo-green-light);" disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">Vous</td><td><input type="text" id="gram-vous" class="duo-input" value="${prefilled.vous || ''}" ${prefilled.vous ? 'style="border-color: var(--duo-green); background: var(--duo-green-light);" disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">Ils / Elles</td><td><input type="text" id="gram-ils" class="duo-input" value="${prefilled.ils || ''}" ${prefilled.ils ? 'style="border-color: var(--duo-green); background: var(--duo-green-light);" disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                </table>
            </div>
        `;
    }
    else if (item.type === 'fill') {
        const norm = getNormalizedFillParts(item.data.sentence);
        let sentenceHTML = "";
        norm.parts.forEach((p, idx) => {
            sentenceHTML += `<span>${p}</span>`;
            if (idx < norm.parts.length - 1) {
                sentenceHTML += `<input type="text" class="inline-blank-input fill-blank-input" data-idx="${idx}" autocomplete="off">`;
            }
        });
        if (norm.punct) {
            sentenceHTML += `<span>${norm.punct}</span>`;
        }

        container.innerHTML = `
            ${wrapTitleWithBadge(item.data.title)}
            ${renderIllustrationHTML(item.data)}
            <div class="fill-blank-sentence">
                ${sentenceHTML}
            </div>
        `;
    }
    else if (item.type === 'order') {
        const targetWords = item.data.sentence.split(' ');
        const allWords = [...targetWords, ...item.data.extras].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            ${wrapTitleWithBadge(item.data.title)}
            <div class="instruction-box">
                <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="speakFrench('${item.data.sentence.replace(/'/g, "\\'")}')">🔊</button>
            </div>
            ${item.data.img || item.data.imgDataUrl || item.data.svgCode ? renderIllustrationHTML(item.data) : ''}
            <div class="sentence-target-area" id="target-word-area"></div>
            <div class="word-bank">
                ${allWords.map((w, idx) => `
                    <button class="word-tile" id="tile-${idx}" onclick="toggleWord('${w.replace(/'/g, "\\'")}', ${idx})">${w}</button>
                `).join('')}
            </div>
        `;
    }
    
    if (!item.isSpeaking && item.type !== 'order') {
        setTimeout(() => {
            const firstInput = document.querySelector('#view-practice input[type="text"]:not([disabled])');
            if (firstInput) {
                firstInput.focus();
            }
        }, 60);
    }
}

// Global Enter Key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const practiceView = document.getElementById('view-practice');
        if (practiceView && practiceView.classList.contains('active')) {
            e.preventDefault();
            handleDrawerAction();
        }
    }
});

// Speech Recognition API
function toggleSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast("Tu navegador no soporta captura de voz nativa.");
        return;
    }

    const micBtn = document.getElementById('mic-trigger-btn');
    const statusText = document.getElementById('speech-status');
    const inputField = document.getElementById('user-speech-input');

    if (speechRecognitionInstance && micBtn.classList.contains('recording')) {
        speechRecognitionInstance.stop();
        return;
    }

    speechRecognitionInstance = new SpeechRecognition();
    speechRecognitionInstance.lang = 'fr-FR';
    speechRecognitionInstance.interimResults = true;
    speechRecognitionInstance.continuous = false;

    speechRecognitionInstance.onstart = function() {
        micBtn.classList.add('recording');
        if (statusText) statusText.textContent = "🎙️ Escuchando... Habla ahora en francés";
    };

    speechRecognitionInstance.onresult = function(event) {
        let currentTranscript = "";
        if (event.results && event.results.length > 0) {
            currentTranscript = event.results[event.results.length - 1][0].transcript;
        }
        if (inputField) inputField.value = currentTranscript.trim();
    };

    speechRecognitionInstance.onerror = function() {
        micBtn.classList.remove('recording');
        if (statusText) statusText.textContent = "Error de escucha. Puedes escribir o intentar de nuevo.";
    };

    speechRecognitionInstance.onend = function() {
        micBtn.classList.remove('recording');
        if (statusText) statusText.textContent = "Grabado. Puedes editar el texto y dar a COMPROBAR.";
    };

    speechRecognitionInstance.start();
}

function skipSpeakingExercise() {
    showToast("Ejercicio de voz saltado.");
    loadNextQuestion();
}

function skipAllSpeakingExercises() {
    sessionQueue = sessionQueue.filter(i => !i.isSpeaking);
    retryQueue = retryQueue.filter(i => !i.isSpeaking);
    showToast("⏭️ Todos los ejercicios de pronunciación han sido saltados.");
    loadNextQuestion();
}

function toggleWord(word, index) {
    const tile = document.getElementById(`tile-${index}`);
    if (tile.classList.contains('disabled')) return;

    selectedWords.push({ word, index });
    tile.classList.add('disabled');
    speakFrench(word);
    renderSelectedWords();
}

function removeSelectedWord(arrayIdx) {
    const item = selectedWords[arrayIdx];
    document.getElementById(`tile-${item.index}`).classList.remove('disabled');
    selectedWords.splice(arrayIdx, 1);
    renderSelectedWords();
}

function renderSelectedWords() {
    const area = document.getElementById('target-word-area');
    area.innerHTML = selectedWords.map((item, idx) => `
        <button class="word-tile" onclick="removeSelectedWord(${idx})">${item.word}</button>
    `).join('');
}

function handleDrawerAction() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (!isChecked) {
        checkAnswer();
    } else {
        loadNextQuestion();
    }
}

function cleanStr(str) {
    return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, "").trim();
}

function checkAnswer() {
    let isCorrect = false;
    let correctSolutionText = '';
    let textToSpeak = '';
    const elapsedSec = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0;

    if (currentItem.type === 'vocab_type') {
        const val = document.getElementById('user-input').value.trim();
        isCorrect = (cleanStr(val) === cleanStr(currentItem.data.fr));
        correctSolutionText = `${currentItem.data.fr} = ${currentItem.data.es}`;
        textToSpeak = currentItem.data.fr;
    } else if (currentItem.type === 'phoneme_speak') {
        const val = document.getElementById('user-speech-input').value.trim();
        const cleanInput = cleanStr(val);
        const cleanSym = cleanStr(currentItem.data.symbol);
        const cleanWord = cleanStr(currentItem.data.word);

        isCorrect = (cleanInput.length > 0 && (cleanInput.includes(cleanSym) || cleanInput.includes(cleanWord) || cleanSym.includes(cleanInput)));
        correctSolutionText = `Fonema: "${currentItem.data.symbol}" | Ejemplo: "${currentItem.data.word}" (${currentItem.data.trans})`;
        textToSpeak = currentItem.data.word;
    } else if (currentItem.type === 'speaking') {
        const val = document.getElementById('user-speech-input').value.trim();
        const cleanTarget = cleanStr(currentItem.targetText);
        const cleanInput = cleanStr(val);
        
        isCorrect = (cleanInput.length > 0 && (cleanTarget === cleanInput || cleanInput.includes(cleanTarget) || cleanTarget.includes(cleanInput)));
        correctSolutionText = currentItem.targetText;
        textToSpeak = currentItem.targetText;
    } else if (currentItem.type === 'grammar') {
        const c = currentItem.data.conjugations;
        if (!currentItem.prefilled) currentItem.prefilled = {};
        const inputs = {
            je: document.getElementById('gram-je'),
            tu: document.getElementById('gram-tu'),
            il: document.getElementById('gram-il'),
            nous: document.getElementById('gram-nous'),
            vous: document.getElementById('gram-vous'),
            ils: document.getElementById('gram-ils')
        };
        const userVals = {
            je: inputs.je.value.trim(),
            tu: inputs.tu.value.trim(),
            il: inputs.il.value.trim(),
            nous: inputs.nous.value.trim(),
            vous: inputs.vous.value.trim(),
            ils: inputs.ils.value.trim()
        };

        let allGrammarCorrect = true;
        let incorrectConjugations = [];

        Object.keys(c).forEach(k => {
            if (currentItem.prefilled[k]) return; // already correct

            if (cleanStr(userVals[k]) === cleanStr(c[k])) {
                currentItem.prefilled[k] = c[k];
                if (inputs[k]) {
                    inputs[k].style.borderColor = 'var(--duo-green)';
                    inputs[k].style.background = 'var(--duo-green-light)';
                    inputs[k].disabled = true;
                }
            } else {
                allGrammarCorrect = false;
                incorrectConjugations.push({ pronoun: k, correct: c[k] });
                if (inputs[k]) {
                    inputs[k].style.borderColor = 'var(--duo-red)';
                    inputs[k].style.background = 'var(--duo-red-light)';
                    inputs[k].title = `Correcto: ${c[k]}`;
                }
            }
        });

        isCorrect = allGrammarCorrect;
        if (isCorrect) {
            currentItem.prefilled = {};
        }
        correctSolutionText = `${c.je}, ${c.tu}, ${c.il}, ${c.nous}, ${c.vous}, ${c.ils}`;
        
        if (!isCorrect && incorrectConjugations.length > 0) {
            textToSpeak = incorrectConjugations.map(ic => `${ic.pronoun} ${ic.correct}`).join('. ');
        } else {
            textToSpeak = currentItem.data.verb;
        }
    } else if (currentItem.type === 'fill') {
        const fillInputs = document.querySelectorAll('.fill-blank-input');
        const answers = currentItem.data.answer.split(/[,/]/).map(a => cleanStr(a));
        let allCorrect = true;

        if (fillInputs.length > 0) {
            fillInputs.forEach((inp, idx) => {
                const expected = answers[idx] || answers[0] || '';
                if (cleanStr(inp.value) !== expected) {
                    allCorrect = false;
                }
            });
        }
        isCorrect = allCorrect;
        correctSolutionText = currentItem.data.answer;

        const norm = getNormalizedFillParts(currentItem.data.sentence);
        let spokenSentence = "";
        norm.parts.forEach((p, idx) => {
            spokenSentence += p;
            if (idx < fillInputs.length && fillInputs[idx] && fillInputs[idx].value) {
                spokenSentence += fillInputs[idx].value;
            } else if (idx < answers.length) {
                spokenSentence += (currentItem.data.answer.split(/[,/]/)[idx] || currentItem.data.answer.split(/[,/]/)[0] || '');
            }
        });
        textToSpeak = (spokenSentence + norm.punct).trim();
    } else if (currentItem.type === 'order') {
        const userSentence = selectedWords.map(sw => sw.word).join(' ').trim();
        isCorrect = (cleanStr(userSentence) === cleanStr(currentItem.data.sentence));
        correctSolutionText = currentItem.data.sentence;
        textToSpeak = currentItem.data.sentence;
    } else if (currentItem.type === 'vocab_match_fr' || currentItem.type === 'vocab_match_audio') {
        const totalItems = currentItem.items.length;
        isCorrect = (matchedPairs.length === totalItems);
        correctSolutionText = currentItem.items.map(i => `${i.fr} = ${i.es}`).join(', ');
        textToSpeak = currentItem.items.map(i => i.fr).join('. ');
    }

    // Spaced repetition score updating
    const targetData = currentItem.data || currentItem.item;
    const targetItems = currentItem.items;

    const processItemScore = (itemObj) => {
        itemObj.lastAskedDate = Date.now();
        const currentScore = itemObj.score || 0;
        if (!isCorrect) {
            itemObj.score = 1;
        } else {
            const isGrammar = (currentItem.type === 'grammar');
            const isPronunciation = (currentItem.type === 'speaking' || currentItem.type === 'phoneme_speak');
            const fastLimit = isGrammar ? 35 : (isPronunciation ? 20 : 10);
            const slowLimit = isGrammar ? 50 : (isPronunciation ? 30 : 15);

            if (currentScore === 0) {
                itemObj.score = 1;
            } else if (elapsedSec < fastLimit) {
                itemObj.score = Math.min(5, currentScore + 1);
            } else if (elapsedSec > slowLimit) {
                itemObj.score = Math.max(1, currentScore - 1);
            }
        }
    };

    if (targetItems && Array.isArray(targetItems)) {
        if (!isCorrect) {
            retryQueue.push(currentItem);
        }
        targetItems.forEach(it => processItemScore(it));
    } else if (targetData) {
        if (!isCorrect) {
            targetData.score = 1;
            retryQueue.push(currentItem);
        } else {
            processItemScore(targetData);
        }
    }
    saveDB();

    // Only start TTS if the answer is correct; if incorrect, continue without TTS
    if (isCorrect && textToSpeak) {
        speakFrench(textToSpeak);
    }
    playSound(isCorrect ? 'correct' : 'incorrect');

    const drawer = document.getElementById('bottom-drawer');
    const feedbackContent = document.getElementById('feedback-content');
    const icon = document.getElementById('feedback-icon');
    const title = document.getElementById('feedback-title');
    const subtext = document.getElementById('feedback-subtext');
    const actionBtn = document.getElementById('drawer-action-btn');

    feedbackContent.style.visibility = 'visible';

    if (isCorrect) {
        drawer.className = 'bottom-drawer correct';
        icon.textContent = '✓';
        title.textContent = '¡Excelente!';
        subtext.textContent = `Solución: ${correctSolutionText}`;
        actionBtn.textContent = 'CONTINUAR';
        actionBtn.className = 'check-btn';
    } else {
        drawer.className = 'bottom-drawer incorrect';
        icon.textContent = '✕';
        title.textContent = 'Incorrecto. Lo repasaremos al final:';
        subtext.textContent = correctSolutionText;
        actionBtn.textContent = 'ENTENDIDO';
        actionBtn.className = 'check-btn btn-incorrect';
    }

    isChecked = true;
}

function finishSession() {
    sessionCount++;
    playSound('finish');
    saveDB();

    document.getElementById('bottom-drawer').style.display = 'none';
    const container = document.getElementById('exercise-container');
    const progBar = document.getElementById('progress-bar');
    if (progBar) progBar.style.width = '100%';
    const mobileProg = document.getElementById('progress-bar-mobile');
    if (mobileProg) mobileProg.style.width = '100%';

    container.innerHTML = `
        <div class="summary-card">
            <div class="summary-icon">🎉</div>
            <h1 style="color: var(--duo-green-dark); margin-bottom: 10px;">¡Sesión Completada!</h1>
            <p style="font-size: 1.1rem; color: var(--duo-text-muted); margin-bottom: 20px;">
                Completaste los ejercicios y sus repasos de Spaced Repetition.
            </p>
            
            <div style="background: var(--duo-gray-light); padding: 15px; border-radius: 12px; margin-bottom: 25px; text-align: left;">
                <p><strong>Sesiones completadas:</strong> ${sessionCount}</p>
            </div>

            <button class="action-btn" onclick="startNewSession()">🚀 Iniciar Nueva Sesión</button>
        </div>
    `;
}

function switchView(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    if (view === 'practice') {
        document.getElementById('view-practice').classList.add('active');
        document.getElementById('btn-mode-practice').classList.add('active');
        document.getElementById('bottom-drawer').style.display = 'flex';
        if (sessionQueue.length === 0 && retryQueue.length === 0) {
            startNewSession();
        } else if (currentItem) {
            renderExercise(currentItem);
        }
    } else {
        document.getElementById('view-creator').classList.add('active');
        document.getElementById('btn-mode-creator').classList.add('active');
        document.getElementById('bottom-drawer').style.display = 'none';
        renderCreatorLists();
        loadVoiceSettingsUI();
    }
}

// --- 7. Importar/Exportar y Editar Contenido ---
function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "duo_french_db_backup.json");
    dlAnchorElem.click();
    showToast("Respaldo descargado con éxito.");
}

function importDataJSON(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const parsedData = JSON.parse(e.target.result);
            if (parsedData.vocab && parsedData.grammar) {
                db = parsedData;
                if(!db.fill) db.fill = [];
                if(!db.order) db.order = [];
                if(!db.phonemes) db.phonemes = [];
                saveDB();
                showToast("¡Base de datos cargada correctamente!");
                setTimeout(() => location.reload(), 1500); 
            } else {
                showToast("El archivo no tiene el formato correcto.");
            }
        } catch(err) {
            showToast("Error al leer el archivo JSON.");
        }
    };
    if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0]);
    }
}

function toggleImgTypeInputs(prefix, selectedType) {
    document.getElementById(`${prefix}-input-emoji`).style.display = selectedType === 'emoji' ? 'block' : 'none';
    document.getElementById(`${prefix}-input-file`).style.display = selectedType === 'file' ? 'block' : 'none';
    document.getElementById(`${prefix}-input-svg`).style.display = selectedType === 'svg' ? 'block' : 'none';
}

function editItem(type, index) {
    const item = db[type][index];
    if (!item) return;
    editingItemId = item.id;
    editingItemType = type;

    if (type === 'vocab') {
        document.getElementById('add-vocab-fr').value = item.fr || '';
        document.getElementById('add-vocab-es').value = item.es || '';
        document.getElementById('add-vocab-topic').value = item.topic || 'General';
        if (item.img) document.getElementById('add-vocab-emoji').value = item.img;
        document.getElementById('vocab-form-title').textContent = "Editar Vocabulario";
        document.getElementById('vocab-submit-btn').textContent = "Actualizar Vocabulario";
        document.getElementById('vocab-cancel-btn').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (type === 'phonemes') {
        document.getElementById('add-phoneme-symbol').value = item.symbol || '';
        document.getElementById('add-phoneme-word').value = item.word || '';
        document.getElementById('add-phoneme-trans').value = item.trans || '';
        document.getElementById('add-phoneme-topic').value = item.topic || 'General';
        if (item.img) document.getElementById('add-phoneme-emoji').value = item.img;
        document.getElementById('phoneme-form-title').textContent = "Editar Fonema";
        document.getElementById('phoneme-submit-btn').textContent = "Actualizar Fonema";
        document.getElementById('phoneme-cancel-btn').style.display = 'block';
    } else if (type === 'grammar') {
        document.getElementById('add-gram-verb').value = item.verb || '';
        document.getElementById('add-gram-tense').value = item.tense || '';
        document.getElementById('add-gram-topic').value = item.topic || 'General';
        if (item.conjugations) {
            document.getElementById('add-gram-je').value = item.conjugations.je || '';
            document.getElementById('add-gram-tu').value = item.conjugations.tu || '';
            document.getElementById('add-gram-il').value = item.conjugations.il || '';
            document.getElementById('add-gram-nous').value = item.conjugations.nous || '';
            document.getElementById('add-gram-vous').value = item.conjugations.vous || '';
            document.getElementById('add-gram-ils').value = item.conjugations.ils || '';
        }
        document.getElementById('grammar-form-title').textContent = "Editar Tabla Gramatical";
        document.getElementById('grammar-submit-btn').textContent = "Actualizar Tabla";
        document.getElementById('grammar-cancel-btn').style.display = 'block';
    } else if (type === 'fill') {
        document.getElementById('add-fill-title').value = item.title || '';
        document.getElementById('add-fill-sentence').value = item.sentence || '';
        document.getElementById('add-fill-answer').value = item.answer || '';
        document.getElementById('add-fill-topic').value = item.topic || 'General';
        if (item.img) document.getElementById('add-fill-emoji').value = item.img;
        document.getElementById('fill-form-title').textContent = "Editar Oración";
        document.getElementById('fill-submit-btn').textContent = "Actualizar Oración";
        document.getElementById('fill-cancel-btn').style.display = 'block';
    } else if (type === 'order') {
        document.getElementById('add-order-title').value = item.title || '';
        document.getElementById('add-order-sentence').value = item.sentence || '';
        document.getElementById('add-order-extras').value = item.extras ? item.extras.join(', ') : '';
        document.getElementById('add-order-topic').value = item.topic || 'General';
        if (item.img) document.getElementById('add-order-emoji').value = item.img;
        document.getElementById('order-form-title').textContent = "Editar Reordenar";
        document.getElementById('order-submit-btn').textContent = "Actualizar Reordenar";
        document.getElementById('order-cancel-btn').style.display = 'block';
    }
}

function cancelEdit(type) {
    editingItemId = null;
    editingItemType = null;
    if (type === 'vocab') {
        document.getElementById('add-vocab-fr').value = '';
        document.getElementById('add-vocab-es').value = '';
        document.getElementById('add-vocab-topic').value = 'General';
        document.getElementById('vocab-form-title').textContent = "1. Vocabulario";
        document.getElementById('vocab-submit-btn').textContent = "+ Guardar Vocabulario";
        document.getElementById('vocab-cancel-btn').style.display = 'none';
    } else if (type === 'phonemes') {
        document.getElementById('add-phoneme-symbol').value = '';
        document.getElementById('add-phoneme-word').value = '';
        document.getElementById('add-phoneme-trans').value = '';
        document.getElementById('add-phoneme-topic').value = 'General';
        document.getElementById('phoneme-form-title').textContent = "2. Pronunciación de Fonemas y Letras";
        document.getElementById('phoneme-submit-btn').textContent = "+ Guardar Fonema";
        document.getElementById('phoneme-cancel-btn').style.display = 'none';
    } else if (type === 'grammar') {
        document.getElementById('add-gram-verb').value = '';
        document.getElementById('add-gram-tense').value = '';
        document.getElementById('add-gram-topic').value = 'General';
        ['je', 'tu', 'il', 'nous', 'vous', 'ils'].forEach(k => document.getElementById(`add-gram-${k}`).value = '');
        document.getElementById('grammar-form-title').textContent = "3. Tabla Gramatical (Conjugaciones)";
        document.getElementById('grammar-submit-btn').textContent = "+ Guardar Tabla Gramatical";
        document.getElementById('grammar-cancel-btn').style.display = 'none';
    } else if (type === 'fill') {
        document.getElementById('add-fill-title').value = '';
        document.getElementById('add-fill-sentence').value = '';
        document.getElementById('add-fill-answer').value = '';
        document.getElementById('add-fill-topic').value = 'General';
        document.getElementById('fill-form-title').textContent = "4. Completar Oración";
        document.getElementById('fill-submit-btn').textContent = "+ Guardar Oración";
        document.getElementById('fill-cancel-btn').style.display = 'none';
    } else if (type === 'order') {
        document.getElementById('add-order-title').value = '';
        document.getElementById('add-order-sentence').value = '';
        document.getElementById('add-order-extras').value = '';
        document.getElementById('add-order-topic').value = 'General';
        document.getElementById('order-form-title').textContent = "5. Reordenar Oración";
        document.getElementById('order-submit-btn').textContent = "+ Guardar Reordenar";
        document.getElementById('order-cancel-btn').style.display = 'none';
    }
}

function addVocabItem() {
    const fr = document.getElementById('add-vocab-fr').value.trim();
    const es = document.getElementById('add-vocab-es').value.trim();
    const topic = document.getElementById('add-vocab-topic').value.trim() || 'General';
    const imgType = document.querySelector('input[name="vocab-img-type"]:checked').value;

    if (!fr || !es) return showToast("Completa los campos de Francés y Español.");

    if (editingItemId && editingItemType === 'vocab') {
        const item = db.vocab.find(i => i.id === editingItemId);
        if (item) {
            item.fr = fr;
            item.es = es;
            item.topic = topic;
            if (imgType === 'emoji') item.img = document.getElementById('add-vocab-emoji').value.trim() || '📘';
            else if (imgType === 'svg') item.svgCode = document.getElementById('add-vocab-svg').value.trim();
        }
        cancelEdit('vocab');
        saveDB();
        showToast("Vocabulario actualizado.");
        return;
    }

    const newItem = { id: 'v_' + Date.now(), fr, es, topic, score: 0 };
    const finalizeSave = () => {
        db.vocab.push(newItem);
        saveDB();
        resetVocabForm();
    };

    if (imgType === 'emoji') {
        newItem.img = document.getElementById('add-vocab-emoji').value.trim() || '📘';
        finalizeSave();
    } else if (imgType === 'svg') {
        newItem.svgCode = document.getElementById('add-vocab-svg').value.trim();
        finalizeSave();
    } else if (imgType === 'file') {
        const fileInput = document.getElementById('add-vocab-file');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newItem.imgDataUrl = e.target.result;
                finalizeSave();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            newItem.img = '📘';
            finalizeSave();
        }
    }
}

function resetVocabForm() {
    document.getElementById('add-vocab-fr').value = '';
    document.getElementById('add-vocab-es').value = '';
    document.getElementById('add-vocab-topic').value = 'General';
    document.getElementById('add-vocab-emoji').value = '';
    document.getElementById('add-vocab-svg').value = '';
    document.getElementById('add-vocab-file').value = '';
    showToast("Vocabulario guardado.");
}

function addPhonemeItem() {
    const symbol = document.getElementById('add-phoneme-symbol').value.trim();
    const word = document.getElementById('add-phoneme-word').value.trim();
    const trans = document.getElementById('add-phoneme-trans').value.trim();
    const topic = document.getElementById('add-phoneme-topic').value.trim() || 'General';
    const imgType = document.querySelector('input[name="phoneme-img-type"]:checked').value;

    if (!symbol || !word) return showToast("Ingresa el fonema y la palabra de ejemplo.");

    if (editingItemId && editingItemType === 'phonemes') {
        const item = db.phonemes.find(i => i.id === editingItemId);
        if (item) {
            item.symbol = symbol;
            item.word = word;
            item.trans = trans;
            item.topic = topic;
            if (imgType === 'emoji') item.img = document.getElementById('add-phoneme-emoji').value.trim() || '🗣️';
        }
        cancelEdit('phonemes');
        saveDB();
        showToast("Fonema actualizado.");
        return;
    }

    const newItem = { id: 'p_' + Date.now(), symbol, word, trans, topic, score: 0 };
    const saveAndReset = () => {
        db.phonemes.push(newItem);
        saveDB();
        document.getElementById('add-phoneme-symbol').value = '';
        document.getElementById('add-phoneme-word').value = '';
        document.getElementById('add-phoneme-trans').value = '';
        document.getElementById('add-phoneme-topic').value = 'General';
        showToast("Fonema guardado.");
    };

    if (imgType === 'emoji') {
        newItem.img = document.getElementById('add-phoneme-emoji').value.trim() || '🗣️';
        saveAndReset();
    } else if (imgType === 'svg') {
        newItem.svgCode = document.getElementById('add-phoneme-svg').value.trim();
        saveAndReset();
    } else if (imgType === 'file') {
        const fileInput = document.getElementById('add-phoneme-file');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newItem.imgDataUrl = e.target.result;
                saveAndReset();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            newItem.img = '🗣️';
            saveAndReset();
        }
    }
}

function addGrammarItem() {
    const verb = document.getElementById('add-gram-verb').value.trim();
    const tense = document.getElementById('add-gram-tense').value.trim() || "Présent";
    const topic = document.getElementById('add-gram-topic').value.trim() || 'General';
    const je = document.getElementById('add-gram-je').value.trim();
    const tu = document.getElementById('add-gram-tu').value.trim();
    const il = document.getElementById('add-gram-il').value.trim();
    const nous = document.getElementById('add-gram-nous').value.trim();
    const vous = document.getElementById('add-gram-vous').value.trim();
    const ils = document.getElementById('add-gram-ils').value.trim();

    if (!verb || !je || !tu || !il || !nous || !vous || !ils) return showToast("Completa todas las conjugaciones.");

    if (editingItemId && editingItemType === 'grammar') {
        const item = db.grammar.find(i => i.id === editingItemId);
        if (item) {
            item.verb = verb;
            item.tense = tense;
            item.topic = topic;
            item.conjugations = { je, tu, il, nous, vous, ils };
        }
        cancelEdit('grammar');
        saveDB();
        showToast("Tabla de gramática actualizada.");
        return;
    }

    db.grammar.push({
        id: 'g_' + Date.now(), verb, tense, topic, score: 0,
        conjugations: { je, tu, il, nous, vous, ils }
    });

    document.getElementById('add-gram-verb').value = '';
    ['je', 'tu', 'il', 'nous', 'vous', 'ils'].forEach(k => document.getElementById(`add-gram-${k}`).value = '');
    saveDB();
    showToast("Tabla de gramática guardada.");
}

function addFillItem() {
    const title = document.getElementById('add-fill-title').value.trim();
    const sentence = document.getElementById('add-fill-sentence').value.trim();
    const answer = document.getElementById('add-fill-answer').value.trim();
    const topic = document.getElementById('add-fill-topic').value.trim() || 'General';
    const imgType = document.querySelector('input[name="fill-img-type"]:checked').value;

    if (!sentence.includes('___') || !answer) return showToast("La oración debe contener '___' y la respuesta.");

    if (editingItemId && editingItemType === 'fill') {
        const item = db.fill.find(i => i.id === editingItemId);
        if (item) {
            item.title = title || 'Completa la frase';
            item.sentence = sentence;
            item.answer = answer;
            item.topic = topic;
            if (imgType === 'emoji') item.img = document.getElementById('add-fill-emoji').value.trim() || '✏️';
        }
        cancelEdit('fill');
        saveDB();
        showToast("Oración actualizada.");
        return;
    }

    const newItem = { id: 'f_' + Date.now(), title: title || 'Completa la frase', sentence, answer, topic, score: 0 };
    const saveAndReset = () => {
        db.fill.push(newItem);
        saveDB();
        document.getElementById('add-fill-title').value = '';
        document.getElementById('add-fill-sentence').value = '';
        document.getElementById('add-fill-answer').value = '';
        showToast("Oración guardada.");
    };

    if (imgType === 'emoji') {
        newItem.img = document.getElementById('add-fill-emoji').value.trim() || '✏️';
        saveAndReset();
    } else if (imgType === 'svg') {
        newItem.svgCode = document.getElementById('add-fill-svg').value.trim();
        saveAndReset();
    } else if (imgType === 'file') {
        const fileInput = document.getElementById('add-fill-file');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newItem.imgDataUrl = e.target.result;
                saveAndReset();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            newItem.img = '✏️';
            saveAndReset();
        }
    }
}

function addOrderItem() {
    const title = document.getElementById('add-order-title').value.trim();
    const sentence = document.getElementById('add-order-sentence').value.trim();
    const extrasRaw = document.getElementById('add-order-extras').value.trim();
    const topic = document.getElementById('add-order-topic').value.trim() || 'General';
    const imgType = document.querySelector('input[name="order-img-type"]:checked').value;

    if (!title || !sentence) return showToast("Completa el título y la oración.");

    const extras = extrasRaw ? extrasRaw.split(',').map(s => s.trim()) : [];

    if (editingItemId && editingItemType === 'order') {
        const item = db.order.find(i => i.id === editingItemId);
        if (item) {
            item.title = title;
            item.sentence = sentence;
            item.extras = extras;
            item.topic = topic;
            if (imgType === 'emoji') item.img = document.getElementById('add-order-emoji').value.trim();
        }
        cancelEdit('order');
        saveDB();
        showToast("Reordenar actualizado.");
        return;
    }

    const newItem = { id: 'o_' + Date.now(), title, sentence, extras, topic, score: 0 };
    const saveAndReset = () => {
        db.order.push(newItem);
        saveDB();
        document.getElementById('add-order-title').value = '';
        document.getElementById('add-order-sentence').value = '';
        document.getElementById('add-order-extras').value = '';
        showToast("Ejercicio de reordenar guardado.");
    };

    if (imgType === 'emoji') {
        newItem.img = document.getElementById('add-order-emoji').value.trim();
        saveAndReset();
    } else if (imgType === 'svg') {
        newItem.svgCode = document.getElementById('add-order-svg').value.trim();
        saveAndReset();
    } else if (imgType === 'file') {
        const fileInput = document.getElementById('add-order-file');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newItem.imgDataUrl = e.target.result;
                saveAndReset();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveAndReset();
        }
    }
}

function deleteItem(type, index) {
    db[type].splice(index, 1);
    saveDB();
    showToast("Elemento eliminado.");
}

function renderCreatorLists() {
    document.getElementById('list-vocab').innerHTML = db.vocab.map((item, idx) => `
        <span class="item-chip">${item.img || '🖼️'} <strong>${item.fr}</strong> (${item.es}) <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="editItem('vocab', ${idx})">✏️</button><span class="remove-chip" onclick="deleteItem('vocab', ${idx})">✕</span></span>
    `).join('');

    document.getElementById('list-phonemes').innerHTML = db.phonemes.map((item, idx) => `
        <span class="item-chip">🗣️ <strong>[${item.symbol}]</strong> ${item.word} <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="editItem('phonemes', ${idx})">✏️</button><span class="remove-chip" onclick="deleteItem('phonemes', ${idx})">✕</span></span>
    `).join('');

    document.getElementById('list-grammar').innerHTML = db.grammar.map((item, idx) => `
        <span class="item-chip">📗 Verbo: <strong>${item.verb}</strong> <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="editItem('grammar', ${idx})">✏️</button><span class="remove-chip" onclick="deleteItem('grammar', ${idx})">✕</span></span>
    `).join('');

    document.getElementById('list-fill').innerHTML = db.fill.map((item, idx) => `
        <span class="item-chip">✏️ <strong>${item.sentence}</strong> <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="editItem('fill', ${idx})">✏️</button><span class="remove-chip" onclick="deleteItem('fill', ${idx})">✕</span></span>
    `).join('');

    document.getElementById('list-order').innerHTML = db.order.map((item, idx) => `
        <span class="item-chip">🧩 <strong>${item.sentence}</strong> <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="editItem('order', ${idx})">✏️</button><span class="remove-chip" onclick="deleteItem('order', ${idx})">✕</span></span>
    `).join('');
}

// --- 8. Almacenamiento Local de Archivo (File System Access API + IndexedDB) ---
let localFileHandle = null;

const DB_NAME = 'buho_local_file_db';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'auto_save_handle';

function openIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

async function saveHandleToIDB(handle) {
    try {
        const db = await openIDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn("Could not save handle to IDB:", e);
    }
}

async function getHandleFromIDB() {
    try {
        const db = await openIDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn("Could not get handle from IDB:", e);
        return null;
    }
}

async function clearHandleFromIDB() {
    try {
        const db = await openIDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
    } catch (e) {
        console.warn("Could not clear handle from IDB:", e);
    }
}

async function initLocalFileHandle() {
    if (!window.showSaveFilePicker) return;
    const handle = await getHandleFromIDB();
    if (handle) {
        localFileHandle = handle;
        try {
            const options = { mode: 'readwrite' };
            const permission = await localFileHandle.queryPermission(options);
            if (permission === 'granted') {
                updateLocalFileStatusUI(true, handle.name);
                await saveToLocalFile();
            } else {
                updateLocalFileStatusUI('needs_permission', handle.name);
            }
        } catch (e) {
            console.error("Error checking handle permission:", e);
            updateLocalFileStatusUI(false);
        }
    }
}

async function openAndConnectLocalFile() {
    if (!window.showOpenFilePicker) {
        showToast("❌ Tu navegador no soporta abrir y conectar archivos locales directamente.");
        return;
    }
    try {
        const options = {
            types: [{
                description: 'JSON Backup Files',
                accept: { 'application/json': ['.json'] }
            }],
            multiple: false
        };
        const [handle] = await window.showOpenFilePicker(options);
        if (!handle) return;

        const file = await handle.getFile();
        const text = await file.text();
        
        let parsedData;
        try {
            parsedData = JSON.parse(text);
        } catch (err) {
            showToast("❌ Error: El archivo no es un JSON válido.");
            return;
        }

        if (parsedData.vocab && parsedData.grammar) {
            db = parsedData;
            if (!db.fill) db.fill = [];
            if (!db.order) db.order = [];
            if (!db.phonemes) db.phonemes = [];
            if (parsedData.sessionCount !== undefined) {
                sessionCount = parsedData.sessionCount;
            }
            saveDB();

            localFileHandle = handle;
            await saveHandleToIDB(localFileHandle);
            updateLocalFileStatusUI(true, localFileHandle.name);
            showToast("📁 Archivo cargado y conectado para auto-guardado.");
            setTimeout(() => location.reload(), 1500);
        } else if (parsedData.vocab || parsedData.phonemes) {
            db = parsedData;
            if (!db.fill) db.fill = [];
            if (!db.order) db.order = [];
            if (!db.phonemes) db.phonemes = [];
            saveDB();

            localFileHandle = handle;
            await saveHandleToIDB(localFileHandle);
            updateLocalFileStatusUI(true, localFileHandle.name);
            showToast("📁 Archivo cargado y conectado para auto-guardado.");
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast("❌ El archivo no tiene el formato correcto (faltan propiedades de vocabulario).");
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            showToast("❌ Error al abrir el archivo.");
            console.error(err);
        }
    }
}

async function connectLocalFile() {
    if (!window.showSaveFilePicker) {
        showToast("❌ Tu navegador no soporta el acceso directo al sistema de archivos.");
        return;
    }
    try {
        const options = {
            suggestedName: 'duo_french_db_backup.json',
            types: [{
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] }
            }]
        };
        localFileHandle = await window.showSaveFilePicker(options);
        await saveHandleToIDB(localFileHandle);
        showToast("📁 Archivo local conectado correctamente.");
        updateLocalFileStatusUI(true, localFileHandle.name);
        await saveToLocalFile();
    } catch (err) {
        if (err.name !== 'AbortError') {
            showToast("❌ Error al conectar archivo local.");
            console.error(err);
        }
    }
}

async function reconnectLocalFile() {
    if (!localFileHandle) return;
    try {
        const options = { mode: 'readwrite' };
        const permission = await localFileHandle.requestPermission(options);
        if (permission === 'granted') {
            showToast("📁 Archivo local reconectado correctamente.");
            updateLocalFileStatusUI(true, localFileHandle.name);
            await saveToLocalFile();
        } else {
            showToast("❌ Permiso denegado.");
            updateLocalFileStatusUI(false);
        }
    } catch (err) {
        console.error("Error requesting permission:", err);
        await clearHandleFromIDB();
        localFileHandle = null;
        updateLocalFileStatusUI(false);
        showToast("❌ El archivo anterior ya no es accesible. Conecta uno nuevo.");
    }
}

async function saveToLocalFile() {
    if (!localFileHandle) return;
    try {
        const writable = await localFileHandle.createWritable();
        const payload = JSON.stringify({ db, sessionCount }, null, 2);
        await writable.write(payload);
        await writable.close();
        showToast("💾 Guardado automáticamente en archivo local.");
    } catch (err) {
        console.error("Error writing to local file:", err);
        showToast("⚠️ Advertencia: No se pudo escribir en el archivo local. Haz clic en reconectar.");
        await clearHandleFromIDB();
        updateLocalFileStatusUI('needs_permission', localFileHandle.name);
        localFileHandle = null;
    }
}

function updateLocalFileStatusUI(status, fileName = '') {
    const statusEl = document.getElementById('local-file-status');
    const reconnectBtn = document.getElementById('reconnect-local-btn');
    if (!statusEl) return;

    if (status === true) {
        statusEl.innerHTML = `Estado: 🟢 <strong>Conectado y auto-guardando en tiempo real (${fileName || 'archivo'})</strong>`;
        if (reconnectBtn) reconnectBtn.style.display = 'none';
    } else if (status === 'needs_permission') {
        statusEl.innerHTML = `Estado: 🟡 <strong>Archivo vinculado previamente ("${fileName || 'archivo'}"). Haz clic en "Reconectar Archivo" para continuar auto-guardando.</strong>`;
        if (reconnectBtn) reconnectBtn.style.display = 'inline-block';
    } else {
        statusEl.innerHTML = `Estado: 🔴 Ningún archivo conectado (usando almacenamiento interno)`;
        if (reconnectBtn) reconnectBtn.style.display = 'none';
    }
}

// --- 9. Inicialización de la Aplicación ---
updateHeaderStats();
populateTopicDropdown();
startNewSession();
initLocalFileHandle();
