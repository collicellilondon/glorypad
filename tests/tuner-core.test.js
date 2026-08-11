const assert = require("assert");
const tuner = require("../tuner-core");

const guitar = tuner.instruments.find((instrument) => instrument.id === "guitar-standard");

function nearlyEqual(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} to be within ${tolerance} of ${expected}`);
}

[
  [82.41, "E2", 6],
  [110.0, "A2", 5],
  [146.83, "D3", 4],
  [196.0, "G3", 3],
  [246.94, "B3", 2],
  [329.63, "E4", 1],
].forEach(([frequency, noteLabel, stringNumber]) => {
  const result = tuner.analyzeFrequency(frequency, guitar);
  assert.equal(result.reliable, true);
  assert.equal(result.noteLabel, noteLabel);
  assert.equal(result.string.stringNumber, stringNumber);
  nearlyEqual(result.cents, 0, 0.08);
});

assert.equal(Math.round(tuner.frequencyToMidi(440)), 69);
assert.deepEqual(tuner.midiToNoteName(69), { note: "A", octave: 4, label: "A4", midi: 69 });
nearlyEqual(tuner.centsDifference(440, 440), 0);
assert.ok(tuner.centsDifference(445, 440) > 0);
assert.ok(tuner.centsDifference(435, 440) < 0);

const flatA = tuner.analyzeFrequency(108, guitar);
assert.equal(flatA.noteLabel, "A2");
assert.equal(flatA.status, "FLAT");

const sharpD = tuner.analyzeFrequency(149, guitar);
assert.equal(sharpD.noteLabel, "D3");
assert.equal(sharpD.status, "SHARP");

const e2Harmonic2 = tuner.analyzeFrequency(164.82, guitar);
assert.equal(e2Harmonic2.noteLabel, "E2");
assert.equal(e2Harmonic2.harmonicDivisor, 2);

[0, -10, Number.NaN, Number.POSITIVE_INFINITY].forEach((value) => {
  assert.equal(tuner.analyzeFrequency(value, guitar).reliable, false);
  assert.equal(tuner.frequencyToMidi(value), null);
  assert.equal(tuner.centsDifference(value, 440), null);
});

assert.equal(tuner.analyzeFrequency(null, guitar).status, "NO_SIGNAL");
assert.equal(tuner.analyzeFrequency(undefined, guitar).status, "NO_SIGNAL");

console.log("tuner-core tests passed");
