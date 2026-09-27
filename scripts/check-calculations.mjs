import assert from 'node:assert/strict';

const HEIGHT_TO_STRIDE = 0.413;

function strideFromHeight(heightCm) {
  return (heightCm / 100) * HEIGHT_TO_STRIDE;
}

function estimateDistance(durationSeconds, speedMetersPerSecond) {
  return speedMetersPerSecond * durationSeconds;
}

function roundEstimatedSteps(steps) {
  return Math.max(10, Math.round(steps / 10) * 10);
}

function paceFromSpeed(speedMetersPerSecond) {
  return 1000 / speedMetersPerSecond;
}

const distance = estimateDistance(1800, 1.5);
assert.equal(distance, 2700);

const speedFromDistance = 2700 / 1800;
assert.equal(speedFromDistance, 1.5);
assert.ok(Math.abs(paceFromSpeed(1.5) - 666.666) < 0.01);

const stride = strideFromHeight(170);
assert.ok(Math.abs(stride - 0.7021) < 0.0001);

const steps = roundEstimatedSteps(2700 / stride);
assert.equal(steps, 3850);
assert.notEqual(steps, 2700 / stride);

function estimateWalkingKcal({ durationSeconds, weightKg, speedMetersPerSecond, inclinePercent = 0 }) {
  const speedMPerMin = speedMetersPerSecond * 60;
  const grade = inclinePercent / 100;
  const vo2 = 3.5 + 0.1 * speedMPerMin + 1.8 * speedMPerMin * grade;
  const kcalPerMin = (vo2 * weightKg * 5) / 1000;
  return kcalPerMin * (durationSeconds / 60);
}

const kcal = estimateWalkingKcal({ durationSeconds: 1800, weightKg: 70, speedMetersPerSecond: 1.5 });
assert.ok(Math.abs(kcal - 131.25) < 0.01);

console.log('Calculation checks passed.');
