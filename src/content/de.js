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
        { id: "de_g7", verb: "Sein", tense: "Konjunktiv I", topic: "verbs", level: "C1",
          conjugations: { je: "sei", tu: "seist", il: "sei", nous: "seien", vous: "seiet", ils: "seien" } }
    ],
    fill: [
        { id: "de_f1", title: { es: "Completa la frase", en: "Complete the sentence", fr: "Complète la phrase" }, sentence: "Ich ___ einen leckeren roten Apfel.", answer: "esse", img: "🍎", topic: "phrases", level: "A1" },
        { id: "de_f2", title: { es: "Completa con el artículo", en: "Complete with the article", fr: "Complète avec l'article" }, sentence: "___ Katze schläft auf dem Stuhl.", answer: "Die", img: "🐱", topic: "phrases", level: "A1" },
        { id: "de_f3", title: { es: "Completa con el verbo modal", en: "Complete with the modal verb", fr: "Complète avec le verbe modal" }, sentence: "Morgen ___ ich früh aufstehen.", answer: "muss", img: "⏰", topic: "phrases", level: "A2" },
        { id: "de_f4", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Gestern ___ ich ins Kino gegangen.", answer: "bin", img: "🎬", topic: "phrases", level: "B1" },
        { id: "de_f5", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Wenn ich Zeit hätte, ___ ich mehr reisen.", answer: "würde", img: "✈️", topic: "phrases", level: "B2" },
        { id: "de_f6", title: { es: "Completa con la palabra correcta", en: "Complete with the correct word", fr: "Complète avec le bon mot" }, sentence: "Das Buch, ___ ich gestern gekauft habe, ist spannend.", answer: "das", img: "📖", topic: "phrases", level: "C1" },
        { id: "de_f7", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Er sagte, er ___ krank.", answer: "sei", img: "🤒", topic: "phrases", level: "C1" }
    ],
    order: [
        { id: "de_o1", title: { es: "Traduce: «El gato come una manzana»", en: "Translate: \"The cat eats an apple\"", fr: "Traduis : « Le chat mange une pomme »" }, sentence: "Die Katze frisst einen Apfel", extras: ["Hund", "rot", "in"], topic: "syntax", level: "A1" },
        { id: "de_o2", title: { es: "Traduce: «Nosotros hablamos alemán»", en: "Translate: \"We speak German\"", fr: "Traduis : « Nous parlons allemand »" }, sentence: "Wir sprechen Deutsch", extras: ["Spanisch", "seid", "die"], topic: "syntax", level: "A1" }
    ],
    // Opción múltiple de 3 respuestas (A1 = primeras 2 semanas; cada nivel repasa el anterior)
    choice: [
        ["A1", "Hallo, ich ___ Lukas.", "heiße", "heißt|habe"],
        ["A1", "Ich ___ aus Mexiko.", "komme", "kommst|habe"],
        ["A1", "Anna ___ zwanzig Jahre alt.", "ist", "bist|hat"],
        ["A1", "Das ist ___ Buch.", "ein", "eine|einen"],
        ["A1", "— Wie geht's?", "Gut, danke.", "Gute, danke.|Ich heiße Paul."],
        ["A1", "Wir ___ Studenten.", "sind", "seid|haben"],
        ["A2", "Gestern ___ ich eine Pizza gegessen.", "habe", "bin|werde"],
        ["A2", "Morgen ___ wir das Museum.", "besuchen", "besucht|besuchten"],
        ["A2", "Ist das ___ Auto?", "dein", "deine|du"],
        ["A2", "Letzten Samstag ___ meine Freunde einen Film gesehen.", "haben", "hat|sind"],
        ["A2", "— Was hast du am Wochenende gemacht?", "Ich habe meine Freunde besucht.", "Ich habe meine Freunde besuchen.|Ich besuche morgen meine Freunde gestern."],
        ["A2", "Er ___ Englisch und Französisch.", "spricht", "sprichst|sprecht"],
        ["B1", "Als Kind ___ ich auf dem Land.", "wohnte", "wohne|werde wohnen"],
        ["B1", "Ich ___ noch nie in Italien gewesen.", "bin", "habe|war"],
        ["B1", "Nächstes Jahr ___ ich nach Japan reisen.", "werde", "würde|wurde"],
        ["B1", "Dieses Buch ist interessanter ___ der Film.", "als", "wie|dann"],
        ["B1", "Ich weiß nicht, ___ er heute kommt.", "ob", "wenn|dass ob"],
        ["B1", "— Kommst du zur Party?", "Ja, ich komme um acht.", "Ja, ich kam morgen um acht.|Ja, ich komme gestern um acht."],
        ["B2", "Wenn ich mehr Zeit hätte, ___ ich mehr lesen.", "würde", "werde|wurde"],
        ["B2", "Das ist die Stadt, in ___ ich geboren bin.", "der", "die|dem"],
        ["B2", "Der Brief ___ gestern geschickt.", "wurde", "wird|hat"],
        ["B2", "Ich warte schon ___ zwei Stunden.", "seit", "vor|für"],
        ["B2", "Er fragte mich, ___ ich ihm helfen könnte.", "ob", "wenn|dass"],
        ["B2", "— Was würdest du an meiner Stelle tun?", "Ich würde das Angebot annehmen.", "Ich werde das Angebot gestern annehmen.|Ich würde das Angebot angenommen."],
        ["C1", "Wenn du mich angerufen hättest, ___ ich gekommen.", "wäre", "hätte|würde"],
        ["C1", "Obwohl es spät ___, arbeiteten wir weiter.", "war", "ist|wäre"],
        ["C1", "Das ist das Buch, von ___ ich dir erzählt habe.", "dem", "das|den"],
        ["C1", "Hätte ich das nur früher ___!", "gewusst", "wissen|gewusst hätte"],
        ["C1", "Als wir ankamen, ___ sie schon gegangen.", "waren", "hatten|sind"],
        ["C1", "Er sagt, er ___ keine Zeit.", "habe", "hätte gehabt|haben"]
    ],
    // Escribir la forma del verbo entre paréntesis (se añaden a «Completar oración»)
    fillWrite: [
        ["A1", "Ich ___ (sein) Student.", "bin"],
        ["A1", "Wir ___ (haben) zwei Katzen.", "haben"],
        ["A2", "Gestern habe ich Brot ___ (kaufen).", "gekauft"],
        ["A2", "Heute Morgen sind wir mit dem Bus ___ (fahren).", "gefahren"],
        ["B1", "Als Kind ___ (wohnen) ich in Berlin.", "wohnte"],
        ["B1", "Nächsten Sommer ___ (werden) wir ans Meer fahren.", "werden"],
        ["B2", "Wenn ich reich ___ (sein), würde ich um die Welt reisen.", "wäre"],
        ["B2", "Das Haus wurde 1990 ___ (bauen).", "gebaut"],
        ["C1", "Hätte ich das gewusst, ___ (sein) ich früher gekommen.", "wäre"],
        ["C1", "Er behauptet, er ___ (haben) keine Zeit.", "habe|hätte"]
    ]
};
