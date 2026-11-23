// --- Paquete de contenido: Italiano ---

export default {
    pronouns: { je: "Io", tu: "Tu", il: "Lui / Lei", nous: "Noi", vous: "Voi", ils: "Loro" },
    phonemes: [
        { id: "it_p1", symbol: "gli", word: "famiglia", trans: { es: "familia", en: "family", fr: "famille" }, img: "👨‍👩‍👧", topic: "phonetics", level: "A1" },
        { id: "it_p2", symbol: "gn", word: "gnocchi", trans: { es: "ñoquis", en: "gnocchi", fr: "gnocchis" }, img: "🍝", topic: "phonetics", level: "A1" },
        { id: "it_p3", symbol: "ci", word: "ciao", trans: { es: "hola / adiós", en: "hi / bye", fr: "salut" }, img: "👋", topic: "phonetics", level: "A1" },
        { id: "it_p4", symbol: "chi", word: "chiave", trans: { es: "llave", en: "key", fr: "clé" }, img: "🔑", topic: "phonetics", level: "A2" },
        { id: "it_p5", symbol: "zz", word: "pizza", trans: { es: "pizza", en: "pizza", fr: "pizza" }, img: "🍕", topic: "phonetics", level: "A1" }
    ],
    grammar: [
        { id: "it_g1", verb: "Parlare", tense: "Presente indicativo", topic: "verbs", level: "A1",
          conjugations: { je: "parlo", tu: "parli", il: "parla", nous: "parliamo", vous: "parlate", ils: "parlano" } },
        { id: "it_g2", verb: "Essere", tense: "Presente indicativo", topic: "verbs", level: "A1",
          conjugations: { je: "sono", tu: "sei", il: "è", nous: "siamo", vous: "siete", ils: "sono" } },
        { id: "it_g3", verb: "Andare", tense: "Passato prossimo", topic: "verbs", level: "A2",
          conjugations: { je: "sono andato", tu: "sei andato", il: "è andato", nous: "siamo andati", vous: "siete andati", ils: "sono andati" } }
    ],
    fill: [
        { id: "it_f1", title: { es: "Completa la frase", en: "Complete the sentence", fr: "Complète la phrase" }, sentence: "Io ___ una deliziosa mela rossa.", answer: "mangio", img: "🍎", topic: "phrases", level: "A1" },
        { id: "it_f2", title: { es: "Completa con el artículo", en: "Complete with the article", fr: "Complète avec l'article" }, sentence: "___ gatto dorme sulla sedia.", answer: "Il", img: "🐱", topic: "phrases", level: "A1" },
        { id: "it_f3", title: { es: "Completa con el verbo en futuro", en: "Complete with the verb in the future", fr: "Complète avec le verbe au futur" }, sentence: "Domani ___ al mercato.", answer: "andremo", img: "🛒", topic: "phrases", level: "B1" }
    ],
    order: [
        { id: "it_o1", title: { es: "Traduce: «El gato come una manzana»", en: "Translate: \"The cat eats an apple\"", fr: "Traduis : « Le chat mange une pomme »" }, sentence: "Il gatto mangia una mela", extras: ["cane", "rossa", "nella"], topic: "syntax", level: "A1" },
        { id: "it_o2", title: { es: "Traduce: «Nosotros hablamos italiano»", en: "Translate: \"We speak Italian\"", fr: "Traduis : « Nous parlons italien »" }, sentence: "Noi parliamo italiano", extras: ["spagnolo", "siete", "la"], topic: "syntax", level: "A1" }
    ]
};
