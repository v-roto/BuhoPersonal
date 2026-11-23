// --- Diccionario / traductor automático ---
// Orden de búsqueda: 1) contenido del usuario y vocabulario incluido (sin conexión),
// 2) MyMemory para la traducción, 3) Wiktionary para la categoría gramatical de palabras sueltas.
// Palabra → se guarda en Vocabulario. Frase → se guarda como ejercicio de ordenar palabras.

import { db, saveDB, showToast, itemLang } from './state.js';
import { getLevelFilter } from './levels.js';
import { VOCAB_CONCEPTS } from './content/vocabulary.js';
import { renderCreatorLists, populateTopicDropdown } from './creator.js';
import { t, getStudyLang, getTranslationLang, getLangName, localizeTranslation } from './i18n.js';
import { flagSVG } from './flags.js';
import { speakFrench } from './audio.js';
import { renderLangDropdown } from './langDropdown.js';
import { charBarHTML, attachCharBar, applyKeyboardHints } from './specialChars.js';
import { STUDY_LANGS } from './content/index.js';

const MAX_LENGTH = 400;
const DIRECTION_KEY = 'buho_dict_dir';   // 'toTr' (idioma de estudio → traducción) | 'toStudy'
const AUTO_KEY = 'buho_dict_auto';

let direction = localStorage.getItem(DIRECTION_KEY) || 'toTr';
let current = null;      // resultado mostrado
let savedItem = null;    // { type, id } si el resultado ya se guardó
let onChange = () => {};
let onPickStudyLang = () => {};
let onPickNativeLang = () => {};

// Idiomas en los que existe la interfaz (y por tanto las traducciones guardadas)
const NATIVE_LANGS = ['es', 'en', 'fr'];

const $ = (id) => document.getElementById(id);

function escapeHTML(text) {
    return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Texto plano a partir de HTML o entidades (&#39; etc.) que devuelven las APIs
function toPlainText(html) {
    return new DOMParser().parseFromString(String(html || ''), 'text/html').documentElement.textContent.trim();
}

function normalize(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[.,!?¿¡;:"'«»()]/g, '').replace(/\s+/g, ' ').trim();
}

function isAutoAdd() {
    return localStorage.getItem(AUTO_KEY) !== '0';
}

function defaultLevel() {
    const lvl = getLevelFilter();
    return lvl && lvl !== 'all' ? lvl : 'A1';
}

function translationValues(value) {
    if (!value) return [];
    return typeof value === 'object' ? Object.values(value) : [value];
}

// Palabras de un concepto en un idioma ("Coche|Auto|Carro" → ["Coche", "Auto", "Carro"])
function conceptWords(concept, lang) {
    return String(concept.words[lang] || '').split('|').map(w => w.trim()).filter(Boolean);
}

// --- 1. Búsqueda local ---
function findLocal(text, fromStudy) {
    const lang = getStudyLang();
    const trLang = getTranslationLang();
    const q = normalize(text);

    const vocab = db.vocab.find(v => itemLang(v) === lang && (fromStudy
        ? [v.fr, ...(v.alt || [])].some(w => normalize(w) === q)
        : translationValues(v.es).some(tr => normalize(tr) === q)));
    if (vocab) return { studyText: vocab.fr, transText: localizeTranslation(vocab.es), img: vocab.img || '', existing: { type: 'vocab', id: vocab.id } };

    const order = db.order.find(o => itemLang(o) === lang && (fromStudy
        ? normalize(o.sentence) === q
        : translationValues(o.title).some(tr => normalize(tr) === q)));
    if (order) return { studyText: order.sentence, transText: localizeTranslation(order.title), img: order.img || '', existing: { type: 'order', id: order.id } };

    // Vocabulario incluido en la app (aunque el usuario lo haya borrado de su lista)
    const concept = VOCAB_CONCEPTS.find(c => conceptWords(c, fromStudy ? lang : trLang).some(w => normalize(w) === q));
    if (concept && concept.words[lang] && concept.words[trLang]) {
        return { studyText: conceptWords(concept, lang)[0], transText: conceptWords(concept, trLang)[0], img: concept.img, existing: null };
    }
    return null;
}

function conceptEmoji(studyText) {
    const lang = getStudyLang();
    const concept = VOCAB_CONCEPTS.find(c => conceptWords(c, lang).some(w => normalize(w) === normalize(studyText)));
    return concept ? concept.img : '';
}

// --- 2. Traducción automática (MyMemory) ---
async function fetchWithTimeout(url, ms = 9000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
        return await fetch(url, { signal: ctrl.signal });
    } finally {
        clearTimeout(timer);
    }
}

class QuotaError extends Error {}

async function translateOnline(text, from, to) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetchWithTimeout(url);
    if (res.status === 429) throw new QuotaError();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = toPlainText(data?.responseData?.translatedText);
    if (data.quotaFinished || data.responseStatus === 429 || /MYMEMORY WARNING/i.test(translated)) throw new QuotaError();
    if (data.responseStatus !== 200 && data.responseStatus !== '200') throw new Error(data.responseDetails || 'error');
    // Otras traducciones propuestas por la memoria de traducción (sugerencias para corregir)
    const seen = new Set([normalize(translated), normalize(text)]);
    const alternatives = [];
    (data.matches || []).forEach(m => {
        const alt = toPlainText(m.translation);
        const key = normalize(alt);
        if (alt && !seen.has(key) && alt.length <= text.length * 3 + 20 && !/MYMEMORY/i.test(alt)) {
            seen.add(key);
            alternatives.push(alt);
        }
    });
    return { translated, alternatives: alternatives.slice(0, 4) };
}

// --- 3. Categoría gramatical (Wiktionary, solo palabras sueltas) ---
async function lookupWiktionary(word, lang) {
    for (const candidate of [...new Set([word, word.toLowerCase()])]) {
        try {
            const res = await fetchWithTimeout(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(candidate)}`, 7000);
            if (!res.ok) continue;
            const data = await res.json();
            const entry = (data[lang] || [])[0];
            if (!entry) continue;
            const definition = toPlainText((entry.definitions || [])[0]?.definition || '');
            return { partOfSpeech: entry.partOfSpeech || '', definition: definition.slice(0, 160) };
        } catch (e) {
            // Wiktionary es opcional: si falla, se muestra la traducción sin categoría
        }
    }
    return null;
}

// --- Búsqueda principal ---
export async function dictSearch() {
    const input = $('dict-input');
    const text = (input?.value || '').trim();
    if (!text) return;
    if (text.length > MAX_LENGTH) return showToast(t('dictTooLong'));

    const lang = getStudyLang();
    const trLang = getTranslationLang();
    const fromStudy = direction === 'toTr';
    const isPhrase = /\s/.test(text);
    savedItem = null;

    const local = findLocal(text, fromStudy);
    if (local) {
        current = { ...local, lang, kind: /\s/.test(local.studyText) ? 'phrase' : 'word', source: 'local' };
        if (!current.existing && isAutoAdd()) saveCurrent();
        renderResult();
        return;
    }

    renderLoading();
    try {
        const { translated, alternatives } = await translateOnline(text, fromStudy ? lang : trLang, fromStudy ? trLang : lang);
        if (!translated) { renderMessage(t('dictNoResult')); return; }
        const studyText = fromStudy ? text : translated;
        const transText = fromStudy ? translated : text;
        current = { lang, studyText, transText, img: conceptEmoji(studyText), kind: /\s/.test(studyText) || isPhrase ? 'phrase' : 'word', source: 'online', existing: findExisting(studyText), alternatives, altTarget: fromStudy ? 'tr' : 'study' };
        if (!current.existing && isAutoAdd()) saveCurrent();
        renderResult();

        if (current.kind === 'word') refreshWiktionary(studyText);
    } catch (e) {
        renderMessage(e instanceof QuotaError ? t('dictQuota') : t('dictError'), true);
    }
}

async function refreshWiktionary(studyText) {
    if (/\s/.test(studyText)) return;
    const info = await lookupWiktionary(studyText, getStudyLang());
    if (info && current && current.studyText === studyText) {
        current.wiki = info;
        renderResult();
    }
}

function findExisting(studyText) {
    const lang = getStudyLang();
    const q = normalize(studyText);
    const vocab = db.vocab.find(v => itemLang(v) === lang && normalize(v.fr) === q);
    if (vocab) return { type: 'vocab', id: vocab.id };
    const order = db.order.find(o => itemLang(o) === lang && normalize(o.sentence) === q);
    if (order) return { type: 'order', id: order.id };
    return null;
}

// --- Guardado ---
function distractorWords(sentenceWords) {
    const lang = getStudyLang();
    const used = new Set(sentenceWords.map(normalize));
    const pool = db.vocab
        .filter(v => itemLang(v) === lang && !/\s/.test(v.fr) && !used.has(normalize(v.fr)))
        .map(v => v.fr.toLowerCase());
    return [...new Set(pool)].sort(() => Math.random() - 0.5).slice(0, 3);
}

function saveCurrent() {
    if (!current || current.existing) return;
    const trLang = getTranslationLang();
    const base = { lang: getStudyLang(), level: defaultLevel(), topic: 'dictionary', score: 0, img: current.img || '' };
    const id = `d_${Date.now()}`;

    if (current.kind === 'word') {
        db.vocab.push({ ...base, id, fr: current.studyText, es: { [trLang]: current.transText } });
        savedItem = { type: 'vocab', id };
    } else {
        const sentence = current.studyText.replace(/\s+/g, ' ').trim();
        db.order.push({ ...base, id, sentence, title: { [trLang]: current.transText }, extras: distractorWords(sentence.split(' ')) });
        savedItem = { type: 'order', id };
    }
    saveDB(renderCreatorLists, populateTopicDropdown);
    onChange();
}

function findSaved() {
    if (!savedItem) return null;
    return db[savedItem.type].find(i => i.id === savedItem.id) || null;
}

// Aplica las correcciones del usuario (palabra, traducción, emoji) al elemento guardado
function applyEdits() {
    if (!current) return;
    const study = $('dict-edit-study');
    const tr = $('dict-edit-tr');
    const emoji = $('dict-edit-emoji');
    if (study && study.value.trim()) current.studyText = study.value.trim();
    if (tr && tr.value.trim()) current.transText = tr.value.trim();
    if (emoji) current.img = emoji.value.trim();

    const item = findSaved();
    if (!item) return;
    const trLang = getTranslationLang();
    if (savedItem.type === 'vocab') {
        item.fr = current.studyText;
        item.es = { ...(typeof item.es === 'object' ? item.es : {}), [trLang]: current.transText };
    } else {
        item.sentence = current.studyText.replace(/\s+/g, ' ').trim();
        item.title = { ...(typeof item.title === 'object' ? item.title : {}), [trLang]: current.transText };
    }
    item.img = current.img;
    saveDB(renderCreatorLists, populateTopicDropdown);
}

function undoSave() {
    if (!savedItem) return;
    const list = db[savedItem.type];
    const idx = list.findIndex(i => i.id === savedItem.id);
    if (idx >= 0) list.splice(idx, 1);
    savedItem = null;
    saveDB(renderCreatorLists, populateTopicDropdown);
    onChange();
    showToast(t('dictRemoved'));
    renderResult();
}

// --- Interfaz ---
function renderLoading() {
    const box = $('dict-result');
    if (box) box.innerHTML = `<p class="dict-status">⏳ ${t('dictLoading')}</p>`;
}

function renderMessage(msg, isError = false) {
    const box = $('dict-result');
    if (box) box.innerHTML = `<p class="dict-status ${isError ? 'dict-error' : ''}">${escapeHTML(msg)}</p>`;
}

function renderResult() {
    const box = $('dict-result');
    if (!box || !current) return;
    const lang = getStudyLang();
    const trLang = getTranslationLang();
    const isWord = current.kind === 'word';

    let status;
    if (current.existing) {
        status = `<span class="dict-badge">📚 ${t('dictAlready')}</span>`;
    } else if (savedItem) {
        status = `<span class="dict-badge dict-badge-ok">${t(isWord ? 'dictAddedWord' : 'dictAddedPhrase')}</span>
                  <button class="link-btn" id="dict-undo">${t('dictUndo')}</button>`;
    } else {
        status = `<button class="action-btn dict-add-btn" id="dict-add">${t(isWord ? 'dictAddWord' : 'dictAddPhrase')}</button>`;
    }
    const editable = !current.existing;
    const wiki = current.wiki && (current.wiki.partOfSpeech || current.wiki.definition)
        ? `<p class="dict-meta">📖 <strong>${escapeHTML(current.wiki.partOfSpeech)}</strong>${current.wiki.definition ? ' · ' + escapeHTML(current.wiki.definition) : ''} <span class="dict-source">(Wiktionary · EN)</span></p>`
        : '';

    box.innerHTML = `
        <div class="dict-result-card">
            <div class="dict-pair">
                <div class="dict-side">
                    <span class="dict-lang">${flagSVG(lang)} ${escapeHTML(getLangName(lang))}</span>
                    <div class="dict-field">
                        ${editable ? `<input id="dict-edit-study" class="duo-input" value="${escapeHTML(current.studyText)}" autocomplete="off">` : `<strong class="dict-text">${escapeHTML(current.studyText)}</strong>`}
                        <button class="speaker-btn speaker-btn-sm" id="dict-speak" title="🔊">🔊</button>
                    </div>
                </div>
                <div class="dict-arrow">→</div>
                <div class="dict-side">
                    <span class="dict-lang">${flagSVG(trLang)} ${escapeHTML(getLangName(trLang))}</span>
                    <div class="dict-field">
                        ${editable ? `<input id="dict-edit-tr" class="duo-input" value="${escapeHTML(current.transText)}" autocomplete="off">` : `<strong class="dict-text">${escapeHTML(current.transText)}</strong>`}
                    </div>
                </div>
            </div>
            ${editable && current.alternatives && current.alternatives.length ? `
                <div class="dict-alternatives">
                    <span>${t('dictAlternatives')}</span>
                    ${current.alternatives.map((alt, i) => `<button class="dict-alt-btn" data-alt="${i}">${escapeHTML(alt)}</button>`).join('')}
                </div>` : ''}
            ${wiki}
            <p class="dict-meta dict-source">${current.source === 'local' ? t('dictSourceLocal') : t('dictSourceOnline')}
                · ${isWord ? t('dictWillBeVocab') : t('dictWillBeOrder')}</p>
            <div class="dict-actions">
                ${editable ? `<label class="dict-emoji">${t('dictEmoji')} <input id="dict-edit-emoji" class="duo-input" value="${escapeHTML(current.img || '')}" maxlength="8" autocomplete="off"></label>` : ''}
                <div class="dict-status-row">${status}</div>
            </div>
        </div>`;

    $('dict-speak')?.addEventListener('click', () => speakFrench(current.studyText));
    ['dict-edit-study', 'dict-edit-tr', 'dict-edit-emoji'].forEach(id => $(id)?.addEventListener('change', applyEdits));
    $('dict-undo')?.addEventListener('click', undoSave);
    box.querySelectorAll('.dict-alt-btn').forEach(btn => btn.addEventListener('click', () => {
        const alt = current.alternatives[Number(btn.dataset.alt)];
        const field = $(current.altTarget === 'tr' ? 'dict-edit-tr' : 'dict-edit-study');
        if (!field) return;
        const previous = field.value;
        field.value = alt;
        applyEdits();
        current.alternatives[Number(btn.dataset.alt)] = previous;  // la opción anterior pasa a ser sugerencia
        if (current.altTarget === 'study') {
            current.wiki = null;
            refreshWiktionary(current.studyText);
        }
        renderResult();
    }));
    $('dict-add')?.addEventListener('click', () => {
        applyEdits();
        current.existing = findExisting(current.studyText);
        if (!current.existing) saveCurrent();
        renderResult();
    });
    renderRecent();
}

function renderRecent() {
    const box = $('dict-recent');
    if (!box) return;
    const lang = getStudyLang();
    const recent = [...db.vocab, ...db.order]
        .filter(i => i.topic === 'dictionary' && itemLang(i) === lang && String(i.id).startsWith('d_'))
        .sort((a, b) => String(b.id).localeCompare(String(a.id)))
        .slice(0, 8);
    box.innerHTML = recent.length ? `
        <p class="dict-recent-title">${t('dictRecent')}</p>
        <div class="dict-recent-list">
            ${recent.map(i => `<span class="dict-chip">${i.img ? escapeHTML(i.img) + ' ' : ''}<strong>${escapeHTML(i.fr || i.sentence)}</strong> → ${escapeHTML(localizeTranslation(i.es || i.title))}</span>`).join('')}
        </div>` : '';
}

// Etiquetas de dirección (banderas e idiomas); se llama al cambiar idioma de estudio o de interfaz
export function renderDictionaryChrome() {
    const lang = getStudyLang();
    const trLang = getTranslationLang();
    // Selector del idioma que se aprende: cambia el idioma de estudio de toda la app.
    // Selector de "tu idioma": cambia el idioma de la interfaz (y con él las traducciones).
    const study = { value: lang, options: STUDY_LANGS, onChange: onPickStudyLang, ariaLabel: t('studyLanguage'), caption: t('dictStudyCaption') };
    const native = { value: trLang, options: NATIVE_LANGS.filter(l => l !== lang), onChange: onPickNativeLang, ariaLabel: t('dictNativeCaption'), caption: t('dictNativeCaption') };
    const [from, to] = direction === 'toTr' ? [study, native] : [native, study];
    renderLangDropdown($('dict-from'), from);
    renderLangDropdown($('dict-to'), to);
    if ($('dict-from-caption')) $('dict-from-caption').textContent = from.caption;
    // Teclas de acentos del idioma desde el que se escribe
    const charsBox = $('dict-chars');
    if (charsBox) {
        charsBox.innerHTML = charBarHTML(from.value);
        attachCharBar(charsBox.closest('.dict-card'));
        applyKeyboardHints(charsBox.closest('.dict-card'), from.value);
    }
    if ($('dict-to-caption')) $('dict-to-caption').textContent = to.caption;
    const auto = $('dict-auto');
    if (auto) auto.checked = isAutoAdd();
    // Un resultado de otro idioma de estudio ya no aplica
    if (current && current.lang !== lang) {
        current = null;
        savedItem = null;
        const box = $('dict-result');
        if (box) box.innerHTML = '';
    }
    renderRecent();
}

export function initDictionary(options = {}) {
    onChange = options.onChange || onChange;
    onPickStudyLang = options.onPickStudyLang || onPickStudyLang;
    onPickNativeLang = options.onPickNativeLang || onPickNativeLang;
    $('dict-form')?.addEventListener('submit', (e) => { e.preventDefault(); dictSearch(); });
    $('dict-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); dictSearch(); }
    });
    $('dict-swap')?.addEventListener('click', () => {
        direction = direction === 'toTr' ? 'toStudy' : 'toTr';
        localStorage.setItem(DIRECTION_KEY, direction);
        renderDictionaryChrome();
        $('dict-input')?.focus();
    });
    $('dict-auto')?.addEventListener('change', (e) => localStorage.setItem(AUTO_KEY, e.target.checked ? '1' : '0'));
    renderDictionaryChrome();
}
