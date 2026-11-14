// --- Módulo de Lógica de Ejercicios y Práctica ---

import { db, sessionCount, currentTopicFilter, saveDB, incrementSessionCount } from './state.js';
import { speakFrench, toggleSpeechRecognition, playSound } from './audio.js';
import { getLevelFilter, isItemDue, matchesLevelAndSRS } from './levels.js';
import { t } from './i18n.js';

let sessionQueue = [];
let retryQueue = [];
let currentItem = null;
let isRetryMode = false;
let isChecked = false;
let selectedWords = [];
let questionStartTime = 0;

let matchSelectedLeft = null;
let matchSelectedRight = null;
let matchedPairs = [];

export function selectMatchItem(side, index, itemId) {
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

window.selectMatchItem = selectMatchItem;

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

export function startNewSession() {
    let pool = [];
    const currentLevel = getLevelFilter();

    const matchesTopicAndLevel = (item) => {
        const matchesTopic = (currentTopicFilter === 'all' || (item.topic || 'General') === currentTopicFilter);
        const matchesLvl = matchesLevelAndSRS(item, currentLevel);
        return matchesTopic && matchesLvl;
    };

    if(db.vocab) {
        let vocabFiltered = db.vocab.filter(item => matchesTopicAndLevel(item));
        vocabFiltered.forEach(item => {
            pool.push({ category: 'vocab', type: 'vocab_type', isSpeaking: false, data: item, score: item.score || 0 });
        });
        let allVocabPool = db.vocab || [];
        let vocabSource = currentTopicFilter === 'all' ? allVocabPool : allVocabPool.filter(item => (item.topic || 'General') === currentTopicFilter);
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
            if (matchesTopicAndLevel(item)) {
                pool.push({ category: 'grammar', type: 'grammar', isSpeaking: false, data: item, score: item.score || 0 });
            }
        });
    }
    if(db.fill) {
        db.fill.forEach(item => {
            if (matchesTopicAndLevel(item)) {
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
            if (matchesTopicAndLevel(item)) {
                pool.push({ category: 'order', type: 'order', isSpeaking: false, data: item, score: item.score || 0 });
                pool.push({ category: 'order', type: 'speaking', isSpeaking: true, targetText: item.sentence, promptText: `Pronuncia la oración: "${item.title}"`, item: item, score: item.score || 0 });
            }
        });
    }
    if(db.phonemes) {
        db.phonemes.forEach(item => {
            if (matchesTopicAndLevel(item)) {
                pool.push({ category: 'phoneme', type: 'phoneme_speak', isSpeaking: true, data: item, score: item.score || 0 });
            }
        });
    }

    let duePool = pool.filter(i => isItemDue(i.data || i.item || (i.items ? i.items[0] : null)));
    if (duePool.length === 0) {
        duePool = pool;
    }

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

export function loadNextQuestion() {
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

export function renderExercise(item) {
    const container = document.getElementById('exercise-container');
    const drawer = document.getElementById('bottom-drawer');
    if (!container || !drawer) return;
    
    drawer.className = 'bottom-drawer';
    drawer.style.display = 'flex';
    document.getElementById('feedback-content').style.visibility = 'hidden';
    const actionBtn = document.getElementById('drawer-action-btn');
    actionBtn.textContent = t('check');
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
    const itemObj = item.data || item.item || (item.items ? item.items[0] : {});
    const itemLevel = itemObj.level || 'A1';
    const scoreLabel = `[${itemLevel}] ⭐ Dominio: ${scoreVal}/5`;
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
                <button class="speaker-btn hint-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${item.data.fr.replace(/'/g, "\\'")}')">${t('listenAudioHint')}</button>
            </div>
            <input type="text" id="user-input" class="duo-input" placeholder="${t('typeInFrench')}" autocomplete="off">
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
                            <div class="match-tile" id="match-left-${idx}" onclick="window.selectMatchItem('left', ${idx}, '${it.id}'); window.speakFrench('${it.fr.replace(/'/g, "\\'")}')" style="background: white; border: 2px solid var(--duo-gray-border); border-bottom-width: 4px; border-radius: 12px; padding: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                                🔊
                            </div>
                        ` : `
                            <div class="match-tile" id="match-left-${idx}" onclick="window.selectMatchItem('left', ${idx}, '${it.id}')" style="background: white; border: 2px solid var(--duo-gray-border); border-bottom-width: 4px; border-radius: 12px; padding: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                                <span>${it.fr}</span>
                                <button class="speaker-btn" style="width: 32px; height: 32px; font-size: 1rem;" onmousedown="event.preventDefault()" onclick="event.stopPropagation(); window.speakFrench('${it.fr.replace(/'/g, "\\'")}')">🔊</button>
                            </div>
                        `}
                    `).join('')}
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;" id="match-right-column">
                    ${shuffledRight.map((it, idx) => `
                        <div class="match-tile" id="match-right-${idx}" onclick="window.selectMatchItem('right', ${idx}, '${it.id}')" style="background: white; border: 2px solid var(--duo-gray-border); border-bottom-width: 4px; border-radius: 12px; padding: 12px; font-weight: 800; cursor: pointer; text-align: center;">
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
                        <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${item.data.symbol.replace(/'/g, "\\'")}')">🔊</button>
                    </div>
                    <div class="phoneme-example-row">
                        <div>
                            <span style="font-size: 0.8rem; color: var(--duo-text-muted);">Ejemplo: </span>
                            <strong style="color: var(--duo-purple-dark); font-size: 1.1rem;">${item.data.word}</strong>
                            <span style="color: var(--duo-text-muted); font-size: 0.9rem;"> (${item.data.trans})</span>
                            ${renderMiniIllustrationHTML(item.data)}
                        </div>
                        <button class="speaker-btn" style="width: 34px; height: 34px; font-size: 0.95rem;" onmousedown="event.preventDefault()" onclick="window.speakFrench('${item.data.word.replace(/'/g, "\\'")}')">🔊</button>
                    </div>
                </div>

                <div style="margin-top: 5px;">
                    <button class="mic-btn" id="mic-trigger-btn" onclick="window.toggleSpeechRecognition()">🎤</button>
                </div>
                <p id="speech-status" style="font-size: 0.85rem; color: var(--duo-text-muted);">Toca el micrófono y pronuncia "${item.data.symbol}" o "${item.data.word}"</p>

                <div class="speech-edit-container">
                    <label class="speech-edit-label">Lo que escuchó el sistema (puedes editarlo):</label>
                    <input type="text" id="user-speech-input" class="duo-input" placeholder="Haz clic en el mic o escribe aquí..." style="border-color: #ce93d8;" autocomplete="off">
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                    <button class="skip-btn" onclick="window.skipSpeakingExercise()">${t('skipExercise')}</button>
                    <button class="skip-btn" style="background: #f3e5f5; border-color: #ce93d8; color: var(--duo-purple-dark);" onclick="window.skipAllSpeakingExercises()">${t('skipAllSpeaking')}</button>
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
                <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${item.targetText.replace(/'/g, "\\'")}')">🔊</button>
                
                <div style="margin-top: 10px;">
                    <button class="mic-btn" id="mic-trigger-btn" onclick="window.toggleSpeechRecognition()">🎤</button>
                </div>
                <p id="speech-status" style="font-size: 0.85rem; color: var(--duo-text-muted);">Toca el micrófono para hablar en francés</p>

                <div class="speech-edit-container">
                    <label class="speech-edit-label">Lo que escuchó el sistema (puedes editarlo):</label>
                    <input type="text" id="user-speech-input" class="duo-input" placeholder="Haz clic en el mic o edita la respuesta aquí..." style="border-color: #ce93d8;" autocomplete="off">
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                    <button class="skip-btn" onclick="window.skipSpeakingExercise()">${t('skipExercise')}</button>
                    <button class="skip-btn" style="background: #f3e5f5; border-color: #ce93d8; color: var(--duo-purple-dark);" onclick="window.skipAllSpeakingExercises()">${t('skipAllSpeaking')}</button>
                </div>
            </div>
        `;
    }
    else if (item.type === 'grammar') {
        const prefilled = item.prefilled || {};
        container.innerHTML = `
            ${wrapTitleWithBadge('Completa la tabla de conjugación')}
            <div class="instruction-box">
                <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${item.data.verb.replace(/'/g, "\\'")}')">🔊</button>
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
                <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${item.data.sentence.replace(/'/g, "\\'")}')">🔊</button>
            </div>
            ${item.data.img || item.data.imgDataUrl || item.data.svgCode ? renderIllustrationHTML(item.data) : ''}
            <div class="sentence-target-area" id="target-word-area"></div>
            <div class="word-bank">
                ${allWords.map((w, idx) => `
                    <button class="word-tile" id="tile-${idx}" onclick="window.toggleWord('${w.replace(/'/g, "\\'")}', ${idx})">${w}</button>
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

export function skipSpeakingExercise() {
    loadNextQuestion();
}

export function skipAllSpeakingExercises() {
    sessionQueue = sessionQueue.filter(i => !i.isSpeaking);
    retryQueue = retryQueue.filter(i => !i.isSpeaking);
    loadNextQuestion();
}

export function toggleWord(word, index) {
    const tile = document.getElementById(`tile-${index}`);
    if (!tile || tile.classList.contains('disabled')) return;

    selectedWords.push({ word, index });
    tile.classList.add('disabled');
    speakFrench(word);
    renderSelectedWords();
}

export function removeSelectedWord(arrayIdx) {
    const item = selectedWords[arrayIdx];
    document.getElementById(`tile-${item.index}`).classList.remove('disabled');
    selectedWords.splice(arrayIdx, 1);
    renderSelectedWords();
}

function renderSelectedWords() {
    const area = document.getElementById('target-word-area');
    if (!area) return;
    area.innerHTML = selectedWords.map((item, idx) => `
        <button class="word-tile" onclick="window.removeSelectedWord(${idx})">${item.word}</button>
    `).join('');
}

export function handleDrawerAction() {
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
            if (currentItem.prefilled[k]) return;

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
                }
            }
        });

        isCorrect = allGrammarCorrect;
        if (isCorrect) {
            currentItem.prefilled = {};
        }
        correctSolutionText = `${c.je}, ${c.tu}, ${c.il}, ${c.nous}, ${c.vous}, ${c.ils}`;
        textToSpeak = !isCorrect && incorrectConjugations.length > 0 
            ? incorrectConjugations.map(ic => `${ic.pronoun} ${ic.correct}`).join('. ') 
            : currentItem.data.verb;
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
        title.textContent = t('excellent');
        subtext.textContent = `Solución: ${correctSolutionText}`;
        actionBtn.textContent = t('continue');
        actionBtn.className = 'check-btn';
    } else {
        drawer.className = 'bottom-drawer incorrect';
        icon.textContent = '✕';
        title.textContent = t('incorrect');
        subtext.textContent = correctSolutionText;
        actionBtn.textContent = t('understood');
        actionBtn.className = 'check-btn btn-incorrect';
    }

    isChecked = true;
}

function finishSession() {
    incrementSessionCount();
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
            <h1 style="color: var(--duo-green-dark); margin-bottom: 10px;">${t('sessionCompleted')}</h1>
            <p style="font-size: 1.1rem; color: var(--duo-text-muted); margin-bottom: 20px;">
                Completados los ejercicios con repaso inteligente (SRS).
            </p>
            <div style="background: var(--duo-gray-light); padding: 15px; border-radius: 12px; margin-bottom: 25px; text-align: left;">
                <p><strong>${t('sessionsCompleted')}</strong> ${sessionCount}</p>
            </div>
            <button class="action-btn" onclick="window.startNewSession()">${t('startNewSession')}</button>
        </div>
    `;
}

// Exponer funciones globales para eventos en HTML
window.speakFrench = speakFrench;
window.toggleSpeechRecognition = toggleSpeechRecognition;
window.skipSpeakingExercise = skipSpeakingExercise;
window.skipAllSpeakingExercises = skipAllSpeakingExercises;
window.toggleWord = toggleWord;
window.removeSelectedWord = removeSelectedWord;
window.handleDrawerAction = handleDrawerAction;
window.startNewSession = startNewSession;
