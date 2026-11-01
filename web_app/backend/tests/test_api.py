import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.predictor import SCREENING_THRESHOLD, VitaminDRiskPredictor
from app.preprocessing import (
    MODEL_FEATURE_COLUMNS,
    preprocess_assessment_request,
    preprocess_direct_features,
)
from app.schemas import AssessmentRequest, DirectFeaturesRequest
from pydantic import ValidationError

client = TestClient(app)


@pytest.fixture(scope="module")
def predictor() -> VitaminDRiskPredictor:
    return VitaminDRiskPredictor()


def test_model_loads_correctly(predictor: VitaminDRiskPredictor):
    assert predictor.model is not None
    assert SCREENING_THRESHOLD == 0.35


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["screening_threshold"] == 0.35
    assert data["features"] == MODEL_FEATURE_COLUMNS


def test_root_is_api_metadata_not_a_second_frontend():
    response = client.get("/")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    assert response.json()["docs_url"] == "/docs"


@pytest.mark.parametrize("threshold", [0.35, 0.8])
def test_result_explanation_uses_the_classification_threshold(predictor, monkeypatch, threshold):
    monkeypatch.setattr("app.predictor.SCREENING_THRESHOLD", threshold)
    ref_path = Path(__file__).resolve().parent.parent / "model" / "reference_test_samples.json"
    samples = json.loads(ref_path.read_text())
    sample = next(item for item in samples if item["index"] == 1)
    result = predictor.predict_dataframe(preprocess_direct_features(DirectFeaturesRequest(**sample["features"])))

    assert result.threshold == threshold
    assert result.threshold_percentage == threshold * 100
    assert f"{threshold * 100:g}% screening threshold" in result.explanation
    assert result.risk_classification == ("High Risk" if sample["prob"] >= threshold else "Low Risk")


def test_predictions_match_original_notebook_samples(predictor: VitaminDRiskPredictor):
    """
    Verifies that the serialized model produces the exact same probabilities and
    classifications as `notebook/vit-d-screen.ipynb` on reference test set samples,
    including test sample index 1 (predicted probability 78.28% -> 78.3%, High Risk).
    """
    ref_path = (
        Path(__file__).resolve().parent.parent / "model" / "reference_test_samples.json"
    )
    with open(ref_path, "r") as f:
        samples = json.load(f)

    for sample in samples:
        req = DirectFeaturesRequest(**sample["features"])
        X = preprocess_direct_features(req)
        result = predictor.predict_dataframe(X)

        assert abs(result.probability - sample["prob"]) < 1e-6
        expected_label = "High Risk" if sample["pred_35"] == 1 else "Low Risk"
        assert result.risk_classification == expected_label

        # Also test via HTTP POST /api/predict-features
        http_res = client.post("/api/predict-features", json=sample["features"])
        assert http_res.status_code == 200
        http_json = http_res.json()
        assert abs(http_json["probability"] - sample["prob"]) < 1e-6
        assert http_json["risk_classification"] == expected_label

        if sample["index"] == 1:
            assert result.percentage == 78.3
            assert result.risk_classification == "High Risk"


def test_preprocessing_pipeline_and_api_assess():
    """
    Reconstructs test sample index 1 via questionnaire inputs and verifies both
    preprocessing and the /api/assess endpoint.
    """
    payload = {
        "age": 22,
        "sex": "male",
        "weight_kg": 81.5,
        "height_cm": 170.0,
        "vitd_supplement_iu_per_week": 0,
        "smoking_status": "no",
        "sun_workdays": 90,
        "sun_non_workdays": 50,
        "stay_in_shade": 4,
        "wear_sleeves": 5,
        "use_sunscreen": 5,
    }
    response = client.post("/api/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["percentage"] == 78.3
    assert data["risk_classification"] == "High Risk"
    assert data["threshold"] == 0.35
    assert data["engineered_features"]["bmi"] == 28.2
    assert data["engineered_features"]["sun_per_week"] == 550.0


def test_stay_in_shade_dont_go_out_override():
    req = AssessmentRequest(
        age=35,
        sex="female",
        weight_kg=58.0,
        height_cm=162.0,
        vitd_supplement_iu_per_week=2800,
        smoking_status="no",
        sun_workdays=3333,
        sun_non_workdays=30,
        stay_in_shade=6,
        wear_sleeves=5,
        use_sunscreen=5,
    )
    X = preprocess_assessment_request(req)
    row = X.iloc[0]
    assert row["stay_in_shade"] == 5.0
    assert row["wear_sleeves"] == 5.0
    assert row["use_sunscreen"] == 5.0
    assert row["sun_per_week"] == 210.0
    assert row["vitd_supplement"] == 10.0
    assert row["female"] == 1


def test_input_validation_rejects_invalid_values():
    with pytest.raises(ValidationError):
        AssessmentRequest(
            age=30,
            sex="male",
            weight_kg=70,
            height_cm=175,
            vitd_supplement_iu_per_week=0,
            smoking_status="no",
            sun_workdays=3333,
            sun_non_workdays=3333,
            stay_in_shade=3,
            wear_sleeves=3,
            use_sunscreen=3,
        )

    res = client.post(
        "/api/assess",
        json={
            "age": 30,
            "sex": "male",
            "weight_kg": 70,
            "height_cm": 175,
            "vitd_supplement_iu_per_week": -50,
            "smoking_status": "no",
            "sun_workdays": 60,
            "sun_non_workdays": 60,
            "stay_in_shade": 3,
            "wear_sleeves": 3,
            "use_sunscreen": 3,
        },
    )
    assert res.status_code == 422
