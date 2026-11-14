// --- Módulo del Creador de Contenido ---

import { db, saveDB, showToast } from './state.js';
import { playSound, updateVoiceSettings, testSelectedVoice, populateBrowserVoices, handleSoundUpload } from './audio.js';
import { CEFR_LEVELS } from './levels.js';

let editingItemId = null;
let editingItemType = null;

export function renderCreatorLists() {
    const listVocab = document.getElementById('list-vocab');
    const listPhonemes = document.getElementById('list-phonemes');
    const listGrammar = document.getElementById('list-grammar');
    const listFill = document.getElementById('list-fill');
    const listOrder = document.getElementById('list-order');

    if (listVocab) {
        listVocab.innerHTML = db.vocab.map((item, idx) => `
            <span class="item-chip">${item.img || '🖼️'} [${item.level || 'A1'}] <strong>${item.fr}</strong> (${item.es}) <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="window.editItem('vocab', ${idx})">✏️</button><span class="remove-chip" onclick="window.deleteItem('vocab', ${idx})">✕</span></span>
        `).join('');
    }

    if (listPhonemes) {
        listPhonemes.innerHTML = db.phonemes.map((item, idx) => `
            <span class="item-chip">🗣️ [${item.level || 'A1'}] <strong>[${item.symbol}]</strong> ${item.word} <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="window.editItem('phonemes', ${idx})">✏️</button><span class="remove-chip" onclick="window.deleteItem('phonemes', ${idx})">✕</span></span>
        `).join('');
    }

    if (listGrammar) {
        listGrammar.innerHTML = db.grammar.map((item, idx) => `
            <span class="item-chip">📗 [${item.level || 'A1'}] Verbo: <strong>${item.verb}</strong> <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="window.editItem('grammar', ${idx})">✏️</button><span class="remove-chip" onclick="window.deleteItem('grammar', ${idx})">✕</span></span>
        `).join('');
    }

    if (listFill) {
        listFill.innerHTML = db.fill.map((item, idx) => `
            <span class="item-chip">✏️ [${item.level || 'A1'}] <strong>${item.sentence}</strong> <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="window.editItem('fill', ${idx})">✏️</button><span class="remove-chip" onclick="window.deleteItem('fill', ${idx})">✕</span></span>
        `).join('');
    }

    if (listOrder) {
        listOrder.innerHTML = db.order.map((item, idx) => `
            <span class="item-chip">🧩 [${item.level || 'A1'}] <strong>${item.sentence}</strong> <span style="font-size:0.75rem; color:#888;">[${item.topic || 'General'}]</span> <span class="chip-score">⭐ ${item.score || 0}/5</span> <button class="nav-btn" style="padding:1px 6px; font-size:0.7rem; margin-left:4px;" onclick="window.editItem('order', ${idx})">✏️</button><span class="remove-chip" onclick="window.deleteItem('order', ${idx})">✕</span></span>
        `).join('');
    }
}

export function populateTopicDropdown() {
    const select = document.getElementById('topic-filter-select');
    if (!select) return;
    const topics = new Set(['General']);
    ['vocab', 'phonemes', 'grammar', 'fill', 'order'].forEach(cat => {
        if (db[cat]) {
            db[cat].forEach(i => {
                if (i.topic) topics.add(i.topic);
            });
        }
    });

    const currentVal = select.value;
    select.innerHTML = '<option value="all">📚 Todos los Temas</option>';
    topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = `📁 ${t}`;
        select.appendChild(opt);
    });
    select.value = topics.has(currentVal) || currentVal === 'all' ? currentVal : 'all';
}

export function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "buho_french_db_backup.json");
    dlAnchorElem.click();
    showToast("Respaldo descargado con éxito.");
}

export function toggleImgTypeInputs(prefix, selectedType) {
    const emojiEl = document.getElementById(`${prefix}-input-emoji`);
    const fileEl = document.getElementById(`${prefix}-input-file`);
    const svgEl = document.getElementById(`${prefix}-input-svg`);
    if (emojiEl) emojiEl.style.display = selectedType === 'emoji' ? 'block' : 'none';
    if (fileEl) fileEl.style.display = selectedType === 'file' ? 'block' : 'none';
    if (svgEl) svgEl.style.display = selectedType === 'svg' ? 'block' : 'none';
}

export function editItem(type, index) {
    const item = db[type][index];
    if (!item) return;
    editingItemId = item.id;
    editingItemType = type;

    if (type === 'vocab') {
        document.getElementById('add-vocab-fr').value = item.fr || '';
        document.getElementById('add-vocab-es').value = item.es || '';
        document.getElementById('add-vocab-topic').value = item.topic || 'General';
        if (document.getElementById('add-vocab-level')) document.getElementById('add-vocab-level').value = item.level || 'A1';
        if (item.img) document.getElementById('add-vocab-emoji').value = item.img;
        document.getElementById('vocab-form-title').textContent = "Editar Vocabulario";
        document.getElementById('vocab-submit-btn').textContent = "Actualizar Vocabulario";
        document.getElementById('vocab-cancel-btn').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (type === 'phonemes') {
        document.getElementById('add-phoneme-symbol').value = item.symbol || '';
        document.getElementById('add-phoneme-word').value = item.word || '';
        document.getElementById('add-phoneme-trans').value = item.trans || '';
        document.getElementById('add-phoneme-topic').value = item.topic || 'General';
        if (item.img) document.getElementById('add-phoneme-emoji').value = item.img;
        document.getElementById('phoneme-form-title').textContent = "Editar Fonema";
        document.getElementById('phoneme-submit-btn').textContent = "Actualizar Fonema";
        document.getElementById('phoneme-cancel-btn').style.display = 'block';
    } else if (type === 'grammar') {
        document.getElementById('add-gram-verb').value = item.verb || '';
        document.getElementById('add-gram-tense').value = item.tense || '';
        document.getElementById('add-gram-topic').value = item.topic || 'General';
        if (item.conjugations) {
            document.getElementById('add-gram-je').value = item.conjugations.je || '';
            document.getElementById('add-gram-tu').value = item.conjugations.tu || '';
            document.getElementById('add-gram-il').value = item.conjugations.il || '';
            document.getElementById('add-gram-nous').value = item.conjugations.nous || '';
            document.getElementById('add-gram-vous').value = item.conjugations.vous || '';
            document.getElementById('add-gram-ils').value = item.conjugations.ils || '';
        }
        document.getElementById('grammar-form-title').textContent = "Editar Tabla Gramatical";
        document.getElementById('grammar-submit-btn').textContent = "Actualizar Tabla";
        document.getElementById('grammar-cancel-btn').style.display = 'block';
    } else if (type === 'fill') {
        document.getElementById('add-fill-title').value = item.title || '';
        document.getElementById('add-fill-sentence').value = item.sentence || '';
        document.getElementById('add-fill-answer').value = item.answer || '';
        document.getElementById('add-fill-topic').value = item.topic || 'General';
        if (item.img) document.getElementById('add-fill-emoji').value = item.img;
        document.getElementById('fill-form-title').textContent = "Editar Oración";
        document.getElementById('fill-submit-btn').textContent = "Actualizar Oración";
        document.getElementById('fill-cancel-btn').style.display = 'block';
    } else if (type === 'order') {
        document.getElementById('add-order-title').value = item.title || '';
        document.getElementById('add-order-sentence').value = item.sentence || '';
        document.getElementById('add-order-extras').value = item.extras ? item.extras.join(', ') : '';
        document.getElementById('add-order-topic').value = item.topic || 'General';
        if (item.img) document.getElementById('add-order-emoji').value = item.img;
        document.getElementById('order-form-title').textContent = "Editar Reordenar";
        document.getElementById('order-submit-btn').textContent = "Actualizar Reordenar";
        document.getElementById('order-cancel-btn').style.display = 'block';
    }
}

export function cancelEdit(type) {
    editingItemId = null;
    editingItemType = null;
    if (type === 'vocab') {
        document.getElementById('add-vocab-fr').value = '';
        document.getElementById('add-vocab-es').value = '';
        document.getElementById('add-vocab-topic').value = 'General';
        document.getElementById('vocab-form-title').textContent = "1. Vocabulario";
        document.getElementById('vocab-submit-btn').textContent = "+ Guardar Vocabulario";
        document.getElementById('vocab-cancel-btn').style.display = 'none';
    } else if (type === 'phonemes') {
        document.getElementById('add-phoneme-symbol').value = '';
        document.getElementById('add-phoneme-word').value = '';
        document.getElementById('add-phoneme-trans').value = '';
        document.getElementById('add-phoneme-topic').value = 'General';
        document.getElementById('phoneme-form-title').textContent = "2. Pronunciación de Fonemas y Letras";
        document.getElementById('phoneme-submit-btn').textContent = "+ Guardar Fonema";
        document.getElementById('phoneme-cancel-btn').style.display = 'none';
    } else if (type === 'grammar') {
        document.getElementById('add-gram-verb').value = '';
        document.getElementById('add-gram-tense').value = '';
        document.getElementById('add-gram-topic').value = 'General';
        ['je', 'tu', 'il', 'nous', 'vous', 'ils'].forEach(k => document.getElementById(`add-gram-${k}`).value = '');
        document.getElementById('grammar-form-title').textContent = "3. Tabla Gramatical (Conjugaciones)";
        document.getElementById('grammar-submit-btn').textContent = "+ Guardar Tabla Gramatical";
        document.getElementById('grammar-cancel-btn').style.display = 'none';
    } else if (type === 'fill') {
        document.getElementById('add-fill-title').value = '';
        document.getElementById('add-fill-sentence').value = '';
        document.getElementById('add-fill-answer').value = '';
        document.getElementById('add-fill-topic').value = 'General';
        document.getElementById('fill-form-title').textContent = "4. Completar Oración";
        document.getElementById('fill-submit-btn').textContent = "+ Guardar Oración";
        document.getElementById('fill-cancel-btn').style.display = 'none';
    } else if (type === 'order') {
        document.getElementById('add-order-title').value = '';
        document.getElementById('add-order-sentence').value = '';
        document.getElementById('add-order-extras').value = '';
        document.getElementById('add-order-topic').value = 'General';
        document.getElementById('order-form-title').textContent = "5. Reordenar Oración";
        document.getElementById('order-submit-btn').textContent = "+ Guardar Reordenar";
        document.getElementById('order-cancel-btn').style.display = 'none';
    }
}

export function addVocabItem() {
    const fr = document.getElementById('add-vocab-fr').value.trim();
    const es = document.getElementById('add-vocab-es').value.trim();
    const topic = document.getElementById('add-vocab-topic').value.trim() || 'General';
    const level = document.getElementById('add-vocab-level') ? document.getElementById('add-vocab-level').value : 'A1';
    const imgType = document.querySelector('input[name="vocab-img-type"]:checked').value;

    if (!fr || !es) return showToast("Completa los campos de Francés y Español.");

    if (editingItemId && editingItemType === 'vocab') {
        const item = db.vocab.find(i => i.id === editingItemId);
        if (item) {
            item.fr = fr;
            item.es = es;
            item.topic = topic;
            item.level = level;
            if (imgType === 'emoji') item.img = document.getElementById('add-vocab-emoji').value.trim() || '📘';
            else if (imgType === 'svg') item.svgCode = document.getElementById('add-vocab-svg').value.trim();
        }
        cancelEdit('vocab');
        saveDB(renderCreatorLists, populateTopicDropdown);
        showToast("Vocabulario actualizado.");
        return;
    }

    const newItem = { id: 'v_' + Date.now(), fr, es, topic, level, score: 0 };
    const finalizeSave = () => {
        db.vocab.push(newItem);
        saveDB(renderCreatorLists, populateTopicDropdown);
        document.getElementById('add-vocab-fr').value = '';
        document.getElementById('add-vocab-es').value = '';
        showToast("Vocabulario guardado.");
    };

    if (imgType === 'emoji') {
        newItem.img = document.getElementById('add-vocab-emoji').value.trim() || '📘';
        finalizeSave();
    } else if (imgType === 'svg') {
        newItem.svgCode = document.getElementById('add-vocab-svg').value.trim();
        finalizeSave();
    } else if (imgType === 'file') {
        const fileInput = document.getElementById('add-vocab-file');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newItem.imgDataUrl = e.target.result;
                finalizeSave();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            newItem.img = '📘';
            finalizeSave();
        }
    }
}

export function addPhonemeItem() {
    const symbol = document.getElementById('add-phoneme-symbol').value.trim();
    const word = document.getElementById('add-phoneme-word').value.trim();
    const trans = document.getElementById('add-phoneme-trans').value.trim();
    const topic = document.getElementById('add-phoneme-topic').value.trim() || 'General';
    const level = document.getElementById('add-phoneme-level') ? document.getElementById('add-phoneme-level').value : 'A1';
    const imgType = document.querySelector('input[name="phoneme-img-type"]:checked').value;

    if (!symbol || !word) return showToast("Ingresa el fonema y la palabra de ejemplo.");

    if (editingItemId && editingItemType === 'phonemes') {
        const item = db.phonemes.find(i => i.id === editingItemId);
        if (item) {
            item.symbol = symbol;
            item.word = word;
            item.trans = trans;
            item.topic = topic;
            item.level = level;
            if (imgType === 'emoji') item.img = document.getElementById('add-phoneme-emoji').value.trim() || '🗣️';
        }
        cancelEdit('phonemes');
        saveDB(renderCreatorLists, populateTopicDropdown);
        showToast("Fonema actualizado.");
        return;
    }

    const newItem = { id: 'p_' + Date.now(), symbol, word, trans, topic, level, score: 0 };
    const saveAndReset = () => {
        db.phonemes.push(newItem);
        saveDB(renderCreatorLists, populateTopicDropdown);
        document.getElementById('add-phoneme-symbol').value = '';
        document.getElementById('add-phoneme-word').value = '';
        document.getElementById('add-phoneme-trans').value = '';
        showToast("Fonema guardado.");
    };

    if (imgType === 'emoji') {
        newItem.img = document.getElementById('add-phoneme-emoji').value.trim() || '🗣️';
        saveAndReset();
    } else {
        saveAndReset();
    }
}

export function addGrammarItem() {
    const verb = document.getElementById('add-gram-verb').value.trim();
    const tense = document.getElementById('add-gram-tense').value.trim() || "Présent";
    const topic = document.getElementById('add-gram-topic').value.trim() || 'General';
    const level = document.getElementById('add-gram-level') ? document.getElementById('add-gram-level').value : 'A1';
    const je = document.getElementById('add-gram-je').value.trim();
    const tu = document.getElementById('add-gram-tu').value.trim();
    const il = document.getElementById('add-gram-il').value.trim();
    const nous = document.getElementById('add-gram-nous').value.trim();
    const vous = document.getElementById('add-gram-vous').value.trim();
    const ils = document.getElementById('add-gram-ils').value.trim();

    if (!verb || !je || !tu || !il || !nous || !vous || !ils) return showToast("Completa todas las conjugaciones.");

    if (editingItemId && editingItemType === 'grammar') {
        const item = db.grammar.find(i => i.id === editingItemId);
        if (item) {
            item.verb = verb;
            item.tense = tense;
            item.topic = topic;
            item.level = level;
            item.conjugations = { je, tu, il, nous, vous, ils };
        }
        cancelEdit('grammar');
        saveDB(renderCreatorLists, populateTopicDropdown);
        showToast("Tabla de gramática actualizada.");
        return;
    }

    db.grammar.push({
        id: 'g_' + Date.now(), verb, tense, topic, level, score: 0,
        conjugations: { je, tu, il, nous, vous, ils }
    });

    document.getElementById('add-gram-verb').value = '';
    ['je', 'tu', 'il', 'nous', 'vous', 'ils'].forEach(k => document.getElementById(`add-gram-${k}`).value = '');
    saveDB(renderCreatorLists, populateTopicDropdown);
    showToast("Tabla de gramática guardada.");
}

export function addFillItem() {
    const title = document.getElementById('add-fill-title').value.trim();
    const sentence = document.getElementById('add-fill-sentence').value.trim();
    const answer = document.getElementById('add-fill-answer').value.trim();
    const topic = document.getElementById('add-fill-topic').value.trim() || 'General';
    const level = document.getElementById('add-fill-level') ? document.getElementById('add-fill-level').value : 'A1';

    if (!sentence.includes('___') || !answer) return showToast("La oración debe contener '___' y la respuesta.");

    if (editingItemId && editingItemType === 'fill') {
        const item = db.fill.find(i => i.id === editingItemId);
        if (item) {
            item.title = title || 'Completa la frase';
            item.sentence = sentence;
            item.answer = answer;
            item.topic = topic;
            item.level = level;
        }
        cancelEdit('fill');
        saveDB(renderCreatorLists, populateTopicDropdown);
        showToast("Oración actualizada.");
        return;
    }

    db.fill.push({ id: 'f_' + Date.now(), title: title || 'Completa la frase', sentence, answer, topic, level, score: 0 });
    document.getElementById('add-fill-sentence').value = '';
    document.getElementById('add-fill-answer').value = '';
    saveDB(renderCreatorLists, populateTopicDropdown);
    showToast("Oración guardada.");
}

export function addOrderItem() {
    const title = document.getElementById('add-order-title').value.trim();
    const sentence = document.getElementById('add-order-sentence').value.trim();
    const extrasRaw = document.getElementById('add-order-extras').value.trim();
    const topic = document.getElementById('add-order-topic').value.trim() || 'General';
    const level = document.getElementById('add-order-level') ? document.getElementById('add-order-level').value : 'A1';

    if (!title || !sentence) return showToast("Completa el título y la oración.");
    const extras = extrasRaw ? extrasRaw.split(',').map(s => s.trim()) : [];

    if (editingItemId && editingItemType === 'order') {
        const item = db.order.find(i => i.id === editingItemId);
        if (item) {
            item.title = title;
            item.sentence = sentence;
            item.extras = extras;
            item.topic = topic;
            item.level = level;
        }
        cancelEdit('order');
        saveDB(renderCreatorLists, populateTopicDropdown);
        showToast("Reordenar actualizado.");
        return;
    }

    db.order.push({ id: 'o_' + Date.now(), title, sentence, extras, topic, level, score: 0 });
    document.getElementById('add-order-title').value = '';
    document.getElementById('add-order-sentence').value = '';
    document.getElementById('add-order-extras').value = '';
    saveDB(renderCreatorLists, populateTopicDropdown);
    showToast("Ejercicio de reordenar guardado.");
}

export function deleteItem(type, index) {
    db[type].splice(index, 1);
    saveDB(renderCreatorLists, populateTopicDropdown);
    showToast("Elemento eliminado.");
}

// Exponer funciones globales
window.editItem = editItem;
window.deleteItem = deleteItem;
window.toggleImgTypeInputs = toggleImgTypeInputs;
window.cancelEdit = cancelEdit;
window.addVocabItem = addVocabItem;
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
