import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { assessLocally, preprocess, pythonRound } from '../src/services/browserModel.ts';
import type { AssessmentPayload } from '../src/types/assessment.ts';
const model = JSON.parse(readFileSync(new URL('../src/model/vitd-model.json', import.meta.url), 'utf8'));
const sample: AssessmentPayload = { age: 22, sex: 'male', weight_kg: 81.5, height_cm: 170,
  vitd_supplement_iu_per_week: 0, smoking_status: 'no', sun_workdays: 90,
  sun_non_workdays: 50, stay_in_shade: 4, wear_sleeves: 5, use_sunscreen: 5 };

test('Python decimal rounding preserves exact ties and binary64 behavior', () => {
  for (const [value, digits, expected] of [[28.25,1,28.2], [28.75,1,28.8], [2.675,2,2.67], [-1.25,1,-1.2], [0.125,2,0.12]]) {
    assert.equal(pythonRound(value,digits),expected);
  }
});
test('reference questionnaire produces 78.3 percent and original classification', () => {
  const result = assessLocally(sample, model);
  assert.equal(result.percentage,78.3);
  assert.equal(result.risk_classification,'High Risk');
  assert.equal(result.threshold,0.35);
  assert.equal(result.feature_contributions.length,9);
});
test('rejects invalid answers rather than silently choosing model branches', () => {
  for (const changes of [{age:NaN},{weight_kg:20},{height_cm:100},{vitd_supplement_iu_per_week:-1},
    {sun_workdays:481},{sun_workdays:3333,sun_non_workdays:3333},{stay_in_shade:0},{sex:'invalid'}, {smoking_status:'invalid'}]) {
    assert.throws(()=>preprocess({...sample,...changes} as AssessmentPayload,model));
  }
});
test('skip schedules, supplement conversion and shade override match notebook rules', () => {
  const result=preprocess({...sample,sun_workdays:3333,sun_non_workdays:30,stay_in_shade:6,vitd_supplement_iu_per_week:2800},model);
  assert.equal(result.sun_per_week,210);
  assert.equal(result.vitd_supplement,10);
  assert.equal(result.wear_sleeves,5);
  assert.equal(result.use_sunscreen,5);
});
