// --- Selector desplegable de idioma con banderas SVG ---
// (un <select> nativo no puede mostrar SVG en sus opciones)

import { flagSVG } from './flags.js';
import { getLangName } from './i18n.js';

function escapeHTML(text) {
    return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function closeAll(except = null) {
    document.querySelectorAll('.lang-dd.open').forEach(dd => {
        if (dd === except) return;
        dd.classList.remove('open');
        dd.querySelector('.lang-dd-btn')?.setAttribute('aria-expanded', 'false');
        const menu = dd.querySelector('.lang-dd-menu');
        if (menu) menu.hidden = true;
    });
}

// Cierra al hacer clic fuera o con Escape (un único listener para todos los selectores)
document.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-dd')) closeAll();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
});

/**
 * Dibuja un selector de idioma dentro de `container`.
 * @param {HTMLElement} container
 * @param {{ value: string, options: string[], onChange: (code: string) => void, ariaLabel?: string, size?: 'lg' }} config
 */
export function renderLangDropdown(container, { value, options, onChange, ariaLabel = '', size = '' }) {
    if (!container) return;
    container.innerHTML = `
        <div class="lang-dd ${size === 'lg' ? 'lang-dd-lg' : ''}">
            <button type="button" class="lang-dd-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="${escapeHTML(ariaLabel)}">
                ${flagSVG(value, size === 'lg' ? 'flag-lg' : '')}
                <span class="lang-dd-name">${escapeHTML(getLangName(value))}</span>
                <span class="lang-dd-caret" aria-hidden="true">▾</span>
            </button>
            <ul class="lang-dd-menu" role="listbox" hidden>
                ${options.map(code => `
                    <li>
                        <button type="button" class="lang-dd-option ${code === value ? 'selected' : ''}" role="option" aria-selected="${code === value}" data-lang="${code}">
                            ${flagSVG(code)} <span>${escapeHTML(getLangName(code))}</span>
                            ${code === value ? '<span class="lang-dd-check" aria-hidden="true">✓</span>' : ''}
                        </button>
                    </li>`).join('')}
            </ul>
        </div>`;

    const dd = container.querySelector('.lang-dd');
    const btn = dd.querySelector('.lang-dd-btn');
    const menu = dd.querySelector('.lang-dd-menu');
    const optionButtons = [...dd.querySelectorAll('.lang-dd-option')];

    const open = () => {
        closeAll(dd);
        dd.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
        (optionButtons.find(o => o.classList.contains('selected')) || optionButtons[0])?.focus();
    };
    const close = () => closeAll();

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dd.classList.contains('open') ? close() : open();
    });
    optionButtons.forEach((opt, i) => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            close();
            btn.focus();
            if (opt.dataset.lang !== value) onChange(opt.dataset.lang);
        });
        opt.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); optionButtons[(i + 1) % optionButtons.length].focus(); }
            if (e.key === 'ArrowUp') { e.preventDefault(); optionButtons[(i - 1 + optionButtons.length) % optionButtons.length].focus(); }
        });
    });
}
