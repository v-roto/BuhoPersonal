// --- Paquete de contenido: Francés ---
// Los textos con forma { es, en, fr } se muestran según el idioma de la interfaz.
// El vocabulario y las conversaciones por nivel vienen de vocabulary.js y conversations.js.

export default {
    pronouns: { je: "Je / J'", tu: "Tu", il: "Il / Elle / On", nous: "Nous", vous: "Vous", ils: "Ils / Elles" },
    phonemes: [
        { id: "p1", symbol: "ou", word: "chou", trans: { es: "col / repollo", en: "cabbage", fr: "chou" }, img: "🥬", topic: "phonetics", level: "A1" },
        { id: "p2", symbol: "u", word: "lune", trans: { es: "luna", en: "moon", fr: "lune" }, img: "🌙", topic: "phonetics", level: "A1" },
        { id: "p3", symbol: "eu", word: "fleur", trans: { es: "flor", en: "flower", fr: "fleur" }, img: "🌸", topic: "phonetics", level: "A2" },
        { id: "p4", symbol: "an / en", word: "vent", trans: { es: "viento", en: "wind", fr: "vent" }, img: "💨", topic: "phonetics", level: "B1" },
        { id: "p5", symbol: "é", word: "café", trans: { es: "café", en: "coffee", fr: "café" }, img: "☕", topic: "phonetics", level: "A1" }
    ],
    grammar: [
        { id: "g1", verb: "Parler", tense: "Présent de l'indicatif", topic: "verbs", level: "A1",
          conjugations: { je: "parle", tu: "parles", il: "parle", nous: "parlons", vous: "parlez", ils: "parlent" } },
        { id: "g2", verb: "Être", tense: "Présent de l'indicatif", topic: "verbs", level: "A1",
          conjugations: { je: "suis", tu: "es", il: "est", nous: "sommes", vous: "êtes", ils: "sont" } },
        { id: "fr_g3", verb: "Aller", tense: "Passé composé", topic: "verbs", level: "A2",
          conjugations: { je: "suis allé", tu: "es allé", il: "est allé", nous: "sommes allés", vous: "êtes allés", ils: "sont allés" } },
        { id: "fr_g4", verb: "Faire", tense: "Futur simple", topic: "verbs", level: "B1",
          conjugations: { je: "ferai", tu: "feras", il: "fera", nous: "ferons", vous: "ferez", ils: "feront" } },
        { id: "fr_g5", verb: "Pouvoir", tense: "Subjonctif présent", topic: "verbs", level: "B2",
          conjugations: { je: "puisse", tu: "puisses", il: "puisse", nous: "puissions", vous: "puissiez", ils: "puissent" } },
        { id: "fr_g6", verb: "Devoir", tense: "Conditionnel passé", topic: "verbs", level: "C1",
          conjugations: { je: "aurais dû", tu: "aurais dû", il: "aurait dû", nous: "aurions dû", vous: "auriez dû", ils: "auraient dû" } },
        { id: "fr_g7", verb: "Venir", tense: "Passé simple", topic: "verbs", level: "C2",
          conjugations: { je: "vins", tu: "vins", il: "vint", nous: "vînmes", vous: "vîntes", ils: "vinrent" } }
    ],
    fill: [
        { id: "f1", title: { es: "Completa la frase", en: "Complete the sentence", fr: "Complète la phrase" }, sentence: "Je ___ une délicieuse pomme rouge.", answer: "mange", img: "🍎", topic: "phrases", level: "A1" },
        { id: "f2", title: { es: "Completa con el artículo", en: "Complete with the article", fr: "Complète avec l'article" }, sentence: "___ chat dort sur la chaise.", answer: "Le", img: "🐱", topic: "phrases", level: "A1" },
        { id: "fr_f3", title: { es: "Completa con el verbo en futuro", en: "Complete with the verb in the future", fr: "Complète avec le verbe au futur" }, sentence: "Demain, nous ___ au marché.", answer: "irons", img: "🛒", topic: "phrases", level: "B1" },
        { id: "fr_f4", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Hier, nous ___ au cinéma.", answer: "sommes allés", img: "🎬", topic: "phrases", level: "A2" },
        { id: "fr_f5", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Il faut que tu ___ tes devoirs.", answer: "fasses", img: "📚", topic: "phrases", level: "B2" },
        { id: "fr_f6", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Si j'avais su, je ___ venu plus tôt.", answer: "serais", img: "⏱️", topic: "phrases", level: "C1" },
        { id: "fr_f7", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Quoiqu'il ___ tort, il ne l'admit jamais.", answer: "eût", img: "🧐", topic: "phrases", level: "C2" }
    ],
    order: [
        { id: "o1", title: { es: "Traduce: «El gato come una manzana»", en: "Translate: \"The cat eats an apple\"", fr: "Traduis : « Le chat mange une pomme »" }, sentence: "Le chat mange une pomme", extras: ["chien", "rouge", "dans"], topic: "syntax", level: "A1" },
        { id: "o2", title: { es: "Traduce: «Nosotros hablamos francés»", en: "Translate: \"We speak French\"", fr: "Traduis : « Nous parlons français »" }, sentence: "Nous parlons français", extras: ["espagnol", "êtes", "la"], topic: "syntax", level: "A1" }
    ]
};
