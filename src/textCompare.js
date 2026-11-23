// --- Comparación de texto (pronunciación y parecido entre respuestas) ---

export function levenshtein(a, b) {
    const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = dp[j];
            dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return dp[b.length];
}

// Pronunciación: sin acentos ni puntuación (el reconocimiento de voz no siempre los respeta)
export function normalizeSpoken(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/ß/g, 'ss').replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
}

// Parecido entre lo dicho y la frase (0..1): el mejor entre palabras acertadas y parecido letra a letra
export function speechSimilarity(target, heard) {
    const a = normalizeSpoken(target);
    const b = normalizeSpoken(heard);
    if (!a || !b) return 0;
    const targetWords = a.split(' ');
    const heardWords = b.split(' ');
    let hits = 0;
    targetWords.forEach(w => {
        const idx = heardWords.indexOf(w);
        if (idx >= 0) { hits++; heardWords.splice(idx, 1); }
    });
    const wordScore = hits / targetWords.length;
    const charScore = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
    return Math.max(wordScore, charScore);
}

// Porcentaje entero de parecido (para mostrar y comparar con los umbrales)
export function speechPercent(target, heard) {
    return Math.round(speechSimilarity(target, heard) * 100);
}
