// --- Paquete de contenido: Español ---

export default {
    pronouns: { je: "Yo", tu: "Tú", il: "Él / Ella / Usted", nous: "Nosotros", vous: "Vosotros", ils: "Ellos / Ustedes" },
    phonemes: [
        { id: "es_p1", symbol: "rr", word: "perro", trans: { es: "perro", en: "dog", fr: "chien" }, img: "🐶", topic: "phonetics", level: "A1" },
        { id: "es_p2", symbol: "ñ", word: "niño", trans: { es: "niño", en: "child", fr: "enfant" }, img: "🧒", topic: "phonetics", level: "A1" },
        { id: "es_p3", symbol: "j", word: "jamón", trans: { es: "jamón", en: "ham", fr: "jambon" }, img: "🍖", topic: "phonetics", level: "A1" },
        { id: "es_p4", symbol: "ll", word: "llave", trans: { es: "llave", en: "key", fr: "clé" }, img: "🔑", topic: "phonetics", level: "A2" },
        { id: "es_p5", symbol: "z", word: "zapato", trans: { es: "zapato", en: "shoe", fr: "chaussure" }, img: "👞", topic: "phonetics", level: "A2" }
    ],
    grammar: [
        { id: "es_g1", verb: "Hablar", tense: "Presente de indicativo", topic: "verbs", level: "A1",
          conjugations: { je: "hablo", tu: "hablas", il: "habla", nous: "hablamos", vous: "habláis", ils: "hablan" } },
        { id: "es_g2", verb: "Ser", tense: "Presente de indicativo", topic: "verbs", level: "A1",
          conjugations: { je: "soy", tu: "eres", il: "es", nous: "somos", vous: "sois", ils: "son" } },
        { id: "es_g3", verb: "Ir", tense: "Pretérito indefinido", topic: "verbs", level: "A2",
          conjugations: { je: "fui", tu: "fuiste", il: "fue", nous: "fuimos", vous: "fuisteis", ils: "fueron" } },
        { id: "es_g4", verb: "Tener", tense: "Futuro simple", topic: "verbs", level: "B1",
          conjugations: { je: "tendré", tu: "tendrás", il: "tendrá", nous: "tendremos", vous: "tendréis", ils: "tendrán" } },
        { id: "es_g5", verb: "Hacer", tense: "Presente de subjuntivo", topic: "verbs", level: "B2",
          conjugations: { je: "haga", tu: "hagas", il: "haga", nous: "hagamos", vous: "hagáis", ils: "hagan" } },
        { id: "es_g6", verb: "Decir", tense: "Pretérito imperfecto de subjuntivo", topic: "verbs", level: "C1",
          conjugations: { je: "dijera", tu: "dijeras", il: "dijera", nous: "dijéramos", vous: "dijerais", ils: "dijeran" } },
        { id: "es_g7", verb: "Poner", tense: "Condicional compuesto", topic: "verbs", level: "C2",
          conjugations: { je: "habría puesto", tu: "habrías puesto", il: "habría puesto", nous: "habríamos puesto", vous: "habríais puesto", ils: "habrían puesto" } }
    ],
    fill: [
        { id: "es_f1", title: { es: "Completa la frase", en: "Complete the sentence", fr: "Complète la phrase" }, sentence: "Yo ___ una deliciosa manzana roja.", answer: "como", img: "🍎", topic: "phrases", level: "A1" },
        { id: "es_f2", title: { es: "Completa con el artículo", en: "Complete with the article", fr: "Complète avec l'article" }, sentence: "___ gato duerme en la silla.", answer: "El", img: "🐱", topic: "phrases", level: "A1" },
        { id: "es_f3", title: { es: "Completa con el subjuntivo", en: "Complete with the subjunctive", fr: "Complète avec le subjonctif" }, sentence: "Espero que ___ buen tiempo mañana.", answer: "haga", img: "🌤️", topic: "phrases", level: "B1" },
        { id: "es_f4", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Ayer ___ al cine con mis amigos.", answer: "fui", img: "🎬", topic: "phrases", level: "A2" },
        { id: "es_f5", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Si tuviera dinero, ___ un coche nuevo.", answer: "compraría", img: "🚗", topic: "phrases", level: "B2" },
        { id: "es_f6", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Me sorprendió que no ___ nada.", answer: "dijera", img: "😮", topic: "phrases", level: "C1" },
        { id: "es_f7", title: { es: "Completa con la palabra correcta", en: "Complete with the correct word", fr: "Complète avec le bon mot" }, sentence: "De ___ sabido, no habría venido.", answer: "haberlo", img: "🧐", topic: "phrases", level: "C2" }
    ],
    order: [
        { id: "es_o1", title: { es: "Traduce: «El gato come una manzana»", en: "Translate: \"The cat eats an apple\"", fr: "Traduis : « Le chat mange une pomme »" }, sentence: "El gato come una manzana", extras: ["perro", "rojo", "en"], topic: "syntax", level: "A1" },
        { id: "es_o2", title: { es: "Traduce: «Nosotros hablamos español»", en: "Translate: \"We speak Spanish\"", fr: "Traduis : « Nous parlons espagnol »" }, sentence: "Nosotros hablamos español", extras: ["inglés", "son", "la"], topic: "syntax", level: "A1" }
    ]
};
