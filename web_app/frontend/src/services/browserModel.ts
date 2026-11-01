import type { AssessmentPayload, AssessmentResponse, FeatureContribution } from '../types/assessment.ts';

interface Tree {
  left: number[];
  right: number[];
  feature: number[];
  value: number[];
  defaultLeft: number[];
  cover: number[];
}

export interface BrowserModel {
  formatVersion: number;
  baseScore: number;
  threshold: number;
  features: string[];
  labels: Record<string, string>;
  ordinalLabels: Record<string, string>;
  protectMap: Record<string, number>;
  trees: Tree[];
}

// Match Python's decimal rounding of a binary64 value, including ties-to-even.
// Integer arithmetic avoids rounding an intermediate value after scaling by 10.
export function pythonRound(value: number, digits = 0): number {
  if (!Number.isFinite(value)) throw new Error('A finite number is required.');
  if (!Number.isInteger(digits) || digits < 0 || digits > 6) throw new Error('Unsupported precision.');
  if (value === 0) return value;
  const buffer = new DataView(new ArrayBuffer(8));
  buffer.setFloat64(0, Math.abs(value));
  const bits = buffer.getBigUint64(0);
  const exponent = Number((bits >> 52n) & 0x7ffn);
  const fraction = bits & ((1n << 52n) - 1n);
  const mantissa = exponent === 0 ? fraction : fraction + (1n << 52n);
  const shift = (exponent === 0 ? -1022 : exponent - 1023) - 52;
  let numerator = mantissa * (10n ** BigInt(digits));
  let denominator = 1n;
  if (shift >= 0) numerator <<= BigInt(shift);
  else denominator <<= BigInt(-shift);
  let rounded = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder * 2n > denominator || (remainder * 2n === denominator && rounded % 2n !== 0n)) rounded++;
  return Math.sign(value) * Number(rounded) / (10 ** digits);
}

export function preprocess(payload: AssessmentPayload, model: BrowserModel): Record<string, number> {
  function range(value: number, min: number, max: number, label: string, exclusiveMin = false) {
    if (!Number.isFinite(value) || (exclusiveMin ? value <= min : value < min) || value > max) {
      throw new Error(`Invalid ${label}.`);
    }
  }
  range(payload.age, 18, 120, 'age');
  range(payload.weight_kg, 20, 300, 'weight', true);
  range(payload.height_cm, 100, 250, 'height', true);
  range(payload.vitd_supplement_iu_per_week, 0, 350000, 'supplement intake');
  if (!['male', 'female'].includes(payload.sex)) throw new Error('Invalid sex.');
  if (!['yes', 'no'].includes(payload.smoking_status)) throw new Error('Invalid smoking status.');
  for (const field of ['stay_in_shade', 'wear_sleeves', 'use_sunscreen'] as const) {
    if (!Number.isInteger(payload[field]) || !(payload[field] >= 1 && payload[field] <= 6)) {
      throw new Error('Invalid sun-protection response.');
    }
  }
  for (const minutes of [payload.sun_workdays, payload.sun_non_workdays]) {
    if (minutes !== 3333) range(minutes, 0, 480, 'outdoor time');
  }
  if (payload.sun_workdays === 3333 && payload.sun_non_workdays === 3333) {
    throw new Error('Both outdoor schedules cannot be marked not applicable.');
  }
  const work = pythonRound(payload.sun_workdays, 2);
  const off = pythonRound(payload.sun_non_workdays, 2);
  const shade = model.protectMap[payload.stay_in_shade];
  return {
    age: payload.age,
    stay_in_shade: shade,
    wear_sleeves: shade === 5 ? 5 : model.protectMap[payload.wear_sleeves],
    use_sunscreen: shade === 5 ? 5 : model.protectMap[payload.use_sunscreen],
    bmi: pythonRound(payload.weight_kg / ((payload.height_cm / 100) ** 2), 1),
    vitd_supplement: pythonRound(payload.vitd_supplement_iu_per_week / 280, 3),
    sun_per_week: work === 3333 ? off * 7 : off === 3333 ? work * 7 : work * 5 + off * 2,
    active_smoker: payload.smoking_status === 'yes' ? 1 : 0,
    female: payload.sex === 'female' ? 1 : 0,
  };
}

function nextNode(tree: Tree, node: number, values: number[]): number {
  const value = values[tree.feature[node]];
  const left = Number.isNaN(value) ? tree.defaultLeft[node] === 1 : value < Math.fround(tree.value[node]);
  return left ? tree.left[node] : tree.right[node];
}

// Conditional tree expectation: unknown splits follow both paths using training
// Hessian cover, matching XGBoost's tree-path-dependent SHAP background.
function expectation(tree: Tree, node: number, known: number, values: number[]): number {
  if (tree.left[node] === -1) return Math.fround(tree.value[node]);
  if (known & (1 << tree.feature[node])) return expectation(tree, nextNode(tree, node, values), known, values);
  const left = tree.left[node];
  const right = tree.right[node];
  const cover = Math.fround(tree.cover[node]);
  return expectation(tree, left, known, values) * Math.fround(tree.cover[left]) / cover
    + expectation(tree, right, known, values) * Math.fround(tree.cover[right]) / cover;
}

export function predictFeatures(features: Record<string, number>, model: BrowserModel) {
  if (model.formatVersion !== 1 || model.features.length !== 9) throw new Error('Unsupported model format.');
  const values = model.features.map((name) => {
    if (!Number.isFinite(features[name])) throw new Error(`Invalid feature: ${name}`);
    return Math.fround(features[name]);
  });
  const baseMargin = Math.fround(Math.log(model.baseScore / (1 - model.baseScore)));
  let margin = baseMargin;
  for (const tree of model.trees) {
    let node = 0;
    while (tree.left[node] !== -1) node = nextNode(tree, node, values);
    margin = Math.fround(margin + Math.fround(tree.value[node]));
  }
  const probability = Math.fround(1 / Math.fround(1 + Math.fround(Math.exp(-margin))));

  // Nine features need only 512 coalitions. Enumerating them exactly is small
  // enough for this model and avoids approximation or a second SHAP library.
  const n = values.length;
  const coalitions = new Float64Array(1 << n);
  for (let mask = 0; mask < coalitions.length; mask++) {
    coalitions[mask] = baseMargin;
    for (const tree of model.trees) coalitions[mask] += expectation(tree, 0, mask, values);
  }
  const factorial = [1];
  for (let i = 1; i <= n; i++) factorial[i] = factorial[i - 1] * i;
  const shap = values.map((_, feature) => {
    let contribution = 0;
    for (let mask = 0; mask < coalitions.length; mask++) {
      if (mask & (1 << feature)) continue;
      let count = 0;
      for (let bits = mask; bits; bits &= bits - 1) count++;
      const weight = factorial[count] * factorial[n - count - 1] / factorial[n];
      contribution += weight * (coalitions[mask | (1 << feature)] - coalitions[mask]);
    }
    return contribution;
  });
  return { probability, margin, shap, bias: coalitions[0] };
}

function displayValue(feature: string, value: number, model: BrowserModel): string {
  if (feature === 'age') return `${pythonRound(value)} yrs`;
  if (['stay_in_shade', 'wear_sleeves', 'use_sunscreen'].includes(feature)) return model.ordinalLabels[pythonRound(value)];
  if (feature === 'bmi') return `${value.toFixed(1)} kg/m²`;
  if (feature === 'vitd_supplement') return `${pythonRound(value * 280).toLocaleString('en-US')} IU/wk (${pythonRound(value, 1).toFixed(1)} µg/d)`;
  if (feature === 'sun_per_week') return `${pythonRound(value)} min/wk`;
  if (feature === 'active_smoker') return value === 1 ? 'Yes' : 'No';
  if (feature === 'female') return value === 1 ? 'Female' : 'Male';
  return String(value);
}

export function assessLocally(payload: AssessmentPayload, model: BrowserModel): AssessmentResponse {
  const features = preprocess(payload, model);
  const prediction = predictFeatures(features, model);
  const percentage = pythonRound(prediction.probability * 100, 1);
  const thresholdPercentage = model.threshold * 100;
  const high = prediction.probability >= model.threshold;
  const contributions: FeatureContribution[] = model.features.map((feature, index) => ({
    feature,
    label: model.labels[feature],
    display_value: displayValue(feature, features[feature], model),
    shap_value: pythonRound(prediction.shap[index], 4),
    direction: prediction.shap[index] > 0.005 ? 'increases_risk' : prediction.shap[index] < -0.005 ? 'decreases_risk' : 'neutral',
  }));
  contributions.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  return {
    probability: prediction.probability,
    percentage,
    risk_classification: high ? 'High Risk' : 'Low Risk',
    threshold: model.threshold,
    threshold_percentage: thresholdPercentage,
    explanation: `Predicted deficiency risk (${percentage.toFixed(1)}%) is ${high ? 'at or above' : 'below'} the ${thresholdPercentage}% screening threshold.`,
    disclaimer: 'For screening and research purposes only. This result is not a definitive diagnosis and cannot replace clinical evaluation or laboratory testing.',
    engineered_features: features,
    feature_contributions: contributions,
  };
}
