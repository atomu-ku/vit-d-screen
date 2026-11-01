from typing import Dict, List, Literal
from pydantic import BaseModel, Field, model_validator


class AssessmentRequest(BaseModel):
    """
    User input payload combining Personal Information (Screen 2)
    and NHANES Lifestyle & Behavioral Assessment responses (Screen 3+).
    """

    # Personal Information Page (Screen 2)
    age: float = Field(
        ...,
        ge=18,
        le=120,
        description="Age in years (NHANES RIDAGEYR; model trained on ages 20-59).",
    )
    sex: Literal["male", "female"] = Field(
        ...,
        description="Biological sex (NHANES RIAGENDR: 1=Male, 2=Female).",
    )
    weight_kg: float = Field(
        ...,
        gt=20,
        le=300,
        description="Body weight in kilograms (kg).",
    )
    height_cm: float = Field(
        ...,
        gt=100,
        le=250,
        description="Standing height in centimeters (cm).",
    )
    vitd_supplement_iu_per_week: float = Field(
        ...,
        ge=0,
        le=350000,
        description="Total vitamin D supplement intake in International Units per week (IU/week). Enter 0 if none.",
    )
    smoking_status: Literal["yes", "no"] = Field(
        ...,
        description="Recent smoking/nicotine use in the past 5 days (NHANES SMQ680/SMQ681).",
    )

    # Lifestyle & Behavioral Assessment (Screen 3+ - Official NHANES DEQ module)
    sun_workdays: float = Field(
        ...,
        description=(
            "Minutes spent outdoors between 9 AM and 5 PM on work/school days (NHANES DED120: 0-480), "
            "or 3333 if participant does not work or go to school."
        ),
    )
    sun_non_workdays: float = Field(
        ...,
        description=(
            "Minutes spent outdoors between 9 AM and 5 PM on non-work/free days (NHANES DED125: 0-480), "
            "or 3333 if participant works/attends school 7 days a week (no non-workdays)."
        ),
    )
    stay_in_shade: Literal[1, 2, 3, 4, 5, 6] = Field(
        ...,
        description=(
            "Frequency of staying in the shade on a sunny day for >1 hour (NHANES DEQ034A): "
            "1=Always, 2=Most of the time, 3=Sometimes, 4=Rarely, 5=Never, 6=Don't go out in the sun."
        ),
    )
    wear_sleeves: Literal[1, 2, 3, 4, 5, 6] = Field(
        ...,
        description=(
            "Frequency of wearing long-sleeved shirts on a sunny day for >1 hour (NHANES DEQ034C): "
            "1=Always, 2=Most of the time, 3=Sometimes, 4=Rarely, 5=Never, 6=Don't go out in the sun."
        ),
    )
    use_sunscreen: Literal[1, 2, 3, 4, 5, 6] = Field(
        ...,
        description=(
            "Frequency of using sunscreen on a sunny day for >1 hour (NHANES DEQ034D): "
            "1=Always, 2=Most of the time, 3=Sometimes, 4=Rarely, 5=Never, 6=Don't go out in the sun."
        ),
    )

    @model_validator(mode="after")
    def validate_sun_exposure(self) -> "AssessmentRequest":
        for field_name, val in [
            ("sun_workdays", self.sun_workdays),
            ("sun_non_workdays", self.sun_non_workdays),
        ]:
            if val != 3333 and not (0 <= val <= 480):
                raise ValueError(
                    f"{field_name} must be between 0 and 480 minutes (9:00 AM to 5:00 PM), or 3333."
                )

        if self.sun_workdays == 3333 and self.sun_non_workdays == 3333:
            raise ValueError(
                "Both workdays and non-workdays cannot simultaneously be marked as 'not applicable' (3333)."
            )
        return self


class DirectFeaturesRequest(BaseModel):
    """
    Direct preprocessed model feature payload matching the 9 columns of X_test in the notebook.
    Used to verify 1:1 prediction consistency with the original notebook.
    """

    age: float
    stay_in_shade: float
    wear_sleeves: float
    use_sunscreen: float
    bmi: float
    vitd_supplement: float
    sun_per_week: float
    active_smoker: float
    female: int


class FeatureContribution(BaseModel):
    feature: str
    label: str
    display_value: str
    shap_value: float
    direction: Literal["increases_risk", "decreases_risk", "neutral"]


class AssessmentResponse(BaseModel):
    probability: float = Field(
        ...,
        description="Predicted probability of vitamin D deficiency (< 50 nmol/L) between 0.0 and 1.0.",
    )
    percentage: float = Field(
        ...,
        description="Predicted probability formatted as a percentage (0.0 to 100.0).",
    )
    risk_classification: Literal["Low Risk", "High Risk"] = Field(
        ...,
        description="Binary classification using the original notebook's 0.35 screening threshold.",
    )
    threshold: float = Field(
        ...,
        description="Original clinical screening classification threshold from the notebook (0.35).",
    )
    threshold_percentage: float = Field(
        ...,
        description="Original screening classification threshold as a percentage (35.0%).",
    )
    explanation: str = Field(
        ...,
        description="Clinical screening summary explaining the predicted result and threshold.",
    )
    disclaimer: str = Field(
        ...,
        description="Mandatory research and clinical screening limitation notice.",
    )
    engineered_features: Dict[str, float] = Field(
        ...,
        description="The 9 preprocessed features passed to the trained XGBoost model.",
    )
    feature_contributions: List[FeatureContribution] = Field(
        default_factory=list,
        description="Individualized TreeSHAP feature contributions from the trained XGBoost model.",
    )

