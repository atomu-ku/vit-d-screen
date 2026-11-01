"""Compare browser inference/preprocessing/SHAP with the original Python runtime."""
import json
from pathlib import Path
import subprocess
import sys
import numpy as np
import pandas as pd
import xgboost as xgb

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'web_app/backend'))
from app.predictor import SCREENING_THRESHOLD, VitaminDRiskPredictor
from app.preprocessing import MODEL_FEATURE_COLUMNS, preprocess_assessment_request
from app.schemas import AssessmentRequest
from export_browser_model import export_model

predictor = VitaminDRiskPredictor()
export = export_model()
assert json.loads((ROOT / 'web_app/frontend/src/model/vitd-model.json').read_text()) == json.loads(json.dumps(export))
references = json.loads((ROOT / 'web_app/backend/model/reference_test_samples.json').read_text())
cases = [{'features': item['features']} for item in references]
base = references[1]['features']
# Exercise exact float32 split thresholds and their immediate neighbors.
splits = {(tree['feature'][i], tree['value'][i]) for tree in export['trees'] for i, left in enumerate(tree['left']) if left != -1}
for feature, value in sorted(splits):
    threshold = np.float32(value)
    for val in [np.nextafter(threshold, np.float32(-np.inf)), threshold, np.nextafter(threshold, np.float32(np.inf))]:
        cases.append({'features': {**base, MODEL_FEATURE_COLUMNS[feature]: float(val)}})
# Deterministic questionnaire cases cover preprocessing as well as tree prediction.
rng = np.random.default_rng(20261101)
for index in range(128):
    payload = {
        'age': int(rng.integers(18, 121)), 'sex': 'female' if index % 2 else 'male',
        'weight_kg': float(rng.uniform(35, 180)), 'height_cm': float(rng.uniform(125, 200)),
        'vitd_supplement_iu_per_week': float(rng.uniform(0, 350000)) if index % 3 else 0,
        'smoking_status': 'yes' if index % 2 else 'no',
        'sun_workdays': 3333 if index % 7 == 0 else float(rng.uniform(0, 480)),
        'sun_non_workdays': 3333 if index % 7 == 1 else float(rng.uniform(0, 480)),
        'stay_in_shade': index % 6 + 1, 'wear_sleeves': (index + 2) % 6 + 1,
        'use_sunscreen': (index + 4) % 6 + 1,
    }
    cases.append({'payload': payload})
# Decimal ties, schedule overrides, and sample 1 reconstructed from user inputs.
for weight, height, supplement in [(81.5, 170, 0), (113, 200, 2.38), (113.4, 200, 35), (70, 175, 2800)]:
    cases.append({'payload': {'age':22, 'sex':'male', 'weight_kg':weight, 'height_cm':height,
        'vitd_supplement_iu_per_week':supplement, 'smoking_status':'no', 'sun_workdays':90,
        'sun_non_workdays':50, 'stay_in_shade':4, 'wear_sleeves':5, 'use_sunscreen':5}})
rows = [preprocess_assessment_request(AssessmentRequest(**c['payload'])).iloc[0].to_dict() if 'payload' in c else c['features'] for c in cases]
frame = pd.DataFrame(rows, columns=MODEL_FEATURE_COLUMNS)
dmatrix = xgb.DMatrix(frame, feature_names=MODEL_FEATURE_COLUMNS)
booster = predictor.model.get_booster()
expected_probability = predictor.model.predict_proba(frame)[:, 1]
expected_shap = booster.predict(dmatrix, pred_contribs=True)
expected_margin = booster.predict(dmatrix, output_margin=True)
process = subprocess.run(['node', '--experimental-strip-types', str(ROOT / 'web_app/frontend/tests/predict-batch.ts')],
    input=json.dumps(cases), text=True, capture_output=True, check=True)
actual = json.loads(process.stdout)
prob_error = max(abs(item['probability'] - float(expected_probability[i])) for i,item in enumerate(actual))
shap_error = max(float(np.max(np.abs(np.array(item['shap'] + [item['bias']]) - expected_shap[i]))) for i,item in enumerate(actual))
margin_error = max(abs(item['margin'] - float(expected_margin[i])) for i,item in enumerate(actual))
for i,item in enumerate(actual):
    np.testing.assert_allclose([item['features'][f] for f in MODEL_FEATURE_COLUMNS], frame.iloc[i], rtol=0, atol=1e-10)
    assert (item['probability'] >= SCREENING_THRESHOLD) == (expected_probability[i] >= SCREENING_THRESHOLD), i
    assert round(item['probability'] * 100, 1) == round(float(expected_probability[i]) * 100, 1), i
    if item['result']:
        expected = predictor.predict_dataframe(frame.iloc[[i]])
        assert item['result']['percentage'] == expected.percentage
        assert item['result']['risk_classification'] == expected.risk_classification
        expected_items = {c.feature: c for c in expected.feature_contributions}
        for c in item['result']['feature_contributions']:
            ref = expected_items[c['feature']]
            assert c['direction'] == ref.direction, (i,c,ref)
            assert c['display_value'] == ref.display_value, (i,c,ref)
            assert abs(c['shap_value'] - ref.shap_value) <= 0.000100001
assert prob_error < 1e-6, prob_error
assert margin_error < 1e-6, margin_error
assert shap_error < 1e-5, shap_error
print(f'{len(cases)} parity cases passed ({len(splits)} split thresholds, {len(references)} notebook references, 132 questionnaire cases)')
print(f'Max absolute errors: probability={prob_error:.3g}, margin={margin_error:.3g}, SHAP={shap_error:.3g}')
