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
          conjugations: { je: "fui", tu: "fuiste", il: "fue", nous: "fuimos", vous: "fuisteis", ils: "fueron" } }
    ],
    fill: [
        { id: "es_f1", title: { es: "Completa la frase", en: "Complete the sentence", fr: "Complète la phrase" }, sentence: "Yo ___ una deliciosa manzana roja.", answer: "como", img: "🍎", topic: "phrases", level: "A1" },
        { id: "es_f2", title: { es: "Completa con el artículo", en: "Complete with the article", fr: "Complète avec l'article" }, sentence: "___ gato duerme en la silla.", answer: "El", img: "🐱", topic: "phrases", level: "A1" },
        { id: "es_f3", title: { es: "Completa con el subjuntivo", en: "Complete with the subjunctive", fr: "Complète avec le subjonctif" }, sentence: "Espero que ___ buen tiempo mañana.", answer: "haga", img: "🌤️", topic: "phrases", level: "B1" }
    ],
    order: [
        { id: "es_o1", title: { es: "Traduce: «El gato come una manzana»", en: "Translate: \"The cat eats an apple\"", fr: "Traduis : « Le chat mange une pomme »" }, sentence: "El gato come una manzana", extras: ["perro", "rojo", "en"], topic: "syntax", level: "A1" },
        { id: "es_o2", title: { es: "Traduce: «Nosotros hablamos español»", en: "Translate: \"We speak Spanish\"", fr: "Traduis : « Nous parlons espagnol »" }, sentence: "Nosotros hablamos español", extras: ["inglés", "son", "la"], topic: "syntax", level: "A1" }
    ]
};
