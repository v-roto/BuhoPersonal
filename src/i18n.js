// --- Módulo de Internacionalización (i18n) y Multi-idioma ---

export const translations = {
    es: {
        home: "🏠 Inicio",
        practice: "🎮 Práctica",
        creator: "➕ Contenido",
        settings: "⚙️ Configuración",
        allTopics: "📚 Todos los Temas",
        allLevels: "⭐ Todos los Niveles",
        check: "COMPROBAR",
        continue: "CONTINUAR",
        understood: "ENTENDIDO",
        excellent: "¡Excelente!",
        incorrect: "Incorrecto. Lo repasaremos al final:",
        sessionCompleted: "¡Sesión Completada!",
        sessionsCompleted: "Sesiones completadas:",
        startNewSession: "🚀 Iniciar Nueva Sesión",
        skipExercise: "⏭️ Saltar este ejercicio",
        skipAllSpeaking: "⏭️ Saltar TODOS de pronunciación",
        listenAudioHint: "💡 Escuchar Pista Audio",
        typeInFrench: "Escribe la respuesta...",
        speakNow: "Toca el micrófono y pronuncia",
        savedVocab: "+ Guardar Vocabulario",
        cancelEdit: "Cancelar Edición",
        backupCard: "💾 Copia de Seguridad y Archivo Local (Auto-guardado)",
        connectFile: "📁 Conectar Archivo Local",
        reconnectFile: "🔄 Reconectar Archivo",
        exportBackup: "📥 Exportar Respaldo (.json)",
        openBackup: "📤 Abrir y Conectar Respaldo",
        uiLanguage: "Idioma de la Interfaz",
        studyLanguage: "Idioma que deseas Aprender",
        themeMode: "Tema Visual",
        lightMode: "☀️ Claro",
        darkMode: "🌙 Oscuro",
        dashboardTitle: "Panel Principal • Búho Personal",
        dashboardSubtitle: "Gestiona tu aprendizaje, idiomas, temas y configuración desde un solo lugar."
    },
    en: {
        home: "🏠 Home",
        practice: "🎮 Practice",
        creator: "➕ Content",
        settings: "⚙️ Settings",
        allTopics: "📚 All Topics",
        allLevels: "⭐ All Levels",
        check: "CHECK",
        continue: "CONTINUE",
        understood: "GOT IT",
        excellent: "Excellent!",
        incorrect: "Incorrect. We'll review it at the end:",
        sessionCompleted: "Session Completed!",
        sessionsCompleted: "Completed sessions:",
        startNewSession: "🚀 Start New Session",
        skipExercise: "⏭️ Skip this exercise",
        skipAllSpeaking: "⏭️ Skip ALL speaking exercises",
        listenAudioHint: "💡 Listen Audio Hint",
        typeInFrench: "Type answer...",
        speakNow: "Tap the microphone and speak",
        savedVocab: "+ Save Vocabulary",
        cancelEdit: "Cancel Edit",
        backupCard: "💾 Backup & Local File (Auto-save)",
        connectFile: "📁 Connect Local File",
        reconnectFile: "🔄 Reconnect File",
        exportBackup: "📥 Export Backup (.json)",
        openBackup: "📤 Open & Connect Backup",
        uiLanguage: "Interface Language",
        studyLanguage: "Language you want to Learn",
        themeMode: "Visual Theme",
        lightMode: "☀️ Light",
        darkMode: "🌙 Dark",
        dashboardTitle: "Dashboard • Personal Owl",
        dashboardSubtitle: "Manage your learning, languages, topics and settings in one place."
    },
    fr: {
        home: "🏠 Accueil",
        practice: "🎮 Pratique",
        creator: "➕ Contenu",
        settings: "⚙️ Paramètres",
        allTopics: "📚 Tous les thèmes",
        allLevels: "⭐ Tous les Niveaux",
        check: "VÉRIFIER",
        continue: "CONTINUER",
        understood: "COMPRIS",
        excellent: "Excellent !",
        incorrect: "Incorrect. Nous le réviserons à la fin :",
        sessionCompleted: "Session Terminée !",
        sessionsCompleted: "Sessions terminées :",
        startNewSession: "🚀 Démarrer une nouvelle session",
        skipExercise: "⏭️ Passer cet exercice",
        skipAllSpeaking: "⏭️ Passer TOUS les exercices d'oral",
        listenAudioHint: "💡 Écouter l'indice audio",
        typeInFrench: "Écrivez la réponse...",
        speakNow: "Appuyez sur le micro et parlez",
        savedVocab: "+ Enregistrer le vocabulaire",
        cancelEdit: "Annuler l'édition",
        backupCard: "💾 Sauvegarde et Fichier Local (Enregistrement auto)",
        connectFile: "📁 Connecter un fichier local",
        reconnectFile: "🔄 Reconnecter le fichier",
        exportBackup: "📥 Exporter la sauvegarde (.json)",
        openBackup: "📤 Ouvrir et connecter la sauvegarde",
        uiLanguage: "Langue de l'interface",
        studyLanguage: "Langue à étudier",
        themeMode: "Thème Visuel",
        lightMode: "☀️ Clair",
        darkMode: "🌙 Sombre",
        dashboardTitle: "Tableau de bord • Búho Personal",
        dashboardSubtitle: "Gérez votre apprentissage, vos langues et vos paramètres."
    }
};

let currentUiLang = localStorage.getItem('buho_ui_lang') || 'es';
let currentStudyLang = localStorage.getItem('buho_study_lang') || 'fr';
let currentTheme = localStorage.getItem('buho_theme') || 'light';

export function getUiLang() { return currentUiLang; }
export function setUiLang(lang) {
    if (translations[lang]) {
        currentUiLang = lang;
        localStorage.setItem('buho_ui_lang', lang);
    }
}

export function getStudyLang() { return currentStudyLang; }
export function setStudyLang(lang) {
    currentStudyLang = lang;
    localStorage.setItem('buho_study_lang', lang);
}

export function getTheme() { return currentTheme; }
export function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('buho_theme', theme);
    applyTheme();
}

export function applyTheme() {
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

export function t(key) {
    return translations[currentUiLang][key] || translations['es'][key] || key;
}
