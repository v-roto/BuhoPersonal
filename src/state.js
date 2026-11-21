// --- Módulo de Estado, Base de Datos y Persistencia Local ---

import { t } from './i18n.js';

export function showToast(msg) {
    const area = document.getElementById('toast-area');
    if (!area) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = msg;
    area.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export const defaultKnowledge = {
    vocab: [
        { id: "v1", fr: "Pomme", es: "Manzana", img: "🍎", score: 0, topic: "Comida", level: "A1" },
        { id: "v2", fr: "Chat", es: "Gato", img: "🐱", score: 0, topic: "Animales", level: "A1" },
        { id: "v3", fr: "Voiture", es: "Coche / Auto", img: "🚗", score: 0, topic: "Ciudad", level: "A1" },
        { id: "v4", fr: "Soleil", es: "Sol", img: "☀️", score: 0, topic: "Naturaleza", level: "A2" },
        { id: "v5", fr: "Livre", es: "Libro", img: "📚", score: 0, topic: "Estudio", level: "A1" }
    ],
    phonemes: [
        { id: "p1", symbol: "ou", word: "chou", trans: "col / repollo", img: "🥬", score: 0, topic: "Fonética", level: "A1" },
        { id: "p2", symbol: "u", word: "lune", trans: "luna", img: "🌙", score: 0, topic: "Fonética", level: "A1" },
        { id: "p3", symbol: "eu", word: "fleur", trans: "flor", img: "🌸", score: 0, topic: "Fonética", level: "A2" },
        { id: "p4", symbol: "an / en", word: "vent", trans: "viento", img: "💨", score: 0, topic: "Fonética", level: "B1" },
        { id: "p5", symbol: "é", word: "café", trans: "café", img: "☕", score: 0, topic: "Fonética", level: "A1" }
    ],
    grammar: [
        {
            id: "g1", verb: "Parler", tense: "Présent de l'indicatif", score: 0, topic: "Verbos", level: "A1",
            conjugations: { je: "parle", tu: "parles", il: "parle", nous: "parlons", vous: "parlez", ils: "parlent" }
        },
        {
            id: "g2", verb: "Être", tense: "Présent de l'indicatif", score: 0, topic: "Verbos", level: "A1",
            conjugations: { je: "suis", tu: "es", il: "est", nous: "sommes", vous: "êtes", ils: "sont" }
        }
    ],
    fill: [
        { id: "f1", title: "Completa la frase", sentence: "Je ___ une délicieuse pomme rouge.", answer: "mange", img: "🍎", score: 0, topic: "Frases", level: "A1" },
        { id: "f2", title: "Completa con el artículo", sentence: "___ chat dort sur la chaise.", answer: "Le", img: "🐱", score: 0, topic: "Frases", level: "A1" }
    ],
    order: [
        { id: "o1", title: "Traduce: 'El gato come una manzana'", sentence: "Le chat mange une pomme", extras: ["chien", "rouge", "dans"], score: 0, topic: "Sintaxis", level: "A1" },
        { id: "o2", title: "Traduce: 'Nosotros hablamos francés'", sentence: "Nous parlons français", extras: ["espagnol", "êtes", "la"], score: 0, topic: "Sintaxis", level: "A1" }
    ]
};

export let db = JSON.parse(localStorage.getItem('duo_french_db_v5')) || {};
if (!db.vocab) db.vocab = [...defaultKnowledge.vocab];
if (!db.phonemes) db.phonemes = [...defaultKnowledge.phonemes];
if (!db.grammar) db.grammar = [...defaultKnowledge.grammar];
if (!db.fill) db.fill = [...defaultKnowledge.fill];
if (!db.order) db.order = [...defaultKnowledge.order];

export let sessionCount = parseInt(localStorage.getItem('duo_french_sessions_v5')) || 0;
export let currentTopicFilter = 'all';

export function setTopicFilter(topic) {
    currentTopicFilter = topic;
}

export function saveDB(renderListsCallback, populateTopicsCallback) {
    localStorage.setItem('duo_french_db_v5', JSON.stringify(db));
    localStorage.setItem('duo_french_sessions_v5', sessionCount.toString());
    updateHeaderStats();
    if (renderListsCallback) renderListsCallback();
    if (populateTopicsCallback) populateTopicsCallback();
    if (localFileHandle) {
        saveToLocalFile();
    }
}

export function updateHeaderStats() {
    const statSessionsEl = document.getElementById('stat-sessions');
    if (statSessionsEl) statSessionsEl.textContent = sessionCount;
}

export function incrementSessionCount() {
    sessionCount++;
}

// --- File System Access API + IndexedDB ---
export let localFileHandle = null;
const DB_NAME = 'buho_local_file_db';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'auto_save_handle';

function openIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                dbInstance.createObjectStore(STORE_NAME);
            }
        };
    });
}

async function saveHandleToIDB(handle) {
    try {
        const dbInstance = await openIDB();
        const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn("Could not save handle to IDB:", e);
    }
}

async function getHandleFromIDB() {
    try {
        const dbInstance = await openIDB();
        const tx = dbInstance.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn("Could not get handle from IDB:", e);
        return null;
    }
}

async function clearHandleFromIDB() {
    try {
        const dbInstance = await openIDB();
        const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
    } catch (e) {
        console.warn("Could not clear handle from IDB:", e);
    }
}

export async function initLocalFileHandle() {
    if (!window.showSaveFilePicker) {
        updateLocalFileStatusUI(false);
        return;
    }
    const handle = await getHandleFromIDB();
    if (!handle) {
        updateLocalFileStatusUI(false);
        return;
    }
    localFileHandle = handle;
    try {
        const options = { mode: 'readwrite' };
        const permission = await localFileHandle.queryPermission(options);
        if (permission === 'granted') {
            updateLocalFileStatusUI(true, handle.name);
            await saveToLocalFile();
        } else {
            updateLocalFileStatusUI('needs_permission', handle.name);
        }
    } catch (e) {
        console.error("Error checking handle permission:", e);
        updateLocalFileStatusUI(false);
    }
}

export async function openAndConnectLocalFile(callbackReload) {
    if (!window.showOpenFilePicker) {
        showToast(t('fileOpenUnsupported'));
        return;
    }
    try {
        const options = {
            types: [{
                description: 'JSON Backup Files',
                accept: { 'application/json': ['.json'] }
            }],
            multiple: false
        };
        const [handle] = await window.showOpenFilePicker(options);
        if (!handle) return;

        const file = await handle.getFile();
        const text = await file.text();
        
        let rawData;
        try {
            rawData = JSON.parse(text);
        } catch (err) {
            showToast(t('invalidJson'));
            return;
        }

        const parsedData = (rawData.db && (rawData.db.vocab || rawData.db.phonemes || rawData.db.grammar)) ? rawData.db : rawData;
        const sessionCountVal = rawData.sessionCount !== undefined ? rawData.sessionCount : parsedData.sessionCount;

        if (parsedData.vocab && parsedData.grammar) {
            Object.assign(db, parsedData);
            if (!db.fill) db.fill = [];
            if (!db.order) db.order = [];
            if (!db.phonemes) db.phonemes = [];
            if (sessionCountVal !== undefined) {
                // exported session count
            }
            localFileHandle = handle;
            await saveHandleToIDB(localFileHandle);
            updateLocalFileStatusUI(true, localFileHandle.name);
            showToast(t('fileLoadedConnected'));
            if (callbackReload) callbackReload();
        } else {
            showToast(t('invalidFormat'));
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            showToast(t('openFileError'));
            console.error(err);
        }
    }
}

export async function connectLocalFile() {
    if (!window.showSaveFilePicker) {
        showToast(t('savePickerUnsupported'));
        return;
    }
    try {
        const options = {
            suggestedName: 'buho_french_db_backup.json',
            types: [{
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] }
            }]
        };
        localFileHandle = await window.showSaveFilePicker(options);
        await saveHandleToIDB(localFileHandle);
        showToast(t('fileConnected'));
        updateLocalFileStatusUI(true, localFileHandle.name);
        await saveToLocalFile();
    } catch (err) {
        if (err.name !== 'AbortError') {
            showToast(t('connectFileError'));
            console.error(err);
        }
    }
}

export async function reconnectLocalFile() {
    if (!localFileHandle) return;
    try {
        const options = { mode: 'readwrite' };
        const permission = await localFileHandle.requestPermission(options);
        if (permission === 'granted') {
            showToast(t('fileReconnected'));
            updateLocalFileStatusUI(true, localFileHandle.name);
            await saveToLocalFile();
        } else {
            showToast(t('permissionDenied'));
            updateLocalFileStatusUI(false);
        }
    } catch (err) {
        console.error("Error requesting permission:", err);
        await clearHandleFromIDB();
        localFileHandle = null;
        updateLocalFileStatusUI(false);
        showToast(t('previousFileInaccessible'));
    }
}

export async function saveToLocalFile() {
    if (!localFileHandle) return;
    try {
        const writable = await localFileHandle.createWritable();
        const payload = JSON.stringify({ db, sessionCount }, null, 2);
        await writable.write(payload);
        await writable.close();
    } catch (err) {
        console.error("Error writing to local file:", err);
        showToast(t('writeFileWarning'));
        await clearHandleFromIDB();
        updateLocalFileStatusUI('needs_permission', localFileHandle.name);
        localFileHandle = null;
    }
}

function updateLocalFileStatusUI(status, fileName = '') {
    const statusEl = document.getElementById('local-file-status');
    const reconnectBtn = document.getElementById('reconnect-local-btn');
    if (!statusEl) return;

    if (status === true) {
        statusEl.textContent = t('statusConnected', { name: fileName || 'file' });
        if (reconnectBtn) reconnectBtn.style.display = 'none';
    } else if (status === 'needs_permission') {
        statusEl.textContent = t('statusNeedsPermission', { name: fileName || 'file' });
        if (reconnectBtn) reconnectBtn.style.display = 'inline-block';
    } else {
        statusEl.textContent = t('statusNotConnected');
        if (reconnectBtn) reconnectBtn.style.display = 'none';
    }
}
