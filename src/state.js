// --- Módulo de Estado, Base de Datos y Persistencia Local ---

import { t } from './i18n.js';
import { CONTENT_CATEGORIES, buildDefaultContent, getLegacyIds, LEGACY_TOPIC_KEYS } from './content/index.js';
import { openLevelsByCategory, isPracticeDue } from './levels.js';

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

// Datos de la primera versión (script.js, claves _v4): se copian una vez a las claves actuales
migrateV4Storage();
function migrateV4Storage() {
    const oldDB = localStorage.getItem('duo_french_db_v4');
    if (!oldDB || localStorage.getItem('duo_french_db_v5')) return;
    localStorage.setItem('duo_french_db_v5', oldDB);
    const oldSessions = localStorage.getItem('duo_french_sessions_v4');
    if (oldSessions && !localStorage.getItem('duo_french_sessions_v5')) {
        localStorage.setItem('duo_french_sessions_v5', oldSessions);
    }
}

const storedDB = localStorage.getItem('duo_french_db_v5');
export let db = JSON.parse(storedDB) || {};
CONTENT_CATEGORIES.forEach(cat => { if (!Array.isArray(db[cat])) db[cat] = []; });

// Ítems sin `lang` pertenecen al francés (compatibilidad con datos antiguos)
export function itemLang(item) {
    return item.lang || 'fr';
}

// Ids de contenido por defecto que ya se añadieron alguna vez (no se vuelven a añadir si el usuario los borra)
if (!Array.isArray(db.seededIds)) {
    const seeded = new Set();
    if (storedDB) {
        // Bases antiguas: el francés venía precargado; otros idiomas, si se marcaron como cargados
        const legacyLangs = new Set(['fr', ...(Array.isArray(db.seededLangs) ? db.seededLangs : [])]);
        legacyLangs.forEach(lang => getLegacyIds(lang).forEach(id => seeded.add(id)));
    }
    db.seededIds = [...seeded];
}
delete db.seededLangs;
migrateLegacyItems();

// Convierte temas antiguos en claves traducibles y textos antiguos en textos multi-idioma
function migrateLegacyItems() {
    CONTENT_CATEGORIES.forEach(cat => {
        db[cat].forEach(item => {
            if (item.topic && LEGACY_TOPIC_KEYS[item.topic]) item.topic = LEGACY_TOPIC_KEYS[item.topic];
            if (item.level === 'C2') item.level = 'C1';  // el nivel C2 se retiró
        });
    });
}

function upgradeFromPack(item, packItem) {
    let changed = false;
    // Respuestas alternativas añadidas después: se copian si el ítem guardado no tiene las suyas
    if (Array.isArray(packItem.alt) && !Array.isArray(item.alt)) { item.alt = [...packItem.alt]; changed = true; }
    if (packItem.conjugations && item.conjugations) {
        Object.keys(packItem.conjugations).forEach(k => {
            const packForm = packItem.conjugations[k] || '';
            if (packForm.includes('|') && item.conjugations[k] === packForm.split('|')[0]) { item.conjugations[k] = packForm; changed = true; }
        });
    }
    Object.keys(packItem).forEach(field => {
        const value = packItem[field];
        const isLocalized = value && typeof value === 'object' && !Array.isArray(value) && typeof value.es === 'string';
        if (isLocalized && typeof item[field] === 'string' && Object.values(value).includes(item[field])) {
            item[field] = value;
            changed = true;
        }
    });
    return changed;
}

// Añade el contenido por defecto del idioma que aún no esté en la base (incluye contenido nuevo por nivel)
export function ensureLangContent(lang) {
    const pack = buildDefaultContent(lang);
    const seeded = new Set(db.seededIds);
    let changed = false;
    CONTENT_CATEGORIES.forEach(cat => {
        const existing = new Map(db[cat].map(i => [i.id, i]));
        pack[cat].forEach(item => {
            if (existing.has(item.id)) {
                if (upgradeFromPack(existing.get(item.id), item)) changed = true;
                if (!seeded.has(item.id)) { seeded.add(item.id); changed = true; }
            } else if (!seeded.has(item.id)) {
                db[cat].push(item);
                seeded.add(item.id);
                changed = true;
            }
        });
    });
    db.seededIds = [...seeded];
    return changed;
}

// Regla de práctica de un idioma: (categoría, ítem) → ¿entra hoy? Los niveles abiertos de cada tipo
// se calculan con todo el contenido del idioma (el progreso no depende del tema elegido).
export function practiceFilter(lang, level) {
    const byCat = {};
    CONTENT_CATEGORIES.forEach(cat => { byCat[cat] = (db[cat] || []).filter(i => itemLang(i) === lang); });
    const open = openLevelsByCategory(byCat, level);
    return (cat, item) => itemLang(item) === lang && isPracticeDue(item, level, open[cat]);
}

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

// Copia un respaldo (exportado o del archivo local) en la base y lo guarda. Devuelve false si el formato no vale.
function applyBackup(rawData) {
    const parsedData = (rawData.db && (rawData.db.vocab || rawData.db.phonemes || rawData.db.grammar)) ? rawData.db : rawData;
    if (!parsedData || !(parsedData.vocab || parsedData.phonemes)) return false;
    Object.assign(db, parsedData);
    CONTENT_CATEGORIES.forEach(cat => { if (!Array.isArray(db[cat])) db[cat] = []; });
    if (!Array.isArray(db.seededIds)) db.seededIds = getLegacyIds('fr');
    const sessions = rawData.sessionCount !== undefined ? rawData.sessionCount : parsedData.sessionCount;
    if (Number.isFinite(Number(sessions))) sessionCount = Number(sessions);
    delete db.sessionCount;
    // Se guarda ya: tras recargar, la app lee de localStorage
    localStorage.setItem('duo_french_db_v5', JSON.stringify(db));
    localStorage.setItem('duo_french_sessions_v5', sessionCount.toString());
    return true;
}

// Importación sin conectar archivo, para navegadores sin File System Access API (móvil, Firefox, Safari)
function importBackupWithInput(callbackReload) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        let rawData;
        try {
            rawData = JSON.parse(await file.text());
        } catch (err) {
            showToast(t('invalidJson'));
            return;
        }
        if (!applyBackup(rawData)) {
            showToast(t('invalidFormat'));
            return;
        }
        showToast(t('backupImported'));
        if (callbackReload) setTimeout(callbackReload, 1200);
    });
    input.click();
}

export async function openAndConnectLocalFile(callbackReload) {
    if (!window.showOpenFilePicker) {
        importBackupWithInput(callbackReload);
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

        if (applyBackup(rawData)) {
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
