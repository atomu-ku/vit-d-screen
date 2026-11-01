import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/i18n';

interface WelcomePageProps {
  onStart: () => void;
  lang: Language;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStart,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-[#d6dec0] bg-[#fffdf7] shadow-sm">
        <div className="border-b border-[#e4ead2] bg-gradient-to-br from-[#eef4dc] via-[#f5f4d7] to-[#fbf4cd] px-5 py-5 sm:px-6">
          <h1 className="text-xl font-extrabold tracking-tight text-[#253628] sm:text-2xl">
            {t.welcomeTitle}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#4a5d47]">{t.welcomeDesc}</p>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {/* Quick Summary Strip */}
          <div className="grid grid-cols-3 divide-x divide-[#e2e8ce] rounded-xl border border-[#dce3c6] bg-[#f7f9ee] py-3 text-center">
            <div className="px-2">
              <div className="text-xs font-bold text-[#2b3f2e]">{t.stat1Title}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-[#60735b]">{t.stat1Sub}</div>
            </div>
            <div className="px-2">
              <div className="text-xs font-bold text-[#2b3f2e]">{t.stat2Title}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-[#60735b]">{t.stat2Sub}</div>
            </div>
            <div className="px-2">
              <div className="text-xs font-bold text-[#2b3f2e]">{t.stat3Title}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-[#60735b]">{t.stat3Sub}</div>
            </div>
          </div>

          {/* Limitations Box */}
          <div
            role="region"
            aria-label="Limitations"
            className="rounded-xl border border-[#e3c96f] bg-[#fdf6dc] p-3.5"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#b5851b]" />
              <div className="space-y-1 text-xs leading-relaxed text-[#5c4715]">
                <div>
                  <span className="font-bold">{t.limitationsLabel}</span>
                  {t.limitationsText}
                </div>
                <div>
                  <span className="font-bold">{t.sampleGroupLabel}</span>
                  {t.sampleGroupText}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3f6d48] to-[#538451] px-5 py-3.5 text-base font-bold text-[#fffdf5] shadow-sm transition active:scale-[0.99] hover:from-[#355d3d] hover:to-[#477345]"
          >
            <span>{t.startBtn}</span>
            <ArrowRight className="h-4 w-4 text-[#fde68a]" />
          </button>
        </div>
      </div>
    </div>
  );
};
