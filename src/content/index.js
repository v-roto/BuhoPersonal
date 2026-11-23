// --- Registro de paquetes de contenido por idioma de estudio ---
// Para añadir un idioma:
//   1. crea `src/content/<código>.js` con la misma forma que fr.js,
//   2. añade la columna del idioma en vocabulary.js y conversations.js,
//   3. regístralo en LANG_PACKS.

import fr from './fr.js';
import en from './en.js';
import es from './es.js';
import it from './it.js';
import de from './de.js';
import { VOCAB_CONCEPTS } from './vocabulary.js';
import { CONVERSATION_SCENES } from './conversations.js';

const LANG_PACKS = { fr, en, es, it, de };

export const STUDY_LANGS = Object.keys(LANG_PACKS);

export const CONTENT_CATEGORIES = ['vocab', 'conversation', 'phonemes', 'grammar', 'fill', 'order'];

// Claves internas de conjugación (se mantienen por compatibilidad con datos guardados)
export const CONJUGATION_KEYS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

// Idiomas en los que existen traducciones de la interfaz
const UI_LANGS = ['es', 'en', 'fr'];

function pickUiLangs(source, field) {
    const out = {};
    UI_LANGS.forEach(l => { if (source[l]) out[l] = field ? source[l][field] : source[l]; });
    return out;
}

function vocabId(concept, lang) {
    if (concept.legacy) return lang === 'fr' ? `v${concept.legacy}` : `${lang}_v${concept.legacy}`;
    return `${lang}_v_${concept.key}`;
}

function buildVocab(lang) {
    return VOCAB_CONCEPTS.filter(c => c.words[lang]).map(c => ({
        id: vocabId(c, lang),
        fr: c.words[lang],                 // palabra en el idioma de estudio (nombre histórico del campo)
        es: pickUiLangs(c.words),          // traducciones por idioma de interfaz
        img: c.img, topic: c.topic, level: c.level
    }));
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
            phonemes: base.phonemes || [],
            grammar: base.grammar || [],
            fill: base.fill || [],
            order: base.order || []
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
    return {
        vocabWord: vocab.fr, vocabTrans: vocab.es, vocabEmoji: vocab.img,
        phonemeSymbol: phoneme.symbol, phonemeWord: phoneme.word, phonemeTrans: phoneme.trans, phonemeEmoji: phoneme.img,
        verb: grammar.verb, tense: grammar.tense, conjugations: grammar.conjugations,
        fillTitle: fill.title, fillSentence: fill.sentence, fillAnswer: fill.answer, fillEmoji: fill.img,
        orderTitle: order.title, orderSentence: order.sentence, orderExtras: (order.extras || []).join(', '),
        convContext: conv.context, convPrompt: conv.prompt, convPromptTr: conv.promptTr,
        convAnswer: conv.answer, convWrong: conv.wrong || [], convEmoji: conv.img
    };
}

// Nombres de temas antiguos (texto libre en español) → claves de tema traducibles
export const LEGACY_TOPIC_KEYS = {
    'Comida': 'food', 'Animales': 'animals', 'Ciudad': 'city', 'Naturaleza': 'nature', 'Estudio': 'study',
    'Fonética': 'phonetics', 'Verbos': 'verbs', 'Frases': 'phrases', 'Sintaxis': 'syntax'
};

export const TOPIC_KEYS = ['General', 'food', 'animals', 'city', 'nature', 'study', 'travel', 'health', 'work',
    'society', 'language', 'conversation', 'phonetics', 'verbs', 'phrases', 'syntax'];
