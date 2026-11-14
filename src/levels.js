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

// Filtra considerando nivel y asegurando que ítems con bajo dominio (huecos de conocimiento) aparezcan
export function matchesLevelAndSRS(item, selectedLevel) {
    const itemLevel = item.level || 'A1';
    const score = item.score || 0;

    // Si el ítem tiene un puntaje bajo (score < 4), se considera pendiente de refuerzo (evita huecos de conocimiento)
    if (score < 4 && isItemDue(item)) {
        return true;
    }

    if (selectedLevel === 'all') return true;
    return itemLevel === selectedLevel;
}
