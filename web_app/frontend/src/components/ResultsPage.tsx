import React from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/i18n';
import { AssessmentResponse } from '../types/assessment';
import { RiskGauge } from './RiskGauge';

interface ResultsPageProps {
  lang?: Language;
  result: AssessmentResponse;
  onStartNew: () => void;
  onReviewAnswers: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  lang = 'en',
  result,
  onStartNew,
  onReviewAnswers,
}) => {
  const t = TRANSLATIONS[lang];
  const isHighRisk = result.risk_classification === 'High Risk';
  const pctStr = result.percentage.toFixed(1);
  const cutoffStr = String(result.threshold_percentage);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[#d6dec0] bg-[#fffdf7] shadow-sm">
        <div
          className={`flex items-center justify-between border-b px-4 py-3 sm:px-5 ${
            isHighRisk
              ? 'border-[#e8c4b8] bg-gradient-to-r from-[#faece6] to-[#fbf3d5]'
              : 'border-[#d6e3be] bg-gradient-to-r from-[#eaf3d9] to-[#faf4d3]'
          }`}
        >
          <span className="text-sm font-bold text-[#253628]">{t.resultHeader}</span>
          <span className="rounded-full border border-[#d6dec0] bg-[#fffdf7] px-2.5 py-0.5 text-[11px] font-semibold text-[#4a5d47]">
            {t.cutoffBadge}: {cutoffStr}%
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="rounded-xl border border-[#e2e8ce] bg-[#f7f9ee] px-3 py-4">
            <RiskGauge
              lang={lang}
              percentage={result.percentage}
              thresholdPercentage={result.threshold_percentage}
              riskClassification={result.risk_classification}
            />
          </div>

          <div
            className={`rounded-xl border p-3.5 ${
              isHighRisk
                ? 'border-[#e6b4a6] bg-[#fdf0ed] text-[#6e2219]'
                : 'border-[#bdd49f] bg-[#eef6e1] text-[#244729]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isHighRisk ? (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#c43d2f]" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3b7544]" />
              )}
              <div className="text-xs leading-relaxed sm:text-sm">
                <span className="font-bold">{isHighRisk ? t.highRisk : t.lowRisk}: </span>
                {isHighRisk ? t.highRiskExplanation(pctStr, cutoffStr) : t.lowRiskExplanation(pctStr, cutoffStr)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#e3c96f] bg-[#fdf6dc] p-3 text-xs leading-relaxed text-[#5c4715]">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#b5851b]" />
              <span>
                <strong>{t.noteLabel}</strong> {t.disclaimerText}
              </span>
            </div>
          </div>

          {result.feature_contributions && result.feature_contributions.length > 0 && (
            <details className="group rounded-xl border border-[#dce3c6] bg-[#f7f9ee] px-3.5 py-2.5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold text-[#355239]">
                <span>{t.factorBreakdown}</span>
                <span className="text-[#3f6d48] transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-2.5 divide-y divide-[#e4ead2] border-t border-[#dce3c6] pt-2">
                {result.feature_contributions.map((item) => {
                  const isInc = item.direction === 'increases_risk';
                  const isDec = item.direction === 'decreases_risk';
                  return (
                    <div
                      key={item.feature}
                      className="flex items-center justify-between gap-2 py-1.5 text-xs"
                    >
                      <div className="truncate">
                        <span className="font-semibold text-[#253628]">{item.label}: </span>
                        <span className="text-[#5c6e58]">{item.display_value}</span>
                      </div>
                      {isInc && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-[#bf3b2e]">
                          <ArrowUpRight className="h-3.5 w-3.5" />+{item.shap_value.toFixed(2)}
                        </span>
                      )}
                      {isDec && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-[#387040]">
                          <ArrowDownRight className="h-3.5 w-3.5" />
                          {item.shap_value.toFixed(2)}
                        </span>
                      )}
                      {!isInc && !isDec && (
                        <span className="shrink-0 text-[#869680]">0.00</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          )}

          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onReviewAnswers}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ccd6b4] bg-[#fffdf7] px-3.5 py-2.5 text-xs font-semibold text-[#3b523e] active:scale-[0.99] sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t.editBtn}</span>
            </button>

            <button
              type="button"
              onClick={onStartNew}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3f6d48] to-[#538451] px-4 py-2.5 text-sm font-bold text-[#fffdf5] shadow-sm active:scale-[0.99]"
            >
              <RotateCcw className="h-4 w-4 text-[#fde68a]" />
              <span>{t.restartBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
