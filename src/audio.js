// --- Módulo de Audio, Voz (TTS) y Reconocimiento (STT) ---

import { showToast } from './state.js';
import { t, getStudyLang, getStudyLangCode, getStudyLangName } from './i18n.js';

let globalAudioCtx = null;
let browserVoices = [];
let speechRecognitionInstance = null;

export function handleSoundUpload(event, type) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 1500000) {
            showToast(t('soundTooLarge'));
            event.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                localStorage.setItem(`duo_french_sound_${type}`, e.target.result);
                showToast(t('soundSaved'));
            } catch (err) {
                showToast(t('storageFull'));
            }
        };
        reader.readAsDataURL(file);
    }
}

export function playSound(type) {
    const customSound = localStorage.getItem(`duo_french_sound_${type}`);
    if (customSound) {
        const audio = new Audio(customSound);
        audio.play().catch(() => playFallbackSynthSound(type));
    } else {
        playFallbackSynthSound(type);
    }
}

function playFallbackSynthSound(type) {
    try {
        if (!globalAudioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            globalAudioCtx = new AudioContext();
        }
        if (globalAudioCtx.state === 'suspended') {
            globalAudioCtx.resume();
        }

        const osc = globalAudioCtx.createOscillator();
        const gain = globalAudioCtx.createGain();
        osc.connect(gain);
        gain.connect(globalAudioCtx.destination);
        const now = globalAudioCtx.currentTime;

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'incorrect') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(130, now + 0.25);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'finish') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.1);
            osc.frequency.setValueAtTime(659.25, now + 0.2);
            osc.frequency.setValueAtTime(880, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    } catch (e) {
        console.warn("Audio Context Error:", e);
    }
}

export function populateBrowserVoices() {
    if ('speechSynthesis' in window) {
        let allVoices = window.speechSynthesis.getVoices();
        browserVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith(getStudyLang()));
        if (browserVoices.length === 0) browserVoices = allVoices; 

        const select = document.getElementById('browser-voice-select');
        if (!select) return;
        select.innerHTML = '';
        if (browserVoices.length === 0) {
            select.innerHTML = `<option value="">${t('noVoicesFound')}</option>`;
        } else {
            browserVoices.forEach(voice => {
                const opt = document.createElement('option');
                opt.value = voice.name;
                opt.textContent = `${voice.name} (${voice.lang})`;
                select.appendChild(opt);
            });
        }

        const savedVoice = localStorage.getItem('duo_french_browser_voice');
        if (savedVoice && browserVoices.some(v => v.name === savedVoice)) {
            select.value = savedVoice;
        } else if (browserVoices.length > 0) {
            select.value = browserVoices[0].name;
            updateVoiceSettings(); 
        }
    }
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateBrowserVoices;
}

const TEST_PHRASES = {
    fr: "Bonjour ! Bienvenue dans vos leçons de français.",
    en: "Hello! Welcome to your English lessons.",
    es: "¡Hola! Bienvenido a tus lecciones de español.",
    it: "Ciao! Benvenuto nelle tue lezioni di italiano.",
    de: "Hallo! Willkommen zu deinen Deutschstunden."
};

export function speakFrench(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getStudyLangCode();
        utterance.rate = 1.2;
        const selectedVoiceName = localStorage.getItem('duo_french_browser_voice');
        if (selectedVoiceName && browserVoices.length > 0) {
            const found = browserVoices.find(v => v.name === selectedVoiceName);
            if (found) {
                utterance.voice = found;
                utterance.lang = found.lang; 
            }
        }
        window.speechSynthesis.speak(utterance);
    }
}

export function updateVoiceSettings() {
    const browserVoice = document.getElementById('browser-voice-select').value;
    localStorage.setItem('duo_french_browser_voice', browserVoice);
    showToast(t('voiceSaved'));
}

export function testSelectedVoice() {
    speakFrench(TEST_PHRASES[getStudyLang()] || TEST_PHRASES.fr);
}

export function toggleSpeechRecognition(onResultCallback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast(t('speechNotSupported'));
        return;
    }

    const micBtn = document.getElementById('mic-trigger-btn');
    const statusText = document.getElementById('speech-status');
    const inputField = document.getElementById('user-speech-input');

    if (speechRecognitionInstance && micBtn && micBtn.classList.contains('recording')) {
        speechRecognitionInstance.stop();
        return;
    }

    speechRecognitionInstance = new SpeechRecognition();
    speechRecognitionInstance.lang = getStudyLangCode();
    speechRecognitionInstance.interimResults = true;
    speechRecognitionInstance.continuous = false;

    speechRecognitionInstance.onstart = function() {
        if (micBtn) micBtn.classList.add('recording');
        if (statusText) statusText.textContent = t('listeningSpeakNow', { lang: getStudyLangName() });
    };

    speechRecognitionInstance.onresult = function(event) {
        let currentTranscript = "";
        if (event.results && event.results.length > 0) {
            currentTranscript = event.results[event.results.length - 1][0].transcript;
        }
        if (inputField) inputField.value = currentTranscript.trim();
        if (onResultCallback) onResultCallback(currentTranscript.trim());
    };

    speechRecognitionInstance.onerror = function() {
        if (micBtn) micBtn.classList.remove('recording');
        if (statusText) statusText.textContent = t('listenError');
    };

    speechRecognitionInstance.onend = function() {
        if (micBtn) micBtn.classList.remove('recording');
        if (statusText) statusText.textContent = t('recordedEdit');
    };

    speechRecognitionInstance.start();
}
