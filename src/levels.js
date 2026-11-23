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

// Momento en que un ítem vuelve a tocar (las estrellas marcan el intervalo)
export function nextDueDate(item) {
    const score = item.score || 0;
    if (score === 0) return Date.now();
    return (item.lastAskedDate || 0) + getRequiredDays(score) * 24 * 60 * 60 * 1000;
}

function idxOf(level) {
    const idx = CEFR_LEVELS.indexOf(normalizeLevel(level || 'A1'));
    return idx < 0 ? 0 : idx;
}

// --- Subir de nivel por tipo de ejercicio ---
// Cada tipo (vocabulario, conversación, opción múltiple…) puede abrir niveles superiores al actual
// por su cuenta, uno a uno, cuando ya se domina lo anterior:
// - vocabulario: cuando ya se vieron todas las palabras hasta ese nivel (al menos 1 ⭐);
// - fonemas: cuando todos los fonemas hasta ese nivel tienen 4-5 ⭐;
// - resto: cuando todos los ejercicios de ese tipo hasta ese nivel tienen 4-5 ⭐
//   y son al menos MIN_MASTERED_TO_ADVANCE (sumando los niveles).
export const MASTERED_SCORE = 4;
export const MIN_MASTERED_TO_ADVANCE = 10;

const ADVANCE_RULES = {
    vocab: { isDone: (i) => (i.score || 0) > 0, min: 0 },
    phonemes: { isDone: (i) => (i.score || 0) >= MASTERED_SCORE, min: 0 },
    default: { isDone: (i) => (i.score || 0) >= MASTERED_SCORE, min: MIN_MASTERED_TO_ADVANCE }
};

// Nivel más alto abierto para un tipo (≥ nivel actual). `items`: los de ese tipo en el idioma de estudio.
export function openLevelFor(category, items, selectedLevel) {
    if (selectedLevel === 'all') return 'all';
    const rule = ADVANCE_RULES[category] || ADVANCE_RULES.default;
    let open = idxOf(selectedLevel);
    for (;;) {
        const upTo = items.filter(i => idxOf(i.level) <= open);
        const done = upTo.filter(rule.isDone).length;
        if (done < upTo.length || done < rule.min) break;
        const higher = items.filter(i => idxOf(i.level) > open).map(i => idxOf(i.level));
        if (!higher.length) break;
        open = Math.min(...higher);
    }
    return CEFR_LEVELS[open];
}

// Niveles abiertos de todos los tipos: { vocab: 'B1', choice: 'A2', … }
export function openLevelsByCategory(itemsByCategory, selectedLevel) {
    const out = {};
    Object.keys(itemsByCategory).forEach(cat => { out[cat] = openLevelFor(cat, itemsByCategory[cat], selectedLevel); });
    return out;
}

// ¿Entra este ítem en la práctica ahora?
// - Solo si toca repasarlo según sus estrellas (5 ⭐ = cada 90 días).
// - Entran el nivel actual y todos los inferiores, y los superiores que su tipo ya abrió (openLevel).
// - Lo ya empezado de un nivel superior se sigue repasando.
export function isPracticeDue(item, selectedLevel, openLevel = selectedLevel) {
    if (!isItemDue(item)) return false;
    if (selectedLevel === 'all') return true;
    const itemIdx = idxOf(item.level);
    if (itemIdx <= Math.max(idxOf(selectedLevel), idxOf(openLevel))) return true;
    return (item.score || 0) > 0;
}

// ¿Es de un nivel inferior al actual? (sirve para repartir la sesión entre nivel actual y repaso)
export function isBelowLevel(item, selectedLevel) {
    return selectedLevel !== 'all' && idxOf(item.level) < idxOf(selectedLevel);
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
