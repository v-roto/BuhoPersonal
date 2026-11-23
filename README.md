# 🦉 Búho Personal

**Búho Personal** es una aplicación web para aprender idiomas con **repaso espaciado (SRS)**, ejercicios variados y un **examen de nivel CEFR**. Funciona entera en el navegador: no necesita servidor, cuenta ni instalación, y guarda tu progreso en el propio dispositivo.

## ✨ Características

- **5 idiomas de estudio:** francés, inglés, español, italiano y alemán.
- **Interfaz en 3 idiomas:** español, inglés y francés (botón 🌐).
- **Niveles CEFR A1 → C1:** el contenido está organizado por nivel; tu nivel en cada idioma lo fija el examen o eliges empezar en A1.
- **Examen de ubicación:** hasta 60 preguntas (15 por bloque), 3 vidas y 30 minutos. Incluye conjugación, opción múltiple, escritura y lectura en voz alta (B1+).
- **Práctica con repetición espaciada:** cada ítem tiene una puntuación de 0 a 5; los intervalos de repaso son 0, 1, 4, 12, 30 y 90 días. Los ítems de niveles inferiores que aún no dominas vuelven a aparecer para evitar huecos.
- **Tipos de ejercicio:** vocabulario (emparejar/traducir), conversaciones, opción múltiple, fonemas, conjugación, completar oraciones y ordenar palabras.
- **Voz:** pronunciación con síntesis de voz (TTS) y ejercicios de habla con reconocimiento de voz (STT) del navegador.
- **Diccionario/traductor:** busca primero en tu contenido y luego en línea (MyMemory + Wiktionary); puedes guardar palabras o frases como ejercicios nuevos.
- **Editor de contenido:** añade, edita y exporta tus propios ejercicios.
- **Teclas de caracteres especiales** por idioma (é, ñ, ß, ç…).
- **Modo claro / oscuro.**
- **Guardado en archivo local** (opcional) mediante la File System Access API, además de `localStorage`.

## 🚀 Cómo ejecutarlo

No hay dependencias ni paso de compilación. Como usa módulos ES (`<script type="module">`), hay que servirlo por HTTP (abrir `index.html` con `file://` no funciona):

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node
npx serve .
```

Luego abre <http://localhost:8000>.

> El reconocimiento de voz y el guardado en archivo local funcionan mejor en navegadores basados en Chromium (Chrome, Edge).

## 📁 Estructura

```
index.html            Estructura de todas las vistas (Inicio, Práctica, Examen, Contenido, modales)
styles.css            Estilos (incluye temas claro/oscuro)
src/
  main.js             Punto de entrada: navegación entre vistas, idioma, tema, bienvenida
  state.js            Base de datos en localStorage, migraciones, guardado en archivo local
  levels.js           Niveles CEFR y lógica de repaso espaciado
  exercises.js        Sesiones de práctica y corrección de ejercicios
  exam.js             Examen de nivel
  home.js             Panel de Inicio y bienvenida (onboarding)
  creator.js          Editor de contenido del usuario
  dictionary.js       Diccionario / traductor
  i18n.js             Textos de la interfaz (es/en/fr), idioma de estudio y tema
  audio.js            TTS, reconocimiento de voz y sonidos
  textCompare.js      Comparación de texto hablado/escrito
  specialChars.js     Barra de caracteres especiales por idioma
  flags.js            Banderas SVG
  langDropdown.js     Selector de idioma
  content/
    index.js          Registro de paquetes por idioma y generación del contenido por defecto
    fr.js en.js es.js it.js de.js   Contenido propio de cada idioma
    vocabulary.js     Vocabulario compartido (cada concepto en todos los idiomas)
    conversations.js  Conversaciones compartidas por nivel
    exam/             Bancos de preguntas del examen por idioma
```

## 🌍 Añadir un idioma de estudio

1. Crea `src/content/<código>.js` con la misma forma que `fr.js`.
2. Añade la columna del idioma en `vocabulary.js` y `conversations.js`.
3. Regístralo en `LANG_PACKS` (`src/content/index.js`).
4. Crea su banco de examen en `src/content/exam/<código>.js` y regístralo en `exam/index.js`.
5. Añade sus caracteres especiales en `specialChars.js` y su bandera en `flags.js`.

## 💾 Datos y privacidad

Todo el progreso se guarda en el `localStorage` del navegador (y, si lo activas, en un archivo JSON local). Solo el diccionario hace peticiones externas, enviando el texto buscado a MyMemory y Wiktionary.

## 📄 Licencia

[MIT](LICENSE)
