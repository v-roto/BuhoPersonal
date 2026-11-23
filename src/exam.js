// --- Examen de nivel ---
// 6 bloques (A1 → C2) de 10 preguntas = 60 preguntas de dificultad creciente y 3 vidas en total.
// Completar un bloque sin quedarse sin vidas acredita ese nivel. Las preguntas son de opción múltiple
// (un error de tecleo no cuesta una vida) y salen del contenido incluido en la app, no del del usuario.

import { getPack, getPronouns } from './content/index.js';
import { CEFR_LEVELS, setUnlockedLevel, setLevelFilter } from './levels.js';
import { t, getStudyLang, getStudyLangName, getTranslationLang, localize, localizeTranslation } from './i18n.js';
import { speakFrench, playSound } from './audio.js';
import { showToast } from './state.js';

const QUESTIONS_PER_LEVEL = 10;
const MAX_LIVES = 3;

let exam = null;
let callbacks = { onFinish: () => {}, onExit: () => {} };

const $ = (id) => document.getElementById(id);

function escapeHTML(text) {
    return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function normalize(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Distractores distintos entre sí y de la respuesta correcta (prioriza el primer grupo)
function pickDistractors(answer, groups, count) {
    const seen = new Set([normalize(answer)]);
    const out = [];
    for (const group of groups) {
        for (const candidate of shuffle(group)) {
            const key = normalize(candidate);
            if (!candidate || seen.has(key)) continue;
            seen.add(key);
            out.push(candidate);
            if (out.length === count) return out;
        }
    }
    return out;
}

function makeQuestion(base, answer, distractors) {
    return { ...base, answer, options: shuffle([answer, ...distractors]) };
}

// --- Generación de preguntas por nivel ---
function buildLevelQuestions(pack, lang, level) {
    const studyName = getStudyLangName();
    const pronouns = getPronouns(lang);
    const ofLevel = (list) => list.filter(i => (i.level || 'A1') === level);
    const allWords = pack.vocab.map(v => v.fr);
    const allTranslations = pack.vocab.map(v => localizeTranslation(v.es));
    const allForms = pack.grammar.flatMap(g => Object.values(g.conjugations));
    const fillAnswers = pack.fill.map(f => f.answer.split(/[,/]/)[0].trim());

    const vocab = shuffle(ofLevel(pack.vocab));
    // Sin emoji en vocabulario: la ilustración delataría la respuesta
    const vocabQuestion = (v, toStudy) => {
        const trText = localizeTranslation(v.es);
        const sameLevelWords = ofLevel(pack.vocab).map(x => x.fr);
        const sameLevelTr = ofLevel(pack.vocab).map(x => localizeTranslation(x.es));
        return toStudy
            ? makeQuestion({ kind: 'vocab', level, title: t('examHowDoYouSay', { lang: studyName }), quote: trText },
                v.fr, pickDistractors(v.fr, [sameLevelWords, allWords], 3))
            : makeQuestion({ kind: 'vocab', level, title: t('examWhatMeans'), quote: v.fr, speak: v.fr },
                trText, pickDistractors(trText, [sameLevelTr, allTranslations], 3));
    };

    const main = [];
    vocab.slice(0, 4).forEach((v, i) => main.push(vocabQuestion(v, i % 2 === 0)));

    shuffle(ofLevel(pack.conversation)).slice(0, 3).forEach(c => {
        main.push(makeQuestion({ kind: 'conversation', level, img: c.img, title: t('examBestReply'), context: localize(c.context), quote: c.prompt, speak: c.prompt },
            c.answer, shuffle(c.wrong).slice(0, 2)));
    });

    ofLevel(pack.grammar).forEach(g => {
        const keys = shuffle(Object.keys(g.conjugations)).slice(0, 2);
        keys.forEach(k => {
            const answer = g.conjugations[k];
            main.push(makeQuestion({ kind: 'grammar', level, title: t('examConjugate', { verb: g.verb, tense: g.tense }), quote: `${pronouns[k]} ___` },
                answer, pickDistractors(answer, [Object.values(g.conjugations), allForms], 3)));
        });
    });

    ofLevel(pack.fill).slice(0, 2).forEach(f => {
        const answer = f.answer.split(/[,/]/)[0].trim();
        main.push(makeQuestion({ kind: 'fill', level, img: f.img, title: localize(f.title), quote: f.sentence.replace(/___/, '_____').replace(/___/g, '…') },
            answer, pickDistractors(answer, [fillAnswers, allForms], 3)));
    });

    // Se mezcla el bloque y se completa hasta 10 con vocabulario (dirección contraria) si falta contenido
    let questions = shuffle(main).slice(0, QUESTIONS_PER_LEVEL);
    const extraVocab = [...vocab.slice(4), ...vocab.slice(0, 4)];
    let i = 0;
    while (questions.length < QUESTIONS_PER_LEVEL && i < extraVocab.length * 2) {
        questions.push(vocabQuestion(extraVocab[i % extraVocab.length], i >= extraVocab.length));
        i++;
    }
    return questions;
}

function buildExam() {
    const lang = getStudyLang();
    const pack = getPack(lang);
    return {
        lang,
        questions: CEFR_LEVELS.flatMap(level => buildLevelQuestions(pack, lang, level)),
        index: 0,
        lives: MAX_LIVES,
        selected: null,
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
    exam = null;
    const box = $('exam-container');
    if (!box) return;
    box.innerHTML = `
        <div class="exam-intro">
            <div class="exam-intro-icon">📝</div>
            <h1>${escapeHTML(t('examTitle', { lang: getStudyLangName() }))}</h1>
            <p class="muted">${t('examIntro')}</p>
            <ul class="exam-rules">
                <li>🧩 ${t('examRuleQuestions', { n: CEFR_LEVELS.length * QUESTIONS_PER_LEVEL, levels: CEFR_LEVELS.length })}</li>
                <li>📈 ${t('examRuleDifficulty')}</li>
                <li>❤️ ${t('examRuleLives', { n: MAX_LIVES })}</li>
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
    renderQuestion();
}

function renderQuestion() {
    const box = $('exam-container');
    const q = exam.questions[exam.index];
    exam.selected = null;
    exam.checked = false;
    const total = exam.questions.length;
    const pct = Math.round((exam.index / total) * 100);

    box.innerHTML = `
        <div class="exam-top">
            <div class="exam-hearts" aria-label="${t('examLives')}">${heartsHTML()}</div>
            <div class="exam-progress"><div class="exam-progress-fill" style="width:${pct}%"></div></div>
            <span class="exam-count">${exam.index + 1}/${total}</span>
        </div>
        <div class="exam-level-tag">${q.level} · ${t('levelName' + q.level)}</div>
        <h2 class="exam-question">${escapeHTML(q.title)}</h2>
        ${q.context ? `<div class="chat-context">🎬 ${escapeHTML(q.context)}</div>` : ''}
        <div class="exam-quote">
            ${q.img ? `<span class="exam-quote-img">${escapeHTML(q.img)}</span>` : ''}
            <span class="exam-quote-text">${escapeHTML(q.quote)}</span>
            ${q.speak ? `<button class="speaker-btn speaker-btn-sm" id="exam-speak" title="🔊">🔊</button>` : ''}
        </div>
        <div class="choice-list">
            ${q.options.map((opt, i) => `
                <button class="choice-btn" data-idx="${i}">
                    <span class="choice-key">${i + 1}</span><span class="choice-text">${escapeHTML(opt)}</span>
                </button>`).join('')}
        </div>
        <div class="exam-feedback" id="exam-feedback" hidden></div>
        <button class="action-btn exam-action" id="exam-action" disabled>${t('check')}</button>
        <p class="keyboard-hint">${t('examKeyboardHint')}</p>`;

    box.querySelectorAll('.choice-btn').forEach(btn => btn.addEventListener('click', () => selectOption(Number(btn.dataset.idx))));
    $('exam-action').addEventListener('click', handleAction);
    $('exam-speak')?.addEventListener('click', () => speakFrench(q.speak));
    if (q.speak) setTimeout(() => speakFrench(q.speak), 300);
}

function selectOption(idx) {
    if (!exam || exam.checked) return;
    exam.selected = idx;
    document.querySelectorAll('#exam-container .choice-btn').forEach((b, i) => b.classList.toggle('selected', i === idx));
    $('exam-action').disabled = false;
}

function handleAction() {
    if (!exam) return;
    if (!exam.checked) return checkAnswer();
    if (exam.finished) return renderResults();
    exam.index++;
    renderQuestion();
}

function checkAnswer() {
    if (exam.selected === null) return;
    const q = exam.questions[exam.index];
    const correct = q.options[exam.selected] === q.answer;
    const result = exam.results[q.level];
    result.answered++;
    if (correct) result.correct++;
    else exam.lives--;
    exam.checked = true;

    document.querySelectorAll('#exam-container .choice-btn').forEach((b, i) => {
        b.disabled = true;
        if (q.options[i] === q.answer) b.classList.add('correct');
        else if (i === exam.selected) b.classList.add('incorrect');
    });
    playSound(correct ? 'correct' : 'incorrect');
    if (correct && q.speak && q.kind === 'conversation') speakFrench(q.answer);

    const endOfBlock = (exam.index + 1) % QUESTIONS_PER_LEVEL === 0;
    const isLast = exam.index + 1 >= exam.questions.length;
    if (exam.lives > 0 && endOfBlock) {
        exam.passedLevel = q.level;
        showToast(t('examLevelPassed', { level: q.level }));
    }
    if (exam.lives <= 0 || isLast) exam.finished = true;

    const fb = $('exam-feedback');
    fb.hidden = false;
    fb.className = `exam-feedback ${correct ? 'ok' : 'bad'}`;
    fb.innerHTML = correct
        ? `✓ ${t('excellent')}`
        : `✕ ${t('examCorrectWas')} <strong>${escapeHTML(q.answer)}</strong>${exam.lives > 0 ? ` · ${t('examLivesLeft', { n: exam.lives })}` : ''}`;
    document.querySelector('#exam-container .exam-hearts').innerHTML = heartsHTML();
    const action = $('exam-action');
    action.textContent = exam.finished ? t('examSeeResult') : t('continue');
    action.focus();
}

function renderResults() {
    const level = exam.passedLevel || 'A1';
    setUnlockedLevel(exam.lang, level);
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
            <p class="exam-result-msg">${exam.passedLevel ? t('examUnlockedMsg', { level }) : t('examStartFromA1')}</p>
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

// Teclado: 1-4 para elegir, Enter para comprobar / continuar
document.addEventListener('keydown', (e) => {
    const view = $('view-exam');
    if (!exam || !view || !view.classList.contains('active')) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) selectOption(n - 1);
    if (e.key === 'Enter' && !e.target.closest('.exam-action')) {
        e.preventDefault();
        if (exam.checked || exam.selected !== null) handleAction();
    }
});

export function initExam(options = {}) {
    callbacks = { ...callbacks, ...options };
}
