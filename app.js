const pads = [
  { label: "C", relative: "Am", source: "D\u00f3", files: { ambient: "D\u00f3.wav", foundation: "C.mp3", organic: "C.mp3", studio: "C.mp3", warm: "C.mp3" }, frequency: 261.63 },
  { label: "C#", relative: "A#m", source: "D\u00f3#", files: { ambient: "D\u00f3#.wav", foundation: "C#.mp3", organic: "Db.mp3", studio: "Cs.mp3", warm: "Cs.mp3" }, frequency: 277.18 },
  { label: "D", relative: "Bm", source: "R\u00e9", files: { ambient: "R\u00e9.wav", foundation: "D.mp3", organic: "D.mp3", studio: "D.mp3", warm: "D.mp3" }, frequency: 293.66 },
  { label: "D#", relative: "Cm", source: "R\u00e9#", files: { ambient: "R\u00e9#.wav", foundation: "Eb.mp3", organic: "Eb.mp3", studio: "Ds.mp3", warm: "Ds.mp3" }, frequency: 311.13 },
  { label: "E", relative: "C#m", source: "Mi", files: { ambient: "Mi.wav", foundation: "E.mp3", organic: "E.mp3", studio: "E.mp3", warm: "E.mp3" }, frequency: 329.63 },
  { label: "F", relative: "Dm", source: "F\u00e1", files: { ambient: "F\u00e1.wav", foundation: "F.mp3", organic: "F.mp3", studio: "F.mp3", warm: "F.mp3" }, frequency: 349.23 },
  { label: "F#", relative: "D#m", source: "F\u00e1#", files: { ambient: "F\u00e1#.wav", foundation: "Gb.mp3", organic: "Gb.mp3", studio: "Fs.mp3", warm: "Fs.mp3" }, frequency: 369.99 },
  { label: "G", relative: "Em", source: "Sol", files: { ambient: "Sol.wav", foundation: "G.mp3", organic: "G.mp3", studio: "G.mp3", warm: "G.mp3" }, frequency: 392.0 },
  { label: "G#", relative: "Fm", source: "Sol#", files: { ambient: "Sol#.wav", foundation: "Ab.mp3", organic: "Ab.mp3", studio: "Gs.mp3", warm: "Gs.mp3" }, frequency: 415.3 },
  { label: "A", relative: "F#m", source: "L\u00e1", files: { ambient: "L\u00e1.wav", foundation: "A.mp3", organic: "A.mp3", studio: "A.mp3", warm: "A.mp3" }, frequency: 440.0 },
  { label: "A#", relative: "Gm", source: "L\u00e1#", files: { ambient: "L\u00e1#.wav", foundation: "Bb.mp3", organic: "Bb.mp3", studio: "As.mp3", warm: "As.mp3" }, frequency: 466.16 },
  { label: "B", relative: "G#m", source: "Si", files: { ambient: "Si.wav", foundation: "B.mp3", organic: "B.mp3", studio: "B.mp3", warm: "B.mp3" }, frequency: 493.88 },
];

const padLibraries = [
  { id: "foundation", name: "Foundation", folder: "assets/pads-foundations" },
  { id: "organic", name: "Organic", folder: "assets/pads-organic" },
  { id: "studio", name: "Studio", folder: "assets/pads-studio", loopCrossfadeMs: 8000 },
  { id: "warm", name: "Warm", folder: "assets/pads-warm", loopCrossfadeMs: 8000 },
];

const padsGrid = document.querySelector("#padsGrid");
const activeNote = document.querySelector("#activeNote");
const pulseRing = document.querySelector("#pulseRing");
const volumeSlider = document.querySelector("#volume");
const homeButton = document.querySelector("#homeButton");
const topHomeButton = document.querySelector("#topHomeButton");
const homeConfigButton = document.querySelector("#homeConfigButton");
const homeScreen = document.querySelector("#homeScreen");
const padsScreen = document.querySelector("#padsScreen");
const SPLASH_DURATION_MS = 3000;
const settingsButton = document.querySelector("#settingsButton");
const backToLiveButton = document.querySelector("#backToLiveButton");
const liveView = document.querySelector("#liveView");
const soundsView = document.querySelector("#soundsView");
const toneSelect = document.querySelector("#toneSelect");
const languageSelect = document.querySelector("#languageSelect");
const libraryList = document.querySelector("#libraryList");
const miniLibraryName = document.querySelector("#miniLibraryName");
const modeTabs = document.querySelectorAll("[data-view]");

let activePad = null;
let activeAudio = null;
let audioContext = null;
let synthNodes = null;
let currentLibrary = padLibraries[0];
let splashTimer = null;
const managedAudios = new Set();
let currentLanguage = localStorage.getItem("gloryPadLanguage") || "pt-BR";

const translations = {
  "pt-BR": {
    activePad: "Pad ativo",
    appEntry: "Entrada do app",
    appModes: "Modos do app",
    backToEntry: "Voltar para entrada",
    backToLive: "Voltar ao vivo",
    collections: "Coleções",
    keyRelative: "Tom / relativa",
    language: "Idioma",
    live: "Ao Vivo",
    livePads: "Pads ao vivo",
    none: "Nenhum",
    soundList: "Lista de sons",
    sounds: "Sons",
    twelveKeys: "Pads das 12 tonalidades",
    volume: "Volume",
  },
  en: {
    activePad: "Active pad",
    appEntry: "App intro",
    appModes: "App modes",
    backToEntry: "Back to intro",
    backToLive: "Back to live",
    collections: "Collections",
    keyRelative: "Key / relative",
    language: "Language",
    live: "Live",
    livePads: "Live pads",
    none: "None",
    soundList: "Sound list",
    sounds: "Sounds",
    twelveKeys: "Pads for the 12 keys",
    volume: "Volume",
  },
};

const libraryNames = {
  foundation: { "pt-BR": "Base", en: "Foundation" },
  organic: { "pt-BR": "Orgânico", en: "Organic" },
  studio: { "pt-BR": "Estúdio", en: "Studio" },
  warm: { "pt-BR": "Warm", en: "Warm" },
};

const AUDIO_FADE_IN_MS = 5200;
const AUDIO_FADE_OUT_MS = 9200;
const STOP_FADE_MS = 1400;
const AUDIO_FADE_FRAME_MS = 30;
const masterGainValue = () => Number(volumeSlider.value) / 100;
const smoothFade = (progress) => progress * progress * progress * (progress * (progress * 6 - 15) + 10);
const t = (key) => translations[currentLanguage]?.[key] || translations["pt-BR"][key] || key;

function clearAudioFade(audio) {
  if (!audio?.gloryFadeTimer) return;
  window.clearInterval(audio.gloryFadeTimer);
  audio.gloryFadeTimer = null;
}

function clearAudioLoop(audio) {
  if (!audio) return;

  if (audio.gloryLoopTimer) {
    window.clearTimeout(audio.gloryLoopTimer);
    audio.gloryLoopTimer = null;
  }

  if (audio.gloryLoopHandler) {
    audio.removeEventListener("loadedmetadata", audio.gloryLoopHandler);
    audio.gloryLoopHandler = null;
  }
}

function configureAudioLoop(audio, library) {
  clearAudioLoop(audio);

  if (!library.loopCrossfadeMs) {
    audio.loop = true;
    return;
  }

  audio.loop = false;
  audio.gloryLoopHandler = () => scheduleSeamlessLoop(audio, library);

  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.gloryLoopHandler();
  } else {
    audio.addEventListener("loadedmetadata", audio.gloryLoopHandler, { once: true });
  }
}

function scheduleSeamlessLoop(audio, library) {
  if (!managedAudios.has(audio) || audio.gloryIsFadingOut) return;

  const durationMs = Number.isFinite(audio.duration) ? audio.duration * 1000 : 0;
  if (!durationMs) {
    audio.gloryLoopTimer = window.setTimeout(() => scheduleSeamlessLoop(audio, library), 500);
    return;
  }

  const crossfadeMs = Math.min(library.loopCrossfadeMs, durationMs * 0.4);
  const nextStartDelayMs = Math.max(durationMs - crossfadeMs, 0);

  audio.gloryLoopTimer = window.setTimeout(() => {
    if (!managedAudios.has(audio) || audio.gloryIsFadingOut) return;

    const nextAudio = new Audio(audio.currentSrc || audio.src);
    nextAudio.preload = "auto";
    configureAudioLoop(nextAudio, library);
    nextAudio.volume = 0;
    nextAudio.gloryFadeTarget = masterGainValue();
    managedAudios.add(nextAudio);
    activeAudio = nextAudio;

    nextAudio
      .play()
      .then(() => {
        fadeAudioTo(nextAudio, masterGainValue(), crossfadeMs);
        fadeOutAndDispose(audio, crossfadeMs);
      })
      .catch(() => {
        managedAudios.delete(nextAudio);
        if (activeAudio === nextAudio) activeAudio = audio;
        audio.loop = true;
      });
  }, nextStartDelayMs);
}

function fadeOutAndDispose(audio, duration, shouldReset = true) {
  if (!audio) return;
  audio.gloryIsFadingOut = true;
  clearAudioLoop(audio);
  fadeAudioTo(audio, 0, duration, () => {
    audio.pause();
    if (shouldReset) audio.currentTime = 0;
    managedAudios.delete(audio);
    audio.gloryIsFadingOut = false;
    if (activeAudio === audio) activeAudio = null;
  });
}

function fadeOutAllManagedAudios(duration = STOP_FADE_MS) {
  [...managedAudios].forEach((audio) => {
    fadeOutAndDispose(audio, duration);
  });
}

function fadeAudioTo(audio, targetVolume, duration = AUDIO_FADE_IN_MS, onComplete) {
  if (!audio) return;

  clearAudioFade(audio);
  const startVolume = audio.volume;
  const startedAt = performance.now();
  audio.gloryFadeTarget = targetVolume;

  audio.gloryFadeTimer = window.setInterval(() => {
    const progress = Math.min((performance.now() - startedAt) / duration, 1);
    const easedProgress = smoothFade(progress);
    audio.volume = startVolume + (audio.gloryFadeTarget - startVolume) * easedProgress;

    if (progress >= 1) {
      clearAudioFade(audio);
      audio.volume = audio.gloryFadeTarget;
      onComplete?.();
    }
  }, AUDIO_FADE_FRAME_MS);
}

function fadeOutAudio(audio, shouldReset = true) {
  fadeOutAndDispose(audio, AUDIO_FADE_OUT_MS, shouldReset);
}

function lockDarkTheme() {
  document.documentElement.dataset.theme = "dark";
  localStorage.removeItem("gloryPadThemeV1");
  localStorage.removeItem("wpPadsThemeV2");
}

function showHome() {
  stopCurrentPad();
  homeScreen.classList.remove("is-hidden");
  padsScreen.classList.add("is-hidden");
  window.clearTimeout(splashTimer);
  splashTimer = window.setTimeout(() => showPads("live"), SPLASH_DURATION_MS);
}

function showPads(view = "live") {
  window.clearTimeout(splashTimer);
  homeScreen.classList.add("is-hidden");
  padsScreen.classList.remove("is-hidden");
  setView(view);
}

function setView(view) {
  const isLive = view === "live";
  liveView.classList.toggle("is-hidden", !isLive);
  soundsView.classList.toggle("is-hidden", isLive);

  modeTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
}

function renderToneOptions() {
  toneSelect.innerHTML = pads
    .map((pad, index) => `<option value="${index}">${pad.label}/${pad.relative}</option>`)
    .join("");
}

function renderPads() {
  padsGrid.innerHTML = pads
    .map(
      (pad, index) => `
        <button class="pad" type="button" data-index="${index}" aria-pressed="false">
          <span class="pad-light" aria-hidden="true"></span>
          <span class="pad-note">
            <strong>${pad.label}</strong>
            <span>${pad.relative}</span>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderLibraries() {
  libraryList.innerHTML = padLibraries
    .map(
      (library) => `
        <button class="library-row" type="button" data-library-id="${library.id}" aria-pressed="${library.id === currentLibrary.id}">
          <strong>${libraryNames[library.id]?.[currentLanguage] || library.name}</strong>
          <span aria-hidden="true"></span>
        </button>
      `,
    )
    .join("");
  updateLibraryUi();
}

function updateLibraryUi() {
  miniLibraryName.textContent = libraryNames[currentLibrary.id]?.[currentLanguage] || currentLibrary.name;

  document.querySelectorAll("[data-library-id]").forEach((button) => {
    const isSelected = button.dataset.libraryId === currentLibrary.id;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function setActivePad(nextPad) {
  document.querySelectorAll(".pad").forEach((button) => {
    const isActive = nextPad && Number(button.dataset.index) === pads.indexOf(nextPad);
    button.classList.toggle("is-active", Boolean(isActive));
    button.setAttribute("aria-pressed", String(Boolean(isActive)));
  });

  activeNote.textContent = nextPad ? `${nextPad.label}/${nextPad.relative}` : t("none");
  pulseRing.classList.toggle("is-on", Boolean(nextPad));
  if (nextPad) toneSelect.value = String(pads.indexOf(nextPad));
  activePad = nextPad;
}

function stopSynth() {
  if (!synthNodes) return;

  const { gain, oscillators } = synthNodes;
  const now = audioContext.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setTargetAtTime(0, now, 0.08);
  oscillators.forEach((oscillator) => oscillator.stop(now + 0.35));
  synthNodes = null;
}

function stopCurrentPad() {
  fadeOutAllManagedAudios();
  activeAudio = null;
  stopSynth();
  setActivePad(null);
}

function ensureAudioContext() {
  if (!audioContext) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextConstructor();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playSynthPad(pad) {
  ensureAudioContext();

  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  const frequencies = [pad.frequency, pad.frequency * 1.25, pad.frequency * 1.5];

  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.7;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(masterGainValue() * 0.34, now + 0.5);

  filter.connect(gain);
  gain.connect(audioContext.destination);

  const oscillators = frequencies.map((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency / 2;
    oscillator.detune.value = index * 4;
    oscillator.connect(filter);
    oscillator.start(now);
    return oscillator;
  });

  synthNodes = { gain, oscillators };
}

function updateVolume() {
  const nextVolume = masterGainValue();

  [...managedAudios].forEach((audio) => {
    if (audio.gloryIsFadingOut) return;
    audio.gloryFadeTarget = nextVolume;
    fadeAudioTo(audio, nextVolume, 120);
  });

  if (synthNodes) {
    synthNodes.gain.gain.setTargetAtTime(masterGainValue() * 0.34, audioContext.currentTime, 0.08);
  }
}

function playPad(pad) {
  if (activePad === pad) {
    stopCurrentPad();
    return;
  }

  const outgoingAudios = [...managedAudios];
  const hadSynthPad = Boolean(synthNodes);

  setActivePad(pad);

  const file = pad.files[currentLibrary.id];
  if (!file) {
    outgoingAudios.forEach((audio) => fadeOutAudio(audio));
    if (hadSynthPad) stopSynth();
    activeAudio = null;
    playSynthPad(pad);
    return;
  }

  const audio = new Audio(`${currentLibrary.folder}/${encodeURIComponent(file)}`);
  audio.preload = "auto";
  configureAudioLoop(audio, currentLibrary);
  audio.volume = 0;
  activeAudio = audio;
  managedAudios.add(audio);

  audio
    .play()
    .then(() => {
      if (hadSynthPad) stopSynth();
      fadeAudioTo(audio, masterGainValue(), AUDIO_FADE_IN_MS);
      outgoingAudios.forEach((outgoingAudio) => fadeOutAudio(outgoingAudio));
    })
    .catch(() => {
      if (activeAudio === audio) activeAudio = null;
      outgoingAudios.forEach((outgoingAudio) => fadeOutAudio(outgoingAudio));
      if (hadSynthPad) stopSynth();
      playSynthPad(pad);
    });
}

function selectLibrary(libraryId) {
  currentLibrary = padLibraries.find((library) => library.id === libraryId) || padLibraries[0];
  updateLibraryUi();
  stopCurrentPad();
}

function applyLanguage(language) {
  currentLanguage = translations[language] ? language : "pt-BR";
  document.documentElement.lang = currentLanguage;
  localStorage.setItem("gloryPadLanguage", currentLanguage);
  languageSelect.value = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });

  renderLibraries();
  setActivePad(activePad);
}

renderPads();
renderToneOptions();
renderLibraries();
lockDarkTheme();
applyLanguage(currentLanguage);
splashTimer = window.setTimeout(() => showPads("live"), SPLASH_DURATION_MS);

padsGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".pad");
  if (!button) return;
  playPad(pads[Number(button.dataset.index)]);
});

libraryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-library-id]");
  if (!button) return;
  selectLibrary(button.dataset.libraryId);
});

modeTabs.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

homeConfigButton?.addEventListener("click", () => showPads("sounds"));
homeButton?.addEventListener("click", showHome);
topHomeButton.addEventListener("click", showHome);
settingsButton?.addEventListener("click", () => showPads("sounds"));
backToLiveButton.addEventListener("click", () => setView("live"));
volumeSlider.addEventListener("input", updateVolume);
languageSelect.addEventListener("change", () => applyLanguage(languageSelect.value));

toneSelect.addEventListener("change", () => {
  playPad(pads[Number(toneSelect.value)]);
  setView("live");
});
