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
        { id: "fr_g7", verb: "Venir", tense: "Passé simple", topic: "verbs", level: "C1",
          conjugations: { je: "vins", tu: "vins", il: "vint", nous: "vînmes", vous: "vîntes", ils: "vinrent" } }
    ],
    fill: [
        { id: "f1", title: { es: "Completa la frase", en: "Complete the sentence", fr: "Complète la phrase" }, sentence: "Je ___ une délicieuse pomme rouge.", answer: "mange", img: "🍎", topic: "phrases", level: "A1" },
        { id: "f2", title: { es: "Completa con el artículo", en: "Complete with the article", fr: "Complète avec l'article" }, sentence: "___ chat dort sur la chaise.", answer: "Le", img: "🐱", topic: "phrases", level: "A1" },
        { id: "fr_f3", title: { es: "Completa con el verbo en futuro", en: "Complete with the verb in the future", fr: "Complète avec le verbe au futur" }, sentence: "Demain, nous ___ au marché.", answer: "irons", img: "🛒", topic: "phrases", level: "B1" },
        { id: "fr_f4", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Hier, nous ___ au cinéma.", answer: "sommes allés", img: "🎬", topic: "phrases", level: "A2" },
        { id: "fr_f5", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Il faut que tu ___ tes devoirs.", answer: "fasses", img: "📚", topic: "phrases", level: "B2" },
        { id: "fr_f6", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Si j'avais su, je ___ venu plus tôt.", answer: "serais", img: "⏱️", topic: "phrases", level: "C1" },
        { id: "fr_f7", title: { es: "Completa con la forma verbal correcta", en: "Complete with the correct verb form", fr: "Complète avec la bonne forme verbale" }, sentence: "Quoiqu'il ___ tort, il ne l'admit jamais.", answer: "eût", img: "🧐", topic: "phrases", level: "C1" }
    ],
    order: [
        { id: "o1", title: { es: "Traduce: «El gato come una manzana»", en: "Translate: \"The cat eats an apple\"", fr: "Traduis : « Le chat mange une pomme »" }, sentence: "Le chat mange une pomme", extras: ["chien", "rouge", "dans"], topic: "syntax", level: "A1" },
        { id: "o2", title: { es: "Traduce: «Nosotros hablamos francés»", en: "Translate: \"We speak French\"", fr: "Traduis : « Nous parlons français »" }, sentence: "Nous parlons français", extras: ["espagnol", "êtes", "la"], topic: "syntax", level: "A1" }
    ],
    // Opción múltiple de 3 respuestas (A1 = primeras 2 semanas; cada nivel repasa el anterior)
    choice: [
        ["A1", "Bonjour, je ___ Lucas.", "m'appelle", "t'appelles|ai"],
        ["A1", "Je ___ mexicain.", "suis", "es|ai"],
        ["A1", "Tu ___ vingt ans ?", "as", "a|suis"],
        ["A1", "C'est ___ livre.", "un", "une|des"],
        ["A1", "— Comment ça va ?", "Ça va bien, merci.", "Ça va bon, merci.|Je m'appelle Paul."],
        ["A1", "Elle ___ française.", "est", "es|a"],
        ["A2", "Hier, j'___ une pizza.", "ai mangé", "ai manger|mange"],
        ["A2", "Demain, nous ___ visiter le musée.", "allons", "allez|avons"],
        ["A2", "C'est ___ voiture.", "ma", "mon|mes"],
        ["A2", "Samedi dernier, ils ___ un film.", "ont regardé", "ont regarder|regardent"],
        ["A2", "— Qu'est-ce que tu as fait ce week-end ?", "J'ai vu mes amis.", "J'ai voir mes amis.|Je vois mes amis demain."],
        ["A2", "Nous ___ français et anglais.", "parlons", "parlez|parle"],
        ["B1", "Quand j'étais petit, je ___ à la campagne.", "vivais", "vis|ai vécu"],
        ["B1", "Elles sont ___ hier soir.", "parties", "parti|partis"],
        ["B1", "L'année prochaine, je ___ en Italie.", "voyagerai", "voyagerais|ai voyagé"],
        ["B1", "Ce livre est ___ intéressant que le film.", "plus", "plus de|meilleur"],
        ["B1", "Ce matin, je me suis ___ à sept heures.", "réveillé", "réveiller|réveillais"],
        ["B1", "— Tu viendras à la fête ?", "Oui, je viendrai avec plaisir.", "Oui, je viendrais hier avec plaisir.|Oui, je suis venu demain."],
        ["B2", "Si j'avais le temps, je ___ plus souvent.", "lirais", "lirai|lisais"],
        ["B2", "C'est la ville ___ je suis né.", "où", "que|qui"],
        ["B2", "Il faut que tu ___ tes devoirs.", "fasses", "fais|feras"],
        ["B2", "Je veux que vous ___ à l'heure.", "soyez", "êtes|serez"],
        ["B2", "Le film ___ j'ai vu hier était génial.", "que", "qui|dont"],
        ["B2", "— Qu'est-ce que tu ferais à ma place ?", "À ta place, j'accepterais l'offre.", "À ta place, j'accepterai l'offre.|À ta place, j'acceptais l'offre."],
        ["C1", "Si tu m'avais appelé, je ___ venu.", "serais", "serai|aurais"],
        ["C1", "Bien qu'il ___ tard, nous avons continué.", "soit", "est|était"],
        ["C1", "C'est le livre ___ je t'ai parlé.", "dont", "que|où"],
        ["C1", "Je suis content que tu ___ venu.", "sois", "es|serais"],
        ["C1", "Quand je suis arrivé, elle avait déjà ___.", "mangé", "manger|mangeait"],
        ["C1", "Quoi qu'il ___, je ne changerai pas d'avis.", "dise", "dit|dira"]
    ],
    // Escribir la forma del verbo entre paréntesis (se añaden a «Completar oración»)
    fillWrite: [
        ["A1", "Je ___ (être) étudiant.", "suis"],
        ["A1", "Nous ___ (avoir) deux chats.", "avons"],
        ["A2", "Hier, j'___ (acheter) du pain.", "ai acheté"],
        ["A2", "Ce matin, nous ___ (prendre) le bus.", "avons pris"],
        ["B1", "Quand j'étais enfant, j'___ (habiter) à Lyon.", "habitais"],
        ["B1", "L'été prochain, nous ___ (aller) en Espagne.", "irons"],
        ["B2", "Si j'étais riche, je ___ (voyager) partout.", "voyagerais"],
        ["B2", "Il faut que nous ___ (partir) tôt.", "partions"],
        ["C1", "Si j'avais su, je ___ (venir) plus tôt.", "serais venu|serais venue"],
        ["C1", "Bien qu'elle ___ (être) malade, elle est venue.", "soit"]
    ]
};
