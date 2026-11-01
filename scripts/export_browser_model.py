"""Export the existing trained trees for browser inference; never retrains the model."""
import argparse
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'web_app/backend'))
from app.predictor import FEATURE_LABELS, SCREENING_THRESHOLD, VitaminDRiskPredictor
from app.preprocessing import MODEL_FEATURE_COLUMNS, ORDINAL_LABELS, PROTECT_MAP


def export_model():
    predictor = VitaminDRiskPredictor()
    learner = json.loads(predictor.model.get_booster().save_raw(raw_format='json'))['learner']
    booster = learner['gradient_booster']
    assert learner['objective']['name'] == 'binary:logistic'
    assert booster['name'] == 'gbtree'
    assert learner['feature_names'] == MODEL_FEATURE_COLUMNS
    base = json.loads(learner['learner_model_param']['base_score'])
    base = base[0] if isinstance(base, list) else base
    assert 0 < base < 1
    trees = []
    for tree in booster['model']['trees']:
        assert not tree['categories'] and not any(tree['split_type'])
        assert tree['tree_param']['size_leaf_vector'] == '1'
        trees.append({
            'left': tree['left_children'], 'right': tree['right_children'],
            'feature': tree['split_indices'], 'value': tree['split_conditions'],
            'defaultLeft': tree['default_left'], 'cover': tree['sum_hessian'],
        })
    return {
        'formatVersion': 1,
        'sourceSha256': hashlib.sha256(predictor.model_path.read_bytes()).hexdigest(),
        'baseScore': base, 'threshold': SCREENING_THRESHOLD,
        'features': MODEL_FEATURE_COLUMNS, 'labels': FEATURE_LABELS,
        'ordinalLabels': ORDINAL_LABELS, 'protectMap': PROTECT_MAP, 'trees': trees,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    target = ROOT / 'web_app/frontend/src/model/vitd-model.json'
    serialized = json.dumps(export_model(), separators=(',', ':'), ensure_ascii=False) + '\n'
    if args.check:
        assert target.read_text() == serialized, 'Browser model is stale; run scripts/export_browser_model.py'
        print('Browser export matches the trained Python model')
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(serialized)
        print(f'Exported {target.relative_to(ROOT)}')
