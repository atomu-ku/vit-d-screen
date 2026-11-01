import os
import pickle
from pathlib import Path
from typing import List
import pandas as pd
import xgboost as xgb

from .preprocessing import MODEL_FEATURE_COLUMNS, ORDINAL_LABELS
from .schemas import AssessmentResponse, FeatureContribution

# Original classification threshold from notebook/vit-d-screen.ipynb (Cell 70 & 76)
SCREENING_THRESHOLD = 0.35

FEATURE_LABELS = {
    "age": "Age",
    "stay_in_shade": "Shade-Seeking",
    "wear_sleeves": "Long-Sleeve Use",
    "use_sunscreen": "Sunscreen Use",
    "bmi": "BMI",
    "vitd_supplement": "Vitamin D Supplement",
    "sun_per_week": "Outdoor Sun Exposure",
    "active_smoker": "Smoking (Past 5 Days)",
    "female": "Sex",
}


class VitaminDRiskPredictor:
    """
    Loads the existing serialized XGBoost model from notebook/vit-d-screen.ipynb
    and executes probability estimation, binary risk classification at threshold 0.35,
    and individualized TreeSHAP feature attribution.
    """

    def __init__(self, model_path: str | None = None) -> None:
        if model_path is None:
            env_path = os.getenv("MODEL_PATH")
            if env_path:
                resolved = Path(env_path)
                if not resolved.is_absolute():
                    resolved = Path(__file__).resolve().parent.parent / env_path
            else:
                resolved = (
                    Path(__file__).resolve().parent.parent
                    / "model"
                    / "xgb_vitd_model.pkl"
                )
        else:
            resolved = Path(model_path)

        if not resolved.exists():
            raise FileNotFoundError(
                f"Serialized model artifact not found at {resolved}. "
                "Ensure the original trained model pickle exists."
            )

        self.model_path = resolved
        with open(self.model_path, "rb") as f:
            self.model = pickle.load(f)

    def _format_feature_display_value(self, col: str, val: float) -> str:
        if col == "age":
            return f"{int(round(val))} yrs"
        if col in ("stay_in_shade", "wear_sleeves", "use_sunscreen"):
            return ORDINAL_LABELS.get(int(round(val)), str(val))
        if col == "bmi":
            return f"{val:.1f} kg/m²"
        if col == "vitd_supplement":
            iu_week = round(val * 280.0)
            return f"{iu_week:,} IU/wk ({val:.1f} µg/d)"
        if col == "sun_per_week":
            return f"{int(round(val))} min/wk"
        if col == "active_smoker":
            return "Yes" if val == 1.0 else "No"
        if col == "female":
            return "Female" if int(round(val)) == 1 else "Male"
        return str(val)

    def _compute_feature_contributions(
        self, X: pd.DataFrame
    ) -> List[FeatureContribution]:
        booster = self.model.get_booster()
        dmatrix = xgb.DMatrix(X, feature_names=MODEL_FEATURE_COLUMNS)
        contribs = booster.predict(dmatrix, pred_contribs=True)[0]

        items: List[FeatureContribution] = []
        row = X.iloc[0]
        for idx, col in enumerate(MODEL_FEATURE_COLUMNS):
            shap_val = float(contribs[idx])
            val = float(row[col])
            if shap_val > 0.005:
                direction = "increases_risk"
            elif shap_val < -0.005:
                direction = "decreases_risk"
            else:
                direction = "neutral"

            items.append(
                FeatureContribution(
                    feature=col,
                    label=FEATURE_LABELS.get(col, col),
                    display_value=self._format_feature_display_value(col, val),
                    shap_value=round(shap_val, 4),
                    direction=direction,
                )
            )

        items.sort(key=lambda item: abs(item.shap_value), reverse=True)
        return items

    def predict_dataframe(self, X: pd.DataFrame) -> AssessmentResponse:
        X_ordered = X[MODEL_FEATURE_COLUMNS]

        prob = float(self.model.predict_proba(X_ordered)[0, 1])
        percentage = round(prob * 100.0, 1)

        is_high_risk = prob >= SCREENING_THRESHOLD
        risk_classification = "High Risk" if is_high_risk else "Low Risk"
        threshold_percentage = SCREENING_THRESHOLD * 100.0

        if is_high_risk:
            explanation = (
                f"Predicted deficiency risk ({percentage:.1f}%) is at or above the {threshold_percentage:g}% screening threshold. "
                "Confirmatory serum 25(OH)D testing and clinical evaluation are recommended."
            )
        else:
            explanation = (
                f"Predicted deficiency risk ({percentage:.1f}%) is below the {threshold_percentage:g}% screening threshold, "
                "indicating a lower likelihood of vitamin D deficiency (< 50 nmol/L)."
            )

        disclaimer = (
            "For screening and research purposes only. This result is not a definitive diagnosis "
            "and cannot replace clinical evaluation or laboratory testing."
        )

        row_dict = {col: float(X_ordered.iloc[0][col]) for col in MODEL_FEATURE_COLUMNS}
        contributions = self._compute_feature_contributions(X_ordered)

        return AssessmentResponse(
            probability=prob,
            percentage=percentage,
            risk_classification=risk_classification,
            threshold=SCREENING_THRESHOLD,
            threshold_percentage=threshold_percentage,
            explanation=explanation,
            disclaimer=disclaimer,
            engineered_features=row_dict,
            feature_contributions=contributions,
        )
