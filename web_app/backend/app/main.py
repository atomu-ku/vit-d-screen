import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .predictor import SCREENING_THRESHOLD, VitaminDRiskPredictor
from .preprocessing import (
    MODEL_FEATURE_COLUMNS,
    preprocess_assessment_request,
    preprocess_direct_features,
)
from .schemas import (
    AssessmentRequest,
    AssessmentResponse,
    DirectFeaturesRequest,
)

app = FastAPI(
    title="Vitamin D Deficiency Risk Assessment API",
    description=(
        "FastAPI backend serving the original NHANES 2011-2018 XGBoost screening model "
        "for non-invasive Vitamin D deficiency (< 50 nmol/L) risk assessment."
    ),
    version="1.0.0",
)

cors_origins_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = (
    ["*"]
    if cors_origins_env.strip() == "*"
    else [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False if allowed_origins == ["*"] else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = VitaminDRiskPredictor()

@app.get("/")
def root():
    return JSONResponse(
        {
            "service": "Vitamin D Deficiency Risk Assessment API",
            "status": "online",
            "model": "XGBClassifier (NHANES 2011-2018 Asian Adult Cohort)",
            "screening_threshold": SCREENING_THRESHOLD,
            "docs_url": "/docs",
        }
    )


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": predictor.model is not None,
        "model_path": str(predictor.model_path.name),
        "features": MODEL_FEATURE_COLUMNS,
        "screening_threshold": SCREENING_THRESHOLD,
    }


@app.post("/api/assess", response_model=AssessmentResponse)
def assess_vitamin_d_risk(payload: AssessmentRequest) -> AssessmentResponse:
    """
    Processes Personal Information and NHANES Lifestyle Questionnaire inputs
    through the original notebook's preprocessing pipeline and returns the
    predicted probability and binary risk classification (Low Risk vs. High Risk).
    """
    try:
        X = preprocess_assessment_request(payload)
        return predictor.predict_dataframe(X)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Prediction error: {str(exc)}"
        ) from exc


@app.post("/api/predict-features", response_model=AssessmentResponse)
def predict_from_direct_features(payload: DirectFeaturesRequest) -> AssessmentResponse:
    """
    Generates a prediction directly from the 9 preprocessed features to verify
    exact parity with the original Jupyter Notebook (`X_test` samples).
    """
    try:
        X = preprocess_direct_features(payload)
        return predictor.predict_dataframe(X)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Prediction error: {str(exc)}"
        ) from exc
