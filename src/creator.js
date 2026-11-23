// --- Módulo del Creador de Contenido ---

import { db, saveDB, showToast, itemLang } from './state.js';
import { playSound, updateVoiceSettings, testSelectedVoice, populateBrowserVoices, handleSoundUpload } from './audio.js';
import { getLevelFilter } from './levels.js';
import { getPronouns, getExamples, CONJUGATION_KEYS, CONTENT_CATEGORIES } from './content/index.js';
import {
    t, getStudyLang, getStudyLangName, getLangName, getTranslationLang,
    localize, localizeTranslation, topicLabel, topicFromInput
} from './i18n.js';
import { flagSVG } from './flags.js';

let editingItemId = null;
let editingItemType = null;

// Configuración de cada formulario: prefijo de ids en el HTML y textos de título/botón
const FORMS = {
    vocab: { prefix: 'vocab', title: 'vocabCardTitle', editTitle: 'editVocabTitle', save: 'savedVocab', update: 'updateVocab' },
    conversation: { prefix: 'conv', title: 'conversationCardTitle', editTitle: 'editConversationTitle', save: 'saveConversation', update: 'updateConversation' },
    phonemes: { prefix: 'phoneme', title: 'phonemesCardTitle', editTitle: 'editPhonemeTitle', save: 'savePhoneme', update: 'updatePhoneme' },
    grammar: { prefix: 'grammar', title: 'grammarCardTitle', editTitle: 'editGrammarTitle', save: 'saveGrammar', update: 'updateGrammar' },
    fill: { prefix: 'fill', title: 'fillCardTitle', editTitle: 'editFillTitle', save: 'saveSentence', update: 'updateFill' },
    order: { prefix: 'order', title: 'orderCardTitle', editTitle: 'editOrderTitle', save: 'saveOrder', update: 'updateOrder' }
};

// Alias usados por los botones del HTML
const TYPE_ALIASES = { phoneme: 'phonemes', conv: 'conversation' };
const normalizeType = (type) => TYPE_ALIASES[type] || type;

const $ = (id) => document.getElementById(id);
const val = (id) => ($(id) ? $(id).value.trim() : '');
const setVal = (id, v) => { if ($(id)) $(id).value = v ?? ''; };

function escapeHTML(text) {
    return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Si el texto del formulario coincide con el texto multi-idioma mostrado, conserva todas sus traducciones
function keepLocalized(oldValue, newText, show = localizeTranslation) {
    if (oldValue && typeof oldValue === 'object' && show(oldValue) === newText) return oldValue;
    return newText;
}

function keepTopic(oldTopic, newText) {
    if (oldTopic && topicLabel(oldTopic) === newText) return oldTopic;
    return topicFromInput(newText);
}

function defaultLevel() {
    const lvl = getLevelFilter();
    return lvl && lvl !== 'all' ? lvl : 'A1';
}

// Ítems del idioma de estudio actual, conservando su índice original en db
function forStudyLang(list) {
    const lang = getStudyLang();
    return (list || []).map((item, idx) => ({ item, idx })).filter(({ item }) => itemLang(item) === lang);
}

// --- Pestañas ---
let activeTab = localStorage.getItem('buho_creator_tab') || 'vocab';

export function switchCreatorTab(tab) {
    activeTab = tab;
    localStorage.setItem('buho_creator_tab', tab);
    document.querySelectorAll('.creator-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    document.querySelectorAll('[data-creator-panel]').forEach(panel => {
        panel.hidden = panel.dataset.creatorPanel !== tab;
    });
}

// --- Etiquetas y ejemplos dependientes del idioma de estudio y de la interfaz ---
export function updateGrammarFormLabels() {
    const pronouns = getPronouns(getStudyLang());
    CONJUGATION_KEYS.forEach(k => {
        const label = document.querySelector(`label[for="add-gram-${k}"]`);
        if (label) label.textContent = pronouns[k];
    });
}

export function updateCreatorExamples() {
    const lang = getStudyLang();
    const ex = getExamples(lang);
    const pre = t('examplePrefix');
    const studyName = getStudyLangName();
    const trName = getLangName(getTranslationLang());
    const ph = (id, text) => { if ($(id) && text) $(id).placeholder = `${pre} ${text}`; };
    const label = (id, text) => { if ($(id)) $(id).textContent = text; };

    const banner = $('creator-lang-banner');
    if (banner) banner.innerHTML = `${flagSVG(lang)} ${escapeHTML(t('editingContentFor', { lang: studyName }))}`;

    label('label-vocab-word', t('wordInLang', { lang: studyName }));
    label('label-vocab-trans', t('translationInLang', { lang: trName }));
    label('label-phoneme-trans', t('translationInLang', { lang: trName }));
    label('label-conv-prompt-tr', `${t('convPromptTr')} · ${trName}`);
    label('label-fill-sentence', t('sentenceInLangBlank', { lang: studyName }));
    label('label-order-sentence', t('sentenceInLang', { lang: studyName }));

    ph('add-vocab-fr', ex.vocabWord);
    ph('add-vocab-es', localizeTranslation(ex.vocabTrans));
    ph('add-vocab-emoji', ex.vocabEmoji);

    ph('add-conv-context', localize(ex.convContext));
    ph('add-conv-prompt', ex.convPrompt);
    ph('add-conv-prompt-tr', localizeTranslation(ex.convPromptTr));
    ph('add-conv-answer', ex.convAnswer);
    ph('add-conv-wrong1', ex.convWrong[0]);
    ph('add-conv-wrong2', ex.convWrong[1]);
    ph('add-conv-emoji', ex.convEmoji);

    ph('add-phoneme-symbol', ex.phonemeSymbol);
    ph('add-phoneme-word', ex.phonemeWord);
    ph('add-phoneme-trans', localizeTranslation(ex.phonemeTrans));
    ph('add-phoneme-emoji', ex.phonemeEmoji);

    ph('add-gram-verb', ex.verb);
    ph('add-gram-tense', ex.tense);
    CONJUGATION_KEYS.forEach(k => { if ($(`add-gram-${k}`) && ex.conjugations) $(`add-gram-${k}`).placeholder = ex.conjugations[k] || ''; });

    ph('add-fill-title', localize(ex.fillTitle));
    ph('add-fill-sentence', ex.fillSentence);
    ph('add-fill-answer', ex.fillAnswer);
    ph('add-fill-emoji', ex.fillEmoji);

    ph('add-order-title', localizeTranslation(ex.orderTitle));
    ph('add-order-sentence', ex.orderSentence);
    ph('add-order-extras', ex.orderExtras);

    document.querySelectorAll('.topic-input').forEach(el => { el.placeholder = t('topicPlaceholder'); });
    updateGrammarFormLabels();
}

// --- Listas de elementos ---
function chip(type, idx, item, icon, mainHTML) {
    return `
        <span class="item-chip">
            <span class="chip-icon">${icon}</span>
            <span class="chip-level">${item.level || 'A1'}</span>
            <span class="chip-main">${mainHTML}</span>
            <span class="chip-topic">${escapeHTML(topicLabel(item.topic))}</span>
            <span class="chip-score">⭐ ${item.score || 0}/5</span>
            <button class="chip-btn" title="✏️" onclick="window.editItem('${type}', ${idx})">✏️</button>
            <span class="remove-chip" title="✕" onclick="window.deleteItem('${type}', ${idx})">✕</span>
        </span>`;
}

const CHIP_RENDERERS = {
    vocab: (item) => [item.img || '🖼️', `<strong>${escapeHTML(item.fr)}</strong> <span class="chip-muted">(${escapeHTML(localizeTranslation(item.es))})</span>`],
    conversation: (item) => [item.img || '💬', `<strong>${escapeHTML(item.prompt)}</strong> <span class="chip-muted">→ ${escapeHTML(item.answer)}</span>`],
    phonemes: (item) => ['🗣️', `<strong>[${escapeHTML(item.symbol)}]</strong> ${escapeHTML(item.word)}`],
    grammar: (item) => ['📗', `${t('verbLabel')}: <strong>${escapeHTML(item.verb)}</strong> <span class="chip-muted">${escapeHTML(item.tense)}</span>`],
    fill: (item) => ['✏️', `<strong>${escapeHTML(item.sentence)}</strong>`],
    order: (item) => ['🧩', `<strong>${escapeHTML(item.sentence)}</strong>`]
};

const LIST_IDS = { vocab: 'list-vocab', conversation: 'list-conversation', phonemes: 'list-phonemes', grammar: 'list-grammar', fill: 'list-fill', order: 'list-order' };

export function renderCreatorLists() {
    CONTENT_CATEGORIES.forEach(type => {
        const items = forStudyLang(db[type]);
        const list = $(LIST_IDS[type]);
        if (list) {
            list.innerHTML = items.length
                ? items.map(({ item, idx }) => {
                    const [icon, main] = CHIP_RENDERERS[type](item);
                    return chip(type, idx, item, icon, main);
                }).join('')
                : `<p class="empty-list">${t('emptyList')}</p>`;
        }
        const count = document.querySelector(`.creator-tab[data-tab="${type}"] .tab-count`);
        if (count) count.textContent = items.length;
    });
}

export function populateTopicDropdown() {
    const topics = new Set(['General']);
    CONTENT_CATEGORIES.forEach(cat => {
        (db[cat] || []).forEach(i => {
            if (i.topic && itemLang(i) === getStudyLang()) topics.add(i.topic);
        });
    });
    const sorted = [...topics].sort((a, b) => topicLabel(a).localeCompare(topicLabel(b)));

    ['topic-filter-select', 'home-topic-select'].forEach(id => {
        const select = $(id);
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = `<option value="all">${t('allTopics')}</option>`;
        sorted.forEach(topic => {
            const opt = document.createElement('option');
            opt.value = topic;
            opt.textContent = `📁 ${topicLabel(topic)}`;
            select.appendChild(opt);
        });
        select.value = topics.has(currentVal) || currentVal === 'all' ? currentVal : 'all';
    });
}

export function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "buho_db_backup.json");
    dlAnchorElem.click();
    showToast(t('backupDownloaded'));
}

export function toggleImgTypeInputs(prefix, selectedType) {
    const emojiEl = $(`${prefix}-input-emoji`);
    const fileEl = $(`${prefix}-input-file`);
    const svgEl = $(`${prefix}-input-svg`);
    if (emojiEl) emojiEl.style.display = selectedType === 'emoji' ? 'block' : 'none';
    if (fileEl) fileEl.style.display = selectedType === 'file' ? 'block' : 'none';
    if (svgEl) svgEl.style.display = selectedType === 'svg' ? 'block' : 'none';
}

// --- Edición ---
function setFormMode(type, editing) {
    const cfg = FORMS[type];
    const title = $(`${cfg.prefix}-form-title`);
    const submit = $(`${cfg.prefix}-submit-btn`);
    const cancel = $(`${cfg.prefix}-cancel-btn`);
    if (title) title.textContent = t(editing ? cfg.editTitle : cfg.title);
    if (submit) submit.textContent = t(editing ? cfg.update : cfg.save);
    if (cancel) cancel.style.display = editing ? 'block' : 'none';
    const card = title && title.closest('.creator-card');
    if (card) card.classList.toggle('is-editing', editing);
}

export function editItem(type, index) {
    type = normalizeType(type);
    const item = db[type][index];
    if (!item) return;
    editingItemId = item.id;
    editingItemType = type;
    switchCreatorTab(type);

    if (type === 'vocab') {
        setVal('add-vocab-fr', item.fr);
        setVal('add-vocab-es', localizeTranslation(item.es));
        setVal('add-vocab-topic', topicLabel(item.topic));
        setVal('add-vocab-level', item.level || 'A1');
        if (item.img) setVal('add-vocab-emoji', item.img);
    } else if (type === 'conversation') {
        setVal('add-conv-context', localize(item.context));
        setVal('add-conv-prompt', item.prompt);
        setVal('add-conv-prompt-tr', localizeTranslation(item.promptTr));
        setVal('add-conv-answer', item.answer);
        setVal('add-conv-wrong1', (item.wrong || [])[0]);
        setVal('add-conv-wrong2', (item.wrong || [])[1]);
        setVal('add-conv-topic', topicLabel(item.topic));
        setVal('add-conv-level', item.level || 'A1');
        setVal('add-conv-emoji', item.img);
    } else if (type === 'phonemes') {
        setVal('add-phoneme-symbol', item.symbol);
        setVal('add-phoneme-word', item.word);
        setVal('add-phoneme-trans', localizeTranslation(item.trans));
        setVal('add-phoneme-topic', topicLabel(item.topic));
        setVal('add-phoneme-level', item.level || 'A1');
        if (item.img) setVal('add-phoneme-emoji', item.img);
    } else if (type === 'grammar') {
        setVal('add-gram-verb', item.verb);
        setVal('add-gram-tense', item.tense);
        setVal('add-gram-topic', topicLabel(item.topic));
        setVal('add-gram-level', item.level || 'A1');
        CONJUGATION_KEYS.forEach(k => setVal(`add-gram-${k}`, (item.conjugations || {})[k]));
    } else if (type === 'fill') {
        setVal('add-fill-title', localize(item.title));
        setVal('add-fill-sentence', item.sentence);
        setVal('add-fill-answer', item.answer);
        setVal('add-fill-topic', topicLabel(item.topic));
        setVal('add-fill-level', item.level || 'A1');
        if (item.img) setVal('add-fill-emoji', item.img);
    } else if (type === 'order') {
        setVal('add-order-title', localizeTranslation(item.title));
        setVal('add-order-sentence', item.sentence);
        setVal('add-order-extras', item.extras ? item.extras.join(', ') : '');
        setVal('add-order-topic', topicLabel(item.topic));
        setVal('add-order-level', item.level || 'A1');
        if (item.img) setVal('add-order-emoji', item.img);
    }
    setFormMode(type, true);
    const title = $(`${FORMS[type].prefix}-form-title`);
    if (title) title.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const FORM_FIELDS = {
    vocab: ['add-vocab-fr', 'add-vocab-es', 'add-vocab-emoji'],
    conversation: ['add-conv-context', 'add-conv-prompt', 'add-conv-prompt-tr', 'add-conv-answer', 'add-conv-wrong1', 'add-conv-wrong2', 'add-conv-emoji'],
    phonemes: ['add-phoneme-symbol', 'add-phoneme-word', 'add-phoneme-trans', 'add-phoneme-emoji'],
    grammar: ['add-gram-verb', 'add-gram-tense', ...CONJUGATION_KEYS.map(k => `add-gram-${k}`)],
    fill: ['add-fill-title', 'add-fill-sentence', 'add-fill-answer', 'add-fill-emoji'],
    order: ['add-order-title', 'add-order-sentence', 'add-order-extras', 'add-order-emoji']
};
const DEFAULT_TOPICS = { conversation: 'conversation' };
const TOPIC_FIELDS = { vocab: 'add-vocab-topic', conversation: 'add-conv-topic', phonemes: 'add-phoneme-topic', grammar: 'add-gram-topic', fill: 'add-fill-topic', order: 'add-order-topic' };

function clearForm(type, keepTopicField = false) {
    FORM_FIELDS[type].forEach(id => setVal(id, ''));
    if (!keepTopicField) setVal(TOPIC_FIELDS[type], topicLabel(DEFAULT_TOPICS[type] || 'General'));
}

export function cancelEdit(type) {
    type = normalizeType(type);
    editingItemId = null;
    editingItemType = null;
    clearForm(type);
    setFormMode(type, false);
}

function finishEdit(type, toastKey) {
    cancelEdit(type);
    saveDB(renderCreatorLists, populateTopicDropdown);
    showToast(t(toastKey));
}

function findEditing(type) {
    return (editingItemId && editingItemType === type) ? db[type].find(i => i.id === editingItemId) : null;
}

function newItem(prefix, fields) {
    return { id: `${prefix}_${Date.now()}`, ...fields, lang: getStudyLang(), score: 0 };
}

// Lee la ilustración elegida (emoji, archivo o SVG) y la aplica al ítem
function applyIllustration(prefix, item, fallbackEmoji, done) {
    const checked = document.querySelector(`input[name="${prefix}-img-type"]:checked`);
    const imgType = checked ? checked.value : 'emoji';
    if (imgType === 'emoji') {
        item.img = val(`add-${prefix}-emoji`) || item.img || fallbackEmoji;
        done();
    } else if (imgType === 'svg') {
        item.svgCode = val(`add-${prefix}-svg`);
        done();
    } else {
        const fileInput = $(`add-${prefix}-file`);
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => { item.imgDataUrl = e.target.result; done(); };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            item.img = item.img || fallbackEmoji;
            done();
        }
    }
}

// --- Guardado por tipo ---
export function addVocabItem() {
    const fr = val('add-vocab-fr');
    const es = val('add-vocab-es');
    if (!fr || !es) return showToast(t('completeVocabFields'));
    const level = val('add-vocab-level') || 'A1';
    const existing = findEditing('vocab');

    if (existing) {
        Object.assign(existing, { fr, es: keepLocalized(existing.es, es), topic: keepTopic(existing.topic, val('add-vocab-topic')), level });
        return applyIllustration('vocab', existing, '📘', () => finishEdit('vocab', 'vocabUpdated'));
    }
    const item = newItem('v', { fr, es, topic: topicFromInput(val('add-vocab-topic')), level });
    applyIllustration('vocab', item, '📘', () => {
        db.vocab.push(item);
        saveDB(renderCreatorLists, populateTopicDropdown);
        clearForm('vocab', true);
        showToast(t('vocabSaved'));
    });
}

export function addConversationItem() {
    const prompt = val('add-conv-prompt');
    const answer = val('add-conv-answer');
    const wrong = [val('add-conv-wrong1'), val('add-conv-wrong2')].filter(Boolean);
    if (!prompt || !answer || wrong.length === 0) return showToast(t('completeConversationFields'));
    const context = val('add-conv-context');
    const promptTr = val('add-conv-prompt-tr');
    const level = val('add-conv-level') || 'A1';
    const img = val('add-conv-emoji') || '🧑';
    const existing = findEditing('conversation');

    if (existing) {
        Object.assign(existing, {
            prompt, answer, wrong, level, img,
            context: keepLocalized(existing.context, context, localize),
            promptTr: keepLocalized(existing.promptTr, promptTr),
            answerTr: existing.answer === answer ? existing.answerTr : '',
            topic: keepTopic(existing.topic, val('add-conv-topic'))
        });
        return finishEdit('conversation', 'conversationUpdated');
    }
    db.conversation.push(newItem('c', { prompt, answer, wrong, context, promptTr, answerTr: '', img, level, topic: topicFromInput(val('add-conv-topic') || 'conversation') }));
    saveDB(renderCreatorLists, populateTopicDropdown);
    clearForm('conversation', true);
    showToast(t('conversationSaved'));
}

export function addPhonemeItem() {
    const symbol = val('add-phoneme-symbol');
    const word = val('add-phoneme-word');
    if (!symbol || !word) return showToast(t('enterPhonemeExample'));
    const trans = val('add-phoneme-trans');
    const level = val('add-phoneme-level') || 'A1';
    const existing = findEditing('phonemes');

    if (existing) {
        Object.assign(existing, { symbol, word, trans: keepLocalized(existing.trans, trans), topic: keepTopic(existing.topic, val('add-phoneme-topic')), level });
        return applyIllustration('phoneme', existing, '🗣️', () => finishEdit('phonemes', 'phonemeUpdated'));
    }
    const item = newItem('p', { symbol, word, trans, topic: topicFromInput(val('add-phoneme-topic')), level });
    applyIllustration('phoneme', item, '🗣️', () => {
        db.phonemes.push(item);
        saveDB(renderCreatorLists, populateTopicDropdown);
        clearForm('phonemes', true);
        showToast(t('phonemeSaved'));
    });
}

export function addGrammarItem() {
    const verb = val('add-gram-verb');
    const tense = val('add-gram-tense') || getExamples(getStudyLang()).tense || '';
    const conjugations = {};
    CONJUGATION_KEYS.forEach(k => { conjugations[k] = val(`add-gram-${k}`); });
    if (!verb || CONJUGATION_KEYS.some(k => !conjugations[k])) return showToast(t('completeConjugations'));
    const level = val('add-gram-level') || 'A1';
    const existing = findEditing('grammar');

    if (existing) {
        Object.assign(existing, { verb, tense, conjugations, topic: keepTopic(existing.topic, val('add-gram-topic')), level });
        return finishEdit('grammar', 'grammarUpdated');
    }
    db.grammar.push(newItem('g', { verb, tense, conjugations, topic: topicFromInput(val('add-gram-topic')), level }));
    saveDB(renderCreatorLists, populateTopicDropdown);
    clearForm('grammar', true);
    showToast(t('grammarSaved'));
}

export function addFillItem() {
    const title = val('add-fill-title');
    const sentence = val('add-fill-sentence');
    const answer = val('add-fill-answer');
    if (!sentence.includes('___') || !answer) return showToast(t('fillNeedsBlank'));
    const level = val('add-fill-level') || 'A1';
    const existing = findEditing('fill');

    if (existing) {
        Object.assign(existing, {
            title: title ? keepLocalized(existing.title, title, localize) : t('defaultFillTitle'),
            sentence, answer, topic: keepTopic(existing.topic, val('add-fill-topic')), level
        });
        return applyIllustration('fill', existing, '✏️', () => finishEdit('fill', 'fillUpdated'));
    }
    const item = newItem('f', { title: title || t('defaultFillTitle'), sentence, answer, topic: topicFromInput(val('add-fill-topic')), level });
    applyIllustration('fill', item, '✏️', () => {
        db.fill.push(item);
        saveDB(renderCreatorLists, populateTopicDropdown);
        clearForm('fill', true);
        showToast(t('fillSaved'));
    });
}

export function addOrderItem() {
    const title = val('add-order-title');
    const sentence = val('add-order-sentence');
    if (!title || !sentence) return showToast(t('completeTitleSentence'));
    const extrasRaw = val('add-order-extras');
    const extras = extrasRaw ? extrasRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const level = val('add-order-level') || 'A1';
    const existing = findEditing('order');

    if (existing) {
        Object.assign(existing, { title: keepLocalized(existing.title, title), sentence, extras, topic: keepTopic(existing.topic, val('add-order-topic')), level });
        return applyIllustration('order', existing, '🧩', () => finishEdit('order', 'orderUpdated'));
    }
    const item = newItem('o', { title, sentence, extras, topic: topicFromInput(val('add-order-topic')), level });
    applyIllustration('order', item, '🧩', () => {
        db.order.push(item);
        saveDB(renderCreatorLists, populateTopicDropdown);
        clearForm('order', true);
        showToast(t('orderSaved'));
    });
}

export function deleteItem(type, index) {
    type = normalizeType(type);
    const item = db[type][index];
    if (item && item.id === editingItemId) cancelEdit(type);
    db[type].splice(index, 1);
    saveDB(renderCreatorLists, populateTopicDropdown);
    showToast(t('itemDeleted'));
}

// Inicializa la vista del creador (pestaña activa, niveles por defecto, ejemplos)
export function initCreatorView() {
    switchCreatorTab(activeTab);
    document.querySelectorAll('select.level-select').forEach(sel => {
        if (!editingItemId) sel.value = defaultLevel();
    });
    Object.entries(TOPIC_FIELDS).forEach(([type, id]) => {
        if ($(id) && !val(id)) setVal(id, topicLabel(DEFAULT_TOPICS[type] || 'General'));
    });
    updateCreatorExamples();
}

// Exponer funciones globales
window.editItem = editItem;
window.deleteItem = deleteItem;
window.toggleImgTypeInputs = toggleImgTypeInputs;
window.cancelEdit = cancelEdit;
window.switchCreatorTab = switchCreatorTab;
window.addVocabItem = addVocabItem;
window.addConversationItem = addConversationItem;
window.addPhonemeItem = addPhonemeItem;
window.addGrammarItem = addGrammarItem;
window.addFillItem = addFillItem;
window.addOrderItem = addOrderItem;
window.exportDataJSON = exportDataJSON;
window.handleSoundUpload = handleSoundUpload;
window.playSound = playSound;
window.updateVoiceSettings = updateVoiceSettings;
window.testSelectedVoice = testSelectedVoice;
window.populateBrowserVoices = populateBrowserVoices;
