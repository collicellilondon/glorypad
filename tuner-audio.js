(function initGloryPadTunerAudio(globalScope) {
  const core = globalScope.GloryPadTunerCore;

  const DETECTION_CONFIG = {
    fftSize: 16384,
    minFrequency: 65,
    maxFrequency: 370,
    rmsThreshold: 0.0055,
    confidenceThreshold: 0.56,
    yinThreshold: 0.2,
    inputGain: 2.35,
    smoothingAlpha: 0.3,
    staleFrameLimit: 16,
    analysisIntervalMs: 24,
  };

  class AudioInputService {
    constructor() {
      this.audioContext = null;
      this.analyser = null;
      this.stream = null;
      this.source = null;
      this.gain = null;
    }

    async start() {
      if (this.stream && this.analyser && this.audioContext) return this.getInput();

      const AudioContextConstructor = globalScope.AudioContext || globalScope.webkitAudioContext;
      if (!AudioContextConstructor) {
        throw new Error("AudioContext is not available in this browser.");
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone capture is not available in this browser.");
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });

      this.audioContext = new AudioContextConstructor();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = DETECTION_CONFIG.fftSize;
      this.analyser.smoothingTimeConstant = 0;
      this.gain = this.audioContext.createGain();
      this.gain.gain.value = DETECTION_CONFIG.inputGain;
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.gain);
      this.gain.connect(this.analyser);

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      return this.getInput();
    }

    getInput() {
      return {
        analyser: this.analyser,
        audioContext: this.audioContext,
      };
    }

    async stop() {
      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }

      if (this.gain) {
        this.gain.disconnect();
        this.gain = null;
      }

      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }

      if (this.audioContext) {
        await this.audioContext.close().catch(() => {});
        this.audioContext = null;
      }

      this.analyser = null;
    }
  }

  class PitchDetectionService {
    constructor(config = DETECTION_CONFIG) {
      this.config = config;
    }

    detect(buffer, sampleRate) {
      const rms = calculateRms(buffer);
      if (!Number.isFinite(rms) || rms < this.config.rmsThreshold) {
        return { reliable: false, reason: "quiet", rms, confidence: 0, frequencyHz: null };
      }

      const pitch = detectPitchYin(buffer, sampleRate, this.config);
      if (!pitch || pitch.frequencyHz < this.config.minFrequency || pitch.frequencyHz > this.config.maxFrequency * 4) {
        return { reliable: false, reason: "range", rms, confidence: pitch?.confidence || 0, frequencyHz: pitch?.frequencyHz || null };
      }

      const reliable = pitch.confidence >= this.config.confidenceThreshold;
      return {
        reliable,
        reason: reliable ? "ok" : "unstable",
        rms,
        confidence: pitch.confidence,
        frequencyHz: pitch.frequencyHz,
      };
    }
  }

  class TunerEngine {
    constructor(instrument = core.instruments[0], config = DETECTION_CONFIG) {
      this.instrument = instrument;
      this.config = config;
      this.state = this.getIdleState();
      this.smoothedCents = null;
      this.smoothedFrequency = null;
      this.staleFrames = 0;
    }

    setInstrument(instrument) {
      if (!instrument?.available) return;
      this.instrument = instrument;
      this.reset();
    }

    reset() {
      this.state = this.getIdleState();
      this.smoothedCents = null;
      this.smoothedFrequency = null;
      this.staleFrames = 0;
    }

    getIdleState() {
      return {
        reliable: false,
        status: "NO_SIGNAL",
        message: "Toque uma corda",
        note: "--",
        noteLabel: "",
        cents: 0,
        displayCents: 0,
        frequencyHz: null,
        stringNumber: null,
        targetFrequencyHz: null,
        confidence: 0,
      };
    }

    update(detection) {
      if (!detection?.reliable || !core.isValidFrequency(detection.frequencyHz)) {
        this.staleFrames += 1;
        if (this.staleFrames >= this.config.staleFrameLimit) {
          this.reset();
        }
        return this.state;
      }

      const analysis = core.analyzeFrequency(detection.frequencyHz, this.instrument);
      if (!analysis.reliable) {
        this.staleFrames += 1;
        if (this.staleFrames >= this.config.staleFrameLimit) this.reset();
        return this.state;
      }

      const targetChanged = this.state.stringNumber !== analysis.string.stringNumber;
      if (targetChanged) {
        this.smoothedCents = analysis.cents;
        this.smoothedFrequency = analysis.correctedFrequencyHz;
      } else {
        this.smoothedCents = smoothValue(this.smoothedCents, analysis.cents, this.config.smoothingAlpha);
        this.smoothedFrequency = smoothValue(this.smoothedFrequency, analysis.correctedFrequencyHz, this.config.smoothingAlpha);
      }

      this.staleFrames = 0;
      const displayCents = Math.max(-50, Math.min(50, this.smoothedCents));
      const status = core.tuningStatus(this.smoothedCents);

      this.state = {
        reliable: true,
        status,
        message: statusMessage(status),
        note: analysis.note,
        octave: analysis.octave,
        noteLabel: analysis.noteLabel,
        cents: this.smoothedCents,
        displayCents,
        frequencyHz: this.smoothedFrequency,
        rawFrequencyHz: detection.frequencyHz,
        targetFrequencyHz: analysis.targetFrequencyHz,
        stringNumber: analysis.string.stringNumber,
        confidence: detection.confidence,
        harmonicDivisor: analysis.harmonicDivisor,
      };

      return this.state;
    }

    getState() {
      return this.state;
    }
  }

  class TunerController {
    constructor(options) {
      this.inputService = options.inputService || new AudioInputService();
      this.pitchService = options.pitchService || new PitchDetectionService();
      this.engine = options.engine || new TunerEngine();
      this.onState = options.onState || function noop() {};
      this.intervalId = null;
      this.buffer = null;
      this.running = false;
    }

    setInstrument(instrument) {
      this.engine.setInstrument(instrument);
      this.onState(this.engine.getState());
    }

    async start() {
      if (this.running) return;

      const input = await this.inputService.start();
      this.buffer = new Float32Array(input.analyser.fftSize);
      this.running = true;

      this.intervalId = globalScope.setInterval(() => {
        input.analyser.getFloatTimeDomainData(this.buffer);
        const detection = this.pitchService.detect(this.buffer, input.audioContext.sampleRate);
        const state = this.engine.update(detection);
        this.onState(state);
      }, this.pitchService.config.analysisIntervalMs);
    }

    async stop() {
      if (this.intervalId) {
        globalScope.clearInterval(this.intervalId);
        this.intervalId = null;
      }

      this.running = false;
      this.buffer = null;
      this.engine.reset();
      this.onState(this.engine.getState());
      await this.inputService.stop();
    }
  }

  function detectPitchYin(buffer, sampleRate, config) {
    const minTau = Math.max(2, Math.floor(sampleRate / (config.maxFrequency * 4)));
    const maxTau = Math.min(buffer.length - 2, Math.ceil(sampleRate / config.minFrequency));
    const yin = new Float32Array(maxTau + 1);
    let runningSum = 0;
    let tauEstimate = -1;

    for (let tau = 1; tau <= maxTau; tau += 1) {
      let difference = 0;
      for (let index = 0; index < maxTau; index += 1) {
        const delta = buffer[index] - buffer[index + tau];
        difference += delta * delta;
      }

      runningSum += difference;
      yin[tau] = runningSum === 0 ? 1 : (difference * tau) / runningSum;
    }

    for (let tau = minTau; tau <= maxTau; tau += 1) {
      if (yin[tau] < config.yinThreshold) {
        while (tau + 1 <= maxTau && yin[tau + 1] < yin[tau]) tau += 1;
        tauEstimate = tau;
        break;
      }
    }

    if (tauEstimate < 0) {
      let bestTau = minTau;
      for (let tau = minTau + 1; tau <= maxTau; tau += 1) {
        if (yin[tau] < yin[bestTau]) bestTau = tau;
      }
      tauEstimate = yin[bestTau] < 0.22 ? bestTau : -1;
    }

    if (tauEstimate < 0) return null;

    const refinedTau = parabolicTau(yin, tauEstimate);
    const frequencyHz = sampleRate / refinedTau;
    const confidence = Math.max(0, Math.min(1, 1 - yin[tauEstimate]));

    return { frequencyHz, confidence };
  }

  function calculateRms(buffer) {
    let sum = 0;
    for (let index = 0; index < buffer.length; index += 1) {
      sum += buffer[index] * buffer[index];
    }
    return Math.sqrt(sum / buffer.length);
  }

  function parabolicTau(values, tau) {
    const previous = values[tau - 1];
    const current = values[tau];
    const next = values[tau + 1];
    const divisor = previous + next - 2 * current;
    if (!Number.isFinite(divisor) || Math.abs(divisor) < 0.000001) return tau;
    return tau + (previous - next) / (2 * divisor);
  }

  function smoothValue(previous, next, alpha) {
    if (!Number.isFinite(previous)) return next;
    return previous + alpha * (next - previous);
  }

  function statusMessage(status) {
    if (status === "IN_TUNE") return "Afinado";
    if (status === "FLAT") return "Aperte a corda";
    if (status === "SHARP") return "Afrouxe a corda";
    return "Toque uma corda";
  }

  globalScope.GloryPadTunerAudio = {
    DETECTION_CONFIG,
    AudioInputService,
    PitchDetectionService,
    TunerEngine,
    TunerController,
    detectPitchYin,
  };
})(typeof window !== "undefined" ? window : globalThis);
