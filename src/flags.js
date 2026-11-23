// --- Banderas en SVG ---
// Windows no dibuja los emojis de banderas (muestra "FR", "GB"...), así que se usan SVG propios.

let uid = 0;

const FLAG_BODIES = {
    fr: () => `<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#002654"/><rect x="20" width="10" height="20" fill="#CE1126"/>`,
    it: () => `<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#009246"/><rect x="20" width="10" height="20" fill="#CE2B37"/>`,
    de: () => `<rect width="30" height="20" fill="#FFCE00"/><rect width="30" height="6.67" fill="#000"/><rect y="6.67" width="30" height="6.67" fill="#DD0000"/>`,
    es: () => `<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>`,
    en: () => {
        const id = `ukclip${++uid}`;
        return `<clipPath id="${id}"><path d="M15,10 h15 v10 z v10 h-15 z h-15 v-10 z v-10 h15 z"/></clipPath>
            <rect width="30" height="20" fill="#012169"/>
            <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" stroke-width="4"/>
            <path d="M0,0 L30,20 M30,0 L0,20" clip-path="url(#${id})" stroke="#C8102E" stroke-width="2.4"/>
            <path d="M15,0 v20 M0,10 h30" stroke="#fff" stroke-width="6.5"/>
            <path d="M15,0 v20 M0,10 h30" stroke="#C8102E" stroke-width="3.8"/>`;
    }
};

// Devuelve el HTML de una bandera (código de idioma: fr, en, es, it, de)
export function flagSVG(code, extraClass = '') {
    const body = FLAG_BODIES[code];
    if (!body) return '<span class="flag-icon flag-icon-fallback">🌐</span>';
    return `<svg class="flag-icon ${extraClass}" viewBox="0 0 30 20" preserveAspectRatio="none" role="img" aria-label="${code.toUpperCase()}">${body()}</svg>`;
}
