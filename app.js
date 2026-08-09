const pads = [
  { label: "C", relative: "Am", source: "D\u00f3", files: { ambient: "D\u00f3.wav", foundation: "C.mp3", organic: "C.mp3", studio: "C.mp3" }, frequency: 261.63 },
  { label: "C#", relative: "A#m", source: "D\u00f3#", files: { ambient: "D\u00f3#.wav", foundation: "C#.mp3", organic: "Db.mp3", studio: "Cs.mp3" }, frequency: 277.18 },
  { label: "D", relative: "Bm", source: "R\u00e9", files: { ambient: "R\u00e9.wav", foundation: "D.mp3", organic: "D.mp3", studio: "D.mp3" }, frequency: 293.66 },
  { label: "D#", relative: "Cm", source: "R\u00e9#", files: { ambient: "R\u00e9#.wav", foundation: "Eb.mp3", organic: "Eb.mp3", studio: "Ds.mp3" }, frequency: 311.13 },
  { label: "E", relative: "C#m", source: "Mi", files: { ambient: "Mi.wav", foundation: "E.mp3", organic: "E.mp3", studio: "E.mp3" }, frequency: 329.63 },
  { label: "F", relative: "Dm", source: "F\u00e1", files: { ambient: "F\u00e1.wav", foundation: "F.mp3", organic: "F.mp3", studio: "F.mp3" }, frequency: 349.23 },
  { label: "F#", relative: "D#m", source: "F\u00e1#", files: { ambient: "F\u00e1#.wav", foundation: "Gb.mp3", organic: "Gb.mp3", studio: "Fs.mp3" }, frequency: 369.99 },
  { label: "G", relative: "Em", source: "Sol", files: { ambient: "Sol.wav", foundation: "G.mp3", organic: "G.mp3", studio: "G.mp3" }, frequency: 392.0 },
  { label: "G#", relative: "Fm", source: "Sol#", files: { ambient: "Sol#.wav", foundation: "Ab.mp3", organic: "Ab.mp3", studio: "Gs.mp3" }, frequency: 415.3 },
  { label: "A", relative: "F#m", source: "L\u00e1", files: { ambient: "L\u00e1.wav", foundation: "A.mp3", organic: "A.mp3", studio: "A.mp3" }, frequency: 440.0 },
  { label: "A#", relative: "Gm", source: "L\u00e1#", files: { ambient: "L\u00e1#.wav", foundation: "Bb.mp3", organic: "Bb.mp3", studio: "As.mp3" }, frequency: 466.16 },
  { label: "B", relative: "G#m", source: "Si", files: { ambient: "Si.wav", foundation: "B.mp3", organic: "B.mp3", studio: "B.mp3" }, frequency: 493.88 },
];

const padLibraries = [
  { id: "foundation", name: "Foundation", folder: "assets/pads-foundations" },
  { id: "organic", name: "Organic", folder: "assets/pads-organic" },
  { id: "studio", name: "Studio", folder: "assets/pads-studio" },
];

const padsGrid = document.querySelector("#padsGrid");
const activeNote = document.querySelector("#activeNote");
const pulseRing = document.querySelector("#pulseRing");
const stopButton = document.querySelector("#stopButton");
const miniStopButton = document.querySelector("#miniStopButton");
const volumeSlider = document.querySelector("#volume");
const homeButton = document.querySelector("#homeButton");
const topHomeButton = document.querySelector("#topHomeButton");
const homeConfigButton = document.querySelector("#homeConfigButton");
const homeScreen = document.querySelector("#homeScreen");
const padsScreen = document.querySelector("#padsScreen");
const startButton = document.querySelector("#startButton");
const settingsButton = document.querySelector("#settingsButton");
const bottomSettingsButton = document.querySelector("#bottomSettingsButton");
const musicButton = document.querySelector("#musicButton");
const backToLiveButton = document.querySelector("#backToLiveButton");
const liveView = document.querySelector("#liveView");
const soundsView = document.querySelector("#soundsView");
const toneSelect = document.querySelector("#toneSelect");
const libraryList = document.querySelector("#libraryList");
const miniLibraryName = document.querySelector("#miniLibraryName");
const modeTabs = document.querySelectorAll("[data-view]");

let activePad = null;
let activeAudio = null;
let audioContext = null;
let synthNodes = null;
let currentLibrary = padLibraries[0];

const AUDIO_FADE_MS = 900;
const AUDIO_FADE_FRAME_MS = 30;
const masterGainValue = () => Number(volumeSlider.value) / 100;

function clearAudioFade(audio) {
  if (!audio?.gloryFadeTimer) return;
  window.clearInterval(audio.gloryFadeTimer);
  audio.gloryFadeTimer = null;
}

function fadeAudioTo(audio, targetVolume, duration = AUDIO_FADE_MS, onComplete) {
  if (!audio) return;

  clearAudioFade(audio);
  const startVolume = audio.volume;
  const startedAt = performance.now();

  audio.gloryFadeTimer = window.setInterval(() => {
    const progress = Math.min((performance.now() - startedAt) / duration, 1);
    audio.volume = startVolume + (targetVolume - startVolume) * progress;

    if (progress >= 1) {
      clearAudioFade(audio);
      audio.volume = targetVolume;
      onComplete?.();
    }
  }, AUDIO_FADE_FRAME_MS);
}

function fadeOutAudio(audio, shouldReset = true) {
  fadeAudioTo(audio, 0, AUDIO_FADE_MS, () => {
    audio.pause();
    if (shouldReset) audio.currentTime = 0;
  });
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
}

function showPads(view = "live") {
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
          <strong>${library.name}</strong>
          <span aria-hidden="true"></span>
        </button>
      `,
    )
    .join("");
  updateLibraryUi();
}

function updateLibraryUi() {
  miniLibraryName.textContent = currentLibrary.name;

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

  activeNote.textContent = nextPad ? `${nextPad.label}/${nextPad.relative}` : "Nenhum";
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
  if (activeAudio) {
    fadeOutAudio(activeAudio);
    activeAudio = null;
  }

  stopSynth();
  setActivePad(null);
}

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
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
  if (activeAudio) {
    fadeAudioTo(activeAudio, masterGainValue(), 160);
  }

  if (synthNodes) {
    synthNodes.gain.gain.setTargetAtTime(masterGainValue() * 0.34, audioContext.currentTime, 0.08);
  }
}

function playPad(pad) {
  if (activePad === pad) {
    stopCurrentPad();
    return;
  }

  stopCurrentPad();
  setActivePad(pad);

  const file = pad.files[currentLibrary.id];
  if (!file) {
    playSynthPad(pad);
    return;
  }
  const audio = new Audio(`${currentLibrary.folder}/${encodeURIComponent(file)}`);
  audio.loop = true;
  audio.volume = 0;
  activeAudio = audio;

  audio
    .play()
    .then(() => fadeAudioTo(audio, masterGainValue()))
    .catch(() => {
      activeAudio = null;
      playSynthPad(pad);
    });
}

function selectLibrary(libraryId) {
  currentLibrary = padLibraries.find((library) => library.id === libraryId) || padLibraries[0];
  updateLibraryUi();
  stopCurrentPad();
}

renderPads();
renderToneOptions();
renderLibraries();
lockDarkTheme();

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

startButton.addEventListener("click", () => showPads("live"));
homeConfigButton?.addEventListener("click", () => showPads("sounds"));
homeButton?.addEventListener("click", showHome);
topHomeButton.addEventListener("click", showHome);
settingsButton?.addEventListener("click", () => showPads("sounds"));
bottomSettingsButton.addEventListener("click", () => setView("sounds"));
backToLiveButton.addEventListener("click", () => setView("live"));
musicButton.addEventListener("click", () => setView("live"));
stopButton.addEventListener("click", stopCurrentPad);
miniStopButton.addEventListener("click", stopCurrentPad);
volumeSlider.addEventListener("input", updateVolume);

toneSelect.addEventListener("change", () => {
  playPad(pads[Number(toneSelect.value)]);
  setView("live");
});
