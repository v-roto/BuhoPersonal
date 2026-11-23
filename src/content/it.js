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
          conjugations: { je: "sono andato", tu: "sei andato", il: "è andato", nous: "siamo andati", vous: "siete andati", ils: "sono andati" } },
        { id: "it_g4", verb: "Fare", tense: "Futuro semplice", topic: "verbs", level: "B1",
          conjugations: { je: "farò", tu: "farai", il: "farà", nous: "faremo", vous: "farete", ils: "faranno" } },
        { id: "it_g5", verb: "Potere", tense: "Congiuntivo presente", topic: "verbs", level: "B2",
          conjugations: { je: "possa", tu: "possa", il: "possa", nous: "possiamo", vous: "possiate", ils: "possano" } },
        { id: "it_g6", verb: "Essere", tense: "Congiuntivo imperfetto", topic: "verbs", level: "C1",
          conjugations: { je: "fossi", tu: "fossi", il: "fosse", nous: "fossimo", vous: "foste", ils: "fossero" } },
        { id: "it_g7", verb: "Venire", tense: "Passato remoto", topic: "verbs", level: "C1",
          conjugations: { je: "venni", tu: "venisti", il: "venne", nous: "venimmo", vous: "veniste", ils: "vennero" } }
    ],
    fill: [
        { id: "it_f1", title: { es: "Completa la frase", en: "Complete the sentence", fr: "Complète la phrase" }, sentence: "Io ___ una deliziosa mela rossa.", answer: "mangio", img: "🍎", topic: "phrases", level: "A1" },
        { id: "it_f2", title: { es: "Completa con el artículo", en: "Complete with the article", fr: "Complète avec l'article" }, sentence: "___ gatto dorme sulla sedia.", answer: "Il", img: "🐱", topic: "phrases", level: "A1" },
        { id: "it_f3", title: { es: "Completa con el verbo en futuro", en: "Complete with the verb in the future", fr: "Complète avec le verbe au futur" }, sentence: "Domani ___ al mercato.", answer: "andremo", img: "🛒", topic: "phrases", level: "B1" },
        { id: "it_f4", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Ieri ___ andato al cinema.", answer: "sono", img: "🎬", topic: "phrases", level: "A2" },
        { id: "it_f5", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Penso che lui ___ ragione.", answer: "abbia", img: "🤔", topic: "phrases", level: "B2" },
        { id: "it_f6", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Se ___ più tempo, viaggerei di più.", answer: "avessi", img: "✈️", topic: "phrases", level: "C1" },
        { id: "it_f7", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Dante ___ la Divina Commedia nel Trecento.", answer: "scrisse", img: "📜", topic: "phrases", level: "C1" }
    ],
    order: [
        { id: "it_o1", title: { es: "Traduce: «El gato come una manzana»", en: "Translate: \"The cat eats an apple\"", fr: "Traduis : « Le chat mange une pomme »" }, sentence: "Il gatto mangia una mela", extras: ["cane", "rossa", "nella"], topic: "syntax", level: "A1" },
        { id: "it_o2", title: { es: "Traduce: «Nosotros hablamos italiano»", en: "Translate: \"We speak Italian\"", fr: "Traduis : « Nous parlons italien »" }, sentence: "Noi parliamo italiano", extras: ["spagnolo", "siete", "la"], topic: "syntax", level: "A1" }
    ],
    // Opción múltiple de 3 respuestas (A1 = primeras 2 semanas; cada nivel repasa el anterior)
    choice: [
        ["A1", "Ciao, ___ Luca.", "mi chiamo", "ti chiami|ho"],
        ["A1", "Io ___ messicano.", "sono", "sei|ho"],
        ["A1", "Lei ___ vent'anni.", "ha", "hai|è"],
        ["A1", "È ___ libro.", "un", "una|uno"],
        ["A1", "— Come stai?", "Sto bene, grazie.", "Sto buono, grazie.|Mi chiamo Paolo."],
        ["A1", "Noi ___ studenti.", "siamo", "sono|abbiamo"],
        ["A2", "Ieri ___ una pizza.", "ho mangiato", "ho mangiare|mangio"],
        ["A2", "Domani noi ___ a visitare il museo.", "andiamo", "vanno|siamo andati"],
        ["A2", "È la ___ macchina?", "tua", "tuo|tu"],
        ["A2", "Sabato scorso loro ___ un film.", "hanno visto", "vedono|vedranno"],
        ["A2", "— Cosa hai fatto nel fine settimana?", "Ho visitato i miei amici.", "Visiterò i miei amici ieri.|Visito i miei amici domani."],
        ["A2", "Lei ___ inglese e francese.", "parla", "parli|parlo"],
        ["B1", "Da bambino ___ in campagna.", "vivevo", "vivo|vivrò"],
        ["B1", "Le ragazze sono ___ ieri sera.", "partite", "partito|partiti"],
        ["B1", "L'anno prossimo io ___ in Giappone.", "andrò", "andrei|sono andato"],
        ["B1", "Questo libro è più interessante ___ film.", "del", "che il|come il"],
        ["B1", "Mentre ___ la cena, è squillato il telefono.", "preparavo", "ho preparato|preparo"],
        ["B1", "— Verrai alla festa?", "Sì, arriverò alle otto.", "Sì, arriverei ieri alle otto.|Sì, sono arrivato domani alle otto."],
        ["B2", "Se avessi più tempo, ___ di più.", "leggerei", "leggerò|leggevo"],
        ["B2", "È la città ___ sono nato.", "dove", "che|cui"],
        ["B2", "È importante che tu ___ in orario.", "arrivi", "arriva|arriverai"],
        ["B2", "Voglio che tu ___ con me.", "venga", "vieni|verrai"],
        ["B2", "Il film ___ ho visto ieri era bellissimo.", "che", "cui|il quale che"],
        ["B2", "— Cosa faresti al posto mio?", "Al posto tuo, accetterei l'offerta.", "Al posto tuo, accetterò l'offerta.|Al posto tuo, ho accettato l'offerta."],
        ["C1", "Se mi avessi chiamato, ___ venuto.", "sarei", "sarò|avrei"],
        ["C1", "Sono contento che tu ___ venuto.", "sia", "sei|saresti"],
        ["C1", "È il libro di ___ ti ho parlato.", "cui", "che|quale"],
        ["C1", "Magari l'___ saputo prima!", "avessi", "avrei|avevo"],
        ["C1", "Quando siamo arrivati, loro erano già ___.", "partiti", "partito|partire"],
        ["C1", "Non credo che noi ___ il tempo di finirlo.", "abbiamo", "avremo|avevamo"]
    ],
    // Escribir la forma del verbo entre paréntesis (se añaden a «Completar oración»)
    fillWrite: [
        ["A1", "Io ___ (essere) studente.", "sono"],
        ["A1", "Noi ___ (avere) due gatti.", "abbiamo"],
        ["A2", "Ieri io ___ (comprare) il pane.", "ho comprato"],
        ["A2", "Stamattina noi ___ (prendere) l'autobus.", "abbiamo preso"],
        ["B1", "Da bambino ___ (abitare) a Roma.", "abitavo"],
        ["B1", "L'estate prossima noi ___ (andare) al mare.", "andremo"],
        ["B2", "Se fossi ricco, ___ (viaggiare) in tutto il mondo.", "viaggerei"],
        ["B2", "È necessario che tu ___ (partire) presto.", "parta"],
        ["C1", "Se l'avessi saputo, ___ (venire) prima.", "sarei venuto|sarei venuta"],
        ["C1", "Sono felice che tu ___ (superare) l'esame.", "abbia superato"]
    ]
};
