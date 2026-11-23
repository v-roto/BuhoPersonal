// --- Vocabulario compartido por niveles CEFR ---
// Cada concepto está escrito en todos los idiomas: sirve como palabra a aprender
// en un idioma y como traducción en los demás (según el idioma de la interfaz).
// `legacy` conserva los ids de versiones anteriores (v1..v5) para no duplicar datos guardados.

export const VOCAB_CONCEPTS = [
    // A1 — Principiante
    { key: 'apple', legacy: 1, img: '🍎', topic: 'food', level: 'A1', words: { es: 'Manzana', en: 'Apple', fr: 'Pomme', it: 'Mela', de: 'Apfel' } },
    { key: 'cat', legacy: 2, img: '🐱', topic: 'animals', level: 'A1', words: { es: 'Gato', en: 'Cat', fr: 'Chat', it: 'Gatto', de: 'Katze' } },
    { key: 'car', legacy: 3, img: '🚗', topic: 'city', level: 'A1', words: { es: 'Coche', en: 'Car', fr: 'Voiture', it: 'Macchina', de: 'Auto' } },
    { key: 'book', legacy: 5, img: '📚', topic: 'study', level: 'A1', words: { es: 'Libro', en: 'Book', fr: 'Livre', it: 'Libro', de: 'Buch' } },
    { key: 'water', img: '💧', topic: 'food', level: 'A1', words: { es: 'Agua', en: 'Water', fr: 'Eau', it: 'Acqua', de: 'Wasser' } },
    { key: 'house', img: '🏠', topic: 'city', level: 'A1', words: { es: 'Casa', en: 'House', fr: 'Maison', it: 'Casa', de: 'Haus' } },
    { key: 'dog', img: '🐶', topic: 'animals', level: 'A1', words: { es: 'Perro', en: 'Dog', fr: 'Chien', it: 'Cane', de: 'Hund' } },

    { key: 'bread', img: '🍞', topic: 'food', level: 'A1', words: { es: 'Pan', en: 'Bread', fr: 'Pain', it: 'Pane', de: 'Brot' } },
    { key: 'friend', img: '🧑‍🤝‍🧑', topic: 'General', level: 'A1', words: { es: 'Amigo', en: 'Friend', fr: 'Ami', it: 'Amico', de: 'Freund' } },

    // A2 — Elemental
    { key: 'sun', legacy: 4, img: '☀️', topic: 'nature', level: 'A2', words: { es: 'Sol', en: 'Sun', fr: 'Soleil', it: 'Sole', de: 'Sonne' } },
    { key: 'rain', img: '🌧️', topic: 'nature', level: 'A2', words: { es: 'Lluvia', en: 'Rain', fr: 'Pluie', it: 'Pioggia', de: 'Regen' } },
    { key: 'train', img: '🚆', topic: 'travel', level: 'A2', words: { es: 'Tren', en: 'Train', fr: 'Train', it: 'Treno', de: 'Zug' } },
    { key: 'ticket', img: '🎫', topic: 'travel', level: 'A2', words: { es: 'Billete', en: 'Ticket', fr: 'Billet', it: 'Biglietto', de: 'Fahrkarte' } },
    { key: 'doctor', img: '🩺', topic: 'health', level: 'A2', words: { es: 'Médico', en: 'Doctor', fr: 'Médecin', it: 'Medico', de: 'Arzt' } },

    { key: 'market', img: '🛒', topic: 'city', level: 'A2', words: { es: 'Mercado', en: 'Market', fr: 'Marché', it: 'Mercato', de: 'Markt' } },
    { key: 'weekend', img: '📆', topic: 'General', level: 'A2', words: { es: 'Fin de semana', en: 'Weekend', fr: 'Week-end', it: 'Fine settimana', de: 'Wochenende' } },
    { key: 'hospital', img: '🏥', topic: 'health', level: 'A2', words: { es: 'Hospital', en: 'Hospital', fr: 'Hôpital', it: 'Ospedale', de: 'Krankenhaus' } },

    // B1 — Intermedio
    { key: 'job', img: '💼', topic: 'work', level: 'B1', words: { es: 'Trabajo', en: 'Job', fr: 'Travail', it: 'Lavoro', de: 'Arbeit' } },
    { key: 'meeting', img: '🗓️', topic: 'work', level: 'B1', words: { es: 'Reunión', en: 'Meeting', fr: 'Réunion', it: 'Riunione', de: 'Besprechung' } },
    { key: 'neighborhood', img: '🏘️', topic: 'city', level: 'B1', words: { es: 'Barrio', en: 'Neighborhood', fr: 'Quartier', it: 'Quartiere', de: 'Viertel' } },
    { key: 'luggage', img: '🧳', topic: 'travel', level: 'B1', words: { es: 'Equipaje', en: 'Luggage', fr: 'Bagages', it: 'Bagaglio', de: 'Gepäck' } },
    { key: 'appointment', img: '📅', topic: 'health', level: 'B1', words: { es: 'Cita', en: 'Appointment', fr: 'Rendez-vous', it: 'Appuntamento', de: 'Termin' } },

    { key: 'experience', img: '🧭', topic: 'General', level: 'B1', words: { es: 'Experiencia', en: 'Experience', fr: 'Expérience', it: 'Esperienza', de: 'Erfahrung' } },
    { key: 'advice', img: '💬', topic: 'General', level: 'B1', words: { es: 'Consejo', en: 'Advice', fr: 'Conseil', it: 'Consiglio', de: 'Rat' } },
    { key: 'salary', img: '💶', topic: 'work', level: 'B1', words: { es: 'Sueldo', en: 'Salary', fr: 'Salaire', it: 'Stipendio', de: 'Gehalt' } },

    // B2 — Intermedio alto
    { key: 'environment', img: '🌍', topic: 'society', level: 'B2', words: { es: 'Medio ambiente', en: 'Environment', fr: 'Environnement', it: 'Ambiente', de: 'Umwelt' } },
    { key: 'goal', img: '🎯', topic: 'work', level: 'B2', words: { es: 'Objetivo', en: 'Goal', fr: 'Objectif', it: 'Obiettivo', de: 'Ziel' } },
    { key: 'skill', img: '🛠️', topic: 'work', level: 'B2', words: { es: 'Habilidad', en: 'Skill', fr: 'Compétence', it: 'Competenza', de: 'Fähigkeit' } },
    { key: 'advertising', img: '📢', topic: 'society', level: 'B2', words: { es: 'Publicidad', en: 'Advertising', fr: 'Publicité', it: 'Pubblicità', de: 'Werbung' } },
    { key: 'research', img: '🔬', topic: 'study', level: 'B2', words: { es: 'Investigación', en: 'Research', fr: 'Recherche', it: 'Ricerca', de: 'Forschung' } },

    { key: 'pollution', img: '🏭', topic: 'society', level: 'B2', words: { es: 'Contaminación', en: 'Pollution', fr: 'Pollution', it: 'Inquinamento', de: 'Verschmutzung' } },
    { key: 'unemployment', img: '📉', topic: 'society', level: 'B2', words: { es: 'Desempleo', en: 'Unemployment', fr: 'Chômage', it: 'Disoccupazione', de: 'Arbeitslosigkeit' } },
    { key: 'law', img: '⚖️', topic: 'society', level: 'B2', words: { es: 'Ley', en: 'Law', fr: 'Loi', it: 'Legge', de: 'Gesetz' } },

    // C1 — Avanzado
    { key: 'challenge', img: '🧗', topic: 'society', level: 'C1', words: { es: 'Desafío', en: 'Challenge', fr: 'Défi', it: 'Sfida', de: 'Herausforderung' } },
    { key: 'awareness', img: '💡', topic: 'society', level: 'C1', words: { es: 'Conciencia', en: 'Awareness', fr: 'Prise de conscience', it: 'Consapevolezza', de: 'Bewusstsein' } },
    { key: 'negotiation', img: '🤝', topic: 'work', level: 'C1', words: { es: 'Negociación', en: 'Negotiation', fr: 'Négociation', it: 'Trattativa', de: 'Verhandlung' } },
    { key: 'reliable', img: '✅', topic: 'language', level: 'C1', words: { es: 'Fiable', en: 'Reliable', fr: 'Fiable', it: 'Affidabile', de: 'Zuverlässig' } },
    { key: 'achieve', img: '🏆', topic: 'language', level: 'C1', words: { es: 'Lograr', en: 'To achieve', fr: 'Atteindre', it: 'Raggiungere', de: 'Erreichen' } },

    { key: 'bias', img: '🙈', topic: 'society', level: 'C1', words: { es: 'Sesgo', en: 'Bias', fr: 'Biais', it: 'Pregiudizio', de: 'Voreingenommenheit' } },
    { key: 'sustainable', img: '♻️', topic: 'society', level: 'C1', words: { es: 'Sostenible', en: 'Sustainable', fr: 'Durable', it: 'Sostenibile', de: 'Nachhaltig' } },
    { key: 'feasible', img: '🧩', topic: 'work', level: 'C1', words: { es: 'Viable', en: 'Feasible', fr: 'Faisable', it: 'Fattibile', de: 'Machbar' } },

    // C2 — Maestría
    { key: 'nuance', img: '🎨', topic: 'language', level: 'C2', words: { es: 'Matiz', en: 'Nuance', fr: 'Nuance', it: 'Sfumatura', de: 'Nuance' } },
    { key: 'ephemeral', img: '⏳', topic: 'language', level: 'C2', words: { es: 'Efímero', en: 'Ephemeral', fr: 'Éphémère', it: 'Effimero', de: 'Vergänglich' } },
    { key: 'serendipity', img: '🍀', topic: 'language', level: 'C2', words: { es: 'Serendipia', en: 'Serendipity', fr: 'Sérendipité', it: 'Serendipità', de: 'Glücklicher Zufall' } },
    { key: 'undermine', img: '🧱', topic: 'society', level: 'C2', words: { es: 'Socavar', en: 'To undermine', fr: 'Saper', it: 'Minare', de: 'Untergraben' } },
    { key: 'thorough', img: '🔎', topic: 'language', level: 'C2', words: { es: 'Minucioso', en: 'Thorough', fr: 'Minutieux', it: 'Accurato', de: 'Gründlich' } },
    { key: 'ubiquitous', img: '🌐', topic: 'language', level: 'C2', words: { es: 'Omnipresente', en: 'Ubiquitous', fr: 'Omniprésent', it: 'Onnipresente', de: 'Allgegenwärtig' } },
    { key: 'mitigate', img: '🛡️', topic: 'language', level: 'C2', words: { es: 'Mitigar', en: 'To mitigate', fr: 'Atténuer', it: 'Mitigare', de: 'Abmildern' } },
    { key: 'cumbersome', img: '🐘', topic: 'language', level: 'C2', words: { es: 'Engorroso', en: 'Cumbersome', fr: 'Encombrant', it: 'Ingombrante', de: 'Umständlich' } }
];
