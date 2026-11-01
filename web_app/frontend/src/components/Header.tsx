import React from 'react';
import { Sun } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/i18n';

interface HeaderProps {
  onReset: () => void;
  stepLabel?: string;
  lang: Language;
  onToggleLang: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  stepLabel,
  lang,
  onToggleLang,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-30 border-b border-[#34593d] bg-gradient-to-r from-[#3b6644] via-[#487850] to-[#5a8a52] text-[#fffdf5] shadow-sm">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f5d76e]/40 bg-[#f4d058]/25 shadow-inner">
            <Sun className="h-4 w-4 text-[#fde68a]" />
          </div>
          <span className="block text-sm font-bold leading-tight tracking-tight text-[#fffdf5] sm:text-base">
            {t.appTitle}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {stepLabel && (
            <span className="hidden rounded-full border border-[#f3d56b]/40 bg-[#f6e08b]/25 px-2.5 py-0.5 text-[11px] font-semibold text-[#fff9db] sm:inline-block">
              {stepLabel}
            </span>
          )}

          {/* EN / TH Toggle Button */}
          <div
            className="inline-flex items-center rounded-full border border-[#f3d56b]/50 bg-[#2e5236]/80 p-0.5 shadow-inner"
            role="group"
            aria-label="Language switcher"
          >
            <button
              type="button"
              onClick={() => onToggleLang('en')}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                lang === 'en'
                  ? 'bg-[#f6e08b] text-[#253628] shadow-sm'
                  : 'text-[#e6eed6] hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onToggleLang('th')}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                lang === 'th'
                  ? 'bg-[#f6e08b] text-[#253628] shadow-sm'
                  : 'text-[#e6eed6] hover:text-white'
              }`}
            >
              TH
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
