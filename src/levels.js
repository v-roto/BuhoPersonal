// --- Módulo de Niveles (CEFR A1-C1) y Prevención de Huecos de Conocimiento ---

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

// El nivel C2 se retiró: los datos antiguos con C2 pasan a C1
export function normalizeLevel(level) {
    return level === 'C2' ? 'C1' : level;
}

let currentLevelFilter = normalizeLevel(localStorage.getItem('buho_level_filter') || 'all');

export function getLevelFilter() {
    return currentLevelFilter;
}

export function setLevelFilter(level) {
    currentLevelFilter = level;
    localStorage.setItem('buho_level_filter', level);
}

// Intervalos de días según puntuación de Repetición Espaciada (0 a 5)
export function getRequiredDays(score) {
    if (score === 0) return 0;
    if (score === 1) return 1;
    if (score === 2) return 4;
    if (score === 3) return 12;
    if (score === 4) return 30;
    if (score === 5) return 90;
    return 999999;
}

export function isItemDue(item) {
    const score = item.score || 0;
    if (score === 0) return true;
    const lastAsked = item.lastAskedDate || 0;
    const daysElapsed = (Date.now() - lastAsked) / (1000 * 60 * 60 * 24);
    return daysElapsed >= getRequiredDays(score);
}

// Filtra por nivel evitando huecos de conocimiento:
// - siempre entran los ítems del nivel elegido;
// - de niveles inferiores solo entran los ya practicados con bajo dominio (1-3) que toca repasar;
// - los niveles superiores quedan fuera.
export function matchesLevelAndSRS(item, selectedLevel) {
    if (selectedLevel === 'all') return true;
    const itemIdx = CEFR_LEVELS.indexOf(item.level || 'A1');
    const selectedIdx = CEFR_LEVELS.indexOf(selectedLevel);
    if (itemIdx === selectedIdx) return true;
    const score = item.score || 0;
    return itemIdx < selectedIdx && score > 0 && score < 4 && isItemDue(item);
}

// --- Niveles desbloqueados por idioma (se obtienen con el examen de nivel) ---
const UNLOCK_KEY = 'buho_unlocked_levels';

function readUnlocked() {
    try {
        const stored = JSON.parse(localStorage.getItem(UNLOCK_KEY));
        if (stored && typeof stored === 'object') return stored;
    } catch (e) { /* valor corrupto: se reinicia */ }
    return null;
}

export function levelIndex(level) {
    const idx = CEFR_LEVELS.indexOf(level || 'A1');
    return idx < 0 ? 0 : idx;
}

// Usuarios anteriores al examen: conservan el nivel que ya tenían elegido en su idioma actual
export function migrateUnlockedLevels(currentLang) {
    if (readUnlocked()) return;
    const filter = getLevelFilter();
    const initial = CEFR_LEVELS.includes(filter) ? filter : 'A1';
    localStorage.setItem(UNLOCK_KEY, JSON.stringify({ [currentLang]: initial }));
}

export function getUnlockedLevel(lang) {
    const map = readUnlocked() || {};
    const level = normalizeLevel(map[lang]);
    return CEFR_LEVELS.includes(level) ? level : 'A1';
}

// Por defecto nunca baja un nivel ya conseguido; el examen lo fija tal cual (force)
export function setUnlockedLevel(lang, level, { force = false } = {}) {
    const map = readUnlocked() || {};
    if (force || levelIndex(level) >= levelIndex(map[lang])) map[lang] = level;
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(map));
}

export function isLevelUnlocked(level, lang) {
    return level === 'all' || levelIndex(level) <= levelIndex(getUnlockedLevel(lang));
}
