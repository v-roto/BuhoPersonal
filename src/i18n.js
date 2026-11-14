// --- Módulo de Internacionalización (i18n) y Multi-idioma ---

export const translations = {
    es: {
        practice: "🎮 Práctica",
        creator: "➕ Contenido",
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
        typeInFrench: "Escribe en francés...",
        speakNow: "Toca el micrófono y pronuncia",
        savedVocab: "+ Guardar Vocabulario",
        cancelEdit: "Cancelar Edición",
        backupCard: "💾 Copia de Seguridad y Archivo Local (Auto-guardado)",
        connectFile: "📁 Conectar Archivo Local",
        reconnectFile: "🔄 Reconectar Archivo",
        exportBackup: "📥 Exportar Respaldo (.json)",
        openBackup: "📤 Abrir y Conectar Respaldo"
    },
    en: {
        practice: "🎮 Practice",
        creator: "➕ Content",
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
        typeInFrench: "Type in French...",
        speakNow: "Tap the microphone and speak",
        savedVocab: "+ Save Vocabulary",
        cancelEdit: "Cancel Edit",
        backupCard: "💾 Backup & Local File (Auto-save)",
        connectFile: "📁 Connect Local File",
        reconnectFile: "🔄 Reconnect File",
        exportBackup: "📥 Export Backup (.json)",
        openBackup: "📤 Open & Connect Backup"
    },
    fr: {
        practice: "🎮 Pratique",
        creator: "➕ Contenu",
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
        typeInFrench: "Écrivez en français...",
        speakNow: "Appuyez sur le micro et parlez",
        savedVocab: "+ Enregistrer le vocabulaire",
        cancelEdit: "Annuler l'édition",
        backupCard: "💾 Sauvegarde et Fichier Local (Enregistrement auto)",
        connectFile: "📁 Connecter un fichier local",
        reconnectFile: "🔄 Reconnecter le fichier",
        exportBackup: "📥 Exporter la sauvegarde (.json)",
        openBackup: "📤 Ouvrir et connecter la sauvegarde"
    }
};

let currentUiLang = localStorage.getItem('buho_ui_lang') || 'es';

export function setUiLang(lang) {
    if (translations[lang]) {
        currentUiLang = lang;
        localStorage.setItem('buho_ui_lang', lang);
    }
}

export function t(key) {
    return translations[currentUiLang][key] || translations['es'][key] || key;
}
