// --- Teclas de caracteres especiales (acentos, cedilla, ñ, ß…) según el idioma ---
// Se usan en el examen, en los ejercicios de práctica y en el traductor.
// Si un idioma tiene muchas, se agrupan en un desplegable para no ocupar espacio.

export const SPECIAL_CHARS = {
    fr: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'ù', 'û', 'œ'],
    es: ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'],
    it: ['à', 'è', 'é', 'ì', 'ò', 'ù'],
    de: ['ä', 'ö', 'ü', 'ß'],
    en: []
};

const COLLAPSE_AFTER = 8;
let lastInput = null;

// Recuerda el último campo de texto usado para insertar ahí el carácter
document.addEventListener('focusin', (e) => {
    if (e.target.matches && e.target.matches('input[type="text"], textarea')) lastInput = e.target;
});

export function insertAtCursor(input, text) {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    input.selectionStart = input.selectionEnd = start + text.length;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
}

/**
 * HTML de la barra de caracteres. Con `collapsible`, más de 8 teclas se ocultan tras un botón.
 */
export function charBarHTML(lang, { collapsible = true } = {}) {
    const chars = SPECIAL_CHARS[lang] || [];
    if (!chars.length) return '';
    const collapsed = collapsible && chars.length > COLLAPSE_AFTER;
    return `
        <div class="char-bar ${collapsed ? 'collapsed' : ''}">
            ${collapsed ? `<button type="button" class="char-bar-toggle" aria-expanded="false">${chars.slice(0, 3).join(' ')} … <span class="char-bar-caret">▾</span></button>` : ''}
            <div class="char-bar-keys" ${collapsed ? 'hidden' : ''}>
                ${chars.map(c => `<button type="button" class="char-key" data-char="${c}" aria-label="${c}">${c}</button>`).join('')}
            </div>
        </div>`;
}

/**
 * Activa las barras de caracteres dentro de `root`. Las teclas escriben en el campo enfocado
 * (o el último usado dentro de `root`) sin cerrar el teclado del móvil.
 */
export function attachCharBar(root) {
    if (!root) return;
    const targetInput = () => {
        const active = document.activeElement;
        if (active && root.contains(active) && active.matches('input[type="text"], textarea') && !active.disabled) return active;
        if (lastInput && root.contains(lastInput) && !lastInput.disabled) return lastInput;
        return root.querySelector('input[type="text"]:not([disabled]), textarea:not([disabled])');
    };
    root.querySelectorAll('.char-key').forEach(btn => {
        // pointerdown + preventDefault: el campo no pierde el foco (el teclado del móvil sigue abierto)
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const input = targetInput();
            if (input) insertAtCursor(input, btn.dataset.char);
        });
        // Teclado (Enter/Espacio sobre la tecla)
        btn.addEventListener('click', (e) => {
            if (e.detail !== 0) return;
            const input = targetInput();
            if (input) insertAtCursor(input, btn.dataset.char);
        });
    });
    root.querySelectorAll('.char-bar-toggle').forEach(toggle => {
        toggle.addEventListener('pointerdown', (e) => e.preventDefault());
        toggle.addEventListener('click', () => {
            const keys = toggle.parentElement.querySelector('.char-bar-keys');
            keys.hidden = !keys.hidden;
            toggle.setAttribute('aria-expanded', String(!keys.hidden));
            toggle.classList.toggle('open', !keys.hidden);
        });
    });
}

// Pistas para el teclado del móvil: idioma del campo y sin autocorrección/mayúsculas automáticas.
// (El navegador no puede forzar el idioma del teclado; algunos teclados sí usan el atributo lang.)
export function applyKeyboardHints(root, lang) {
    if (!root) return;
    root.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.lang = lang;
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('autocorrect', 'off');
        input.spellcheck = false;
    });
}
