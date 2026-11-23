// --- Módulo de Inicio (panel) y bienvenida inicial ---

import { db, sessionCount, itemLang, practiceFilter } from './state.js';
import { getLevelFilter } from './levels.js';
import { CONTENT_CATEGORIES, STUDY_LANGS } from './content/index.js';
import { t, getStudyLang, getUiLang, getLangName } from './i18n.js';
import { flagSVG } from './flags.js';
import { renderLangDropdown } from './langDropdown.js';

const LEVEL_ICONS = { all: '⭐', A1: '🌱', A2: '🌿', B1: '🌳', B2: '🏔️', C1: '🚀', C2: '👑' };
const ONBOARDED_KEY = 'buho_onboarded';

function itemsForLang(lang = getStudyLang()) {
    const items = [];
    CONTENT_CATEGORIES.forEach(cat => (db[cat] || []).forEach(i => { if (itemLang(i) === lang) items.push(i); }));
    return items;
}

function levelMastery(items, level) {
    const inLevel = items.filter(i => (i.level || 'A1') === level);
    if (inLevel.length === 0) return 0;
    const mastered = inLevel.filter(i => (i.score || 0) >= 4).length;
    return Math.round((mastered / inLevel.length) * 100);
}

// Botones de idioma de estudio (bandera + nombre)
function renderLangPicker(container, onPick) {
    if (!container) return;
    const current = getStudyLang();
    container.innerHTML = STUDY_LANGS.map(code => `
        <button class="lang-pill ${code === current ? 'selected' : ''}" data-lang="${code}" aria-pressed="${code === current}">
            ${flagSVG(code, 'flag-lg')}
            <span>${getLangName(code)}</span>
        </button>
    `).join('');
    container.querySelectorAll('.lang-pill').forEach(btn => btn.addEventListener('click', () => onPick(btn.dataset.lang)));
}

// Nivel actual del idioma: no se elige, lo acredita el examen
function renderCurrentLevel(level, items) {
    const pct = levelMastery(items, level);
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('level-current-icon', LEVEL_ICONS[level] || '🌱');
    set('level-current-code', level);
    set('level-current-name', t('levelName' + level));
    set('level-current-desc', t('levelDesc' + level));
    set('level-current-mastery', t('levelMastery', { pct }));
    const fill = document.getElementById('level-current-fill');
    if (fill) fill.style.width = `${pct}%`;
}

export function renderHome({ onPickLang }) {
    const lang = getStudyLang();
    const level = getLevelFilter();
    const items = itemsForLang(lang);
    // Pendientes: misma regla que la práctica
    const isDue = practiceFilter(lang, level);
    const due = CONTENT_CATEGORIES.reduce((n, cat) => n + (db[cat] || []).filter(i => isDue(cat, i)).length, 0);
    const inLevel = items.filter(i => (i.level || 'A1') === level).length;
    const mastered = items.filter(i => (i.score || 0) >= 4).length;

    renderLangDropdown(document.getElementById('hero-lang-dropdown'), {
        value: lang, options: STUDY_LANGS, onChange: onPickLang, ariaLabel: t('studyLanguage'), size: 'lg'
    });
    const sub = document.getElementById('home-subgreeting');
    if (sub) {
        const levelText = `${level} · ${t('levelName' + level)}`;
        sub.textContent = t('homeLevelLine', { level: levelText, due });
    }

    const setStat = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setStat('home-stat-sessions', sessionCount);
    setStat('home-stat-due', due);
    setStat('home-stat-mastered', mastered);
    setStat('home-stat-level', inLevel);

    renderCurrentLevel(level, items);
}

// --- Bienvenida (primera visita) ---
export function shouldShowOnboarding(hadStoredData) {
    return !localStorage.getItem(ONBOARDED_KEY) && !hadStoredData;
}

export function markOnboarded() {
    localStorage.setItem(ONBOARDED_KEY, '1');
}

export function renderOnboarding(step, { onPickUiLang, onPickLang, onTakeExam, onStartA1, onBack }) {
    const overlay = document.getElementById('onboarding');
    if (!overlay) return;
    overlay.hidden = false;
    document.body.classList.add('modal-open');

    const step1 = document.getElementById('onb-step-1');
    const step2 = document.getElementById('onb-step-2');
    step1.hidden = step !== 1;
    step2.hidden = step !== 2;
    const stepLabel = document.getElementById('onb-step-label');
    if (stepLabel) stepLabel.textContent = t('onbStep', { n: step });

    const uiPicker = document.getElementById('onb-ui-lang');
    if (uiPicker) {
        const ui = getUiLang();
        uiPicker.innerHTML = ['es', 'en', 'fr'].map(code => `
            <button class="mini-pill ${code === ui ? 'selected' : ''}" data-lang="${code}">${flagSVG(code)} ${code.toUpperCase()}</button>
        `).join('');
        uiPicker.querySelectorAll('.mini-pill').forEach(btn => btn.addEventListener('click', () => onPickUiLang(btn.dataset.lang)));
    }

    if (step === 1) renderLangPicker(document.getElementById('onb-lang-picker'), onPickLang);
    if (step === 2) {
        const examBtn = document.getElementById('onb-exam-btn');
        const a1Btn = document.getElementById('onb-a1-btn');
        if (examBtn) examBtn.onclick = onTakeExam;
        if (a1Btn) a1Btn.onclick = onStartA1;
        const back = document.getElementById('onb-back-btn');
        if (back) back.onclick = onBack;
    }
}

export function closeOnboarding() {
    const overlay = document.getElementById('onboarding');
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('modal-open');
}
