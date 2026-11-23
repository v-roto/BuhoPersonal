// --- Registro de paquetes de contenido por idioma de estudio ---
// Para añadir un idioma:
//   1. crea `src/content/<código>.js` con la misma forma que fr.js,
//   2. añade la columna del idioma en vocabulary.js, conversations.js y sentences.js,
//   3. regístralo en LANG_PACKS.

import fr from './fr.js';
import en from './en.js';
import es from './es.js';
import it from './it.js';
import de from './de.js';
import { VOCAB_CONCEPTS } from './vocabulary.js';
import { CONVERSATION_SCENES } from './conversations.js';
import { ORDER_SENTENCES } from './sentences.js';

const LANG_PACKS = { fr, en, es, it, de };

export const STUDY_LANGS = Object.keys(LANG_PACKS);

export const CONTENT_CATEGORIES = ['vocab', 'conversation', 'choice', 'phonemes', 'grammar', 'fill', 'order'];

// Claves internas de conjugación (se mantienen por compatibilidad con datos guardados)
export const CONJUGATION_KEYS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

// Idiomas en los que existen traducciones de la interfaz
const UI_LANGS = ['es', 'en', 'fr'];

function pickUiLangs(source, field) {
    const out = {};
    UI_LANGS.forEach(l => { if (source[l]) out[l] = field ? source[l][field] : source[l]; });
    return out;
}

// "Coche|Auto|Carro" → principal "Coche" y alternativas ["Auto", "Carro"]
function splitAlts(text) {
    const [main, ...alt] = String(text || '').split('|').map(a => a.trim());
    return { main, alt };
}

function vocabId(concept, lang) {
    if (concept.legacy) return lang === 'fr' ? `v${concept.legacy}` : `${lang}_v${concept.legacy}`;
    return `${lang}_v_${concept.key}`;
}

function buildVocab(lang) {
    return VOCAB_CONCEPTS.filter(c => c.words[lang]).map(c => {
        const { main, alt } = splitAlts(c.words[lang]);
        const tr = {};
        UI_LANGS.forEach(l => { if (c.words[l]) tr[l] = splitAlts(c.words[l]).main; });
        return {
            id: vocabId(c, lang),
            fr: main,                      // palabra en el idioma de estudio (nombre histórico del campo)
            ...(alt.length ? { alt } : {}),  // otras respuestas válidas al escribirla
            es: tr,                        // traducciones por idioma de interfaz
            img: c.img, topic: c.topic, level: c.level
        };
    });
}

function buildConversations(lang) {
    return CONVERSATION_SCENES.filter(s => s.lines[lang]).map(s => ({
        id: `${lang}_c_${s.key}`,
        img: s.img, topic: 'conversation', level: s.level,
        context: s.context,
        prompt: s.lines[lang].prompt,
        promptTr: pickUiLangs(s.lines, 'prompt'),
        answer: s.lines[lang].answer,
        answerTr: pickUiLangs(s.lines, 'answer'),
        wrong: [...s.lines[lang].wrong]
    }));
}

// Id estable a partir del texto (no cambia si se reordena el archivo)
function stableId(text) {
    let h = 0;
    for (const ch of text) h = (h * 31 + ch.codePointAt(0)) | 0;
    return (h >>> 0).toString(36);
}

const WRITE_TITLE = { es: 'Escribe la forma correcta del verbo', en: 'Write the correct form of the verb', fr: 'Écris la bonne forme du verbe' };

// Opción múltiple: [nivel, enunciado, respuesta, "distractor|distractor"]
function buildChoice(lang, rows = []) {
    return rows.map(([level, prompt, answer, wrong]) => ({
        id: `${lang}_ch_${stableId(prompt + '|' + answer)}`,
        level, topic: 'grammar', prompt, answer, wrong: wrong.split('|')
    }));
}

// Escribir el verbo entre paréntesis: se guardan como ejercicios de «Completar oración»
function buildFillWrite(lang, rows = []) {
    return rows.map(([level, sentence, answers]) => ({
        id: `${lang}_fw_${stableId(sentence)}`,
        title: WRITE_TITLE, sentence, answer: answers, img: '', topic: 'verbs', level
    }));
}

// Conjugación: [nivel, verbo, tiempo, "formas en el orden de CONJUGATION_KEYS separadas por |"]
// (una persona con varias formas válidas: "suis allé / suis allée")
function buildGrammar(lang, rows = []) {
    return rows.map(([level, verb, tense, forms]) => {
        // "|" separa personas; " / " dentro de una persona separa respuestas válidas
        const list = forms.split('|').map(f => f.split(' / ').map(a => a.trim()).join('|'));
        const conjugations = {};
        CONJUGATION_KEYS.forEach((k, i) => { conjugations[k] = list[i]; });
        return { id: `${lang}_gr_${stableId(verb + '|' + tense)}`, verb, tense, topic: 'verbs', level, conjugations };
    });
}

// Fonemas: [nivel, símbolo, palabra, emoji, "traducción es|en|fr"]
function buildPhonemes(lang, rows = []) {
    return rows.map(([level, symbol, word, img, tr]) => {
        const [es, en, fr] = tr.split('|');
        return { id: `${lang}_ph_${stableId(symbol + '|' + word)}`, symbol, word, trans: { es, en, fr }, img, topic: 'phonetics', level };
    });
}

// Ordenar palabras: frases compartidas (sentences.js); el título es la frase en el idioma de traducción
function buildOrder(lang) {
    return ORDER_SENTENCES.filter(x => x.lines[lang]).map(x => ({
        id: `${lang}_o_${x.key}`,
        title: { es: `Traduce: «${x.lines.es[0]}»`, en: `Translate: "${x.lines.en[0]}"`, fr: `Traduis : « ${x.lines.fr[0]} »` },
        sentence: x.lines[lang][0], extras: x.lines[lang][1].split('|'),
        ...(x.lines[lang][2] ? { alt: x.lines[lang][2] } : {}),   // otros órdenes válidos
        topic: x.topic || 'syntax', level: x.level
    }));
}

const packCache = {};

// Paquete completo (todas las categorías) de un idioma
export function getPack(lang) {
    if (!LANG_PACKS[lang]) return null;
    if (!packCache[lang]) {
        const base = LANG_PACKS[lang];
        packCache[lang] = {
            pronouns: base.pronouns,
            vocab: buildVocab(lang),
            conversation: buildConversations(lang),
            choice: buildChoice(lang, base.choice),
            phonemes: [...(base.phonemes || []), ...buildPhonemes(lang, base.phonemeRows)],
            grammar: [...(base.grammar || []), ...buildGrammar(lang, base.grammarRows)],
            fill: [...(base.fill || []), ...buildFillWrite(lang, base.fillWrite)],
            order: [...(base.order || []), ...buildOrder(lang)]
        };
    }
    return packCache[lang];
}

export function getPronouns(lang) {
    return (getPack(lang) || getPack('fr')).pronouns;
}

// Copias del contenido por defecto de un idioma, etiquetadas con `lang` y score 0
export function buildDefaultContent(lang) {
    const pack = getPack(lang);
    const result = {};
    CONTENT_CATEGORIES.forEach(cat => {
        result[cat] = pack ? pack[cat].map(item => ({ ...JSON.parse(JSON.stringify(item)), lang, score: 0 })) : [];
    });
    return result;
}

// Ids que tenían los paquetes de versiones anteriores (para no volver a añadir lo que el usuario borró)
export function getLegacyIds(lang) {
    const prefix = lang === 'fr' ? '' : `${lang}_`;
    const ids = [];
    [1, 2, 3, 4, 5].forEach(n => ids.push(`${prefix}v${n}`, `${prefix}p${n}`));
    [1, 2].forEach(n => ids.push(`${prefix}g${n}`, `${prefix}f${n}`, `${prefix}o${n}`));
    return ids;
}

// Ejemplos para los placeholders del creador, tomados del paquete del idioma de estudio
export function getExamples(lang) {
    const pack = getPack(lang) || getPack('fr');
    const vocab = pack.vocab[0] || {};
    const phoneme = pack.phonemes[0] || {};
    const grammar = pack.grammar[0] || { conjugations: {} };
    const fill = pack.fill[0] || {};
    const order = pack.order[0] || {};
    const conv = pack.conversation[0] || {};
    const choice = pack.choice[0] || { wrong: [] };
    return {
        vocabWord: vocab.fr, vocabTrans: vocab.es, vocabEmoji: vocab.img,
        phonemeSymbol: phoneme.symbol, phonemeWord: phoneme.word, phonemeTrans: phoneme.trans, phonemeEmoji: phoneme.img,
        verb: grammar.verb, tense: grammar.tense, conjugations: grammar.conjugations,
        fillTitle: fill.title, fillSentence: fill.sentence, fillAnswer: fill.answer, fillEmoji: fill.img,
        orderTitle: order.title, orderSentence: order.sentence, orderExtras: (order.extras || []).join(', '),
        convContext: conv.context, convPrompt: conv.prompt, convPromptTr: conv.promptTr,
        convAnswer: conv.answer, convWrong: conv.wrong || [], convEmoji: conv.img,
        choicePrompt: choice.prompt, choiceAnswer: choice.answer, choiceWrong: choice.wrong
    };
}

// Nombres de temas antiguos (texto libre en español) → claves de tema traducibles
export const LEGACY_TOPIC_KEYS = {
    'Comida': 'food', 'Animales': 'animals', 'Ciudad': 'city', 'Naturaleza': 'nature', 'Estudio': 'study',
    'Fonética': 'phonetics', 'Verbos': 'verbs', 'Frases': 'phrases', 'Sintaxis': 'syntax'
};

export const TOPIC_KEYS = ['General', 'grammar', 'food', 'animals', 'city', 'nature', 'study', 'travel', 'health', 'work',
    'society', 'language', 'conversation', 'phonetics', 'verbs', 'phrases', 'syntax'];
