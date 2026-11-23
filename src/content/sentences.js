// --- Frases compartidas para «Ordenar palabras» por niveles CEFR ---
// Cada frase está escrita en todos los idiomas: [frase, "distractor|distractor|distractor", [otros órdenes válidos]?].
// Los órdenes alternativos deben usar exactamente las mismas palabras que la frase.
// La frase de un idioma sirve de enunciado («Traduce: …») para los demás, según el idioma de traducción.
// Sin signos de puntuación: la corrección compara solo las palabras (sin mayúsculas ni acentos).
// Los ejercicios o1/o2 (A1) siguen en el archivo de cada idioma.

export const ORDER_SENTENCES = [
    // A1
    { key: 'water', level: 'A1', topic: 'food', lines: {
        es: ['Yo bebo agua fría', 'come|caliente|ella'],
        en: ['I drink cold water', 'eat|hot|she'],
        fr: ["Je bois de l'eau froide", 'mange|chaude|elle'],
        it: ['Io bevo acqua fredda', 'mangio|calda|lei'],
        de: ['Ich trinke kaltes Wasser', 'esse|heißes|sie']
    } },
    { key: 'house', level: 'A1', topic: 'city', lines: {
        es: ['Mi casa es pequeña', 'grande|tu|son'],
        en: ['My house is small', 'big|your|are'],
        fr: ['Ma maison est petite', 'grande|ta|sont'],
        it: ['La mia casa è piccola', 'grande|tua|sono'],
        de: ['Mein Haus ist klein', 'groß|dein|sind']
    } },
    { key: 'dog_park', level: 'A1', topic: 'animals', lines: {
        es: ['El perro juega en el parque', 'gato|casa|duerme'],
        en: ['The dog plays in the park', 'cat|house|sleeps'],
        fr: ['Le chien joue dans le parc', 'chat|maison|dort'],
        it: ['Il cane gioca nel parco', 'gatto|casa|dorme'],
        de: ['Der Hund spielt im Park', 'Katze|Haus|schläft']
    } },

    // A2
    { key: 'movie', level: 'A2', lines: {
        es: ['Ayer vimos una película muy buena', 'vemos|mañana|malo', ['Vimos una película muy buena ayer']],
        en: ['Yesterday we watched a very good movie', 'watch|tomorrow|bad', ['We watched a very good movie yesterday']],
        fr: ['Hier nous avons vu un très bon film', 'voyons|demain|mauvais', ['Nous avons vu un très bon film hier']],
        it: ['Ieri abbiamo visto un film molto bello', 'vediamo|domani|brutto', ['Abbiamo visto un film molto bello ieri']],
        de: ['Gestern haben wir einen sehr guten Film gesehen', 'sehen|morgen|schlechten', ['Wir haben gestern einen sehr guten Film gesehen']]
    } },
    { key: 'ticket', level: 'A2', topic: 'travel', lines: {
        es: ['Necesito un billete para Madrid', 'necesitas|desde|tren'],
        en: ['I need a ticket to Madrid', 'needs|from|train'],
        fr: ["J'ai besoin d'un billet pour Madrid", 'as|depuis|train'],
        it: ['Ho bisogno di un biglietto per Madrid', 'hai|treno|da'],
        de: ['Ich brauche eine Fahrkarte nach Madrid', 'brauchst|aus|Zug']
    } },
    { key: 'hot_today', level: 'A2', topic: 'nature', lines: {
        es: ['Hoy hace mucho calor', 'frío|ayer|llueve', ['Hace mucho calor hoy']],
        en: ['It is very hot today', 'cold|yesterday|rains', ['Today it is very hot']],
        fr: ["Il fait très chaud aujourd'hui", 'froid|hier|pleut', ["Aujourd'hui il fait très chaud"]],
        it: ['Oggi fa molto caldo', 'freddo|ieri|piove', ['Fa molto caldo oggi']],
        de: ['Heute ist es sehr heiß', 'kalt|gestern|regnet', ['Es ist heute sehr heiß']]
    } },
    { key: 'headache', level: 'A2', topic: 'health', lines: {
        es: ['Me duele la cabeza desde ayer', 'pie|mañana|duelen', ['Desde ayer me duele la cabeza']],
        en: ['I have had a headache since yesterday', 'tomorrow|foot|has', ['Since yesterday I have had a headache']],
        fr: ["J'ai mal à la tête depuis hier", 'pied|demain|ont', ["Depuis hier j'ai mal à la tête"]],
        it: ['Mi fa male la testa da ieri', 'piede|domani|fanno', ['Da ieri mi fa male la testa']],
        de: ['Ich habe seit gestern Kopfschmerzen', 'morgen|Fuß|hat', ['Seit gestern habe ich Kopfschmerzen']]
    } },
    { key: 'gift', level: 'A2', lines: {
        es: ['Compré un regalo para mi madre', 'compro|padre|su'],
        en: ['I bought a gift for my mother', 'buy|father|her'],
        fr: ["J'ai acheté un cadeau pour ma mère", 'achète|père|sa'],
        it: ['Ho comprato un regalo per mia madre', 'compro|padre|sua'],
        de: ['Ich habe ein Geschenk für meine Mutter gekauft', 'kaufe|Vater|seine']
    } },

    // B1
    { key: 'childhood', level: 'B1', lines: {
        es: ['Cuando era niño jugaba al fútbol', 'juego|jugué|eras', ['Jugaba al fútbol cuando era niño']],
        en: ['When I was a child I used to play football', 'plays|playing|would', ['I used to play football when I was a child']],
        fr: ["Quand j'étais enfant je jouais au football", 'joue|jouerai|était', ["Je jouais au football quand j'étais enfant"]],
        it: ['Quando ero bambino giocavo a calcio', 'gioco|giocherò|era', ['Giocavo a calcio quando ero bambino']],
        de: ['Als ich ein Kind war spielte ich Fußball', 'spiele|wenn|bin', ['Ich spielte Fußball als ich ein Kind war']]
    } },
    { key: 'beach_plan', level: 'B1', topic: 'travel', lines: {
        es: ['Si tengo tiempo iré a la playa', 'tendría|iría|montaña', ['Iré a la playa si tengo tiempo']],
        en: ['If I have time I will go to the beach', 'would|had|mountain', ['I will go to the beach if I have time']],
        fr: ["Si j'ai le temps j'irai à la plage", 'aurais|irais|montagne', ["J'irai à la plage si j'ai le temps"]],
        it: ['Se ho tempo andrò al mare', 'avrei|andrei|montagna', ['Andrò al mare se ho tempo']],
        de: ['Wenn ich Zeit habe werde ich an den Strand gehen', 'hätte|würde|Berg', ['Ich werde an den Strand gehen wenn ich Zeit habe']]
    } },
    { key: 'book_opinion', level: 'B1', topic: 'study', lines: {
        es: ['Creo que este libro es interesante', 'sea|aburrido|esta'],
        en: ['I think that this book is interesting', 'boring|these|are'],
        fr: ['Je pense que ce livre est intéressant', 'soit|ennuyeux|cette'],
        it: ['Penso che questo libro sia interessante', 'è|noioso|questa'],
        de: ['Ich glaube dass dieses Buch interessant ist', 'langweilig|diese|sind']
    } },
    { key: 'three_years', level: 'B1', topic: 'city', lines: {
        es: ['Vivo en esta ciudad desde hace tres años', 'vivía|dos|meses'],
        en: ['I have lived in this city for three years', 'since|live|two'],
        fr: ["J'habite dans cette ville depuis trois ans", 'habitais|deux|pendant'],
        it: ['Vivo in questa città da tre anni', 'vivevo|due|per'],
        de: ['Ich wohne seit drei Jahren in dieser Stadt', 'wohnte|zwei|Monaten']
    } },
    { key: 'restaurant', level: 'B1', topic: 'food', lines: {
        es: ['Te recomiendo probar este restaurante', 'recomiendas|comer|esa'],
        en: ['I recommend that you try this restaurant', 'recommends|eat|these'],
        fr: ["Je te recommande d'essayer ce restaurant", 'recommandes|manger|cette'],
        it: ['Ti consiglio di provare questo ristorante', 'consigli|mangiare|questa'],
        de: ['Ich empfehle dir dieses Restaurant auszuprobieren', 'empfiehlt|essen|diese']
    } },

    // B2
    { key: 'party', level: 'B2', lines: {
        es: ['Espero que puedas venir a mi fiesta', 'puedes|vienes|tu'],
        en: ['I hope you can come to my party', 'could|came|your'],
        fr: ["J'espère que tu pourras venir à ma fête", 'peux|viens|ta'],
        it: ['Spero che tu possa venire alla mia festa', 'puoi|vieni|tua'],
        de: ['Ich hoffe dass du zu meiner Party kommen kannst', 'konntest|kommst|deiner']
    } },
    { key: 'more_money', level: 'B2', topic: 'travel', lines: {
        es: ['Si tuviera más dinero viajaría por el mundo', 'tengo|viajaré|menos', ['Viajaría por el mundo si tuviera más dinero']],
        en: ['If I had more money I would travel around the world', 'have|will|less', ['I would travel around the world if I had more money']],
        fr: ["Si j'avais plus d'argent je voyagerais dans le monde entier", 'ai|voyagerai|moins', ["Je voyagerais dans le monde entier si j'avais plus d'argent"]],
        it: ['Se avessi più soldi viaggerei per il mondo', 'ho|viaggerò|meno', ['Viaggerei per il mondo se avessi più soldi']],
        de: ['Wenn ich mehr Geld hätte würde ich um die Welt reisen', 'habe|werde|weniger', ['Ich würde um die Welt reisen wenn ich mehr Geld hätte']]
    } },
    { key: 'letter', level: 'B2', lines: {
        es: ['La carta fue escrita por mi abuelo', 'escribió|abuela|es'],
        en: ['The letter was written by my grandfather', 'wrote|grandmother|is'],
        fr: ['La lettre a été écrite par mon grand-père', 'écrit|grand-mère|est'],
        it: ['La lettera è stata scritta da mio nonno', 'scrisse|nonna|ha'],
        de: ['Der Brief wurde von meinem Großvater geschrieben', 'schrieb|Großmutter|ist']
    } },
    { key: 'woman_told', level: 'B2', lines: {
        es: ['Es la mujer de la que te hablé', 'quien|hablo|cual'],
        en: ['She is the woman I told you about', 'who|tell|he'],
        fr: ["C'est la femme dont je t'ai parlé", 'que|qui|parle'],
        it: ['È la donna di cui ti ho parlato', 'che|quale|parlo'],
        de: ['Das ist die Frau von der ich dir erzählt habe', 'die|dem|erzähle']
    } },
    { key: 'late', level: 'B2', lines: {
        es: ['Me dijo que llegaría tarde', 'llegará|dice|temprano'],
        en: ['He told me that he would arrive late', 'will|says|early'],
        fr: ["Il m'a dit qu'il arriverait en retard", 'arrivera|dira|tôt'],
        it: ['Mi ha detto che sarebbe arrivato tardi', 'arriverà|dice|presto'],
        de: ['Er hat mir gesagt dass er spät kommen würde', 'wird|sagt|früh']
    } },

    // C1
    { key: 'had_known', level: 'C1', lines: {
        es: ['De haberlo sabido habría actuado de otra manera', 'sabía|habrá|igual'],
        en: ['Had I known I would have acted differently', 'has|will|same'],
        fr: ["Si j'avais su j'aurais agi autrement", 'aurai|savais|pareil'],
        it: ["Se l'avessi saputo avrei agito diversamente", 'avrò|sapevo|uguale'],
        de: ['Hätte ich das gewusst hätte ich anders gehandelt', 'habe|wusste|gleich']
    } },
    { key: 'despite_rain', level: 'C1', topic: 'nature', lines: {
        es: ['A pesar de la lluvia salimos a caminar', 'aunque|nieve|salgamos', ['Salimos a caminar a pesar de la lluvia']],
        en: ['Despite the rain we went out for a walk', 'although|snow|go', ['We went out for a walk despite the rain']],
        fr: ['Malgré la pluie nous sommes sortis nous promener', 'bien|neige|sortons', ['Nous sommes sortis nous promener malgré la pluie']],
        it: ['Nonostante la pioggia siamo usciti a fare una passeggiata', 'anche|neve|usciamo', ['Siamo usciti a fare una passeggiata nonostante la pioggia']],
        de: ['Trotz des Regens sind wir spazieren gegangen', 'obwohl|Schnee|gehen', ['Wir sind trotz des Regens spazieren gegangen']]
    } },
    { key: 'insist', level: 'C1', lines: {
        es: ['Por mucho que insistas no cambiaré de opinión', 'insistes|cambio|nunca'],
        en: ['No matter how much you insist I will not change my mind', 'insisted|would|mine'],
        fr: ["Tu as beau insister je ne changerai pas d'avis", 'insistes|change|jamais'],
        it: ['Per quanto tu insista non cambierò idea', 'insisti|cambio|mai'],
        de: ['So sehr du auch darauf bestehst ich werde meine Meinung nicht ändern', 'bestehe|änderte|nie']
    } },
    { key: 'wish_studied', level: 'C1', topic: 'study', lines: {
        es: ['Ojalá hubiera estudiado más para el examen', 'estudiara|menos|haya'],
        en: ['I wish I had studied more for the exam', 'have|less|would'],
        fr: ["J'aurais aimé étudier davantage pour l'examen", 'étudié|moins|aurai'],
        it: ["Avrei voluto studiare di più per l'esame", 'studiato|meno|avrò'],
        de: ['Ich wünschte ich hätte mehr für die Prüfung gelernt', 'habe|weniger|lerne']
    } },
    { key: 'not_only', level: 'C1', topic: 'language', lines: {
        es: ['No solo habla inglés sino también chino', 'pero|tampoco|hablan'],
        en: ['Not only does she speak English but also Chinese', 'speaks|neither|do'],
        fr: ['Non seulement elle parle anglais mais aussi chinois', 'seul|ni|parlent'],
        it: ['Non solo parla inglese ma anche cinese', 'però|neanche|parlano'],
        de: ['Sie spricht nicht nur Englisch sondern auch Chinesisch', 'aber|weder|sprechen']
    } }
];
