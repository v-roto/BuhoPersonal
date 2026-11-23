// --- Examen de nivel ---
// 5 bloques (A1 → C1) de 15 preguntas = 75 preguntas de dificultad creciente y 3 vidas en total.
// Completar un bloque sin quedarse sin vidas acredita ese nivel.
// Las preguntas salen de un banco propio de cada idioma (src/content/exam/) con opciones casi iguales;
// cada examen toma una selección aleatoria distinta del banco.
//   · opción múltiple (todos los niveles) y conjugación con formas parecidas
//   · escribir (desde A2): la ortografía y los acentos cuentan
//   · leer en voz alta (desde B1): un solo intento, sin editar, basta un 70 % de coincidencia

import { EXAM_BANKS } from './content/exam/index.js';
import { getPronouns } from './content/index.js';
import { CEFR_LEVELS, setUnlockedLevel, setLevelFilter } from './levels.js';
import { t, getStudyLang, getStudyLangName, getStudyLangCode } from './i18n.js';
import { playSound } from './audio.js';
import { showToast } from './state.js';
import { charBarHTML, attachCharBar, applyKeyboardHints } from './specialChars.js';
import { levenshtein, speechSimilarity, speechPercent } from './textCompare.js';

const QUESTIONS_PER_LEVEL = 15;
const MAX_LIVES = 3;
const SPEAK_PASS_PERCENT = 80;     // lectura en voz alta: aprueba por encima del 79 %
const SPEAK_ATTEMPTS = 2;          // se puede repetir la lectura una vez (cuenta el mejor intento)
const EXAM_MINUTES = 30;           // al acabarse el tiempo, el nivel es el último bloque completado
const EASY_LEVELS = ['A1', 'A2'];  // en estos niveles solo una opción incorrecta se parece a la correcta
const PARTIAL_PASS = 6;            // si el examen termina en un bloque con 6+ aciertos, ese nivel cuenta
let timerId = null;

// Cuántas preguntas de cada tipo por bloque (el resto es opción múltiple)
const LEVEL_PLAN = {
    A1: { conj: 4, write: 0, speak: 0 },
    A2: { conj: 4, write: 1, speak: 0 },
    B1: { conj: 3, write: 3, speak: 2 },
    B2: { conj: 3, write: 3, speak: 2 },
    C1: { conj: 3, write: 3, speak: 2 }
};

let exam = null;
let recognition = null;
let callbacks = { onFinish: () => {}, onExit: () => {} };

const $ = (id) => document.getElementById(id);

function escapeHTML(text) {
    return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getSpeechRecognition() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// --- Comparación de respuestas ---
// Escritura: los acentos y la ortografía cuentan; se ignoran mayúsculas, espacios dobles y puntuación final
function normalizeWritten(text) {
    return String(text || '').normalize('NFC').replace(/[’`]/g, "'").toLowerCase()
        .replace(/\s+/g, ' ').replace(/^[\s"«»]+|[\s.!?"«»]+$/g, '').trim();
}

export { speechSimilarity };

// --- Construcción del examen ---
function textSimilarity(a, b) {
    const x = a.toLowerCase();
    const y = b.toLowerCase();
    return 1 - levenshtein(x, y) / Math.max(x.length, y.length, 1);
}

// 3 opciones por pregunta (respuesta + 2 distractores) para reducir la carga mental.
// A1/A2: un distractor parecido y otro claramente distinto. B1+: dos distractores al azar del banco.
function chooseDistractors(answer, candidates, level) {
    const seen = new Set([answer.toLowerCase()]);
    const unique = [];
    candidates.forEach(c => {
        if (c && !seen.has(c.toLowerCase())) { seen.add(c.toLowerCase()); unique.push(c); }
    });
    if (unique.length <= 2) return unique;
    if (EASY_LEVELS.includes(level)) {
        const sorted = [...unique].sort((x, y) => textSimilarity(answer, y) - textSimilarity(answer, x));
        return [sorted[0], sorted[sorted.length - 1]];
    }
    return shuffle(unique).slice(0, 2);
}

function conjQuestions(bank, lang, level) {
    const pronouns = getPronouns(lang);
    const keys = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
    const questions = [];
    (bank.conj || []).filter(r => r[0] === level).forEach(([, verb, tense, forms]) => {
        const list = forms.split('|');
        keys.forEach((k, i) => {
            // Personas poco usadas en ciertos niveles (p. ej. "vosotros" solo en C1)
            if ((bank.skipPersons?.[k] || []).includes(level)) return;
            const distractors = chooseDistractors(list[i], list, level);
            if (distractors.length < 2) return;
            questions.push({
                kind: 'mc', level, title: t('examConjugate', { verb, tense }),
                quote: `${pronouns[k]} ___`, answer: list[i], options: shuffle([list[i], ...distractors]), group: `${verb}-${tense}`
            });
        });
    });
    // Inglés: formas irregulares (pasado / participio) con formas parecidas como distractores
    (bank.irregular || []).filter(r => r[0] === level).forEach(([, base, past, participle]) => {
        const regular = base.endsWith('e') ? `${base}d` : `${base}ed`;
        const pool = [past, participle, base, regular, `${base}en`, `${past}ed`];
        [['examIrregularPast', past], ['examIrregularParticiple', participle]].forEach(([tpl, answer]) => {
            const distractors = chooseDistractors(answer, pool, level);
            if (distractors.length < 2) return;
            questions.push({
                kind: 'mc', level, title: t('examIrregularTitle', { verb: base }),
                quote: t(tpl, { verb: base }), answer, options: shuffle([answer, ...distractors]), group: base
            });
        });
    });
    return questions;
}

function mcQuestion(level, [, q, answer, distractors]) {
    const options = shuffle([answer, ...chooseDistractors(answer, distractors.split('|'), level)]);
    if (!q) return { kind: 'mc', level, title: t('examPickTitle'), quote: '', answer, options };
    if (q.startsWith('—')) return { kind: 'mc', level, title: t('examReplyTitle'), quote: q.replace(/^—\s*/, ''), answer, options };
    return { kind: 'mc', level, title: t('examGapTitle'), quote: q.replace('___', '_____'), answer, options };
}

// Toma n preguntas sin repetir el mismo verbo dos veces si hay alternativas
function pickVaried(pool, n) {
    const out = [];
    const usedGroups = new Set();
    for (const q of shuffle(pool)) {
        if (out.length === n) break;
        if (q.group && usedGroups.has(q.group)) continue;
        out.push(q);
        if (q.group) usedGroups.add(q.group);
    }
    for (const q of shuffle(pool)) {
        if (out.length === n) break;
        if (!out.includes(q)) out.push(q);
    }
    return out;
}

function buildLevel(bank, lang, level, canSpeak) {
    const plan = LEVEL_PLAN[level];
    const ofLevel = (rows) => (rows || []).filter(r => r[0] === level);
    const conjPool = conjQuestions(bank, lang, level);
    const mcPool = ofLevel(bank.mc).map(row => mcQuestion(level, row));
    const writePool = ofLevel(bank.write).map(([, q, answers]) => ({
        kind: 'write', level, title: t('examWriteTitle'), quote: q, answers: answers.split('|')
    }));
    const speakPool = canSpeak ? ofLevel(bank.speak).map(([, q]) => ({ kind: 'speak', level, title: t('examSpeakTitle'), quote: q })) : [];

    const chosen = [
        ...pickVaried(conjPool, plan.conj),
        ...shuffle(writePool).slice(0, plan.write),
        ...shuffle(speakPool).slice(0, plan.speak)
    ];
    const restMc = shuffle(mcPool);
    while (chosen.length < QUESTIONS_PER_LEVEL && restMc.length) chosen.push(restMc.pop());
    // Si el banco de opción múltiple se queda corto, se completa con lo que quede de otros tipos
    const leftovers = shuffle([...conjPool, ...writePool, ...speakPool].filter(q => !chosen.includes(q)));
    while (chosen.length < QUESTIONS_PER_LEVEL && leftovers.length) chosen.push(leftovers.pop());
    return shuffle(chosen);
}

function buildExam() {
    const lang = getStudyLang();
    const bank = EXAM_BANKS[lang] || EXAM_BANKS.fr;
    const canSpeak = !!getSpeechRecognition();
    const questions = CEFR_LEVELS.flatMap(level => buildLevel(bank, lang, level, canSpeak));
    return {
        lang,
        questions,
        blockSizes: Object.fromEntries(CEFR_LEVELS.map(l => [l, questions.filter(q => q.level === l).length])),
        index: 0,
        lives: MAX_LIVES,
        selected: null,
        transcript: '',
        speakAttempts: 0,
        deadline: Date.now() + EXAM_MINUTES * 60 * 1000,
        timedOut: false,
        checked: false,
        passedLevel: null,
        results: Object.fromEntries(CEFR_LEVELS.map(l => [l, { correct: 0, answered: 0 }])),
        finished: false
    };
}

// --- Interfaz ---
function heartsHTML() {
    return Array.from({ length: MAX_LIVES }, (_, i) => `<span class="exam-heart ${i < exam.lives ? '' : 'lost'}">${i < exam.lives ? '❤️' : '🤍'}</span>`).join('');
}

export function showExamIntro() {
    stopRecognition();
    stopTimer();
    exam = null;
    const box = $('exam-container');
    if (!box) return;
    const total = CEFR_LEVELS.length * QUESTIONS_PER_LEVEL;
    box.innerHTML = `
        <div class="exam-intro">
            <div class="exam-intro-icon">📝</div>
            <h1>${escapeHTML(t('examTitle', { lang: getStudyLangName() }))}</h1>
            <p class="muted">${t('examIntro')}</p>
            <ul class="exam-rules">
                <li>🧩 ${t('examRuleQuestions', { n: total, levels: CEFR_LEVELS.length, per: QUESTIONS_PER_LEVEL })}</li>
                <li>📈 ${t('examRuleDifficulty', { per: QUESTIONS_PER_LEVEL })}</li>
                <li>✍️ ${t('examRuleWriting')}</li>
                <li>🎙️ ${t(getSpeechRecognition() ? 'examRuleSpeaking' : 'examRuleNoSpeaking')}</li>
                <li>⏱️ ${t('examRuleTimer', { min: EXAM_MINUTES })}</li>
                <li>❤️ ${t('examRuleLives', { n: MAX_LIVES })}</li>
                <li>🎯 ${t('examRulePartial', { n: PARTIAL_PASS })}</li>
                <li>🔓 ${t('examRuleUnlock')}</li>
            </ul>
            <div class="summary-actions">
                <button class="action-btn" id="exam-start">${t('examStart')}</button>
                <button class="action-btn btn-muted" id="exam-cancel">${t('examCancel')}</button>
            </div>
        </div>`;
    $('exam-start').addEventListener('click', startExam);
    $('exam-cancel').addEventListener('click', () => callbacks.onExit());
}

export function startExam() {
    exam = buildExam();
    startTimer();
    renderQuestion();
}

// --- Cronómetro ---
function formatTime(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function updateTimer() {
    if (!exam) return stopTimer();
    const left = exam.deadline - Date.now();
    const el = $('exam-timer');
    if (el) {
        el.textContent = `⏱️ ${formatTime(left)}`;
        el.classList.toggle('warning', left <= 2 * 60 * 1000);
    }
    if (left <= 0) timeUp();
}

function startTimer() {
    stopTimer();
    timerId = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
}

// Acredita el bloque en curso si ya lleva suficientes aciertos
function creditPartialBlock(level) {
    if (exam.results[level].correct >= PARTIAL_PASS && CEFR_LEVELS.indexOf(level) > CEFR_LEVELS.indexOf(exam.passedLevel)) {
        exam.passedLevel = level;
        exam.partialCredit = true;
    }
}

function timeUp() {
    stopTimer();
    stopRecognition();
    if (!exam) return;
    const current = exam.questions[exam.index];
    if (current) creditPartialBlock(current.level);
    exam.timedOut = true;
    exam.finished = true;
    renderResults();
}

function questionBodyHTML(q) {
    if (q.kind === 'mc') {
        return `
            ${q.quote ? `<div class="exam-quote"><span class="exam-quote-text">${escapeHTML(q.quote)}</span></div>` : ''}
            <div class="choice-list">
                ${q.options.map((opt, i) => `
                    <button class="choice-btn" data-idx="${i}">
                        <span class="choice-key">${i + 1}</span><span class="choice-text">${escapeHTML(opt)}</span>
                    </button>`).join('')}
            </div>`;
    }
    if (q.kind === 'write') {
        return `
            <div class="exam-quote"><span class="exam-quote-text">${escapeHTML(q.quote.replace('___', '_____'))}</span></div>
            <input type="text" id="exam-write-input" class="duo-input exam-write-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t('examWritePlaceholder')}">
            ${charBarHTML(exam.lang, { collapsible: false })}`;
    }
    // speak
    return `
        <div class="exam-quote exam-quote-speak"><span class="exam-quote-text">${escapeHTML(q.quote)}</span></div>
        <p class="exam-speak-hint">${t('examSpeakHint', { pct: SPEAK_PASS_PERCENT })}</p>
        <div class="exam-speak-box">
            <button class="mic-btn" id="exam-mic">🎤</button>
            <p class="speech-status" id="exam-speak-status">${t('examMicStart')}</p>
            <div class="exam-transcript" id="exam-transcript" hidden></div>
        </div>`;
}

function renderQuestion() {
    const box = $('exam-container');
    const q = exam.questions[exam.index];
    exam.selected = null;
    exam.transcript = '';
    exam.speakAttempts = 0;
    exam.checked = false;
    const total = exam.questions.length;
    const pct = Math.round((exam.index / total) * 100);

    box.innerHTML = `
        <div class="exam-top">
            <div class="exam-hearts" aria-label="${t('examLives')}">${heartsHTML()}</div>
            <div class="exam-progress"><div class="exam-progress-fill" style="width:${pct}%"></div></div>
            <span class="exam-count">${exam.index + 1}/${total}</span>
            <span class="exam-timer" id="exam-timer">⏱️ ${formatTime(exam.deadline - Date.now())}</span>
        </div>
        <div class="exam-level-tag">${q.level} · ${t('levelName' + q.level)}</div>
        <h2 class="exam-question">${escapeHTML(q.title)}</h2>
        ${questionBodyHTML(q)}
        <div class="exam-feedback" id="exam-feedback" hidden></div>
        ${q.kind === 'mc' ? `<p class="keyboard-hint">${t('examKeyboardHint')}</p>` : ''}
        <div class="exam-action-bar">
            <button class="action-btn exam-action" id="exam-action" ${q.kind === 'write' ? '' : 'disabled'}>${t('check')}</button>
        </div>`;

    $('exam-action').addEventListener('click', handleAction);
    if (q.kind === 'mc') {
        box.querySelectorAll('.choice-btn').forEach(btn => btn.addEventListener('click', () => selectOption(Number(btn.dataset.idx))));
    } else if (q.kind === 'write') {
        applyKeyboardHints(box, exam.lang);
        attachCharBar(box);
        $('exam-write-input').focus();
    } else {
        $('exam-mic').addEventListener('click', startRecognition);
    }
}

function selectOption(idx) {
    if (!exam || exam.checked) return;
    const q = exam.questions[exam.index];
    if (q.kind !== 'mc') return;
    exam.selected = idx;
    document.querySelectorAll('#exam-container .choice-btn').forEach((b, i) => b.classList.toggle('selected', i === idx));
    $('exam-action').disabled = false;
}

// --- Pronunciación: un solo intento válido ---
function stopRecognition() {
    if (recognition) {
        try { recognition.abort(); } catch (e) { /* ya detenido */ }
        recognition = null;
    }
}

function startRecognition() {
    const SR = getSpeechRecognition();
    const q = exam && exam.questions[exam.index];
    if (!SR || !q || q.kind !== 'speak' || exam.speakAttempts >= SPEAK_ATTEMPTS || exam.checked) return;
    const mic = $('exam-mic');
    const status = $('exam-speak-status');
    recognition = new SR();
    recognition.lang = getStudyLangCode();
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    mic.classList.add('recording');
    mic.disabled = true;
    status.textContent = t('examListening');

    let heard = '';
    recognition.onresult = (event) => {
        const alternatives = [...event.results[0]].map(r => r.transcript);
        // Se queda con la alternativa más parecida: no se pide la perfección
        heard = alternatives.sort((a, b) => speechSimilarity(q.quote, b) - speechSimilarity(q.quote, a))[0] || '';
    };
    recognition.onerror = () => { /* se gestiona en onend */ };
    recognition.onend = () => {
        recognition = null;
        mic.classList.remove('recording');
        if (!exam || exam.checked) return;
        if (heard) {
            exam.speakAttempts++;
            // Cuenta el mejor de los intentos
            if (!exam.transcript || speechSimilarity(q.quote, heard) > speechSimilarity(q.quote, exam.transcript)) exam.transcript = heard;
            const box = $('exam-transcript');
            box.hidden = false;
            box.textContent = heard;
            $('exam-action').disabled = false;
            const canRepeat = exam.speakAttempts < SPEAK_ATTEMPTS;
            mic.disabled = !canRepeat;
            status.textContent = canRepeat ? t('examSpeakAgain') : t('examHeard');
        } else {
            // No se oyó nada: no cuenta como intento
            mic.disabled = false;
            status.textContent = t('examSpeakRetry');
        }
    };
    recognition.start();
}

function handleAction() {
    if (!exam) return;
    if (!exam.checked) return checkAnswer();
    if (exam.finished) return renderResults();
    exam.index++;
    renderQuestion();
}

function checkAnswer() {
    const q = exam.questions[exam.index];
    let correct = false;
    let detail = '';

    if (q.kind === 'mc') {
        if (exam.selected === null) return;
        correct = q.options[exam.selected] === q.answer;
        document.querySelectorAll('#exam-container .choice-btn').forEach((b, i) => {
            b.disabled = true;
            if (q.options[i] === q.answer) b.classList.add('correct');
            else if (i === exam.selected) b.classList.add('incorrect');
        });
        detail = q.answer;
    } else if (q.kind === 'write') {
        const input = $('exam-write-input');
        const value = input.value;
        if (!value.trim()) return;
        correct = q.answers.some(a => normalizeWritten(a) === normalizeWritten(value));
        input.disabled = true;
        input.classList.add(correct ? 'is-correct' : 'is-wrong');
        document.querySelectorAll('#exam-container .char-key').forEach(b => { b.disabled = true; });
        detail = q.answers[0];
    } else {
        if (!exam.transcript) return;
        stopRecognition();
        $('exam-mic').disabled = true;
        const pct = speechPercent(q.quote, exam.transcript);
        correct = pct >= SPEAK_PASS_PERCENT;
        detail = t('examSpeakScore', { pct });
    }

    const result = exam.results[q.level];
    result.answered++;
    if (correct) result.correct++;
    else exam.lives--;
    exam.checked = true;
    playSound(correct ? 'correct' : 'incorrect');

    const blockStart = exam.questions.findIndex(x => x.level === q.level);
    const endOfBlock = exam.index === blockStart + exam.blockSizes[q.level] - 1;
    const isLast = exam.index + 1 >= exam.questions.length;
    if (exam.lives > 0 && endOfBlock) {
        exam.passedLevel = q.level;
        // Superar un bloque devuelve una vida (máximo 3)
        if (exam.lives < MAX_LIVES && !isLast) {
            exam.lives++;
            showToast(t('examLevelPassedLife', { level: q.level }));
        } else {
            showToast(t('examLevelPassed', { level: q.level }));
        }
    }
    // Sin vidas a mitad de bloque: con 6 aciertos o más en él, ese nivel cuenta
    if (exam.lives <= 0) creditPartialBlock(q.level);
    if (exam.lives <= 0 || isLast) exam.finished = true;

    const fb = $('exam-feedback');
    fb.hidden = false;
    fb.className = `exam-feedback ${correct ? 'ok' : 'bad'}`;
    if (q.kind === 'speak') {
        fb.innerHTML = `${correct ? '✓' : '✕'} ${escapeHTML(detail)}${!correct && exam.lives > 0 ? ` · ${t('examLivesLeft', { n: exam.lives })}` : ''}`;
    } else {
        fb.innerHTML = correct
            ? `✓ ${t('excellent')}`
            : `✕ ${t('examCorrectWas')} <strong>${escapeHTML(detail)}</strong>${exam.lives > 0 ? ` · ${t('examLivesLeft', { n: exam.lives })}` : ''}`;
    }
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.querySelector('#exam-container .exam-hearts').innerHTML = heartsHTML();
    const action = $('exam-action');
    action.disabled = false;
    action.textContent = exam.finished ? t('examSeeResult') : t('continue');
    action.focus();
}

function renderResults() {
    stopRecognition();
    stopTimer();
    const level = exam.passedLevel || 'A1';
    // El último examen determina el nivel actual del idioma
    setUnlockedLevel(exam.lang, level, { force: true });
    setLevelFilter(level);
    playSound('finish');

    const rows = CEFR_LEVELS.map(l => {
        const r = exam.results[l];
        const passed = exam.passedLevel && CEFR_LEVELS.indexOf(l) <= CEFR_LEVELS.indexOf(exam.passedLevel);
        const icon = passed ? '✅' : (r.answered ? '❌' : '⬜');
        return `<li class="${passed ? 'passed' : ''}"><span>${icon} <strong>${l}</strong> ${t('levelName' + l)}</span><span>${r.answered ? `${r.correct}/${r.answered}` : '—'}</span></li>`;
    }).join('');

    $('exam-container').innerHTML = `
        <div class="summary-card exam-results">
            <div class="summary-icon">${exam.passedLevel ? '🏆' : '🌱'}</div>
            <h1>${t('examYourLevel')} <span class="exam-result-level">${level}</span></h1>
            <p class="muted">${t('levelName' + level)} · ${t('levelDesc' + level)}</p>
            ${exam.timedOut ? `<p class="exam-result-msg exam-timeout">⏱️ ${t('examTimeUp')}</p>` : ''}
            ${exam.partialCredit ? `<p class="exam-result-msg">🎯 ${t('examPartialCredit', { n: PARTIAL_PASS, level })}</p>` : ''}
            <p class="exam-result-msg">${exam.passedLevel ? t('examLevelSetMsg', { level }) : t('examStartFromA1')}</p>
            <ul class="exam-breakdown">${rows}</ul>
            <div class="summary-actions">
                <button class="action-btn" id="exam-practice">${t('examPracticeAt', { level })}</button>
                <button class="action-btn btn-secondary" id="exam-home">${t('backHome')}</button>
            </div>
        </div>`;
    $('exam-practice').addEventListener('click', () => callbacks.onFinish('practice'));
    $('exam-home').addEventListener('click', () => callbacks.onFinish('home'));
    exam = null;
}

// Teclado: 1-4 para elegir (opción múltiple), Enter para comprobar / continuar
document.addEventListener('keydown', (e) => {
    const view = $('view-exam');
    if (!exam || !view || !view.classList.contains('active')) return;
    const q = exam.questions[exam.index];
    const typing = e.target && e.target.id === 'exam-write-input';
    const n = parseInt(e.key, 10);
    if (!typing && q.kind === 'mc' && n >= 1 && n <= q.options.length) selectOption(n - 1);
    if (e.key === 'Enter' && !e.target.closest('.exam-action')) {
        e.preventDefault();
        if (exam.checked || (q.kind === 'mc' && exam.selected !== null) || (q.kind === 'write') || (q.kind === 'speak' && exam.transcript)) handleAction();
    }
});

export function initExam(options = {}) {
    callbacks = { ...callbacks, ...options };
}

// Detener el micrófono si se sale del examen
export function leaveExam() {
    stopRecognition();
    stopTimer();
}
