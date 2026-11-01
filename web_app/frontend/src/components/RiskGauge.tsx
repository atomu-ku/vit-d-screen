import React from 'react';
import { Language, TRANSLATIONS } from '../data/i18n';

interface RiskGaugeProps {
  lang?: Language;
  percentage: number; // 0 to 100
  thresholdPercentage: number;
  riskClassification: 'Low Risk' | 'High Risk';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  lang = 'en',
  percentage,
  thresholdPercentage,
  riskClassification,
}) => {
  const t = TRANSLATIONS[lang];
  const clampedPct = Math.max(0, Math.min(100, percentage));

  const cx = 160;
  const cy = 150;
  const radius = 115;

  const needleRotationDeg = (clampedPct / 100) * 180 - 90;

  const thresholdAngleRad = Math.PI * (1 - thresholdPercentage / 100);
  const threshInnerR = radius - 18;
  const threshOuterR = radius + 18;
  const tx1 = cx + threshInnerR * Math.cos(thresholdAngleRad);
  const ty1 = cy - threshInnerR * Math.sin(thresholdAngleRad);
  const tx2 = cx + threshOuterR * Math.cos(thresholdAngleRad);
  const ty2 = cy - threshOuterR * Math.sin(thresholdAngleRad);

  const labelRadius = radius + 28;
  const tLabelX = cx + labelRadius * Math.cos(thresholdAngleRad);
  const tLabelY = cy - labelRadius * Math.sin(thresholdAngleRad);

  const isHighRisk = riskClassification === 'High Risk';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[300px]">
        <svg
          viewBox="0 0 320 190"
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`Semicircular speedometer gauge showing ${clampedPct.toFixed(
            1
          )}% predicted probability of vitamin D deficiency (${riskClassification})`}
        >
          <defs>
            <linearGradient id="riskGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3f7a4d" />
              <stop offset="30%" stopColor="#8ab84b" />
              <stop offset="55%" stopColor="#e8c547" />
              <stop offset="78%" stopColor="#e58a3b" />
              <stop offset="100%" stopColor="#cf463c" />
            </linearGradient>

            <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.22" />
            </filter>
          </defs>

          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#e6ebd5"
            strokeWidth="26"
            strokeLinecap="round"
          />

          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="url(#riskGaugeGradient)"
            strokeWidth="22"
            strokeLinecap="round"
          />

          <line
            x1={tx1}
            y1={ty1}
            x2={tx2}
            y2={ty2}
            stroke="#253628"
            strokeWidth="2.5"
            strokeDasharray="3 2"
          />
          <text
            x={tLabelX}
            y={tLabelY - 2}
            textAnchor="middle"
            className="fill-[#3b523e] text-[9px] font-bold"
          >
          {t.cutoffGauge(String(thresholdPercentage))}
          </text>

          <text
            x={cx - radius}
            y={cy + 24}
            textAnchor="middle"
            className="fill-[#356340] text-xs font-bold"
          >
            0%
          </text>
          <text
            x={cx}
            y={cy - radius - 16}
            textAnchor="middle"
            className="fill-[#6c7d66] text-[10px] font-semibold"
          >
            50%
          </text>
          <text
            x={cx + radius}
            y={cy + 24}
            textAnchor="middle"
            className="fill-[#b93c32] text-xs font-bold"
          >
            100%
          </text>

          <g
            transform={`rotate(${needleRotationDeg} ${cx} ${cy})`}
            style={{ transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)' }}
            filter="url(#needleShadow)"
          >
            <polygon
              points={`${cx - 5},${cy} ${cx},${cy - (radius - 8)} ${cx + 5},${cy}`}
              fill="#253628"
            />
          </g>

          <circle cx={cx} cy={cy} r="10" fill="#253628" />
          <circle cx={cx} cy={cy} r="4" fill="#fffdf5" />
        </svg>
      </div>

      <div className="-mt-3 text-center">
        <div className="text-4xl font-extrabold tracking-tight text-[#253628]">
          {clampedPct.toFixed(1)}%
        </div>
        <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#60735b]">
          {t.probSubtitle}
        </div>

        <div className="mt-2.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-sm font-extrabold shadow-sm ${
              isHighRisk
                ? 'border border-[#e09d8c] bg-[#fbe7e2] text-[#87291f]'
                : 'border border-[#a8c686] bg-[#e5f0d5] text-[#28502e]'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isHighRisk ? 'bg-[#c94032]' : 'bg-[#3d7a47]'
              }`}
            />
            <span>{isHighRisk ? t.highRisk : t.lowRisk}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
