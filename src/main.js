// --- Punto de Entrada Principal (Main Module) ---

import { startNewSession, loadNextQuestion, handleDrawerAction } from './exercises.js';
import { renderCreatorLists, populateTopicDropdown } from './creator.js';
import { updateHeaderStats, initLocalFileHandle, connectLocalFile, reconnectLocalFile, openAndConnectLocalFile, setTopicFilter } from './state.js';
import { getLevelFilter, setLevelFilter, CEFR_LEVELS } from './levels.js';
import { setUiLang, getUiLang, setStudyLang, getStudyLang, getTheme, setTheme, applyTheme, applyTranslationsToDOM, t } from './i18n.js';
import { updateVoiceSettings, testSelectedVoice, populateBrowserVoices } from './audio.js';

window.switchView = function(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const navContainer = document.getElementById('nav-links-container');
    if (navContainer) navContainer.classList.remove('mobile-open');

    // En Home ocultamos la barra superior (es redundante con los botones de acción)
    document.body.classList.toggle('hide-header', view === 'home');

    if (view === 'home') {
        document.getElementById('view-home').classList.add('active');
        document.getElementById('btn-mode-home').classList.add('active');
        document.getElementById('bottom-drawer').style.display = 'none';
    } else if (view === 'practice') {
        document.getElementById('view-practice').classList.add('active');
        document.getElementById('btn-mode-practice').classList.add('active');
        document.getElementById('bottom-drawer').style.display = 'flex';
        startNewSession();
    } else {
        document.getElementById('view-creator').classList.add('active');
        document.getElementById('btn-mode-creator').classList.add('active');
        document.getElementById('bottom-drawer').style.display = 'none';
        renderCreatorLists();
        populateBrowserVoices();
    }
};

window.toggleMobileNav = function() {
    const navContainer = document.getElementById('nav-links-container');
    if (navContainer) {
        navContainer.classList.toggle('mobile-open');
    }
};

document.addEventListener('click', function(e) {
    const navContainer = document.getElementById('nav-links-container');
    if (!navContainer) return;
    if (navContainer.contains(e.target)) return;
    if (e.target.closest('.hamburger-btn')) return;
    navContainer.classList.remove('mobile-open');
});

window.changeTopicFilter = function() {
    const val = document.getElementById('topic-filter-select').value;
    setTopicFilter(val);
    const homeTopic = document.getElementById('home-topic-select');
    if (homeTopic) homeTopic.value = val;
    startNewSession();
};

window.changeHomeTopicFilter = function() {
    const val = document.getElementById('home-topic-select').value;
    setTopicFilter(val);
    const headerTopic = document.getElementById('topic-filter-select');
    if (headerTopic) headerTopic.value = val;
};

window.changeLevelFilter = function() {
    const val = document.getElementById('level-filter-select').value;
    setLevelFilter(val);
    const homeLvl = document.getElementById('home-level-select');
    if (homeLvl) homeLvl.value = val;
    startNewSession();
};

window.changeHomeLevelFilter = function() {
    const val = document.getElementById('home-level-select').value;
    setLevelFilter(val);
    const headerLvl = document.getElementById('level-filter-select');
    if (headerLvl) headerLvl.value = val;
};

const UI_LANG_CYCLE = ['es', 'en', 'fr'];
const UI_LANG_FLAGS = { es: '🇪🇸', en: '🇬🇧', fr: '🇫🇷' };

function updateLangButton() {
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.textContent = UI_LANG_FLAGS[getUiLang()] || '🌐';
}

window.cycleUiLanguage = function() {
    const idx = UI_LANG_CYCLE.indexOf(getUiLang());
    const next = UI_LANG_CYCLE[(idx + 1) % UI_LANG_CYCLE.length];
    setUiLang(next);
    applyTranslationsToDOM();
    updateLangButton();
    renderCreatorLists();
};

window.changeStudyLanguage = function() {
    const val = document.getElementById('study-lang-select').value;
    setStudyLang(val);
    populateBrowserVoices();
    const practiceView = document.getElementById('view-practice');
    if (practiceView && practiceView.classList.contains('active')) {
        startNewSession();
    }
};

window.toggleThemeSwitch = function() {
    const checkbox = document.getElementById('theme-toggle-checkbox');
    if (!checkbox) return;
    setTheme(checkbox.checked ? 'dark' : 'light');
};

// Global Enter Key for Practice
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const practiceView = document.getElementById('view-practice');
        if (practiceView && practiceView.classList.contains('active')) {
            e.preventDefault();
            handleDrawerAction();
        }
    }
});

// File storage actions
window.connectLocalFile = connectLocalFile;
window.reconnectLocalFile = reconnectLocalFile;
window.openAndConnectLocalFile = () => openAndConnectLocalFile(() => location.reload());

// Inicialización inmediata de la aplicación
function initApp() {
    applyTheme();
    applyTranslationsToDOM();
    updateHeaderStats();
    populateTopicDropdown();

    const currentLvl = getLevelFilter();
    const levelSelect = document.getElementById('level-filter-select');
    if (levelSelect) levelSelect.value = currentLvl;
    const homeLevelSelect = document.getElementById('home-level-select');
    if (homeLevelSelect) homeLevelSelect.value = currentLvl;

    const studyLangSelect = document.getElementById('study-lang-select');
    if (studyLangSelect) studyLangSelect.value = getStudyLang();

    updateLangButton();

    // Sincronizar el switch visual con el tema guardado
    const themeCheckbox = document.getElementById('theme-toggle-checkbox');
    if (themeCheckbox) themeCheckbox.checked = (getTheme() === 'dark');

    // Iniciar por defecto en Home
    switchView('home');
    initLocalFileHandle();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
