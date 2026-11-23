// --- Módulo de Lógica de Ejercicios y Práctica ---

import { db, sessionCount, currentTopicFilter, saveDB, incrementSessionCount, itemLang } from './state.js';
import { getPronouns } from './content/index.js';
import { charBarHTML, attachCharBar, applyKeyboardHints } from './specialChars.js';
import { speechPercent, normalizeSpoken } from './textCompare.js';
import { speakFrench, toggleSpeechRecognition, playSound } from './audio.js';
import { getLevelFilter, isItemDue, matchesLevelAndSRS, isLevelUnlocked } from './levels.js';
import { t, getStudyLang, getStudyLangName, localize, localizeTranslation } from './i18n.js';

let sessionQueue = [];
let retryQueue = [];
let currentItem = null;
let isRetryMode = false;
let isChecked = false;
let selectedWords = [];
let questionStartTime = 0;

let sessionStats = { total: 0, answered: 0, firstTryAnswered: 0, firstTryCorrect: 0 };
let selectedChoice = null;
let orderWordBank = [];

// Escapa texto para usarlo como argumento JS dentro de un atributo onclick="..."
function jsArg(text) {
    return String(text || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function escapeHTML(text) {
    return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let matchSelectedLeft = null;
let matchSelectedRight = null;
let matchedPairs = [];

export function selectMatchItem(side, index, itemId) {
    if (matchedPairs.includes(itemId)) return;
    if (!questionStartTime) questionStartTime = Date.now();

    const prefix = side === 'left' ? 'match-left-' : 'match-right-';
    document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => el.classList.remove('is-selected'));
    document.getElementById(`${prefix}${index}`).classList.add('is-selected');
    if (side === 'left') matchSelectedLeft = { index, itemId };
    else matchSelectedRight = { index, itemId };

    if (matchSelectedLeft && matchSelectedRight) {
        const leftEl = document.getElementById(`match-left-${matchSelectedLeft.index}`);
        const rightEl = document.getElementById(`match-right-${matchSelectedRight.index}`);
        [leftEl, rightEl].forEach(el => el.classList.remove('is-selected'));

        if (matchSelectedLeft.itemId === matchSelectedRight.itemId) {
            matchedPairs.push(matchSelectedLeft.itemId);
            [leftEl, rightEl].forEach(el => el.classList.add('is-matched'));
            playSound('correct');
            matchSelectedLeft = null;
            matchSelectedRight = null;
        } else {
            [leftEl, rightEl].forEach(el => el.classList.add('is-wrong'));
            playSound('incorrect');
            matchSelectedLeft = null;
            matchSelectedRight = null;
            setTimeout(() => [leftEl, rightEl].forEach(el => el.classList.remove('is-wrong')), 500);
        }
    }
}

window.selectMatchItem = selectMatchItem;

function hasIllustration(item) {
    return !!(item && (item.imgDataUrl || item.svgCode || item.img));
}

function renderIllustrationHTML(item) {
    if (item.imgDataUrl) {
        return `<div class="illustration-box"><img src="${escapeHTML(item.imgDataUrl)}" alt=""></div>`;
    } else if (item.svgCode) {
        return `<div class="illustration-box">${item.svgCode}</div>`;
    } else {
        return `<div class="vocab-image-placeholder">${escapeHTML(item.img || '📘')}</div>`;
    }
}

function renderMiniIllustrationHTML(item) {
    if (item.imgDataUrl) return `<img class="mini-illustration" src="${escapeHTML(item.imgDataUrl)}" alt="">`;
    if (item.svgCode) return `<span class="mini-illustration">${item.svgCode}</span>`;
    return item.img ? `<span class="mini-emoji">${escapeHTML(item.img)}</span>` : '';
}

const CHOICE_TYPES = ['conversation_choice', 'choice'];
const PRACTICE_SPEAK_PERCENT = 91;   // pronunciación en práctica: más del 90 % de coincidencia

// Respuestas de cada hueco: "a, b" = varios huecos; "x|y" = respuestas válidas para un mismo hueco
function fillAnswerSlots(answer) {
    return String(answer || '').split(/[,/]/).map(slot => slot.split('|').map(a => a.trim()).filter(Boolean));
}

// Quita las pistas entre paréntesis, p. ej. "Je ___ (être) étudiant." → "Je ___ étudiant."
function withoutHints(text) {
    return String(text || '').replace(/\s*\([^)]*\)/g, '');
}

// Igualdad estricta (con acentos) para avisar de errores de acentuación en la práctica
function strictNorm(str) {
    return (str || '').normalize('NFC').toLowerCase().replace(/[.,!?;:"'«»¿¡]/g, '').replace(/\s+/g, ' ').trim();
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
        // Solo niveles desbloqueados con el examen de nivel
        const matchesLvl = matchesLevelAndSRS(item, currentLevel) && isLevelUnlocked(item.level || 'A1', getStudyLang());
        const matchesLang = (itemLang(item) === getStudyLang());
        return matchesTopic && matchesLvl && matchesLang;
    };

    if(db.vocab) {
        let vocabFiltered = db.vocab.filter(item => matchesTopicAndLevel(item));
        vocabFiltered.forEach(item => {
            pool.push({ category: 'vocab', type: 'vocab_type', isSpeaking: false, data: item, score: item.score || 0 });
        });
        const vocabSource = vocabFiltered;
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
    if(db.conversation) {
        db.conversation.forEach(item => {
            if (matchesTopicAndLevel(item)) {
                pool.push({ category: 'conversation', type: 'conversation_choice', isSpeaking: false, data: item, score: item.score || 0 });
                pool.push({ category: 'conversation', type: 'speaking', isSpeaking: true, targetText: item.answer, promptText: t('speakReply', { prompt: item.prompt }), item: item, score: item.score || 0 });
            }
        });
    }
    if(db.choice) {
        db.choice.forEach(item => {
            if (matchesTopicAndLevel(item)) {
                pool.push({ category: 'choice', type: 'choice', isSpeaking: false, data: item, score: item.score || 0 });
            }
        });
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
                const norm = getNormalizedFillParts(withoutHints(item.sentence));
                const answers = fillAnswerSlots(item.answer).map(slot => slot[0]);
                let fullSentence = "";
                norm.parts.forEach((p, idx) => {
                    fullSentence += p;
                    if (idx < answers.length && idx < norm.parts.length - 1) {
                        fullSentence += (answers[idx] || answers[0]);
                    }
                });
                fullSentence += norm.punct;
                pool.push({ category: 'fill', type: 'speaking', isSpeaking: true, targetText: fullSentence.trim(), promptText: t('speakCompleteSentence', { title: localize(item.title) }), item: item, score: item.score || 0 });
            }
        });
    }
    if(db.order) {
        db.order.forEach(item => {
            if (matchesTopicAndLevel(item)) {
                pool.push({ category: 'order', type: 'order', isSpeaking: false, data: item, score: item.score || 0 });
                pool.push({ category: 'order', type: 'speaking', isSpeaking: true, targetText: item.sentence, promptText: t('speakSentence', { title: localizeTranslation(item.title) }), item: item, score: item.score || 0 });
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

    if (pool.length === 0) {
        renderEmptySession();
        return;
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
        if (selectedTypes.size < 8 && items.length > 0) {
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
    sessionStats = { total: sessionQueue.length, answered: 0, firstTryAnswered: 0, firstTryCorrect: 0 };

    loadNextQuestion();
}

function renderEmptySession() {
    sessionQueue = [];
    retryQueue = [];
    const drawer = document.getElementById('bottom-drawer');
    if (drawer) drawer.style.display = 'none';
    const progBar = document.getElementById('progress-bar');
    if (progBar) progBar.style.width = '0%';
    const mobileProg = document.getElementById('progress-bar-mobile');
    if (mobileProg) mobileProg.style.width = '0%';

    const container = document.getElementById('exercise-container');
    if (!container) return;
    container.innerHTML = `
        <div class="summary-card">
            <div class="summary-icon">📭</div>
            <p style="font-size: 1.1rem; color: var(--duo-text-muted); margin-bottom: 20px;">
                ${t('noContentForFilters')}
            </p>
            <div class="summary-actions">
                <button class="action-btn" onclick="window.switchView('home')">${t('backHome')}</button>
                <button class="action-btn btn-secondary" onclick="window.switchView('creator')">${t('btnManageContent')}</button>
            </div>
        </div>
    `;
}

function updateProgressBar() {
    const remaining = sessionQueue.length + retryQueue.length + (isChecked ? 0 : 1);
    const done = sessionStats.answered;
    const pct = done + remaining > 0 ? Math.round((done / (done + remaining)) * 100) : 0;
    const progress = Math.max(3, Math.min(100, pct));
    const progBar = document.getElementById('progress-bar');
    if (progBar) progBar.style.width = `${progress}%`;
    const mobileProg = document.getElementById('progress-bar-mobile');
    if (mobileProg) mobileProg.style.width = `${progress}%`;
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
    selectedChoice = null;
    questionStartTime = null;

    const markTimerStarted = () => {
        if (!questionStartTime) {
            questionStartTime = Date.now();
        }
    };

    container.oninput = markTimerStarted;
    container.onclick = markTimerStarted;

    updateProgressBar();

    const isSpeakingBadge = item.isSpeaking ? 'speaking-badge' : '';
    const scoreVal = item.score || 0;
    const itemObj = item.data || item.item || (item.items ? item.items[0] : {});
    const itemLevel = itemObj.level || 'A1';
    const scoreLabel = `[${itemLevel}] ⭐ ${t('masteryLabel')}: ${scoreVal}/5`;
    const levelBadgeHTML = `
        <div class="level-pill ${isSpeakingBadge}">
            ${item.isSpeaking ? '🎙️ ' + t('microphoneBadge') + ' • ' : ''}${scoreLabel} ${isRetryMode ? '• 🔁 ' + t('reviewBadge') : ''}
        </div>`;

    const wrapTitleWithBadge = (titleText) => `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
            <h2 class="exercise-title" style="margin: 0;">${titleText}</h2>
            ${levelBadgeHTML}
        </div>
    `;

    if (item.type === 'vocab_type') {
        container.innerHTML = `
            ${wrapTitleWithBadge(t('writeWordInStudyLang', { lang: getStudyLangName() }))}
            <div class="vocab-card">
                <div class="vocab-prompt-row">
                    ${hasIllustration(item.data) ? renderIllustrationHTML(item.data) : ''}
                    <p class="vocab-translation-hint">${escapeHTML(localizeTranslation(item.data.es))}</p>
                </div>
                <button class="speaker-btn hint-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${jsArg(item.data.fr)}')">${t('listenAudioHint')}</button>
            </div>
            <input type="text" id="user-input" class="duo-input" placeholder="${t('typeInFrench')}" autocomplete="off">
            ${charBarHTML(getStudyLang())}
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
            ${wrapTitleWithBadge(isAudioOnly ? t('matchAudioTranslation') : t('matchWordTranslation'))}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="display: flex; flex-direction: column; gap: 10px;" id="match-left-column">
                    ${item.items.map((it, idx) => `
                        ${isAudioOnly ? `
                            <div class="match-tile match-tile-audio" id="match-left-${idx}" onclick="window.selectMatchItem('left', ${idx}, '${it.id}'); window.speakFrench('${jsArg(it.fr)}')">
                                🔊
                            </div>
                        ` : `
                            <div class="match-tile match-tile-word" id="match-left-${idx}" onclick="window.selectMatchItem('left', ${idx}, '${it.id}')">
                                <span>${escapeHTML(it.fr)}</span>
                                <button class="speaker-btn speaker-btn-xs" onmousedown="event.preventDefault()" onclick="event.stopPropagation(); window.speakFrench('${jsArg(it.fr)}')">🔊</button>
                            </div>
                        `}
                    `).join('')}
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;" id="match-right-column">
                    ${shuffledRight.map((it, idx) => `
                        <div class="match-tile match-tile-center" id="match-right-${idx}" onclick="window.selectMatchItem('right', ${idx}, '${it.id}')">
                            ${renderMiniIllustrationHTML(it)}<span>${escapeHTML(localizeTranslation(it.es))}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } 
    else if (item.type === 'phoneme_speak') {
        container.innerHTML = `
            ${wrapTitleWithBadge(t('phonemePronunciationTitle'))}
            <div class="speaking-card">
                <div class="phoneme-combined-card">
                    <div class="phoneme-header-row">
                        <span class="phoneme-symbol-text">${escapeHTML(item.data.symbol)}</span>
                        <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${jsArg(item.data.symbol)}')">🔊</button>
                    </div>
                    <div class="phoneme-example-row">
                        <div>
                            <span class="phoneme-example-label">${t('exampleLabel')} </span>
                            <strong class="phoneme-example-word">${escapeHTML(item.data.word)}</strong>
                            <span class="phoneme-example-trans"> (${escapeHTML(localizeTranslation(item.data.trans))})</span>
                            ${renderMiniIllustrationHTML(item.data)}
                        </div>
                        <button class="speaker-btn speaker-btn-sm" onmousedown="event.preventDefault()" onclick="window.speakFrench('${jsArg(item.data.word)}')">🔊</button>
                    </div>
                </div>

                <div style="margin-top: 5px;">
                    <button class="mic-btn" id="mic-trigger-btn" onclick="window.toggleSpeechRecognition()">🎤</button>
                </div>
                <p id="speech-status" class="speech-status">${escapeHTML(t('speakSymbolOrWord', { symbol: item.data.symbol, word: item.data.word }))}</p>
                <p class="speech-threshold">🎯 ${t('practiceSpeakThreshold', { pct: PRACTICE_SPEAK_PERCENT - 1 })}</p>

                <div class="speech-edit-container">
                    <label class="speech-edit-label">${t('whatSystemHeard')}</label>
                    <input type="text" id="user-speech-input" class="duo-input speech-input" placeholder="${t('micOrTypePlaceholder')}" autocomplete="off">
                    ${charBarHTML(getStudyLang())}
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                    <button class="skip-btn" onclick="window.skipSpeakingExercise()">${t('skipExercise')}</button>
                    <button class="skip-btn skip-btn-purple" onclick="window.skipAllSpeakingExercises()">${t('skipAllSpeaking')}</button>
                </div>
            </div>
        `;
    }
    else if (item.type === 'speaking') {
        container.innerHTML = `
            ${wrapTitleWithBadge(t('pronunciationExerciseTitle'))}
            <div class="speaking-card">
                ${item.item ? renderIllustrationHTML(item.item) : '<div style="font-size: 3.5rem;">🗣️</div>'}
                <h3 style="font-size: 1.2rem;">${escapeHTML(item.promptText)}</h3>
                <p class="speaking-target">"${escapeHTML(item.targetText)}"</p>
                <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${jsArg(item.targetText)}')">🔊</button>
                
                <div style="margin-top: 10px;">
                    <button class="mic-btn" id="mic-trigger-btn" onclick="window.toggleSpeechRecognition()">🎤</button>
                </div>
                <p id="speech-status" class="speech-status">${t('micToSpeakIn', { lang: getStudyLangName() })}</p>
                <p class="speech-threshold">🎯 ${t('practiceSpeakThreshold', { pct: PRACTICE_SPEAK_PERCENT - 1 })}</p>

                <div class="speech-edit-container">
                    <label class="speech-edit-label">${t('whatSystemHeard')}</label>
                    <input type="text" id="user-speech-input" class="duo-input speech-input" placeholder="${t('micOrEditPlaceholder')}" autocomplete="off">
                    ${charBarHTML(getStudyLang())}
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                    <button class="skip-btn" onclick="window.skipSpeakingExercise()">${t('skipExercise')}</button>
                    <button class="skip-btn skip-btn-purple" onclick="window.skipAllSpeakingExercises()">${t('skipAllSpeaking')}</button>
                </div>
            </div>
        `;
    }
    else if (item.type === 'choice') {
        const ch = item.data;
        if (!item.options) item.options = [ch.answer, ...(ch.wrong || [])].sort(() => Math.random() - 0.5);
        const prompt = ch.prompt || '';
        const title = !prompt ? t('examPickTitle') : prompt.startsWith('—') ? t('examReplyTitle') : t('examGapTitle');
        const quote = prompt.replace(/^—\s*/, '').replace('___', '_____');
        container.innerHTML = `
            ${wrapTitleWithBadge(title)}
            ${quote ? `<div class="exam-quote"><span class="exam-quote-text">${escapeHTML(quote)}</span>
                <button class="speaker-btn speaker-btn-sm" onmousedown="event.preventDefault()" onclick="window.speakFrench('${jsArg(quote.replace('_____', '…'))}')">🔊</button></div>` : ''}
            <div class="choice-list">
                ${item.options.map((opt, idx) => `
                    <button class="choice-btn" id="choice-${idx}" onclick="window.selectChoice(${idx})">
                        <span class="choice-key">${idx + 1}</span>
                        <span class="choice-text">${escapeHTML(opt)}</span>
                    </button>
                `).join('')}
            </div>
            <p class="keyboard-hint">${t('keyboardHint')}</p>
        `;
    }
    else if (item.type === 'conversation_choice') {
        const conv = item.data;
        if (!item.options) {
            item.options = [conv.answer, ...(conv.wrong || [])].sort(() => Math.random() - 0.5);
        }
        const promptTr = localizeTranslation(conv.promptTr);
        container.innerHTML = `
            ${wrapTitleWithBadge(t('conversationTitle'))}
            ${conv.context ? `<div class="chat-context">🎬 ${escapeHTML(localize(conv.context))}</div>` : ''}
            <div class="chat-row">
                <div class="chat-avatar">${conv.img || '🧑'}</div>
                <div class="chat-bubble">
                    <div class="chat-bubble-text">${escapeHTML(conv.prompt)}</div>
                    <div class="chat-bubble-actions">
                        <button class="speaker-btn speaker-btn-sm" onmousedown="event.preventDefault()" onclick="window.speakFrench('${jsArg(conv.prompt)}')">🔊</button>
                        ${promptTr ? `<button class="link-btn" id="chat-tr-toggle" onclick="window.toggleChatTranslation()">${t('showTranslation')}</button>` : ''}
                    </div>
                    ${promptTr ? `<div class="chat-translation" id="chat-translation" hidden>${escapeHTML(promptTr)}</div>` : ''}
                </div>
            </div>
            <p class="chat-question">${t('chooseBestReply')}</p>
            <div class="choice-list">
                ${item.options.map((opt, idx) => `
                    <button class="choice-btn" id="choice-${idx}" onclick="window.selectChoice(${idx})">
                        <span class="choice-key">${idx + 1}</span>
                        <span class="choice-text">${escapeHTML(opt)}</span>
                    </button>
                `).join('')}
            </div>
            <p class="keyboard-hint">${t('keyboardHint')}</p>
        `;
        setTimeout(() => speakFrench(conv.prompt), 400);
    }
    else if (item.type === 'grammar') {
        const prefilled = item.prefilled || {};
        const pronouns = getPronouns(itemLang(item.data));
        container.innerHTML = `
            ${wrapTitleWithBadge(t('completeConjugationTable'))}
            <div class="instruction-box">
                <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${jsArg(item.data.verb)}')">🔊</button>
                <div>
                    <p style="color: var(--duo-text-muted); margin:0;">${t('verbLabel')}: <strong>${escapeHTML(item.data.verb)}</strong> | ${t('tenseLabel')}: <strong>${escapeHTML(item.data.tense)}</strong></p>
                </div>
                ${item.helpConsumed
                    ? `<span class="grammar-help-note">🎯 ${t('grammarHelpCountsNow')}</span>`
                    : `<button class="grammar-help-btn" id="grammar-help-btn" onclick="window.showGrammarHelp()">💡 ${t('grammarHelpBtn')}</button>`}
            </div>
            <div class="grammar-help-panel" id="grammar-help-panel" hidden></div>
            <div class="grammar-table-container">
                <div class="grammar-header">
                    <span style="font-weight: 800; color: #1899d6;">${t('subjectPronouns')}</span>
                    <span class="grammar-badge">${escapeHTML(item.data.verb)}</span>
                </div>
                <table class="conjugation-table">
                    <tr><td class="pronoun-cell">${pronouns.je}</td><td><input type="text" id="gram-je" class="duo-input ${prefilled.je ? 'is-correct' : ''}" value="${prefilled.je || ''}" ${prefilled.je ? 'disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">${pronouns.tu}</td><td><input type="text" id="gram-tu" class="duo-input ${prefilled.tu ? 'is-correct' : ''}" value="${prefilled.tu || ''}" ${prefilled.tu ? 'disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">${pronouns.il}</td><td><input type="text" id="gram-il" class="duo-input ${prefilled.il ? 'is-correct' : ''}" value="${prefilled.il || ''}" ${prefilled.il ? 'disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">${pronouns.nous}</td><td><input type="text" id="gram-nous" class="duo-input ${prefilled.nous ? 'is-correct' : ''}" value="${prefilled.nous || ''}" ${prefilled.nous ? 'disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">${pronouns.vous}</td><td><input type="text" id="gram-vous" class="duo-input ${prefilled.vous ? 'is-correct' : ''}" value="${prefilled.vous || ''}" ${prefilled.vous ? 'disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                    <tr><td class="pronoun-cell">${pronouns.ils}</td><td><input type="text" id="gram-ils" class="duo-input ${prefilled.ils ? 'is-correct' : ''}" value="${prefilled.ils || ''}" ${prefilled.ils ? 'disabled' : ''} placeholder="..." autocomplete="off"></td></tr>
                </table>
            </div>
            ${charBarHTML(getStudyLang())}
        `;
    }
    else if (item.type === 'fill') {
        const norm = getNormalizedFillParts(item.data.sentence);
        let sentenceHTML = "";
        norm.parts.forEach((p, idx) => {
            sentenceHTML += `<span>${escapeHTML(p)}</span>`;
            if (idx < norm.parts.length - 1) {
                sentenceHTML += `<input type="text" class="inline-blank-input fill-blank-input" data-idx="${idx}" autocomplete="off">`;
            }
        });
        if (norm.punct) {
            sentenceHTML += `<span>${escapeHTML(norm.punct)}</span>`;
        }

        container.innerHTML = `
            ${wrapTitleWithBadge(escapeHTML(localize(item.data.title)))}
            ${hasIllustration(item.data) ? renderIllustrationHTML(item.data) : ''}
            <div class="fill-blank-sentence">
                ${sentenceHTML}
            </div>
            ${charBarHTML(getStudyLang())}
        `;
    }
    else if (item.type === 'order') {
        const targetWords = item.data.sentence.split(' ');
        const allWords = [...targetWords, ...(item.data.extras || [])].sort(() => Math.random() - 0.5);
        orderWordBank = allWords;

        container.innerHTML = `
            ${wrapTitleWithBadge(escapeHTML(localizeTranslation(item.data.title)))}
            <div class="instruction-box">
                <button class="speaker-btn" onmousedown="event.preventDefault()" onclick="window.speakFrench('${jsArg(item.data.sentence)}')">🔊</button>
            </div>
            ${hasIllustration(item.data) ? renderIllustrationHTML(item.data) : ''}
            <div class="sentence-target-area" id="target-word-area"></div>
            <div class="word-bank">
                ${allWords.map((w, idx) => `
                    <button class="word-tile" id="tile-${idx}" onclick="window.toggleWord(${idx})">${escapeHTML(w)}</button>
                `).join('')}
            </div>
        `;
    }
    
    if (container.querySelector('input[type="text"]')) {
        applyKeyboardHints(container, getStudyLang());
        attachCharBar(container);
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

export function selectChoice(idx) {
    if (isChecked || !currentItem || !CHOICE_TYPES.includes(currentItem.type)) return;
    if (!questionStartTime) questionStartTime = Date.now();
    selectedChoice = idx;
    document.querySelectorAll('.choice-btn').forEach((btn, i) => btn.classList.toggle('selected', i === idx));
    speakFrench(currentItem.options[idx]);
}

export function toggleChatTranslation() {
    const el = document.getElementById('chat-translation');
    const btn = document.getElementById('chat-tr-toggle');
    if (!el) return;
    el.hidden = !el.hidden;
    if (btn) btn.textContent = el.hidden ? t('showTranslation') : t('hideTranslation');
}

// Teclas 1-9 para elegir respuesta en conversaciones
document.addEventListener('keydown', (e) => {
    if (!currentItem || !CHOICE_TYPES.includes(currentItem.type) || isChecked) return;
    const practiceView = document.getElementById('view-practice');
    if (!practiceView || !practiceView.classList.contains('active')) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && currentItem.options && n <= currentItem.options.length) selectChoice(n - 1);
});

export function skipSpeakingExercise() {
    loadNextQuestion();
}

export function skipAllSpeakingExercises() {
    sessionQueue = sessionQueue.filter(i => !i.isSpeaking);
    retryQueue = retryQueue.filter(i => !i.isSpeaking);
    loadNextQuestion();
}

export function toggleWord(index) {
    const tile = document.getElementById(`tile-${index}`);
    if (!tile || tile.classList.contains('disabled')) return;
    const word = orderWordBank[index];

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
        <button class="word-tile" onclick="window.removeSelectedWord(${idx})">${escapeHTML(item.word)}</button>
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

// Muestra la conjugación completa. Si se usa, esta vez no se evalúa y el ejercicio vuelve más adelante.
export function showGrammarHelp() {
    if (!currentItem || currentItem.type !== 'grammar' || currentItem.helpConsumed || isChecked) return;
    currentItem.helpUsed = true;
    const pronouns = getPronouns(itemLang(currentItem.data));
    const c = currentItem.data.conjugations;
    const panel = document.getElementById('grammar-help-panel');
    const btn = document.getElementById('grammar-help-btn');
    if (btn) btn.hidden = true;
    if (!panel) return;
    panel.hidden = false;
    panel.innerHTML = `
        <p class="grammar-help-title">💡 ${escapeHTML(currentItem.data.verb)} · ${escapeHTML(currentItem.data.tense)}</p>
        <div class="grammar-help-grid">
            ${Object.keys(c).map(k => `<span class="grammar-help-pronoun">${escapeHTML(pronouns[k])}</span><span class="grammar-help-form">${escapeHTML(c[k])}</span>`).join('')}
        </div>
        <p class="grammar-help-warning">${t('grammarHelpWarning')}</p>`;
}

// Tras usar la ayuda: sin puntuar y de vuelta a la cola para evaluarlo la próxima vez
function deferGrammarAfterHelp() {
    currentItem.helpUsed = false;
    currentItem.helpConsumed = true;
    currentItem.prefilled = {};
    const queue = isRetryMode ? retryQueue : sessionQueue;
    queue.splice(Math.min(3, queue.length), 0, currentItem);

    const c = currentItem.data.conjugations;
    const drawer = document.getElementById('bottom-drawer');
    document.getElementById('feedback-content').style.visibility = 'visible';
    drawer.className = 'bottom-drawer neutral';
    document.getElementById('feedback-icon').textContent = '💡';
    document.getElementById('feedback-title').textContent = t('grammarHelpNotScored');
    document.getElementById('feedback-subtext').textContent = Object.values(c).join(', ');
    const actionBtn = document.getElementById('drawer-action-btn');
    actionBtn.textContent = t('continue');
    actionBtn.className = 'check-btn btn-neutral';
    isChecked = true;
    updateProgressBar();
}

function checkAnswer() {
    if (currentItem.type === 'grammar' && currentItem.helpUsed && !currentItem.helpConsumed) {
        deferGrammarAfterHelp();
        return;
    }
    let isCorrect = false;
    let correctSolutionText = '';
    let textToSpeak = '';
    const elapsedSec = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0;

    let accentNote = '';
    if (currentItem.type === 'vocab_type') {
        const val = document.getElementById('user-input').value.trim();
        isCorrect = (cleanStr(val) === cleanStr(currentItem.data.fr));
        if (isCorrect && strictNorm(val) !== strictNorm(currentItem.data.fr)) accentNote = currentItem.data.fr;
        correctSolutionText = `${currentItem.data.fr} = ${localizeTranslation(currentItem.data.es)}`;
        textToSpeak = currentItem.data.fr;
    } else if (currentItem.type === 'phoneme_speak') {
        const val = document.getElementById('user-speech-input').value.trim();
        const cleanInput = cleanStr(val);
        const cleanSym = cleanStr(currentItem.data.symbol);
        const cleanWord = cleanStr(currentItem.data.word);

        const heardWords = normalizeSpoken(val).split(' ');
        const bestPct = Math.max(speechPercent(currentItem.data.word, val), speechPercent(currentItem.data.symbol, val));
        isCorrect = cleanInput.length > 0 && (heardWords.includes(normalizeSpoken(currentItem.data.word)) || bestPct >= PRACTICE_SPEAK_PERCENT);
        void cleanSym; void cleanWord;
        correctSolutionText = t('phonemeSolution', { symbol: currentItem.data.symbol, word: currentItem.data.word, trans: localizeTranslation(currentItem.data.trans) });
        textToSpeak = currentItem.data.word;
    } else if (currentItem.type === 'speaking') {
        const val = document.getElementById('user-speech-input').value.trim();
        const pct = val ? speechPercent(currentItem.targetText, val) : 0;
        isCorrect = pct >= PRACTICE_SPEAK_PERCENT;
        correctSolutionText = `${currentItem.targetText} · ${t('examSpeakScore', { pct })}`;
        textToSpeak = currentItem.targetText;
    } else if (currentItem.type === 'grammar') {
        const c = currentItem.data.conjugations;
        const pronouns = getPronouns(itemLang(currentItem.data));
        if (!currentItem.prefilled) currentItem.prefilled = {};
        const inputs = {
            je: document.getElementById('gram-je'),
            tu: document.getElementById('gram-tu'),
            il: document.getElementById('gram-il'),
            nous: document.getElementById('gram-nous'),
            vous: document.getElementById('gram-vous'),
            ils: document.getElementById('gram-ils')
        };
        const userVals = {};
        Object.keys(inputs).forEach(k => { userVals[k] = inputs[k].value.trim(); });

        let allGrammarCorrect = true;
        let incorrectConjugations = [];

        Object.keys(c).forEach(k => {
            if (currentItem.prefilled[k]) return;

            if (cleanStr(userVals[k]) === cleanStr(c[k])) {
                currentItem.prefilled[k] = c[k];
                if (inputs[k]) {
                    inputs[k].classList.remove('is-wrong');
                    inputs[k].classList.add('is-correct');
                    inputs[k].disabled = true;
                }
            } else {
                allGrammarCorrect = false;
                incorrectConjugations.push({ pronoun: pronouns[k].split(' / ')[0].replace(/'$/, ''), correct: c[k] });
                if (inputs[k]) inputs[k].classList.add('is-wrong');
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
        const slots = fillAnswerSlots(currentItem.data.answer);
        let allCorrect = true;
        const accentFixes = [];

        if (fillInputs.length > 0) {
            fillInputs.forEach((inp, idx) => {
                const valid = slots[idx] || slots[0] || [''];
                const match = valid.find(a => cleanStr(inp.value) === cleanStr(a));
                inp.classList.toggle('is-correct', !!match);
                inp.classList.toggle('is-wrong', !match);
                if (!match) allCorrect = false;
                else if (!valid.some(a => strictNorm(a) === strictNorm(inp.value))) accentFixes.push(match);
            });
        }
        isCorrect = allCorrect;
        if (isCorrect && accentFixes.length) accentNote = accentFixes.join(', ');
        correctSolutionText = slots.map(slot => slot.join(' / ')).join(', ');

        const norm = getNormalizedFillParts(withoutHints(currentItem.data.sentence));
        let spokenSentence = "";
        norm.parts.forEach((p, idx) => {
            spokenSentence += p;
            if (idx < norm.parts.length - 1) {
                const typed = fillInputs[idx] && fillInputs[idx].value;
                spokenSentence += isCorrect && typed ? typed : ((slots[idx] || slots[0] || [''])[0]);
            }
        });
        textToSpeak = (spokenSentence + norm.punct).trim();
    } else if (currentItem.type === 'order') {
        const userSentence = selectedWords.map(sw => sw.word).join(' ').trim();
        isCorrect = (cleanStr(userSentence) === cleanStr(currentItem.data.sentence));
        correctSolutionText = currentItem.data.sentence;
        textToSpeak = currentItem.data.sentence;
    } else if (currentItem.type === 'choice') {
        if (selectedChoice === null) return;
        isCorrect = currentItem.options[selectedChoice] === currentItem.data.answer;
        correctSolutionText = currentItem.data.answer;
        textToSpeak = (currentItem.data.prompt || '').includes('___')
            ? currentItem.data.prompt.replace(/^—\s*/, '').replace('___', currentItem.data.answer)
            : currentItem.data.answer;
        document.querySelectorAll('.choice-btn').forEach((btn, i) => {
            btn.disabled = true;
            if (currentItem.options[i] === currentItem.data.answer) btn.classList.add('correct');
            else if (i === selectedChoice) btn.classList.add('incorrect');
        });
    } else if (currentItem.type === 'conversation_choice') {
        if (selectedChoice === null) return;
        const chosen = currentItem.options[selectedChoice];
        isCorrect = (chosen === currentItem.data.answer);
        const answerTr = localizeTranslation(currentItem.data.answerTr);
        correctSolutionText = answerTr ? `${currentItem.data.answer} (${answerTr})` : currentItem.data.answer;
        textToSpeak = currentItem.data.answer;
        document.querySelectorAll('.choice-btn').forEach((btn, i) => {
            btn.disabled = true;
            if (currentItem.options[i] === currentItem.data.answer) btn.classList.add('correct');
            else if (i === selectedChoice) btn.classList.add('incorrect');
        });
    } else if (currentItem.type === 'vocab_match_fr' || currentItem.type === 'vocab_match_audio') {
        const totalItems = currentItem.items.length;
        isCorrect = (matchedPairs.length === totalItems);
        correctSolutionText = currentItem.items.map(i => `${i.fr} = ${localizeTranslation(i.es)}`).join(', ');
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
            const isConversation = CHOICE_TYPES.includes(currentItem.type);
            const fastLimit = isGrammar ? 35 : (isPronunciation || isConversation ? 20 : 10);
            const slowLimit = isGrammar ? 50 : (isPronunciation || isConversation ? 30 : 15);

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

    sessionStats.answered++;
    if (!isRetryMode) sessionStats.firstTryAnswered++;
    if (isCorrect && !isRetryMode) sessionStats.firstTryCorrect++;

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
        subtext.textContent = t('solutionLabel', { solution: correctSolutionText })
            + (accentNote ? ` · ⚠️ ${t('accentWarning', { word: accentNote })}` : '');
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
    updateProgressBar();
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

    const accuracy = sessionStats.firstTryAnswered > 0 ? Math.round((sessionStats.firstTryCorrect / sessionStats.firstTryAnswered) * 100) : 0;
    container.innerHTML = `
        <div class="summary-card">
            <div class="summary-icon">🎉</div>
            <h1 style="color: var(--duo-green-dark); margin-bottom: 10px;">${t('sessionCompleted')}</h1>
            <p style="font-size: 1.1rem; color: var(--duo-text-muted); margin-bottom: 20px;">
                ${t('sessionSummaryText')}
            </p>
            <div class="stats-grid stats-grid-3">
                <div class="stat-tile"><span class="stat-value">${sessionStats.firstTryAnswered}</span><span class="stat-label">${t('summaryReviewed')}</span></div>
                <div class="stat-tile"><span class="stat-value">${sessionStats.firstTryCorrect}</span><span class="stat-label">${t('summaryCorrect')}</span></div>
                <div class="stat-tile"><span class="stat-value">${accuracy}%</span><span class="stat-label">${t('summaryAccuracy')}</span></div>
            </div>
            <p style="color: var(--duo-text-muted); margin-bottom: 20px;"><strong>${t('sessionsCompleted')}</strong> ${sessionCount}</p>
            <div class="summary-actions">
                <button class="action-btn" onclick="window.startNewSession()">${t('startNewSession')}</button>
                <button class="action-btn btn-secondary" onclick="window.switchView('home')">${t('backHome')}</button>
            </div>
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
window.selectChoice = selectChoice;
window.toggleChatTranslation = toggleChatTranslation;
window.showGrammarHelp = showGrammarHelp;
