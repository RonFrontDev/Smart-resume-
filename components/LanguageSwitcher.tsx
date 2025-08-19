import React from 'react';
import { translations } from '../i18n';
import { ChevronDownIcon } from './icons';

interface LanguageSwitcherProps {
  currentLang: keyof typeof translations;
  onSelectLang: (lang: keyof typeof translations) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onSelectLang }) => {
  return (
    <div className="relative">
      <select
        value={currentLang}
        onChange={(e) => onSelectLang(e.target.value as keyof typeof translations)}
        className="appearance-none bg-transparent cursor-pointer font-semibold text-gray-600 hover:text-gray-800 focus:outline-none pr-6 py-2"
        aria-label="Select language"
      >
        <option value="en">EN</option>
        <option value="da">DA</option>
        <option value="sv">SV</option>
      </select>
      <ChevronDownIcon className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
};
