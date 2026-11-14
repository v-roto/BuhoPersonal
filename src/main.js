// --- Punto de Entrada Principal (Main Module) ---

import { startNewSession, loadNextQuestion, handleDrawerAction } from './exercises.js';
import { renderCreatorLists, populateTopicDropdown } from './creator.js';
import { updateHeaderStats, initLocalFileHandle, connectLocalFile, reconnectLocalFile, openAndConnectLocalFile, setTopicFilter } from './state.js';
import { getLevelFilter, setLevelFilter, CEFR_LEVELS } from './levels.js';
import { setUiLang, getUiLang, setStudyLang, getStudyLang, getTheme, setTheme, applyTheme, t } from './i18n.js';
import { updateVoiceSettings, testSelectedVoice, populateBrowserVoices } from './audio.js';

window.switchView = function(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const navContainer = document.getElementById('nav-links-container');
    if (navContainer) navContainer.classList.remove('mobile-open');

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

window.changeTopicFilter = function() {
    const val = document.getElementById('topic-filter-select').value;
    setTopicFilter(val);
    startNewSession();
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
    startNewSession();
};

window.changeUiLanguage = function() {
    const val = document.getElementById('ui-lang-select').value;
    setUiLang(val);
    location.reload();
};

window.changeStudyLanguage = function() {
    const val = document.getElementById('study-lang-select').value;
    setStudyLang(val);
    location.reload();
};

window.changeThemeMode = function() {
    const val = document.getElementById('theme-select').value;
    setTheme(val);
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
    updateHeaderStats();
    populateTopicDropdown();

    const currentLvl = getLevelFilter();
    const levelSelect = document.getElementById('level-filter-select');
    if (levelSelect) levelSelect.value = currentLvl;
    const homeLevelSelect = document.getElementById('home-level-select');
    if (homeLevelSelect) homeLevelSelect.value = currentLvl;

    const uiLangSelect = document.getElementById('ui-lang-select');
    if (uiLangSelect) uiLangSelect.value = getUiLang();

    const studyLangSelect = document.getElementById('study-lang-select');
    if (studyLangSelect) studyLangSelect.value = getStudyLang();

    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.value = getTheme();

    // Iniciar por defecto en Home
    switchView('home');
    initLocalFileHandle();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
