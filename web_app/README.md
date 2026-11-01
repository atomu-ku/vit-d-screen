# Vitamin D Risk Assessment — Web App

**[Open the assessment](https://atomu-ku.github.io/vit-d-screen/)** — English/Thai screening demo hosted on GitHub Pages. Predictions and SHAP factor contributions run in the browser using the original trained XGBoost trees. Answers are not sent to a prediction server, and the app does not save answers in browser storage.

See the [main README](../README.md) for study results and limitations, and the [notebook](../notebook/vit-d-screen.ipynb) for the research workflow. This tool is for screening, research, and education, not diagnosis.

## Run locally

Only **Node.js 22.23.4 or later within 22.x** is needed to run the web app. From the repository root:

```bash
cd web_app/frontend
npm ci
npm run dev
```

Then **[open the assessment locally](http://localhost:5173)**. There is no Python server, API URL, or frontend environment file to configure.

## Architecture

- `frontend/src/` is the single maintained React/TypeScript UI, including English/Thai text.
- `frontend/src/model/vitd-model.json` contains the exported 100 trained trees, feature order, labels, threshold, and training cover statistics. It contains no questionnaire submissions or participant records.
- `frontend/src/services/browserModel.ts` applies the original preprocessing, float32 tree prediction, and tree-path-dependent Shapley calculation. With nine features, all 512 feature coalitions can be evaluated directly, without approximating SHAP.
- `frontend/src/services/assessment.ts` loads the static model asset on demand and computes the result locally. The static asset request contains no assessment answers.
- `backend/` retains the original Python API, pickle, and reference samples for development and parity verification. It is **not required by the deployed website**.
- `frontend/dist/` and dependencies are generated and ignored. The GitHub Actions workflow builds and uploads the site artifact; generated output is not committed.

The live threshold and response labels are exported from the Python model code. The welcome page's sensitivity/cutoff figures describe the original notebook evaluation. SHAP contributions are in raw model log-odds units, not percentage points, and are not causal effects.

## Verification

Frontend checks:

```bash
cd web_app/frontend
npm test
npm run build -- --base=/vit-d-screen/
```

To verify against Python, use **Python 3.14.6** and the pinned model dependencies. From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r web_app/backend/requirements-dev.txt
python scripts/export_browser_model.py --check
python scripts/verify_browser_model.py
cd web_app/backend
python -m pytest -q
```

Node must also be on `PATH` for the parity script. On Windows, use your shell's virtual environment activation command.

The parity suite covers 644 cases: five notebook reference samples, 507 split-boundary cases (169 thresholds and their immediate float32 neighbors), and 132 questionnaire cases including decimal-rounding and schedule edge cases. It compares preprocessing, probability, classification, displayed percentage, and SHAP values with the original Python runtime. Tests require probability/margin error below `1e-6` and SHAP error below `1e-5`; the verified local run had zero probability/margin error and maximum SHAP error below `1e-6`. This verifies implementation parity, not clinical validity beyond the original study.

Browser unit tests also check invalid input rejection, shade overrides, supplement conversion, and Python-compatible decimal rounding.

## Update the model

After exporting a new pickle from the notebook, run from the repository root:

```bash
python scripts/export_browser_model.py
python scripts/verify_browser_model.py
```

Commit the pickle and the generated `frontend/src/model/vitd-model.json` together. The exporter records the pickle's SHA-256 digest and refuses unsupported model types. CI checks that the browser export still matches the original model before deployment. No deployment step trains a new model.

The browser artifact is public, as required for client-side inference. It includes model parameters and aggregated training cover statistics, not individual training records.

## GitHub Pages deployment

[`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) runs on pushes to `main` and can also be started manually from GitHub Actions. It:

1. Installs the pinned Python runtime dependencies and runs backend tests.
2. Checks the browser export and Python/browser prediction parity.
3. Installs frontend dependencies with `npm ci`, runs browser tests, and builds with base path `/vit-d-screen/`.
4. Uploads the generated `dist/` artifact and deploys to GitHub Pages.

Repository **Settings → Pages → Source** must be **GitHub Actions**. The public URL is **https://atomu-ku.github.io/vit-d-screen/**. No Render or Vercel account, API secret, or paid backend is required for this deployment.

If the repository name or domain changes, update the workflow's Vite base path and README links. See [Vite's GitHub Pages guide](https://vite.dev/guide/static-deploy.html#github-pages) for path configuration.

## Optional Python API

The API remains available for development or independent integrations. With the Python environment activated:

```bash
cd web_app/backend
python -m uvicorn app.main:app --reload --env-file .env.example --host 127.0.0.1 --port 8000
```

Open [API documentation](http://localhost:8000/docs) or [health](http://localhost:8000/api/health). `backend/.env.example` documents `CORS_ORIGINS` and `MODEL_PATH`. `backend/requirements.txt` contains runtime dependencies; `requirements-dev.txt` adds test tools. The optional `render.yaml` and frontend `vercel.json` are retained for alternate hosting, but GitHub Pages does not use them.
