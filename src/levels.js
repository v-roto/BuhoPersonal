// --- Módulo de Niveles (CEFR A1-C2) y Prevención de Huecos de Conocimiento ---

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

let currentLevelFilter = localStorage.getItem('buho_level_filter') || 'all';

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
