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

    // C1 (antes C2)
    {
        key: 'irony', img: '🎭', level: 'C1',
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
        key: 'nuance', img: '🧐', level: 'C1',
        context: { es: 'Debatís un tema delicado y te piden que matices tu postura.', en: "You're debating a sensitive topic and are asked to qualify your view.", fr: 'Vous débattez d’un sujet délicat et on te demande de nuancer ta position.' },
        lines: {
            es: { prompt: 'Entonces, ¿estás totalmente en contra de la propuesta?', answer: 'No exactamente; comparto el fondo, pero discrepo en la forma de llevarla a cabo.', wrong: ['Sí, la propuesta llegó por correo.', 'Estoy en contra de la lluvia.'] },
            en: { prompt: 'So, are you completely against the proposal?', answer: 'Not exactly; I agree with the substance, but I disagree with how it would be carried out.', wrong: ['Yes, the proposal arrived by post.', "I'm against the rain."] },
            fr: { prompt: 'Alors, tu es totalement contre la proposition ?', answer: "Pas exactement ; j'en partage le fond, mais je suis en désaccord sur la manière de la mettre en œuvre.", wrong: ['Oui, la proposition est arrivée par la poste.', 'Je suis contre la pluie.'] },
            it: { prompt: 'Quindi sei del tutto contrario alla proposta?', answer: "Non esattamente; ne condivido la sostanza, ma non sono d'accordo sul modo di attuarla.", wrong: ['Sì, la proposta è arrivata per posta.', 'Sono contrario alla pioggia.'] },
            de: { prompt: 'Du bist also völlig gegen den Vorschlag?', answer: 'Nicht ganz; inhaltlich stimme ich zu, aber mit der Umsetzung bin ich nicht einverstanden.', wrong: ['Ja, der Vorschlag kam mit der Post.', 'Ich bin gegen den Regen.'] }
        }
    },

    // --- Ampliación: una escena más por nivel ---
    {
        key: 'origin', img: '🌍', level: 'A1',
        context: { es: 'Un compañero de clase te pregunta.', en: 'A classmate asks you.', fr: 'Un camarade de classe te demande.' },
        lines: {
            es: { prompt: '¿De dónde eres?', answer: 'Soy de México.', wrong: ['Tengo dos hermanos.', 'Es lunes.'] },
            en: { prompt: 'Where are you from?', answer: "I'm from Mexico.", wrong: ['I have two brothers.', "It's Monday."] },
            fr: { prompt: "Tu viens d'où ?", answer: 'Je viens du Mexique.', wrong: ["J'ai deux frères.", "C'est lundi."] },
            it: { prompt: 'Di dove sei?', answer: 'Vengo dal Messico.', wrong: ['Ho due fratelli.', 'È lunedì.'] },
            de: { prompt: 'Woher kommst du?', answer: 'Ich komme aus Mexiko.', wrong: ['Ich habe zwei Brüder.', 'Es ist Montag.'] }
        }
    },
    {
        key: 'shop', img: '🛍️', level: 'A2',
        context: { es: 'Estás de compras en una tienda de ropa.', en: "You're shopping in a clothes shop.", fr: 'Tu fais du shopping dans un magasin de vêtements.' },
        lines: {
            es: { prompt: '¿Cuánto cuesta esta camiseta?', answer: 'Cuesta quince euros.', wrong: ['Mi hermana es médica.', 'Ayer fui al parque.'] },
            en: { prompt: 'How much is this T-shirt?', answer: 'It costs fifteen euros.', wrong: ['My sister is a doctor.', 'Yesterday I went to the park.'] },
            fr: { prompt: 'Combien coûte ce tee-shirt ?', answer: 'Il coûte quinze euros.', wrong: ['Ma sœur est médecin.', 'Hier, je suis allé au parc.'] },
            it: { prompt: 'Quanto costa questa maglietta?', answer: 'Costa quindici euro.', wrong: ['Mia sorella è medico.', 'Ieri sono andato al parco.'] },
            de: { prompt: 'Wie viel kostet dieses T-Shirt?', answer: 'Es kostet fünfzehn Euro.', wrong: ['Meine Schwester ist Ärztin.', 'Gestern bin ich in den Park gegangen.'] }
        }
    },
    {
        key: 'hotel', img: '🏨', level: 'B1',
        context: { es: 'Llamas a la recepción de tu hotel.', en: "You call your hotel's reception.", fr: "Tu appelles la réception de ton hôtel." },
        lines: {
            es: { prompt: '¿En qué puedo ayudarle?', answer: 'La calefacción de mi habitación no funciona. ¿Podrían revisarla?', wrong: ['Me encanta el chocolate.', 'Mañana es mi cumpleaños.'] },
            en: { prompt: 'How can I help you?', answer: "The heating in my room isn't working. Could you check it?", wrong: ['I love chocolate.', 'Tomorrow is my birthday.'] },
            fr: { prompt: 'Que puis-je faire pour vous ?', answer: 'Le chauffage de ma chambre ne marche pas. Pourriez-vous vérifier ?', wrong: ["J'adore le chocolat.", "Demain, c'est mon anniversaire."] },
            it: { prompt: 'Come posso aiutarla?', answer: 'Il riscaldamento della mia camera non funziona. Potreste controllarlo?', wrong: ['Adoro il cioccolato.', 'Domani è il mio compleanno.'] },
            de: { prompt: 'Wie kann ich Ihnen helfen?', answer: 'Die Heizung in meinem Zimmer funktioniert nicht. Könnten Sie sie überprüfen?', wrong: ['Ich liebe Schokolade.', 'Morgen habe ich Geburtstag.'] }
        }
    },
    {
        key: 'apology', img: '⏰', level: 'B2',
        context: { es: 'Un compañero se disculpa contigo.', en: 'A colleague apologises to you.', fr: "Un collègue s'excuse auprès de toi." },
        lines: {
            es: { prompt: 'Siento mucho haber llegado tarde a la reunión.', answer: 'No te preocupes, aunque te agradecería que avisaras la próxima vez.', wrong: ['Gracias, me encanta tu coche.', 'Sí, mañana hará sol.'] },
            en: { prompt: "I'm really sorry I was late for the meeting.", answer: "Don't worry, although I'd appreciate it if you let me know next time.", wrong: ['Thanks, I love your car.', "Yes, it'll be sunny tomorrow."] },
            fr: { prompt: "Je suis vraiment désolé d'être arrivé en retard à la réunion.", answer: "Ne t'inquiète pas, mais j'apprécierais que tu préviennes la prochaine fois.", wrong: ["Merci, j'adore ta voiture.", 'Oui, il fera beau demain.'] },
            it: { prompt: 'Mi dispiace molto di essere arrivato tardi alla riunione.', answer: 'Non preoccuparti, anche se apprezzerei che mi avvisassi la prossima volta.', wrong: ['Grazie, adoro la tua macchina.', 'Sì, domani ci sarà il sole.'] },
            de: { prompt: 'Es tut mir wirklich leid, dass ich zu spät zur Besprechung gekommen bin.', answer: 'Kein Problem, aber ich wäre dir dankbar, wenn du nächstes Mal Bescheid sagst.', wrong: ['Danke, ich liebe dein Auto.', 'Ja, morgen scheint die Sonne.'] }
        }
    },
    {
        key: 'committee', img: '🎤', level: 'C1',
        context: { es: 'Defiendes un proyecto ante un comité.', en: "You're defending a project before a committee.", fr: 'Tu défends un projet devant un comité.' },
        lines: {
            es: { prompt: '¿No cree que su propuesta resulta demasiado costosa?', answer: 'Es cierto que requiere una inversión inicial, pero a medio plazo se amortiza con creces.', wrong: ['Sí, me gusta mucho el café.', 'La propuesta está en la mesa de la cocina.'] },
            en: { prompt: "Don't you think your proposal is too expensive?", answer: 'It does require an initial investment, but in the medium term it more than pays for itself.', wrong: ['Yes, I really like coffee.', 'The proposal is on the kitchen table.'] },
            fr: { prompt: 'Ne pensez-vous pas que votre proposition est trop coûteuse ?', answer: 'Elle exige certes un investissement initial, mais à moyen terme elle est largement rentabilisée.', wrong: ["Oui, j'aime beaucoup le café.", 'La proposition est sur la table de la cuisine.'] },
            it: { prompt: 'Non pensa che la sua proposta sia troppo costosa?', answer: 'È vero che richiede un investimento iniziale, ma a medio termine si ripaga ampiamente.', wrong: ['Sì, mi piace molto il caffè.', 'La proposta è sul tavolo della cucina.'] },
            de: { prompt: 'Halten Sie Ihren Vorschlag nicht für zu teuer?', answer: 'Er erfordert zwar eine Anfangsinvestition, macht sich aber mittelfristig mehr als bezahlt.', wrong: ['Ja, ich mag Kaffee sehr.', 'Der Vorschlag liegt auf dem Küchentisch.'] }
        }
    },
    {
        key: 'idiom', img: '🧵', level: 'C1',
        context: { es: 'Comentas con un colega cómo terminó un proyecto complicado.', en: "You're discussing with a colleague how a tricky project ended.", fr: "Tu discutes avec un collègue de la fin d'un projet compliqué." },
        lines: {
            es: { prompt: 'Parece que al final todo salió a pedir de boca, ¿no?', answer: 'Sí, aunque hubo momentos en que pendía de un hilo.', wrong: ['Sí, me duele un poco la boca.', 'No, el hilo es demasiado corto.'] },
            en: { prompt: 'It looks like everything went off without a hitch in the end, didn’t it?', answer: 'Yes, although at times it was hanging by a thread.', wrong: ['Yes, I tied a knot in it.', 'No, the thread is too short.'] },
            fr: { prompt: "On dirait que tout s'est finalement passé comme sur des roulettes, non ?", answer: 'Oui, même si à certains moments ça ne tenait qu’à un fil.', wrong: ["Oui, j'ai acheté des roulettes.", 'Non, le fil est trop court.'] },
            it: { prompt: "Sembra che alla fine sia andato tutto liscio come l'olio, no?", answer: 'Sì, anche se in certi momenti era appeso a un filo.', wrong: ["Sì, l'olio è in cucina.", 'No, il filo è troppo corto.'] },
            de: { prompt: 'Am Ende ist ja doch alles wie am Schnürchen gelaufen, oder?', answer: 'Ja, obwohl es zeitweise an einem seidenen Faden hing.', wrong: ['Ja, ich habe ein neues Schnürchen gekauft.', 'Nein, der Faden ist zu kurz.'] }
        }
    },

    // --- Escenas añadidas para tener al menos 5 por nivel ---
    // A1
    {
        key: 'age', img: '🎂', level: 'A1',
        context: { es: 'Alguien te pregunta tu edad.', en: 'Someone asks how old you are.', fr: "Quelqu'un te demande ton âge." },
        lines: {
            es: { prompt: '¿Cuántos años tienes?', answer: 'Tengo veinticinco años.', wrong: ['Me llamo Pedro.', 'Vivo en Madrid.'] },
            en: { prompt: 'How old are you?', answer: 'I am twenty-five years old.', wrong: ['My name is Pedro.', 'I live in Madrid.'] },
            fr: { prompt: 'Quel âge as-tu ?', answer: "J'ai vingt-cinq ans.", wrong: ["Je m'appelle Pedro.", "J'habite à Madrid."] },
            it: { prompt: 'Quanti anni hai?', answer: 'Ho venticinque anni.', wrong: ['Mi chiamo Pedro.', 'Abito a Madrid.'] },
            de: { prompt: 'Wie alt bist du?', answer: 'Ich bin fünfundzwanzig Jahre alt.', wrong: ['Ich heiße Pedro.', 'Ich wohne in Madrid.'] }
        }
    },
    {
        key: 'family', img: '👨‍👩‍👧', level: 'A1',
        context: { es: 'Un nuevo amigo te pregunta por tu familia.', en: 'A new friend asks about your family.', fr: 'Un nouvel ami te pose des questions sur ta famille.' },
        lines: {
            es: { prompt: '¿Tienes hermanos?', answer: 'Sí, tengo una hermana.', wrong: ['Sí, tengo veinte años.', 'No, me llamo Luis.'] },
            en: { prompt: 'Do you have any brothers or sisters?', answer: 'Yes, I have a sister.', wrong: ['Yes, I am twenty years old.', 'No, my name is Luis.'] },
            fr: { prompt: 'Tu as des frères et sœurs ?', answer: "Oui, j'ai une sœur.", wrong: ["Oui, j'ai vingt ans.", "Non, je m'appelle Luis."] },
            it: { prompt: 'Hai fratelli o sorelle?', answer: 'Sì, ho una sorella.', wrong: ["Sì, ho vent'anni.", 'No, mi chiamo Luis.'] },
            de: { prompt: 'Hast du Geschwister?', answer: 'Ja, ich habe eine Schwester.', wrong: ['Ja, ich bin zwanzig Jahre alt.', 'Nein, ich heiße Luis.'] }
        }
    },
    // A2
    {
        key: 'bus', img: '🚌', level: 'A2',
        context: { es: 'Estás en la parada del autobús.', en: "You're at the bus stop.", fr: "Tu es à l'arrêt de bus." },
        lines: {
            es: { prompt: '¿A qué hora sale el próximo autobús?', answer: 'Sale a las diez y cuarto.', wrong: ['Salió ayer a las diez.', 'El autobús es azul.'] },
            en: { prompt: 'What time does the next bus leave?', answer: 'It leaves at a quarter past ten.', wrong: ['It left yesterday at ten.', 'The bus is blue.'] },
            fr: { prompt: 'À quelle heure part le prochain bus ?', answer: 'Il part à dix heures et quart.', wrong: ['Il est parti hier à dix heures.', 'Le bus est bleu.'] },
            it: { prompt: 'A che ora parte il prossimo autobus?', answer: 'Parte alle dieci e un quarto.', wrong: ['È partito ieri alle dieci.', "L'autobus è blu."] },
            de: { prompt: 'Wann fährt der nächste Bus?', answer: 'Er fährt um Viertel nach zehn.', wrong: ['Er ist gestern um zehn gefahren.', 'Der Bus ist blau.'] }
        }
    },
    {
        key: 'hobbies', img: '🏊', level: 'A2',
        context: { es: 'Hablas de tus aficiones con un compañero.', en: 'You talk about hobbies with a classmate.', fr: 'Tu parles de tes loisirs avec un camarade.' },
        lines: {
            es: { prompt: '¿Qué te gusta hacer en tu tiempo libre?', answer: 'Me gusta leer y nadar.', wrong: ['Me gusta el tiempo libre.', 'Ayer leí y nadé mucho.'] },
            en: { prompt: 'What do you like doing in your free time?', answer: 'I like reading and swimming.', wrong: ['I like the free time.', 'Yesterday I read and swam a lot.'] },
            fr: { prompt: "Qu'est-ce que tu aimes faire pendant ton temps libre ?", answer: "J'aime lire et nager.", wrong: ["J'aime le temps libre.", "Hier, j'ai beaucoup lu et nagé."] },
            it: { prompt: 'Cosa ti piace fare nel tempo libero?', answer: 'Mi piace leggere e nuotare.', wrong: ['Mi piace il tempo libero.', 'Ieri ho letto e nuotato molto.'] },
            de: { prompt: 'Was machst du gern in deiner Freizeit?', answer: 'Ich lese und schwimme gern.', wrong: ['Ich mag die Freizeit.', 'Gestern habe ich viel gelesen und bin geschwommen.'] }
        }
    },
    // B1
    {
        key: 'lost_wallet', img: '👛', level: 'B1',
        context: { es: 'Has perdido la cartera y hablas con la policía.', en: "You've lost your wallet and are talking to the police.", fr: 'Tu as perdu ton portefeuille et tu parles à la police.' },
        lines: {
            es: { prompt: '¿Dónde vio su cartera por última vez?', answer: 'Creo que la dejé en el autobús esta mañana.', wrong: ['Creo que la dejaré en el autobús mañana.', 'Mi cartera tiene muchos colores.'] },
            en: { prompt: 'Where did you last see your wallet?', answer: 'I think I left it on the bus this morning.', wrong: ['I think I will leave it on the bus tomorrow.', 'My wallet has lots of colours.'] },
            fr: { prompt: 'Où avez-vous vu votre portefeuille pour la dernière fois ?', answer: "Je crois que je l'ai laissé dans le bus ce matin.", wrong: ['Je crois que je le laisserai dans le bus demain.', 'Mon portefeuille a beaucoup de couleurs.'] },
            it: { prompt: "Dove ha visto il portafoglio l'ultima volta?", answer: "Credo di averlo lasciato sull'autobus stamattina.", wrong: ["Credo che lo lascerò sull'autobus domani.", 'Il mio portafoglio ha tanti colori.'] },
            de: { prompt: 'Wo haben Sie Ihre Geldbörse zuletzt gesehen?', answer: 'Ich glaube, ich habe sie heute Morgen im Bus liegen lassen.', wrong: ['Ich glaube, ich werde sie morgen im Bus lassen.', 'Meine Geldbörse hat viele Farben.'] }
        }
    },
    {
        key: 'advice', img: '😮‍💨', level: 'B1',
        context: { es: 'Un amigo está estresado por el trabajo.', en: 'A friend is stressed about work.', fr: 'Un ami est stressé par son travail.' },
        lines: {
            es: { prompt: 'Estoy muy estresado con el trabajo.', answer: 'Deberías tomarte unos días de descanso.', wrong: ['Deberías tomado unos días de descanso.', 'Me alegro de que estés estresado.'] },
            en: { prompt: "I'm really stressed about work.", answer: 'You should take a few days off.', wrong: ['You should took a few days off.', "I'm glad you're stressed."] },
            fr: { prompt: 'Je suis très stressé par le travail.', answer: 'Tu devrais prendre quelques jours de repos.', wrong: ['Tu devrais pris quelques jours de repos.', 'Je suis content que tu sois stressé.'] },
            it: { prompt: 'Sono molto stressato per il lavoro.', answer: 'Dovresti prenderti qualche giorno di riposo.', wrong: ['Dovresti preso qualche giorno di riposo.', 'Sono contento che tu sia stressato.'] },
            de: { prompt: 'Ich bin wegen der Arbeit total gestresst.', answer: 'Du solltest ein paar Tage freinehmen.', wrong: ['Du solltest ein paar Tage freigenommen.', 'Schön, dass du gestresst bist.'] }
        }
    },
    // B2
    {
        key: 'neighbour', img: '🎶', level: 'B2',
        context: { es: 'Tu vecino se disculpa por el ruido.', en: 'Your neighbour apologises for the noise.', fr: "Ton voisin s'excuse pour le bruit." },
        lines: {
            es: { prompt: 'Perdona, ¿te molestó la música anoche?', answer: 'Un poco, la verdad; te agradecería que la bajaras después de las once.', wrong: ['Un poco; te agradecería que la bajas después de las once.', 'Me encanta la música clásica.'] },
            en: { prompt: 'Sorry, did the music bother you last night?', answer: "A little, to be honest; I'd appreciate it if you turned it down after eleven.", wrong: ["A little; I'd appreciate it if you will turn it down after eleven.", 'I love classical music.'] },
            fr: { prompt: 'Désolé, la musique vous a dérangé hier soir ?', answer: "Un peu, pour être honnête ; j'apprécierais que vous la baissiez après onze heures.", wrong: ["Un peu ; j'apprécierais que vous la baissez après onze heures.", "J'adore la musique classique."] },
            it: { prompt: 'Scusa, la musica ti ha dato fastidio ieri sera?', answer: "Un po', a dire il vero; ti sarei grato se la abbassassi dopo le undici.", wrong: ["Un po'; ti sarei grato se la abbassi dopo le undici.", 'Adoro la musica classica.'] },
            de: { prompt: 'Entschuldigung, hat dich die Musik gestern Abend gestört?', answer: 'Ehrlich gesagt ein bisschen; ich wäre dir dankbar, wenn du sie nach elf leiser machen würdest.', wrong: ['Ein bisschen; ich bin dir dankbar, wenn du sie gestern leiser machst.', 'Ich liebe klassische Musik.'] }
        }
    },
    {
        key: 'wrong_bill', img: '🧾', level: 'B2',
        context: { es: 'Reclamas una factura incorrecta en atención al cliente.', en: "You're disputing a wrong bill with customer service.", fr: 'Tu contestes une facture erronée auprès du service client.' },
        lines: {
            es: { prompt: '¿Cuál es el problema con su factura?', answer: 'Me han cobrado dos veces el mismo servicio.', wrong: ['Me cobrarían si lo habría pagado.', 'La factura es muy bonita.'] },
            en: { prompt: "What's the problem with your bill?", answer: "I've been charged twice for the same service.", wrong: ['I would be charged if I would have paid.', 'The bill is very pretty.'] },
            fr: { prompt: 'Quel est le problème avec votre facture ?', answer: "On m'a facturé deux fois le même service.", wrong: ["On me facturerait si j'aurais payé.", 'La facture est très jolie.'] },
            it: { prompt: 'Qual è il problema con la sua bolletta?', answer: 'Mi avete addebitato due volte lo stesso servizio.', wrong: ['Mi addebitereste se avrei pagato.', 'La bolletta è molto carina.'] },
            de: { prompt: 'Was ist das Problem mit Ihrer Rechnung?', answer: 'Mir wurde dieselbe Leistung zweimal berechnet.', wrong: ['Man würde mir berechnen, wenn ich bezahlt würde.', 'Die Rechnung ist sehr hübsch.'] }
        }
    }
];
