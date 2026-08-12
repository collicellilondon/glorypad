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
const tunerView = document.querySelector("#tunerView");
const toneSelect = document.querySelector("#toneSelect");
const languageSelect = document.querySelector("#languageSelect");
const libraryList = document.querySelector("#libraryList");
const miniLibraryName = document.querySelector("#miniLibraryName");
const modeTabs = document.querySelectorAll("[data-view]");
const instrumentSelect = document.querySelector("#instrumentSelect");
const instrumentCards = document.querySelector("#instrumentCards");
const tunerStatusDot = document.querySelector("#tunerStatusDot");
const tunerStage = document.querySelector("#tunerStage");
const tunerPrompt = document.querySelector("#tunerPrompt");
const tunerNote = document.querySelector("#tunerNote");
const tunerNoteDetail = document.querySelector("#tunerNoteDetail");
const tunerFrequency = document.querySelector("#tunerFrequency");
const tunerNeedle = document.querySelector("#tunerNeedle");
const tunerCents = document.querySelector("#tunerCents");
const tunerStrings = document.querySelector("#tunerStrings");
const chromaticNotesElement = document.querySelector("#chromaticNotes");

let activePad = null;
let activeAudio = null;
let audioContext = null;
let synthNodes = null;
let currentLibrary = padLibraries[0];
let splashTimer = null;
const managedAudios = new Set();
let currentLanguage = localStorage.getItem("gloryPadLanguage") || "pt-BR";
let currentView = "live";
let tunerController = null;
let tunerState = null;
let tunerFrame = null;
let currentInstrument = window.GloryPadTunerCore?.instruments?.[0] || null;
let isInstrumentCarouselOpen = false;
const TUNER_MIN_CENTS = -50;
const TUNER_MAX_CENTS = 50;
const TUNER_IN_TUNE_CENTS = 5;
const TUNER_MAX_NEEDLE_ANGLE = 20;
const CHROMATIC_NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

const translations = {
  "pt-BR": {
    activePad: "Pad ativo",
    appEntry: "Entrada do app",
    appModes: "Modos do app",
    backToEntry: "Voltar para entrada",
    backToLive: "Voltar ao vivo",
    collections: "Coleções",
    chromaticNotes: "Notas cromáticas",
    keyRelative: "Tom / relativa",
    language: "Idioma",
    live: "Ao Vivo",
    livePads: "Pads ao vivo",
    none: "Nenhum",
    centsMeter: "Medidor de cents",
    comingSoon: "Em breve",
    flatHint: "Grave",
    flatLabel: "b Baixo",
    inTuneHint: "Afinado",
    instrument: "Instrumento",
    instrumentStrings: "Cordas do instrumento",
    playString: "Toque a corda",
    selectInstrument: "Selecione o instrumento",
    sharpHint: "Agudo",
    sharpLabel: "# Agudo",
    soundList: "Lista de sons",
    sounds: "Sons",
    twelveKeys: "Pads das 12 tonalidades",
    tuner: "Afinador",
    tunerMicError: "Permita o microfone para usar o afinador",
    tunerPrivacy: "O audio do microfone e processado localmente e nunca e gravado ou enviado.",
    tunerTool: "Ferramenta",
    volume: "Volume",
  },
  en: {
    activePad: "Active pad",
    appEntry: "App intro",
    appModes: "App modes",
    backToEntry: "Back to intro",
    backToLive: "Back to live",
    collections: "Collections",
    chromaticNotes: "Chromatic notes",
    keyRelative: "Key / relative",
    language: "Language",
    live: "Live",
    livePads: "Live pads",
    none: "None",
    centsMeter: "Cents meter",
    comingSoon: "Coming soon",
    flatHint: "Flat",
    flatLabel: "b Low",
    inTuneHint: "In tune",
    instrument: "Instrument",
    instrumentStrings: "Instrument strings",
    playString: "Play a string",
    selectInstrument: "Select instrument",
    sharpHint: "Sharp",
    sharpLabel: "# High",
    soundList: "Sound list",
    sounds: "Sounds",
    twelveKeys: "Pads for the 12 keys",
    tuner: "Tuner",
    tunerMicError: "Allow microphone access to use the tuner",
    tunerPrivacy: "Microphone audio is processed locally and is never recorded or sent.",
    tunerTool: "Tool",
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
const DEFAULT_LOOP_CROSSFADE_MS = 9000;
const LOOP_START_GUARD_MS = 420;
const DEFAULT_MASTER_VOLUME = 0.75;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const readStoredVolume = () => {
  const storedVolume = Number(localStorage.getItem("gloryPadMasterVolume"));
  return Number.isFinite(storedVolume) ? clamp(storedVolume, 0, 1) : DEFAULT_MASTER_VOLUME;
};
let masterVolume = readStoredVolume();
const masterGainValue = () => masterVolume;
const smoothFade = (progress) => progress * progress * progress * (progress * (progress * 6 - 15) + 10);
const t = (key) => translations[currentLanguage]?.[key] || translations["pt-BR"][key] || key;

if (volumeSlider) {
  volumeSlider.value = String(Math.round(masterVolume * 100));
}

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

  const crossfadeMs = Math.min(library.loopCrossfadeMs || DEFAULT_LOOP_CROSSFADE_MS, durationMs * 0.42);
  const nextStartDelayMs = Math.max(durationMs - crossfadeMs - LOOP_START_GUARD_MS, 0);
  const nextAudio = new Audio(audio.currentSrc || audio.src);
  nextAudio.preload = "auto";
  nextAudio.volume = 0;
  nextAudio.gloryFadeGain = 0;
  nextAudio.gloryFadeTargetGain = 1;
  nextAudio.load();

  audio.gloryLoopTimer = window.setTimeout(() => {
    if (!managedAudios.has(audio) || audio.gloryIsFadingOut) return;

    managedAudios.add(nextAudio);
    configureAudioLoop(nextAudio, library);
    activeAudio = nextAudio;

    nextAudio
      .play()
      .then(() => {
        fadeAudioTo(nextAudio, 1, crossfadeMs);
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

function syncAudioVolume(audio) {
  if (!audio) return;
  const fadeGain = Number.isFinite(audio.gloryFadeGain) ? audio.gloryFadeGain : 1;
  audio.volume = clamp(fadeGain * masterGainValue(), 0, 1);
}

function fadeAudioTo(audio, targetVolume, duration = AUDIO_FADE_IN_MS, onComplete) {
  if (!audio) return;

  clearAudioFade(audio);
  const startVolume = clamp(
    Number.isFinite(audio.gloryFadeGain) ? audio.gloryFadeGain : audio.volume / Math.max(masterGainValue(), 0.001),
    0,
    1,
  );
  const startedAt = performance.now();
  audio.gloryFadeTargetGain = clamp(targetVolume, 0, 1);

  audio.gloryFadeTimer = window.setInterval(() => {
    const progress = Math.min((performance.now() - startedAt) / duration, 1);
    const easedProgress = smoothFade(progress);
    audio.gloryFadeGain = startVolume + (audio.gloryFadeTargetGain - startVolume) * easedProgress;
    syncAudioVolume(audio);

    if (progress >= 1) {
      clearAudioFade(audio);
      audio.gloryFadeGain = audio.gloryFadeTargetGain;
      syncAudioVolume(audio);
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
  stopTuner();
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
  const isSounds = view === "sounds";
  const isTuner = view === "tuner";
  currentView = view;

  if (isTuner) {
    stopCurrentPad();
    startTuner();
  } else {
    stopTuner();
  }

  liveView.classList.toggle("is-hidden", !isLive);
  soundsView.classList.toggle("is-hidden", !isSounds);
  tunerView.classList.toggle("is-hidden", !isTuner);

  modeTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
}

function renderInstrumentOptions() {
  if (!instrumentSelect || !window.GloryPadTunerCore) return;

  instrumentSelect.innerHTML = window.GloryPadTunerCore.instruments
    .map((instrument) => {
      const suffix = instrument.available ? "" : ` - ${t("comingSoon")}`;
      return `<option value="${instrument.id}" ${instrument.available ? "" : "disabled"}>${instrument.name}${suffix}</option>`;
    })
    .join("");

  instrumentSelect.value = currentInstrument?.id || "guitar-standard";
  renderInstrumentCards();
}

function renderInstrumentCards() {
  if (!instrumentCards || !window.GloryPadTunerCore) return;

  const instruments = window.GloryPadTunerCore.instruments;
  const activeIndex = Math.max(0, instruments.findIndex((instrument) => instrument.id === currentInstrument?.id));
  const visibleInstruments = isInstrumentCarouselOpen
    ? [-2, -1, 0, 1, 2].map((offset) => ({
        offset,
        instrument: instruments[(activeIndex + offset + instruments.length) % instruments.length],
      }))
    : [{ offset: 0, instrument: currentInstrument || instruments[0] }];

  instrumentCards.classList.toggle("is-open", isInstrumentCarouselOpen);
  instrumentCards.innerHTML = visibleInstruments
    .map(({ instrument, offset }) => {
      const isSelected = currentInstrument?.id === instrument.id;
      return `
        <button
          class="instrument-card ${isSelected ? "is-selected" : ""}"
          type="button"
          data-instrument-id="${instrument.id}"
          data-carousel-offset="${offset}"
          ${instrument.available ? "" : "disabled"}
          aria-pressed="${String(isSelected)}"
          aria-expanded="${String(isSelected && isInstrumentCarouselOpen)}"
        >
          <span class="instrument-card-copy">
            <strong>${instrument.name}</strong>
            <small>${instrument.available ? "Standard" : t("comingSoon")}</small>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderTunerStrings() {
  if (!tunerStrings || !currentInstrument) return;
  tunerStrings.innerHTML = "";
}

function renderChromaticNotes() {
  if (!chromaticNotesElement) return;

  chromaticNotesElement.innerHTML = CHROMATIC_NOTES.map(
    (note) => `
      <span class="chromatic-note" data-note="${note}">
        ${note}
      </span>
    `,
  ).join("");
  chromaticNotesElement.style.setProperty("--active-note-index", "0");
}

function getTuningHint(status, cents, isReliable) {
  if (!isReliable) return t("playString");
  if (Math.abs(cents) <= TUNER_IN_TUNE_CENTS) return t("inTuneHint");
  if (cents <= -35) return currentLanguage === "en" ? "Very flat" : "Muito grave";
  if (cents < -TUNER_IN_TUNE_CENTS) return t("flatHint");
  if (cents >= 35) return currentLanguage === "en" ? "Very sharp" : "Muito agudo";
  if (cents > TUNER_IN_TUNE_CENTS) return t("sharpHint");
  return currentLanguage === "en" ? "Almost there" : "Quase lá";
}

function updateChromaticNotes(activeNote, isReliable) {
  if (!chromaticNotesElement) return;

  const activeIndex = CHROMATIC_NOTES.indexOf(activeNote);
  chromaticNotesElement.classList.toggle("has-active-note", isReliable && activeIndex >= 0);
  if (activeIndex >= 0) chromaticNotesElement.style.setProperty("--active-note-index", String(activeIndex));

  chromaticNotesElement.querySelectorAll(".chromatic-note").forEach((element) => {
    element.classList.toggle("is-active", isReliable && element.dataset.note === activeNote);
  });
}

function getTunerController() {
  if (!tunerController && window.GloryPadTunerAudio && currentInstrument) {
    tunerController = new window.GloryPadTunerAudio.TunerController({
      engine: new window.GloryPadTunerAudio.TunerEngine(currentInstrument),
      onState: (state) => {
        tunerState = state;
      },
    });
  }

  return tunerController;
}

async function startTuner() {
  if (!window.GloryPadTunerAudio || !window.GloryPadTunerCore) return;

  tunerStatusDot?.classList.add("is-listening");
  tunerState = tunerState || getTunerController()?.engine.getState();
  startTunerRenderLoop();

  try {
    await getTunerController().start();
  } catch (error) {
    tunerStatusDot?.classList.remove("is-listening");
    tunerState = {
      reliable: false,
      status: "NO_SIGNAL",
      message: t("tunerMicError"),
      note: "--",
      noteLabel: "",
      displayCents: 0,
      cents: 0,
      frequencyHz: null,
      stringNumber: null,
    };
    updateTunerUi(tunerState);
  }
}

async function stopTuner() {
  if (tunerFrame) {
    window.cancelAnimationFrame(tunerFrame);
    tunerFrame = null;
  }

  tunerStatusDot?.classList.remove("is-listening");

  if (tunerController) {
    await tunerController.stop();
  }
}

function startTunerRenderLoop() {
  if (tunerFrame) return;

  const render = () => {
    updateTunerUi(tunerState || getTunerController()?.engine.getState());
    tunerFrame = window.requestAnimationFrame(render);
  };

  tunerFrame = window.requestAnimationFrame(render);
}

function updateTunerUi(state) {
  if (!state || !tunerStage) return;

  const isReliable = Boolean(state.reliable);
  const status = state.status || "NO_SIGNAL";
  const cents = Number.isFinite(state.cents) ? Math.round(state.cents) : 0;
  const displayCents = Number.isFinite(state.displayCents) ? state.displayCents : 0;
  const hint = getTuningHint(status, cents, isReliable);
  const needleAngle = (Math.max(TUNER_MIN_CENTS, Math.min(TUNER_MAX_CENTS, displayCents)) / TUNER_MAX_CENTS) * TUNER_MAX_NEEDLE_ANGLE;

  tunerStage.classList.toggle("is-flat", status === "FLAT");
  tunerStage.classList.toggle("is-sharp", status === "SHARP");
  tunerStage.classList.toggle("is-in-tune", status === "IN_TUNE");
  tunerStage.classList.toggle("has-signal", isReliable);
  tunerStatusDot?.classList.toggle("is-locked", status === "IN_TUNE");
  tunerPrompt.textContent = hint;
  tunerNote.textContent = isReliable ? state.note : "--";
  tunerNoteDetail.textContent = isReliable && Number.isFinite(state.octave) ? state.octave : "";
  tunerFrequency.textContent = isReliable && Number.isFinite(state.frequencyHz) ? `${state.frequencyHz.toFixed(1)} Hz` : "-- Hz";
  tunerCents.textContent = isReliable ? `${cents > 0 ? "+" : ""}${cents} cents` : "0 cents";
  tunerNeedle.style.transform = `rotate(${needleAngle}deg)`;
  updateChromaticNotes(state.note, isReliable);

  document.querySelectorAll(".tuner-string").forEach((element) => {
    const isActiveString = isReliable && Number(element.dataset.stringNumber) === state.stringNumber;
    element.classList.toggle("is-active", isActiveString);
    element.classList.toggle("is-in-tune", isActiveString && status === "IN_TUNE");
    element.classList.toggle("is-out-tune", isActiveString && status !== "IN_TUNE");
  });

  instrumentCards?.style.setProperty("--active-tuner-state", status === "IN_TUNE" ? "var(--tuner-lock)" : "var(--tuner-alert)");
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
      (library, index) => `
        <button class="library-row" type="button" data-library-id="${library.id}" aria-pressed="${library.id === currentLibrary.id}">
          <span class="library-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <span class="library-copy">
            <strong>${libraryNames[library.id]?.[currentLanguage] || library.name}</strong>
            <small>${currentLanguage === "en" ? "Pad collection" : "Colecao de pads"}</small>
          </span>
          <span class="library-state" aria-hidden="true"></span>
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
  masterVolume = clamp(Number(volumeSlider.value) / 100, 0, 1);
  localStorage.setItem("gloryPadMasterVolume", String(masterVolume));

  [...managedAudios].forEach((audio) => {
    syncAudioVolume(audio);
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
  audio.gloryFadeGain = 0;
  audio.gloryFadeTargetGain = 1;
  audio.volume = 0;
  activeAudio = audio;
  managedAudios.add(audio);

  audio
    .play()
    .then(() => {
      if (hadSynthPad) stopSynth();
      fadeAudioTo(audio, 1, AUDIO_FADE_IN_MS);
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
  renderInstrumentOptions();
  renderChromaticNotes();
  setActivePad(activePad);
  updateTunerUi(tunerState || getTunerController()?.engine.getState());
}

renderPads();
renderToneOptions();
renderLibraries();
renderInstrumentOptions();
renderTunerStrings();
renderChromaticNotes();
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
instrumentSelect?.addEventListener("change", () => {
  const nextInstrument = window.GloryPadTunerCore?.instruments.find((instrument) => instrument.id === instrumentSelect.value);
  if (!nextInstrument?.available) {
    instrumentSelect.value = currentInstrument?.id || "guitar-standard";
    return;
  }

  currentInstrument = nextInstrument;
  isInstrumentCarouselOpen = false;
  getTunerController()?.setInstrument(currentInstrument);
  renderInstrumentCards();
  renderTunerStrings();
  updateTunerUi(getTunerController()?.engine.getState());
});

instrumentCards?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-instrument-id]");
  if (!button) return;
  if (button.classList.contains("is-selected")) {
    isInstrumentCarouselOpen = !isInstrumentCarouselOpen;
    renderInstrumentCards();
    return;
  }
  if (button.disabled) return;
  instrumentSelect.value = button.dataset.instrumentId;
  instrumentSelect.dispatchEvent(new Event("change"));
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopTuner();
  } else if (currentView === "tuner") {
    startTuner();
  }
});

toneSelect.addEventListener("change", () => {
  playPad(pads[Number(toneSelect.value)]);
  setView("live");
});
