export type SexOption = 'male' | 'female' | '';
export type SmokingOption = 'yes' | 'no' | '';
export type NhanesSunProtectionCode = 1 | 2 | 3 | 4 | 5 | 6;

export interface PersonalInfoState {
  age: string;
  sex: SexOption;
  weightKg: string;
  heightCm: string;
  vitdSupplementIuPerWeek: string;
  smokingStatus: SmokingOption;
}

export interface LifestyleState {
  sunWorkdays: number | null; // 0-480 minutes or 3333 ("Does not work or go to school")
  sunNonWorkdays: number | null; // 0-480 minutes or 3333 ("Works/attends school 7 days a week")
  stayInShade: NhanesSunProtectionCode | null; // NHANES DEQ034A (1-6)
  wearSleeves: NhanesSunProtectionCode | null; // NHANES DEQ034C (1-6)
  useSunscreen: NhanesSunProtectionCode | null; // NHANES DEQ034D (1-6)
}

export interface AssessmentPayload {
  age: number;
  sex: 'male' | 'female';
  weight_kg: number;
  height_cm: number;
  vitd_supplement_iu_per_week: number;
  smoking_status: 'yes' | 'no';
  sun_workdays: number;
  sun_non_workdays: number;
  stay_in_shade: NhanesSunProtectionCode;
  wear_sleeves: NhanesSunProtectionCode;
  use_sunscreen: NhanesSunProtectionCode;
}

export interface FeatureContribution {
  feature: string;
  label: string;
  display_value: string;
  shap_value: number;
  direction: 'increases_risk' | 'decreases_risk' | 'neutral';
}

export interface AssessmentResponse {
  probability: number;
  percentage: number;
  risk_classification: 'Low Risk' | 'High Risk';
  threshold: number;
  threshold_percentage: number;
  explanation: string;
  disclaimer: string;
  engineered_features: Record<string, number>;
  feature_contributions: FeatureContribution[];
}

