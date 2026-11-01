from typing import Dict
import pandas as pd
from .schemas import AssessmentRequest, DirectFeaturesRequest

# Exact feature column order used to train xgb_model in notebook/vit-d-screen.ipynb (Cell 45 & 47)
MODEL_FEATURE_COLUMNS = [
    "age",
    "stay_in_shade",
    "wear_sleeves",
    "use_sunscreen",
    "bmi",
    "vitd_supplement",
    "sun_per_week",
    "active_smoker",
    "female",
]

# NHANES DEQ034A, DEQ034C, DEQ034D ordinal recoding map (Cell 23)
# 5: Never -> 0 (lowest deficiency risk)
# 4: Rarely -> 1
# 3: Sometimes -> 2
# 2: Most of the time -> 3
# 1: Always -> 4
# 6: Don't go out in the sun -> 5 (highest deficiency risk)
PROTECT_MAP: Dict[int, float] = {
    5: 0.0,
    4: 1.0,
    3: 2.0,
    2: 3.0,
    1: 4.0,
    6: 5.0,
}

ORDINAL_LABELS: Dict[int, str] = {
    0: "Never",
    1: "Rarely",
    2: "Sometimes",
    3: "Most of the time",
    4: "Always",
    5: "Does not go out in the sun",
}


def compute_sun_per_week(sun_workdays: float, sun_non_workdays: float) -> float:
    """
    Replicates Cell 19 of notebook/vit-d-screen.ipynb:
    Synthesizes daily outdoor exposure (DED120 & DED125) into total minutes/week (`sun_per_week`).
    """
    w = round(float(sun_workdays), 2)
    nw = round(float(sun_non_workdays), 2)

    if w != 3333.0 and nw != 3333.0:
        return (w * 5.0) + (nw * 2.0)
    elif w == 3333.0 and nw != 3333.0:
        return nw * 7.0
    elif w != 3333.0 and nw == 3333.0:
        return w * 7.0
    else:
        raise ValueError(
            "Both sun_workdays and sun_non_workdays cannot simultaneously be 3333."
        )


def preprocess_assessment_request(payload: AssessmentRequest) -> pd.DataFrame:
    """
    Transforms the user's Personal Information and NHANES Lifestyle Questionnaire
    responses into the exact 9-feature DataFrame expected by the trained XGBoost model.
    """
    # 1. Age (RIDAGEYR)
    age = float(payload.age)

    # 2-4. Sun-protective behaviors (DEQ034A, DEQ034C, DEQ034D - Cell 23)
    stay_in_shade = PROTECT_MAP[payload.stay_in_shade]
    wear_sleeves = PROTECT_MAP[payload.wear_sleeves]
    use_sunscreen = PROTECT_MAP[payload.use_sunscreen]

    # Exact skip-pattern alignment rule from Cell 23:
    # df.loc[df["stay_in_shade"] == 5, ["wear_sleeves", "use_sunscreen"]] = 5
    if stay_in_shade == 5.0:
        wear_sleeves = 5.0
        use_sunscreen = 5.0

    # 5. BMI (BMXBMI: kg/m^2, rounded to 1 decimal place per NHANES BMX protocol)
    height_m = payload.height_cm / 100.0
    bmi = round(payload.weight_kg / (height_m ** 2), 1)

    # 6. Vitamin D supplement intake (DSQTVD, supported by DSD010 - Cell 25-26)
    # Personal Info collects IU/week; NHANES DSQTVD is recorded in mcg/day (1 mcg = 40 IU, 7 days/week).
    if payload.vitd_supplement_iu_per_week <= 0:
        vitd_supplement = 0.0
    else:
        vitd_supplement = round(payload.vitd_supplement_iu_per_week / (40.0 * 7.0), 3)

    # 7. Total weekly outdoor sun exposure in minutes/week (DED120 & DED125 - Cell 19)
    sun_per_week = compute_sun_per_week(payload.sun_workdays, payload.sun_non_workdays)

    # 8. Active smoker in past 5 days (SMQ680 / SMQ681 - Cell 29)
    active_smoker = 1.0 if payload.smoking_status == "yes" else 0.0

    # 9. Sex encoded as binary female indicator (RIAGENDR == 2.0 - Cell 41)
    female = 1 if payload.sex == "female" else 0

    row = {
        "age": age,
        "stay_in_shade": stay_in_shade,
        "wear_sleeves": wear_sleeves,
        "use_sunscreen": use_sunscreen,
        "bmi": bmi,
        "vitd_supplement": vitd_supplement,
        "sun_per_week": sun_per_week,
        "active_smoker": active_smoker,
        "female": female,
    }

    return pd.DataFrame([row], columns=MODEL_FEATURE_COLUMNS)


def preprocess_direct_features(payload: DirectFeaturesRequest) -> pd.DataFrame:
    """
    Formats already-engineered features into the exact column order required by the model.
    """
    row = {
        "age": float(payload.age),
        "stay_in_shade": float(payload.stay_in_shade),
        "wear_sleeves": float(payload.wear_sleeves),
        "use_sunscreen": float(payload.use_sunscreen),
        "bmi": float(payload.bmi),
        "vitd_supplement": float(payload.vitd_supplement),
        "sun_per_week": float(payload.sun_per_week),
        "active_smoker": float(payload.active_smoker),
        "female": int(payload.female),
    }
    return pd.DataFrame([row], columns=MODEL_FEATURE_COLUMNS)

