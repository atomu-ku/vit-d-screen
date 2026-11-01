import React from 'react';
import { Language, TRANSLATIONS } from '../data/i18n';

interface FooterProps {
  lang?: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang = 'en' }) => {
  const t = TRANSLATIONS[lang];
  return (
    <footer className="mt-auto border-t border-[#dce2c8] bg-[#faf7eb] py-3.5">
      <div className="mx-auto max-w-xl px-4 text-center text-[11px] text-[#5c6e58]">
        {t.footerText}
      </div>
    </footer>
  );
};
