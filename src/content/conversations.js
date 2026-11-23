// --- Conversaciones compartidas por niveles CEFR ---
// Cada escena tiene un contexto (en los idiomas de la interfaz) y sus líneas en cada idioma de estudio.
// Las líneas de un idioma sirven también como traducción para los demás.
// `wrong` = respuestas incorrectas (distractores) para el ejercicio de elegir la respuesta.

export const CONVERSATION_SCENES = [
    // A1
    {
        key: 'greet', img: '👋', level: 'A1',
        context: { es: 'Un amigo te saluda.', en: 'A friend greets you.', fr: 'Un ami te salue.' },
        lines: {
            es: { prompt: '¡Hola! ¿Qué tal?', answer: 'Muy bien, gracias. ¿Y tú?', wrong: ['Tengo veinte años.', 'Es un gato.'] },
            en: { prompt: 'Hi! How are you?', answer: 'Very well, thanks. And you?', wrong: ['I am twenty years old.', 'It is a cat.'] },
            fr: { prompt: 'Salut ! Ça va ?', answer: 'Très bien, merci. Et toi ?', wrong: ["J'ai vingt ans.", "C'est un chat."] },
            it: { prompt: 'Ciao! Come stai?', answer: 'Molto bene, grazie. E tu?', wrong: ["Ho vent'anni.", 'È un gatto.'] },
            de: { prompt: "Hallo! Wie geht's?", answer: 'Sehr gut, danke. Und dir?', wrong: ['Ich bin zwanzig Jahre alt.', 'Das ist eine Katze.'] }
        }
    },
    {
        key: 'name', img: '🙋', level: 'A1',
        context: { es: 'Conoces a alguien nuevo.', en: 'You meet someone new.', fr: "Tu rencontres quelqu'un de nouveau." },
        lines: {
            es: { prompt: '¿Cómo te llamas?', answer: 'Me llamo Ana.', wrong: ['Vivo en una casa.', 'Hace sol.'] },
            en: { prompt: "What's your name?", answer: 'My name is Ana.', wrong: ['I live in a house.', 'It is sunny.'] },
            fr: { prompt: "Comment tu t'appelles ?", answer: "Je m'appelle Ana.", wrong: ["J'habite dans une maison.", 'Il fait beau.'] },
            it: { prompt: 'Come ti chiami?', answer: 'Mi chiamo Ana.', wrong: ['Abito in una casa.', "C'è il sole."] },
            de: { prompt: 'Wie heißt du?', answer: 'Ich heiße Ana.', wrong: ['Ich wohne in einem Haus.', 'Die Sonne scheint.'] }
        }
    },

    // A2
    {
        key: 'cafe', img: '☕', level: 'A2',
        context: { es: 'Estás en una cafetería y el camarero te atiende.', en: "You're at a café and the waiter comes over.", fr: 'Tu es dans un café et le serveur arrive.' },
        lines: {
            es: { prompt: '¿Qué desea tomar?', answer: 'Un café con leche, por favor.', wrong: ['Mañana voy al cine.', 'Mi hermano es alto.'] },
            en: { prompt: 'What would you like to drink?', answer: 'A coffee with milk, please.', wrong: ["Tomorrow I'm going to the cinema.", 'My brother is tall.'] },
            fr: { prompt: "Qu'est-ce que vous désirez boire ?", answer: "Un café au lait, s'il vous plaît.", wrong: ['Demain, je vais au cinéma.', 'Mon frère est grand.'] },
            it: { prompt: 'Cosa desidera bere?', answer: 'Un caffellatte, per favore.', wrong: ['Domani vado al cinema.', 'Mio fratello è alto.'] },
            de: { prompt: 'Was möchten Sie trinken?', answer: 'Einen Milchkaffee, bitte.', wrong: ['Morgen gehe ich ins Kino.', 'Mein Bruder ist groß.'] }
        }
    },
    {
        key: 'directions', img: '🗺️', level: 'A2',
        context: { es: 'Un turista te pide ayuda en la calle.', en: 'A tourist asks you for help in the street.', fr: "Un touriste te demande de l'aide dans la rue." },
        lines: {
            es: { prompt: 'Perdone, ¿dónde está la estación de tren?', answer: 'Siga recto y gire a la izquierda.', wrong: ['Son las tres de la tarde.', 'Me gusta la pizza.'] },
            en: { prompt: 'Excuse me, where is the train station?', answer: 'Go straight ahead and turn left.', wrong: ["It's three in the afternoon.", 'I like pizza.'] },
            fr: { prompt: 'Excusez-moi, où est la gare ?', answer: 'Allez tout droit et tournez à gauche.', wrong: ["Il est trois heures de l'après-midi.", "J'aime la pizza."] },
            it: { prompt: "Scusi, dov'è la stazione?", answer: 'Vada dritto e giri a sinistra.', wrong: ['Sono le tre del pomeriggio.', 'Mi piace la pizza.'] },
            de: { prompt: 'Entschuldigung, wo ist der Bahnhof?', answer: 'Gehen Sie geradeaus und dann links.', wrong: ['Es ist drei Uhr nachmittags.', 'Ich mag Pizza.'] }
        }
    },

    // B1
    {
        key: 'weekend', img: '🏔️', level: 'B1',
        context: { es: 'Un compañero te pregunta por tu fin de semana.', en: 'A colleague asks about your weekend.', fr: "Un collègue te demande comment s'est passé ton week-end." },
        lines: {
            es: { prompt: '¿Qué hiciste el fin de semana?', answer: 'Fui a la montaña con unos amigos.', wrong: ['Iré a la montaña el año que viene.', 'Mi coche es rojo.'] },
            en: { prompt: 'What did you do at the weekend?', answer: 'I went to the mountains with some friends.', wrong: ['I will go to the mountains next year.', 'My car is red.'] },
            fr: { prompt: "Qu'est-ce que tu as fait ce week-end ?", answer: 'Je suis allé à la montagne avec des amis.', wrong: ["J'irai à la montagne l'année prochaine.", 'Ma voiture est rouge.'] },
            it: { prompt: 'Cosa hai fatto nel fine settimana?', answer: 'Sono andato in montagna con degli amici.', wrong: ["Andrò in montagna l'anno prossimo.", 'La mia macchina è rossa.'] },
            de: { prompt: 'Was hast du am Wochenende gemacht?', answer: 'Ich bin mit Freunden in die Berge gefahren.', wrong: ['Ich fahre nächstes Jahr in die Berge.', 'Mein Auto ist rot.'] }
        }
    },
    {
        key: 'doctor', img: '🩺', level: 'B1',
        context: { es: 'Estás en la consulta del médico.', en: "You're at the doctor's.", fr: 'Tu es chez le médecin.' },
        lines: {
            es: { prompt: '¿Qué le pasa? ¿Desde cuándo se siente mal?', answer: 'Me duele la cabeza desde hace dos días.', wrong: ['Quiero reservar una mesa para dos.', 'El tren sale a las ocho.'] },
            en: { prompt: 'What seems to be the problem? How long have you felt unwell?', answer: "I've had a headache for two days.", wrong: ["I'd like to book a table for two.", 'The train leaves at eight.'] },
            fr: { prompt: "Qu'est-ce qui ne va pas ? Depuis quand vous sentez-vous mal ?", answer: "J'ai mal à la tête depuis deux jours.", wrong: ['Je voudrais réserver une table pour deux.', 'Le train part à huit heures.'] },
            it: { prompt: 'Che cosa si sente? Da quando sta male?', answer: 'Ho mal di testa da due giorni.', wrong: ['Vorrei prenotare un tavolo per due.', 'Il treno parte alle otto.'] },
            de: { prompt: 'Was fehlt Ihnen? Seit wann fühlen Sie sich schlecht?', answer: 'Ich habe seit zwei Tagen Kopfschmerzen.', wrong: ['Ich möchte einen Tisch für zwei reservieren.', 'Der Zug fährt um acht Uhr ab.'] }
        }
    },

    // B2
    {
        key: 'interview', img: '💼', level: 'B2',
        context: { es: 'Estás en una entrevista de trabajo.', en: "You're in a job interview.", fr: "Tu passes un entretien d'embauche." },
        lines: {
            es: { prompt: '¿Por qué le interesa este puesto?', answer: 'Porque me permitiría desarrollar mis habilidades en un entorno internacional.', wrong: ['Porque ayer llovió mucho.', 'Prefiero el té al café.'] },
            en: { prompt: 'Why are you interested in this position?', answer: 'Because it would allow me to develop my skills in an international environment.', wrong: ['Because it rained a lot yesterday.', 'I prefer tea to coffee.'] },
            fr: { prompt: 'Pourquoi ce poste vous intéresse-t-il ?', answer: "Parce qu'il me permettrait de développer mes compétences dans un environnement international.", wrong: ["Parce qu'il a beaucoup plu hier.", 'Je préfère le thé au café.'] },
            it: { prompt: 'Perché le interessa questa posizione?', answer: 'Perché mi permetterebbe di sviluppare le mie competenze in un ambiente internazionale.', wrong: ['Perché ieri ha piovuto molto.', 'Preferisco il tè al caffè.'] },
            de: { prompt: 'Warum interessieren Sie sich für diese Stelle?', answer: 'Weil ich dort meine Fähigkeiten in einem internationalen Umfeld weiterentwickeln könnte.', wrong: ['Weil es gestern viel geregnet hat.', 'Ich trinke lieber Tee als Kaffee.'] }
        }
    },
    {
        key: 'environment', img: '🌍', level: 'B2',
        context: { es: 'Debates sobre el medio ambiente con un amigo.', en: "You're discussing the environment with a friend.", fr: "Tu débats de l'environnement avec un ami." },
        lines: {
            es: { prompt: '¿Crees que deberíamos usar menos el coche?', answer: 'Sí, aunque antes habría que mejorar el transporte público.', wrong: ['Sí, mi coche es azul.', 'No, porque hoy es lunes.'] },
            en: { prompt: 'Do you think we should use the car less?', answer: 'Yes, although public transport would need to improve first.', wrong: ['Yes, my car is blue.', 'No, because today is Monday.'] },
            fr: { prompt: "Tu penses qu'on devrait moins utiliser la voiture ?", answer: "Oui, même s'il faudrait d'abord améliorer les transports en commun.", wrong: ['Oui, ma voiture est bleue.', "Non, parce qu'aujourd'hui c'est lundi."] },
            it: { prompt: 'Pensi che dovremmo usare meno la macchina?', answer: 'Sì, anche se prima bisognerebbe migliorare i trasporti pubblici.', wrong: ['Sì, la mia macchina è blu.', 'No, perché oggi è lunedì.'] },
            de: { prompt: 'Findest du, wir sollten weniger Auto fahren?', answer: 'Ja, obwohl man zuerst die öffentlichen Verkehrsmittel verbessern müsste.', wrong: ['Ja, mein Auto ist blau.', 'Nein, weil heute Montag ist.'] }
        }
    },

    // C1
    {
        key: 'negotiation', img: '🤝', level: 'C1',
        context: { es: 'Negocias las condiciones de un contrato.', en: "You're negotiating the terms of a contract.", fr: "Tu négocies les conditions d'un contrat." },
        lines: {
            es: { prompt: 'Nos resulta difícil aceptar ese plazo de entrega.', answer: 'Lo entiendo; ¿y si lo ampliamos dos semanas a cambio de un pequeño descuento?', wrong: ['El plazo es de color verde.', 'Me encanta viajar en verano.'] },
            en: { prompt: 'We find that delivery deadline difficult to accept.', answer: 'I understand; what if we extend it by two weeks in exchange for a small discount?', wrong: ['The deadline is green.', 'I love travelling in summer.'] },
            fr: { prompt: 'Ce délai de livraison nous paraît difficile à accepter.', answer: "Je comprends ; et si nous le prolongions de deux semaines en échange d'une petite remise ?", wrong: ['Le délai est de couleur verte.', "J'adore voyager en été."] },
            it: { prompt: 'Ci risulta difficile accettare questi tempi di consegna.', answer: 'Capisco; e se li prolungassimo di due settimane in cambio di un piccolo sconto?', wrong: ['I tempi sono di colore verde.', "Adoro viaggiare d'estate."] },
            de: { prompt: 'Diese Lieferfrist können wir nur schwer akzeptieren.', answer: 'Das verstehe ich. Was halten Sie davon, sie um zwei Wochen zu verlängern und dafür einen kleinen Rabatt zu bekommen?', wrong: ['Die Frist ist grün.', 'Ich reise im Sommer sehr gern.'] }
        }
    },
    {
        key: 'feedback', img: '🗣️', level: 'C1',
        context: { es: 'Un colega te pide tu opinión sincera sobre su presentación.', en: 'A colleague asks for your honest opinion on their presentation.', fr: 'Un collègue te demande ton avis sincère sur sa présentation.' },
        lines: {
            es: { prompt: 'Sé sincero, ¿qué te pareció mi presentación?', answer: 'Estuvo muy bien estructurada, aunque quizá podrías haber profundizado más en los datos.', wrong: ['Mi presentación es mañana a las diez.', 'No sé nadar.'] },
            en: { prompt: 'Be honest, what did you think of my presentation?', answer: 'It was very well structured, although perhaps you could have gone deeper into the data.', wrong: ['My presentation is tomorrow at ten.', "I can't swim."] },
            fr: { prompt: "Sois franc, qu'as-tu pensé de ma présentation ?", answer: 'Elle était très bien structurée, même si tu aurais peut-être pu approfondir davantage les données.', wrong: ['Ma présentation est demain à dix heures.', 'Je ne sais pas nager.'] },
            it: { prompt: 'Sii sincero, cosa ne pensi della mia presentazione?', answer: 'Era molto ben strutturata, anche se forse avresti potuto approfondire di più i dati.', wrong: ['La mia presentazione è domani alle dieci.', 'Non so nuotare.'] },
            de: { prompt: 'Sei ehrlich, wie fandest du meine Präsentation?', answer: 'Sie war sehr gut strukturiert, auch wenn du vielleicht genauer auf die Daten hättest eingehen können.', wrong: ['Meine Präsentation ist morgen um zehn.', 'Ich kann nicht schwimmen.'] }
        }
    },

    // C2
    {
        key: 'irony', img: '🎭', level: 'C2',
        context: { es: 'Alguien comenta con ironía tras una reunión interminable.', en: 'Someone makes an ironic remark after an endless meeting.', fr: 'Quelqu’un fait une remarque ironique après une réunion interminable.' },
        lines: {
            es: { prompt: 'Bueno, ha sido una reunión de lo más breve, ¿no?', answer: 'Desde luego, se me ha pasado volando: casi tres horas.', wrong: ['Sí, la reunión empieza a las nueve.', 'Todavía no tengo hambre.'] },
            en: { prompt: 'Well, that was a remarkably short meeting, wasn’t it?', answer: 'Absolutely, it flew by: nearly three hours.', wrong: ['Yes, the meeting starts at nine.', "I'm not hungry yet."] },
            fr: { prompt: "Eh bien, c'était une réunion des plus brèves, non ?", answer: "Ah ça oui, je n'ai pas vu le temps passer : presque trois heures.", wrong: ['Oui, la réunion commence à neuf heures.', "Je n'ai pas encore faim."] },
            it: { prompt: 'Beh, è stata una riunione brevissima, no?', answer: 'Altroché, è volata: quasi tre ore.', wrong: ['Sì, la riunione inizia alle nove.', 'Non ho ancora fame.'] },
            de: { prompt: 'Na, das war ja eine ausgesprochen kurze Besprechung, oder?', answer: 'Allerdings, die Zeit ist nur so verflogen: fast drei Stunden.', wrong: ['Ja, die Besprechung beginnt um neun.', 'Ich habe noch keinen Hunger.'] }
        }
    },
    {
        key: 'nuance', img: '🧐', level: 'C2',
        context: { es: 'Debatís un tema delicado y te piden que matices tu postura.', en: "You're debating a sensitive topic and are asked to qualify your view.", fr: 'Vous débattez d’un sujet délicat et on te demande de nuancer ta position.' },
        lines: {
            es: { prompt: 'Entonces, ¿estás totalmente en contra de la propuesta?', answer: 'No exactamente; comparto el fondo, pero discrepo en la forma de llevarla a cabo.', wrong: ['Sí, la propuesta llegó por correo.', 'Estoy en contra de la lluvia.'] },
            en: { prompt: 'So, are you completely against the proposal?', answer: 'Not exactly; I agree with the substance, but I disagree with how it would be carried out.', wrong: ['Yes, the proposal arrived by post.', "I'm against the rain."] },
            fr: { prompt: 'Alors, tu es totalement contre la proposition ?', answer: "Pas exactement ; j'en partage le fond, mais je suis en désaccord sur la manière de la mettre en œuvre.", wrong: ['Oui, la proposition est arrivée par la poste.', 'Je suis contre la pluie.'] },
            it: { prompt: 'Quindi sei del tutto contrario alla proposta?', answer: "Non esattamente; ne condivido la sostanza, ma non sono d'accordo sul modo di attuarla.", wrong: ['Sì, la proposta è arrivata per posta.', 'Sono contrario alla pioggia.'] },
            de: { prompt: 'Du bist also völlig gegen den Vorschlag?', answer: 'Nicht ganz; inhaltlich stimme ich zu, aber mit der Umsetzung bin ich nicht einverstanden.', wrong: ['Ja, der Vorschlag kam mit der Post.', 'Ich bin gegen den Regen.'] }
        }
    }
];
