# AGENTS.md — Guía para agentes de IA

Contexto para asistentes de código (Claude Code, Copilot, Cursor, etc.) que trabajen en este repositorio. Para la descripción general, ver [README.md](README.md).

## Resumen

App web estática de aprendizaje de idiomas (francés, inglés, español, italiano y alemán) con repaso espaciado y examen de nivel CEFR (A1–C1). **JavaScript vanilla con módulos ES, sin framework, sin bundler, sin `package.json`, sin tests.** Los comentarios y los nombres de commit están en español.

- Entrada: `index.html` → `<script type="module" src="src/main.js">`.
- Ejecutar: `python -m http.server 8000` (hace falta HTTP; `file://` rompe los imports).
- No hay linter ni tests automáticos: verifica los cambios abriendo la app en el navegador.

## Reglas importantes

1. **Todo el código vive en `src/`.** El antiguo `script.js` monolítico se eliminó; sus datos (claves `_v4`) se migran en `state.js` (`migrateV4Storage`).
2. **No renombres claves de `localStorage` ni campos de datos guardados.** Hay nombres históricos que se mantienen por compatibilidad:
   - `duo_french_db_v5` (base de datos), `duo_french_sessions_v5`, `duo_french_browser_voice`, `duo_french_sound_<tipo>`.
   - En ítems de vocabulario, `fr` = palabra en el **idioma de estudio** (sea cual sea) y `es` = traducciones por idioma de interfaz.
   - `speakFrench()` en `audio.js` habla en el idioma de estudio actual.
   - Las claves de conjugación son siempre `je, tu, il, nous, vous, ils` (`CONJUGATION_KEYS`), también para otros idiomas.
   - Ítems sin `lang` se consideran francés (`itemLang()` en `state.js`).
3. **Los ids de contenido deben ser estables.** `db.seededIds` recuerda qué contenido por defecto ya se añadió, para no volver a meter lo que el usuario borró. Cambiar un id hace que reaparezca o se duplique. Los ids de `choice` y `fillWrite` se generan con un hash del texto (`stableId`), así que **editar el texto de esas filas cambia su id**.
4. **Toda migración de datos antiguos va en `state.js`** (`migrateLegacyItems`, `upgradeFromPack`). El nivel C2 se retiró: se convierte a C1.
5. **Textos de interfaz:** nunca pongas cadenas visibles a fuego en el JS. Añade la clave en los tres idiomas (`es`, `en`, `fr`) de `translations` en `src/i18n.js` y usa `t('clave', { var })`. En HTML usa `data-i18n="clave"` / `data-i18n-title`.
6. **Textos localizados en contenido:** los campos con forma `{ es, en, fr }` se muestran con `localize()` / `localizeTranslation()`.
7. **Escapa HTML** al interpolar contenido del usuario (cada módulo tiene su `escapeHTML`; en `onclick` inline usa `jsArg` de `exercises.js`).
8. Las funciones llamadas desde atributos `onclick` del HTML se exponen en `window` (ver `main.js` y los módulos).

## Arquitectura (src/)

| Módulo | Responsabilidad |
|---|---|
| `main.js` | Inicialización, `window.switchView(view)` (`home` / `practice` / `exam` / `creator`), idioma de interfaz y de estudio, tema, onboarding |
| `state.js` | Objeto `db` (una lista por categoría), `saveDB()`, `ensureLangContent()`, migraciones, guardado en archivo local (File System Access API + IndexedDB) |
| `levels.js` | `CEFR_LEVELS`, intervalos SRS (`getRequiredDays`), `isItemDue`, `matchesLevelAndSRS`, nivel desbloqueado por idioma |
| `exercises.js` | Cola de sesión, render de cada tipo de ejercicio, corrección (`checkAnswer`), reintentos, fin de sesión |
| `exam.js` | Examen de nivel: `LEVEL_PLAN`, vidas, temporizador, crédito parcial, resultados |
| `home.js` | Panel de Inicio y onboarding |
| `creator.js` | CRUD del contenido del usuario y exportación JSON |
| `dictionary.js` | Búsqueda local → MyMemory → Wiktionary; guarda palabras como `vocab` y frases como `order` |
| `i18n.js` | `translations`, `t()`, idioma de interfaz/estudio, tema |
| `audio.js` | TTS, reconocimiento de voz, sonidos |
| `textCompare.js` | Similitud de texto (`speechPercent`, `normalizeSpoken`) |
| `specialChars.js` | Teclas de acentos por idioma |

Categorías de contenido (`CONTENT_CATEGORIES`): `vocab`, `conversation`, `choice`, `phonemes`, `grammar`, `fill`, `order`.

## Contenido

- `src/content/index.js` construye el paquete de cada idioma (`getPack`) combinando:
  - el archivo del idioma (`fr.js`, `en.js`…): `pronouns`, `phonemes`, `grammar`, `fill`, `order`, y filas compactas `choice` y `fillWrite`;
  - `vocabulary.js` (`VOCAB_CONCEPTS`) y `conversations.js` (`CONVERSATION_SCENES`), compartidos: cada concepto/escena trae su texto en todos los idiomas.
- Formatos compactos (ver comentarios en cada archivo):
  - `choice`: `[nivel, enunciado, respuesta, "distractor|distractor"]`
  - `fillWrite`: `[nivel, "frase con ___ (infinitivo)", "respuesta|alternativa"]`
  - Examen (`content/exam/<lang>.js`): `conj`, `mc`, `write`, `speak` (formato documentado en la cabecera de cada archivo). Cada banco tiene trampas propias de su idioma; no son traducciones entre sí.
- Niveles válidos: `A1`, `A2`, `B1`, `B2`, `C1`. Temas: ver `TOPIC_KEYS` en `content/index.js`.
- Para añadir un idioma de estudio, seguir los pasos del README.

## Interfaz de ejercicios y examen

- La cinta inferior fija (`#bottom-drawer` en práctica, `.exam-action-bar` en el examen) **solo contiene el botón** de comprobar/continuar, para que no cambie de alto ni de posición en móvil.
- La corrección va **debajo del ejercicio**: `#feedback-content` en práctica (usar `showFeedback()` / `hideFeedback()` de `exercises.js`) y `#exam-feedback` en el examen.

## Convenciones

- Indentación de 4 espacios, comillas simples en JS nuevo (el contenido antiguo mezcla dobles).
- Comentarios breves en español, encabezando cada módulo con `// --- Módulo de ... ---`.
- Mantén los cambios dentro del estilo existente: funciones pequeñas exportadas, sin dependencias externas ni herramientas de build.
- Si añades texto de interfaz, CSS o HTML, revisa que funcione en modo claro y oscuro y en móvil.
