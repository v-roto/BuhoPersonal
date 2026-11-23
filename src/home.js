// --- Módulo de Inicio (panel) y bienvenida inicial ---

import { db, sessionCount, itemLang } from './state.js';
import { CEFR_LEVELS, getLevelFilter, isItemDue, matchesLevelAndSRS } from './levels.js';
import { CONTENT_CATEGORIES, STUDY_LANGS } from './content/index.js';
import { t, getStudyLang, getUiLang, getLangName, LANG_FLAGS } from './i18n.js';

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
            <span class="lang-flag">${LANG_FLAGS[code] || '🌐'}</span>
            <span>${getLangName(code)}</span>
        </button>
    `).join('');
    container.querySelectorAll('.lang-pill').forEach(btn => btn.addEventListener('click', () => onPick(btn.dataset.lang)));
}

// Tarjetas de nivel con descripción y barra de dominio
function renderLevelPicker(container, onPick, { includeAll = true, showProgress = true } = {}) {
    if (!container) return;
    const current = getLevelFilter();
    const items = itemsForLang();
    const levels = includeAll ? [...CEFR_LEVELS, 'all'] : CEFR_LEVELS;
    container.innerHTML = levels.map(level => {
        const pct = level === 'all' ? null : levelMastery(items, level);
        const progress = showProgress && pct !== null ? `
            <div class="level-progress" title="${t('levelMastery', { pct })}"><div class="level-progress-fill" style="width:${pct}%"></div></div>
            <span class="level-progress-label">${t('levelMastery', { pct })}</span>` : '';
        return `
            <button class="level-card ${level === current ? 'selected' : ''}" data-level="${level}" aria-pressed="${level === current}">
                <span class="level-card-head">
                    <span class="level-icon">${LEVEL_ICONS[level]}</span>
                    <span class="level-code">${level === 'all' ? t('levelNameAll') : level}</span>
                    ${level === 'all' ? '' : `<span class="level-name">${t('levelName' + level)}</span>`}
                </span>
                <span class="level-desc">${t(level === 'all' ? 'levelDescAll' : 'levelDesc' + level)}</span>
                ${progress}
            </button>`;
    }).join('');
    container.querySelectorAll('.level-card').forEach(btn => btn.addEventListener('click', () => onPick(btn.dataset.level)));
}

export function renderHome({ onPickLang, onPickLevel }) {
    const lang = getStudyLang();
    const level = getLevelFilter();
    const items = itemsForLang(lang);
    const due = items.filter(i => matchesLevelAndSRS(i, level) && isItemDue(i)).length;
    const inLevel = level === 'all' ? items.length : items.filter(i => (i.level || 'A1') === level).length;
    const mastered = items.filter(i => (i.score || 0) >= 4).length;

    const greeting = document.getElementById('home-greeting');
    if (greeting) greeting.textContent = `${LANG_FLAGS[lang] || ''} ${t('homeGreeting', { lang: getLangName(lang) })}`;
    const sub = document.getElementById('home-subgreeting');
    if (sub) {
        const levelText = level === 'all' ? t('levelNameAll') : `${level} · ${t('levelName' + level)}`;
        sub.textContent = t('homeLevelLine', { level: levelText, due });
    }

    const setStat = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setStat('home-stat-sessions', sessionCount);
    setStat('home-stat-due', due);
    setStat('home-stat-mastered', mastered);
    setStat('home-stat-level', inLevel);

    renderLangPicker(document.getElementById('study-lang-picker'), onPickLang);
    renderLevelPicker(document.getElementById('home-level-picker'), onPickLevel);
}

// --- Bienvenida (primera visita) ---
export function shouldShowOnboarding(hadStoredData) {
    return !localStorage.getItem(ONBOARDED_KEY) && !hadStoredData;
}

export function markOnboarded() {
    localStorage.setItem(ONBOARDED_KEY, '1');
}

export function renderOnboarding(step, { onPickUiLang, onPickLang, onPickLevel, onBack }) {
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
            <button class="mini-pill ${code === ui ? 'selected' : ''}" data-lang="${code}">${LANG_FLAGS[code]} ${code.toUpperCase()}</button>
        `).join('');
        uiPicker.querySelectorAll('.mini-pill').forEach(btn => btn.addEventListener('click', () => onPickUiLang(btn.dataset.lang)));
    }

    if (step === 1) renderLangPicker(document.getElementById('onb-lang-picker'), onPickLang);
    if (step === 2) {
        renderLevelPicker(document.getElementById('onb-level-picker'), onPickLevel, { includeAll: false, showProgress: false });
        const back = document.getElementById('onb-back-btn');
        if (back) back.onclick = onBack;
    }
}

export function closeOnboarding() {
    const overlay = document.getElementById('onboarding');
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('modal-open');
}
