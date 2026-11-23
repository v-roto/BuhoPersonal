// --- Paquete de contenido: Inglés ---

export default {
    pronouns: { je: "I", tu: "You", il: "He / She / It", nous: "We", vous: "You (pl.)", ils: "They" },
    phonemes: [
        { id: "en_p1", symbol: "th", word: "think", trans: { es: "pensar", en: "think", fr: "penser" }, img: "🤔", topic: "phonetics", level: "A1" },
        { id: "en_p2", symbol: "sh", word: "ship", trans: { es: "barco", en: "ship", fr: "bateau" }, img: "🚢", topic: "phonetics", level: "A1" },
        { id: "en_p3", symbol: "ee", word: "tree", trans: { es: "árbol", en: "tree", fr: "arbre" }, img: "🌳", topic: "phonetics", level: "A1" },
        { id: "en_p4", symbol: "oo", word: "moon", trans: { es: "luna", en: "moon", fr: "lune" }, img: "🌙", topic: "phonetics", level: "A2" },
        { id: "en_p5", symbol: "w", word: "water", trans: { es: "agua", en: "water", fr: "eau" }, img: "💧", topic: "phonetics", level: "B1" }
    ],
    grammar: [
        { id: "en_g1", verb: "To speak", tense: "Present simple", topic: "verbs", level: "A1",
          conjugations: { je: "speak", tu: "speak", il: "speaks", nous: "speak", vous: "speak", ils: "speak" } },
        { id: "en_g2", verb: "To be", tense: "Present simple", topic: "verbs", level: "A1",
          conjugations: { je: "am", tu: "are", il: "is", nous: "are", vous: "are", ils: "are" } },
        { id: "en_g3", verb: "To go", tense: "Present perfect", topic: "verbs", level: "B1",
          conjugations: { je: "have gone", tu: "have gone", il: "has gone", nous: "have gone", vous: "have gone", ils: "have gone" } },
        { id: "en_g4", verb: "To be", tense: "Past simple", topic: "verbs", level: "A2",
          conjugations: { je: "was", tu: "were", il: "was", nous: "were", vous: "were", ils: "were" } },
        { id: "en_g5", verb: "To work", tense: "Present perfect continuous", topic: "verbs", level: "B2",
          conjugations: { je: "have been working", tu: "have been working", il: "has been working", nous: "have been working", vous: "have been working", ils: "have been working" } },
        { id: "en_g6", verb: "To finish", tense: "Future perfect", topic: "verbs", level: "C1",
          conjugations: { je: "will have finished", tu: "will have finished", il: "will have finished", nous: "will have finished", vous: "will have finished", ils: "will have finished" } },
        { id: "en_g7", verb: "To leave", tense: "Third conditional (would have)", topic: "verbs", level: "C2",
          conjugations: { je: "would have left", tu: "would have left", il: "would have left", nous: "would have left", vous: "would have left", ils: "would have left" } }
    ],
    fill: [
        { id: "en_f1", title: { es: "Completa la frase", en: "Complete the sentence", fr: "Complète la phrase" }, sentence: "I ___ a delicious red apple.", answer: "eat", img: "🍎", topic: "phrases", level: "A1" },
        { id: "en_f2", title: { es: "Completa con el artículo", en: "Complete with the article", fr: "Complète avec l'article" }, sentence: "___ cat sleeps on the chair.", answer: "The", img: "🐱", topic: "phrases", level: "A1" },
        { id: "en_f3", title: { es: "Completa con el verbo en pasado", en: "Complete with the verb in the past", fr: "Complète avec le verbe au passé" }, sentence: "Yesterday we ___ to the market.", answer: "went", img: "🛒", topic: "phrases", level: "A2" },
        { id: "en_f4", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "I ___ never been to Japan.", answer: "have", img: "🗾", topic: "phrases", level: "B1" },
        { id: "en_f5", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "If I ___ more time, I would travel more.", answer: "had", img: "✈️", topic: "phrases", level: "B2" },
        { id: "en_f6", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Had I known, I ___ have come earlier.", answer: "would", img: "⏱️", topic: "phrases", level: "C1" },
        { id: "en_f7", title: { es: "Completa con la palabra correcta", en: "Complete with the correct word", fr: "Complète avec le bon mot" }, sentence: "Seldom ___ we seen such a remarkable performance.", answer: "have", img: "🎭", topic: "phrases", level: "C2" }
    ],
    order: [
        { id: "en_o1", title: { es: "Traduce: «El gato come una manzana»", en: "Translate: \"The cat eats an apple\"", fr: "Traduis : « Le chat mange une pomme »" }, sentence: "The cat eats an apple", extras: ["dog", "red", "in"], topic: "syntax", level: "A1" },
        { id: "en_o2", title: { es: "Traduce: «Nosotros hablamos inglés»", en: "Translate: \"We speak English\"", fr: "Traduis : « Nous parlons anglais »" }, sentence: "We speak English", extras: ["Spanish", "are", "the"], topic: "syntax", level: "A1" }
    ]
};
