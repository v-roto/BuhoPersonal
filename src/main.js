// --- Punto de Entrada Principal (Main Module) ---

import { startNewSession, loadNextQuestion, handleDrawerAction } from './exercises.js';
import { renderCreatorLists, populateTopicDropdown } from './creator.js';
import { updateHeaderStats, initLocalFileHandle, connectLocalFile, reconnectLocalFile, openAndConnectLocalFile, setTopicFilter } from './state.js';
import { getLevelFilter, setLevelFilter, CEFR_LEVELS } from './levels.js';
import { setUiLang, t } from './i18n.js';
import { updateVoiceSettings, testSelectedVoice, populateBrowserVoices } from './audio.js';

window.switchView = function(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    if (view === 'practice') {
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

window.changeTopicFilter = function() {
    const val = document.getElementById('topic-filter-select').value;
    setTopicFilter(val);
    startNewSession();
};

window.changeLevelFilter = function() {
    const val = document.getElementById('level-filter-select').value;
    setLevelFilter(val);
    startNewSession();
};

window.changeUiLanguage = function() {
    const val = document.getElementById('ui-lang-select').value;
    setUiLang(val);
    location.reload();
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

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderStats();
    populateTopicDropdown();

    // Sincronizar selectores con los valores actuales en almacenamiento
    const levelSelect = document.getElementById('level-filter-select');
    if (levelSelect) {
        levelSelect.value = getLevelFilter();
    }

    startNewSession();
    initLocalFileHandle();
});
