// --- Módulo de Inicio (panel) y bienvenida inicial ---

import { db, sessionCount, itemLang } from './state.js';
import { CEFR_LEVELS, getLevelFilter, isItemDue, matchesLevelAndSRS, isLevelUnlocked, levelIndex, getUnlockedLevel } from './levels.js';
import { showToast } from './state.js';
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

// Tarjetas de nivel con descripción y barra de dominio
// Tarjetas de nivel: los niveles por encima del desbloqueado (examen) aparecen bloqueados
function renderLevelPicker(container, onPick) {
    if (!container) return;
    const lang = getStudyLang();
    const current = getLevelFilter();
    const items = itemsForLang(lang);
    container.innerHTML = [...CEFR_LEVELS, 'all'].map(level => {
        const locked = !isLevelUnlocked(level, lang);
        const pct = level === 'all' ? null : levelMastery(items, level);
        const progress = locked
            ? `<span class="level-locked-label">🔒 ${t('levelLockedHint')}</span>`
            : (pct !== null ? `
                <div class="level-progress" title="${t('levelMastery', { pct })}"><div class="level-progress-fill" style="width:${pct}%"></div></div>
                <span class="level-progress-label">${t('levelMastery', { pct })}</span>` : '');
        return `
            <button class="level-card ${level === current ? 'selected' : ''} ${locked ? 'locked' : ''}" data-level="${level}" aria-pressed="${level === current}" ${locked ? 'aria-disabled="true"' : ''}>
                <span class="level-card-head">
                    <span class="level-icon">${locked ? '🔒' : LEVEL_ICONS[level]}</span>
                    <span class="level-code">${level === 'all' ? t('levelNameAll') : level}</span>
                    ${level === 'all' ? '' : `<span class="level-name">${t('levelName' + level)}</span>`}
                </span>
                <span class="level-desc">${level === 'all' ? t('levelDescAllUnlocked', { level: getUnlockedLevel(lang) }) : t('levelDesc' + level)}</span>
                ${progress}
            </button>`;
    }).join('');
    container.querySelectorAll('.level-card').forEach(btn => btn.addEventListener('click', () => {
        if (btn.classList.contains('locked')) return showToast(t('levelLockedToast'));
        onPick(btn.dataset.level);
    }));
}

export function renderHome({ onPickLang, onPickLevel }) {
    const lang = getStudyLang();
    const level = getLevelFilter();
    const items = itemsForLang(lang);
    const unlockedItems = items.filter(i => isLevelUnlocked(i.level || 'A1', lang));
    const due = unlockedItems.filter(i => matchesLevelAndSRS(i, level) && isItemDue(i)).length;
    const inLevel = level === 'all' ? unlockedItems.length : items.filter(i => (i.level || 'A1') === level).length;
    const mastered = items.filter(i => (i.score || 0) >= 4).length;

    renderLangDropdown(document.getElementById('hero-lang-dropdown'), {
        value: lang, options: STUDY_LANGS, onChange: onPickLang, ariaLabel: t('studyLanguage'), size: 'lg'
    });
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

    renderLevelPicker(document.getElementById('home-level-picker'), onPickLevel);
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
