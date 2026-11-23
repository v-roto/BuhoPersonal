// --- Paquete de contenido: Alemán ---

export default {
    pronouns: { je: "Ich", tu: "Du", il: "Er / Sie / Es", nous: "Wir", vous: "Ihr", ils: "Sie" },
    phonemes: [
        { id: "de_p1", symbol: "ü", word: "grün", trans: { es: "verde", en: "green", fr: "vert" }, img: "🟢", topic: "phonetics", level: "A1" },
        { id: "de_p2", symbol: "ö", word: "schön", trans: { es: "bonito", en: "beautiful", fr: "beau" }, img: "🌺", topic: "phonetics", level: "A1" },
        { id: "de_p3", symbol: "ch", word: "ich", trans: { es: "yo", en: "I", fr: "je" }, img: "🙋", topic: "phonetics", level: "A1" },
        { id: "de_p4", symbol: "sch", word: "Schule", trans: { es: "escuela", en: "school", fr: "école" }, img: "🏫", topic: "phonetics", level: "A1" },
        { id: "de_p5", symbol: "ei", word: "Eis", trans: { es: "helado / hielo", en: "ice cream / ice", fr: "glace" }, img: "🍦", topic: "phonetics", level: "A2" }
    ],
    grammar: [
        { id: "de_g1", verb: "Sprechen", tense: "Präsens", topic: "verbs", level: "A1",
          conjugations: { je: "spreche", tu: "sprichst", il: "spricht", nous: "sprechen", vous: "sprecht", ils: "sprechen" } },
        { id: "de_g2", verb: "Sein", tense: "Präsens", topic: "verbs", level: "A1",
          conjugations: { je: "bin", tu: "bist", il: "ist", nous: "sind", vous: "seid", ils: "sind" } },
        { id: "de_g3", verb: "Haben", tense: "Präteritum", topic: "verbs", level: "A2",
          conjugations: { je: "hatte", tu: "hattest", il: "hatte", nous: "hatten", vous: "hattet", ils: "hatten" } },
        { id: "de_g4", verb: "Können", tense: "Präteritum", topic: "verbs", level: "B1",
          conjugations: { je: "konnte", tu: "konntest", il: "konnte", nous: "konnten", vous: "konntet", ils: "konnten" } },
        { id: "de_g5", verb: "Sein", tense: "Konjunktiv II", topic: "verbs", level: "B2",
          conjugations: { je: "wäre", tu: "wärst", il: "wäre", nous: "wären", vous: "wärt", ils: "wären" } },
        { id: "de_g6", verb: "Gehen", tense: "Plusquamperfekt", topic: "verbs", level: "C1",
          conjugations: { je: "war gegangen", tu: "warst gegangen", il: "war gegangen", nous: "waren gegangen", vous: "wart gegangen", ils: "waren gegangen" } },
        { id: "de_g7", verb: "Sein", tense: "Konjunktiv I", topic: "verbs", level: "C2",
          conjugations: { je: "sei", tu: "seist", il: "sei", nous: "seien", vous: "seiet", ils: "seien" } }
    ],
    fill: [
        { id: "de_f1", title: { es: "Completa la frase", en: "Complete the sentence", fr: "Complète la phrase" }, sentence: "Ich ___ einen leckeren roten Apfel.", answer: "esse", img: "🍎", topic: "phrases", level: "A1" },
        { id: "de_f2", title: { es: "Completa con el artículo", en: "Complete with the article", fr: "Complète avec l'article" }, sentence: "___ Katze schläft auf dem Stuhl.", answer: "Die", img: "🐱", topic: "phrases", level: "A1" },
        { id: "de_f3", title: { es: "Completa con el verbo modal", en: "Complete with the modal verb", fr: "Complète avec le verbe modal" }, sentence: "Morgen ___ ich früh aufstehen.", answer: "muss", img: "⏰", topic: "phrases", level: "A2" },
        { id: "de_f4", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Gestern ___ ich ins Kino gegangen.", answer: "bin", img: "🎬", topic: "phrases", level: "B1" },
        { id: "de_f5", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Wenn ich Zeit hätte, ___ ich mehr reisen.", answer: "würde", img: "✈️", topic: "phrases", level: "B2" },
        { id: "de_f6", title: { es: "Completa con la palabra correcta", en: "Complete with the correct word", fr: "Complète avec le bon mot" }, sentence: "Das Buch, ___ ich gestern gekauft habe, ist spannend.", answer: "das", img: "📖", topic: "phrases", level: "C1" },
        { id: "de_f7", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Er sagte, er ___ krank.", answer: "sei", img: "🤒", topic: "phrases", level: "C2" }
    ],
    order: [
        { id: "de_o1", title: { es: "Traduce: «El gato come una manzana»", en: "Translate: \"The cat eats an apple\"", fr: "Traduis : « Le chat mange une pomme »" }, sentence: "Die Katze frisst einen Apfel", extras: ["Hund", "rot", "in"], topic: "syntax", level: "A1" },
        { id: "de_o2", title: { es: "Traduce: «Nosotros hablamos alemán»", en: "Translate: \"We speak German\"", fr: "Traduis : « Nous parlons allemand »" }, sentence: "Wir sprechen Deutsch", extras: ["Spanisch", "seid", "die"], topic: "syntax", level: "A1" }
    ]
};
