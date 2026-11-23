// --- Punto de Entrada Principal (Main Module) ---

// Se comprueba antes de que cualquier módulo guarde datos: decide si mostrar la bienvenida
const hadStoredData = !!(localStorage.getItem('duo_french_db_v5') || localStorage.getItem('duo_french_db_v4'));

import { startNewSession, handleDrawerAction } from './exercises.js';
import { renderCreatorLists, populateTopicDropdown, updateCreatorExamples, initCreatorView } from './creator.js';
import { updateHeaderStats, initLocalFileHandle, connectLocalFile, reconnectLocalFile, openAndConnectLocalFile, setTopicFilter, ensureLangContent, saveDB } from './state.js';
import { setLevelFilter, getUnlockedLevel, setUnlockedLevel, migrateUnlockedLevels } from './levels.js';
import { initExam, showExamIntro, leaveExam } from './exam.js';
import { setUiLang, getUiLang, setStudyLang, getStudyLang, getTheme, setTheme, applyTheme, applyTranslationsToDOM } from './i18n.js';
import { populateBrowserVoices } from './audio.js';
import { flagSVG } from './flags.js';
import { initDictionary, renderDictionaryChrome } from './dictionary.js';
import { renderHome, shouldShowOnboarding, markOnboarded, renderOnboarding, closeOnboarding } from './home.js';

let currentView = 'home';

function isPracticeActive() {
    return currentView === 'practice';
}

window.switchView = function(view) {
    if (currentView === 'exam' && view !== 'exam') leaveExam();
    currentView = view;
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));

    // Barra superior: el búho lleva a Inicio; solo se muestra el botón de la otra sección
    document.getElementById('btn-mode-home').classList.toggle('active', view === 'home');
    document.getElementById('btn-mode-practice').hidden = view !== 'creator';
    document.getElementById('btn-mode-creator').hidden = view !== 'practice';

    // En Home ocultamos la barra de filtros (Home ya tiene sus propios selectores)
    document.body.classList.toggle('hide-header', view !== 'practice');

    const drawer = document.getElementById('bottom-drawer');
    if (view === 'home') {
        document.getElementById('view-home').classList.add('active');
        drawer.style.display = 'none';
        refreshHome();
    } else if (view === 'exam') {
        document.getElementById('view-exam').classList.add('active');
        drawer.style.display = 'none';
        showExamIntro();
    } else if (view === 'practice') {
        document.getElementById('view-practice').classList.add('active');
        drawer.style.display = 'flex';
        syncLevel();
        startNewSession();
    } else {
        document.getElementById('view-creator').classList.add('active');
        drawer.style.display = 'none';
        initCreatorView();
        renderCreatorLists();
        populateBrowserVoices();
    }
    window.scrollTo({ top: 0 });
};

// --- Tema ---
// El tema se elige en Inicio, antes de empezar la sesión
function applyTopic(val) {
    setTopicFilter(val);
    const sel = document.getElementById('home-topic-select');
    if (sel) sel.value = val;
}

window.changeHomeTopicFilter = function() {
    applyTopic(document.getElementById('home-topic-select').value);
    refreshHome();
};

// --- Nivel ---
// El nivel no se elige: siempre es el nivel actual del idioma (el que acredita el examen)
function syncLevel() {
    setLevelFilter(getUnlockedLevel(getStudyLang()));
}

// --- Idioma de interfaz ---
const UI_LANG_CYCLE = ['es', 'en', 'fr'];

function updateLangButton() {
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.innerHTML = flagSVG(getUiLang(), 'flag-lg');
}

function applyUiLang(lang) {
    setUiLang(lang);
    applyTranslationsToDOM();
    updateLangButton();
    populateTopicDropdown();
    updateCreatorExamples();
    renderCreatorLists();
    refreshHome();
    if (isPracticeActive()) startNewSession();
}

window.cycleUiLanguage = function() {
    const idx = UI_LANG_CYCLE.indexOf(getUiLang());
    applyUiLang(UI_LANG_CYCLE[(idx + 1) % UI_LANG_CYCLE.length]);
};

// --- Idioma de estudio ---
// Aplica el contenido del idioma de estudio actual (añade su contenido por defecto si falta)
function applyStudyLangContent() {
    if (ensureLangContent(getStudyLang())) saveDB();
    populateTopicDropdown();
    // Si el tema elegido no existe en este idioma, el selector vuelve a "todos"
    const topicSelect = document.getElementById('home-topic-select');
    if (topicSelect) applyTopic(topicSelect.value);
    updateCreatorExamples();
    renderCreatorLists();
}

function applyStudyLang(lang) {
    setStudyLang(lang);
    applyStudyLangContent();
    populateBrowserVoices();
    refreshHome();
    if (isPracticeActive()) startNewSession();
}

function refreshHome() {
    syncLevel();
    renderDictionaryChrome();
    renderHome({ onPickLang: applyStudyLang });
}

window.toggleThemeSwitch = function() {
    const checkbox = document.getElementById('theme-toggle-checkbox');
    if (!checkbox) return;
    setTheme(checkbox.checked ? 'dark' : 'light');
};

// --- Bienvenida ---
function showOnboarding(step) {
    renderOnboarding(step, {
        onPickUiLang: (lang) => { applyUiLang(lang); showOnboarding(step); },
        onPickLang: (lang) => { applyStudyLang(lang); showOnboarding(2); },
        onTakeExam: () => {
            markOnboarded();
            closeOnboarding();
            window.switchView('exam');
        },
        onStartA1: () => {
            setUnlockedLevel(getStudyLang(), 'A1');
            syncLevel();
            markOnboarded();
            closeOnboarding();
            window.switchView('home');
        },
        onBack: () => showOnboarding(1)
    });
}

// Enter global para Práctica
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && isPracticeActive()) {
        e.preventDefault();
        handleDrawerAction();
    }
});

// Acciones de archivo
window.connectLocalFile = connectLocalFile;
window.reconnectLocalFile = reconnectLocalFile;
window.openAndConnectLocalFile = () => openAndConnectLocalFile(() => location.reload());

// Inicialización inmediata de la aplicación
function initApp() {
    applyTheme();
    applyTranslationsToDOM();
    updateHeaderStats();
    applyStudyLangContent();
    migrateUnlockedLevels(getStudyLang());
    syncLevel();

    updateLangButton();

    const themeCheckbox = document.getElementById('theme-toggle-checkbox');
    if (themeCheckbox) themeCheckbox.checked = (getTheme() === 'dark');

    initDictionary({ onChange: refreshHome, onPickStudyLang: applyStudyLang, onPickNativeLang: applyUiLang });
    initExam({ onFinish: (view) => window.switchView(view), onExit: () => window.switchView('home') });
    window.switchView('home');
    initLocalFileHandle();

    if (shouldShowOnboarding(hadStoredData)) {
        showOnboarding(1);
    } else {
        markOnboarded();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
