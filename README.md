# Lifestyle-Based Vitamin D Deficiency Screening Model in Asian Adults

<p align="center">
  <strong>Vitamin D Risk Assessment</strong><br>
  Estimate your risk from personal health information and lifestyle habits.<br><br>
  <a href="https://atomu-ku.github.io/vit-d-screen/">
    <img src="assets/start-assessment.svg" alt="Start Assessment →" width="360" height="64">
  </a><br>
  <sub>Available in English and Thai</sub>
</p>

**[View the full analysis notebook →](notebook/vit-d-screen.ipynb)** for the complete workflow, from data preparation and feature engineering to model evaluation and SHAP interpretation.

## 1. Clinical Background & Objective

This project investigates non-invasive screening for vitamin D deficiency in primary care settings with limited access to serum vitamin D level testing. It develops a machine learning model using lifestyle factors, demographic characteristics, and body measurements to identify individuals at risk of vitamin D deficiency, defined as serum 25-hydroxyvitamin D **<50 nmol/L**.

The objective is to use the model to triage individuals by risk and guide referral for further investigation or lifestyle intervention.

## 2. Cohort & Clinical Data Pipeline

This project uses data from the National Health and Nutrition Examination Survey (NHANES), collected by the Centers for Disease Control and Prevention (CDC). The datasets are publicly accessible through the [CDC NHANES data portal](https://wwwn.cdc.gov/nchs/nhanes/continuousnhanes/).

NHANES data from **2011–2018**, comprising **1,935 non-pregnant Asian adults aged 20–59 years** with serum vitamin D measurements, are used to develop a model to predict vitamin D deficiency.

The model inputs comprise the following lifestyle, demographic, and anthropometric features:

| Feature | NHANES source | Description |
|---|---|---|
| Age (`age`) | `RIDAGEYR` | Age in years. |
| Sex (`female`) | `RIAGENDR` | Participant sex. |
| Body mass index (`bmi`) | `BMXBMI` | Body mass index (kg/m²). |
| Recent smoking (`active_smoker`) | `SMQ680`, `SMQ681` | Smoking status during the past five days. |
| Weekly outdoor exposure (`sun_per_week`) | `DED120`, `DED125` | Total time spent outdoors per week (minutes). |
| Shade-seeking (`stay_in_shade`) | `DEQ034A` | Frequency of staying in the shade. |
| Long-sleeve use (`wear_sleeves`) | `DEQ034C` | Frequency of wearing long sleeves outdoors. |
| Sunscreen use (`use_sunscreen`) | `DEQ034D` | Frequency of sunscreen use. |
| Vitamin D supplementation (`vitd_supplement`) | `DSQTVD`, supported by `DSD010` | Daily vitamin D intake from supplements (µg/day). |

*Feature definitions and transformations: [Exploring potential behavioral features](notebook/vit-d-screen.ipynb#exploring-potential-behavioral-features) and [Data structuring](notebook/vit-d-screen.ipynb#data-structuring).*

## 3. Methodology & Benchmark Performance

The cohort was divided into **1,548 training participants** and **387 test participants**. Class-weighted Random Forest and XGBoost models were tuned using five-fold grid-search cross-validation, selecting by ROC-AUC.

| Metric | Random Forest | XGBoost |
|---|---:|---:|
| Accuracy | 0.6848 | **0.6925** |
| Precision | 0.5820 | **0.5885** |
| Recall (Sensitivity) | 0.8765 | **0.8827** |
| F1 score | 0.6995 | **0.7062** |
| ROC-AUC | 0.7627 | **0.7668** |

![Primary Validation Plot](assets/roc-comparison.png)

*Figure 1. Test-set ROC curves: Random Forest AUC 0.763; XGBoost AUC 0.767.*

The XGBoost threshold was lowered to **0.35** to better support a screening test that prioritizes sensitivity. Test-set sensitivity increased from **88.27% to 95.06%**, while precision decreased from **58.85% to 54.23%**.

![XGBoost confusion matrices at thresholds 0.50 and 0.35](assets/threshold-comparison.png)

*Figure 2. Threshold 0.35 detects 154 versus 143 deficiency cases; false positives increase from 100 to 130.*

*Detailed evaluation: [Model Comparison and Calibration](notebook/vit-d-screen.ipynb#model-comparison-and-calibration) and [Clinical Threshold Optimization for Screening](notebook/vit-d-screen.ipynb#clinical-threshold-optimization-for-screening).*

## 4. Clinical Interpretability

### Model Interpretability and Clinical Explanation (SHAP)

SHAP identified **vitamin D supplementation** as the strongest lifestyle predictor, followed overall by **age and BMI**. Sex and other lifestyle factors, including outdoor exposure, sun-protection behaviors, and smoking, contributed less to model predictions.

![SHAP summary of XGBoost feature contributions](assets/shap-summary.png)

*Figure 3. Test-set SHAP summary: color denotes feature value; position indicates contribution to model output.*

![SHAP waterfall for test participant at index 1](assets/shap-waterfall.png)

*Figure 4. SHAP waterfall for test index 1: **78.3%** predicted deficiency probability; positive screen at threshold **0.35**.*

*Detailed analysis: [Model Interpretability and Clinical Explanation (SHAP)](notebook/vit-d-screen.ipynb#model-interpretability-and-clinical-explanation-shap).*

## 5. End-to-End Workflow & Reproducibility

The notebook's major checkpoints, in execution order, are:

1. [Import Packages and Load Dataset](notebook/vit-d-screen.ipynb#import-packages-and-load-dataset)
2. [Exploratory Data Analysis](notebook/vit-d-screen.ipynb#exploratory-data-analysis)
3. [Feature Engineering](notebook/vit-d-screen.ipynb#feature-engineering)
4. [Model Develoment and Evaluation](notebook/vit-d-screen.ipynb#model-develoment-and-evaluation)
5. [Model Comparison and Calibration](notebook/vit-d-screen.ipynb#model-comparison-and-calibration)
6. [Champion Model Selection: XGBoost](notebook/vit-d-screen.ipynb#champion-model-selection-xgboost)

To run the analysis notebook, execute the following commands from the project root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cd notebook
python -m jupyterlab vit-d-screen.ipynb
```

Run cells in order from the `notebook` directory to download NHANES data from CDC, save the combined dataset, and export the trained model.
