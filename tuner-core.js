(function initGloryPadTunerCore(globalScope) {
  const A4_DEFAULT_HZ = 440;
  const IN_TUNE_CENTS = 5;
  const MIN_GUITAR_HZ = 65;
  const MAX_GUITAR_HZ = 370;
  const HARMONIC_DIVISORS = [1, 2, 3, 4];

  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  const instruments = [
    {
      id: "guitar-standard",
      name: "Violao / Guitarra",
      available: true,
      strings: [
        { stringNumber: 6, note: "E", octave: 2, frequency: 82.41 },
        { stringNumber: 5, note: "A", octave: 2, frequency: 110.0 },
        { stringNumber: 4, note: "D", octave: 3, frequency: 146.83 },
        { stringNumber: 3, note: "G", octave: 3, frequency: 196.0 },
        { stringNumber: 2, note: "B", octave: 3, frequency: 246.94 },
        { stringNumber: 1, note: "E", octave: 4, frequency: 329.63 },
      ],
    },
    { id: "ukulele", name: "Ukulele", available: false, strings: [] },
    { id: "bass-4", name: "Baixo 4 cordas", available: false, strings: [] },
    { id: "bass-5", name: "Baixo 5 cordas", available: false, strings: [] },
    { id: "cavaquinho", name: "Cavaquinho", available: false, strings: [] },
    { id: "banjo", name: "Banjo", available: false, strings: [] },
  ];

  function isValidFrequency(frequencyHz) {
    return Number.isFinite(frequencyHz) && frequencyHz > 0;
  }

  function log2(value) {
    return Math.log(value) / Math.LN2;
  }

  function frequencyToMidi(frequencyHz, a4Hz = A4_DEFAULT_HZ) {
    if (!isValidFrequency(frequencyHz) || !isValidFrequency(a4Hz)) return null;
    return 69 + 12 * log2(frequencyHz / a4Hz);
  }

  function midiToNoteName(midiValue) {
    if (!Number.isFinite(midiValue)) return null;
    const rounded = Math.round(midiValue);
    const note = NOTE_NAMES[((rounded % 12) + 12) % 12];
    const octave = Math.floor(rounded / 12) - 1;
    return { note, octave, label: `${note}${octave}`, midi: rounded };
  }

  function centsDifference(detectedFrequency, targetFrequency) {
    if (!isValidFrequency(detectedFrequency) || !isValidFrequency(targetFrequency)) return null;
    return 1200 * log2(detectedFrequency / targetFrequency);
  }

  function tuningStatus(cents, tolerance = IN_TUNE_CENTS) {
    if (!Number.isFinite(cents)) return "NO_SIGNAL";
    if (Math.abs(cents) <= tolerance) return "IN_TUNE";
    return cents < 0 ? "FLAT" : "SHARP";
  }

  function nearestStringForCandidate(candidateFrequency, strings) {
    if (!isValidFrequency(candidateFrequency) || !Array.isArray(strings) || !strings.length) return null;

    return strings
      .map((stringNote) => ({
        string: stringNote,
        cents: centsDifference(candidateFrequency, stringNote.frequency),
      }))
      .filter((result) => Number.isFinite(result.cents))
      .sort((a, b) => Math.abs(a.cents) - Math.abs(b.cents))[0] || null;
  }

  function findNearestString(detectedFrequency, instrument = instruments[0]) {
    if (!isValidFrequency(detectedFrequency) || !instrument?.strings?.length) return null;

    const directMatch = nearestStringForCandidate(detectedFrequency, instrument.strings);
    if (directMatch && Math.abs(directMatch.cents) <= 15) {
      return {
        ...directMatch,
        detectedFrequency,
        correctedFrequency: detectedFrequency,
        harmonicDivisor: 1,
        score: Math.abs(directMatch.cents),
        status: tuningStatus(directMatch.cents),
      };
    }

    const candidates = HARMONIC_DIVISORS.map((divisor) => ({
      divisor,
      frequency: detectedFrequency / divisor,
    })).filter((candidate) => candidate.frequency >= MIN_GUITAR_HZ && candidate.frequency <= MAX_GUITAR_HZ);

    const ranked = candidates
      .map((candidate) => {
        const nearest = nearestStringForCandidate(candidate.frequency, instrument.strings);
        if (!nearest) return null;

        const harmonicPenalty = candidate.divisor === 1 ? 0 : 2.5 * (candidate.divisor - 1);
        const strongHarmonicBonus = candidate.divisor > 1 && Math.abs(nearest.cents) <= 18 ? -18 : 0;
        const score = Math.abs(nearest.cents) + harmonicPenalty + strongHarmonicBonus;

        return {
          ...nearest,
          detectedFrequency,
          correctedFrequency: candidate.frequency,
          harmonicDivisor: candidate.divisor,
          score,
          status: tuningStatus(nearest.cents),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score);

    return ranked[0] || null;
  }

  function analyzeFrequency(detectedFrequency, instrument = instruments[0], options = {}) {
    if (!isValidFrequency(detectedFrequency)) {
      return {
        reliable: false,
        status: "NO_SIGNAL",
        message: "Toque uma corda",
      };
    }

    const match = findNearestString(detectedFrequency, instrument);
    if (!match || Math.abs(match.cents) > (options.maxCentsFromTarget || 80)) {
      return {
        reliable: false,
        frequencyHz: detectedFrequency,
        status: "NO_SIGNAL",
        message: "Toque uma corda",
      };
    }

    return {
      reliable: true,
      frequencyHz: detectedFrequency,
      correctedFrequencyHz: match.correctedFrequency,
      harmonicDivisor: match.harmonicDivisor,
      string: match.string,
      note: match.string.note,
      octave: match.string.octave,
      noteLabel: `${match.string.note}${match.string.octave}`,
      targetFrequencyHz: match.string.frequency,
      cents: match.cents,
      status: match.status,
    };
  }

  const api = {
    A4_DEFAULT_HZ,
    IN_TUNE_CENTS,
    instruments,
    frequencyToMidi,
    midiToNoteName,
    centsDifference,
    tuningStatus,
    findNearestString,
    analyzeFrequency,
    isValidFrequency,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.GloryPadTunerCore = api;
})(typeof window !== "undefined" ? window : globalThis);
