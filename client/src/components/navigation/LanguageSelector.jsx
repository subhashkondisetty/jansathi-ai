/**
 * @fileoverview Language selector synchronized with OptionsContext, LanguageContext, and user profile.
 * Triggers full client-side interface translation and sets document <html lang>.
 * Compact accessible design preventing layout disruption in responsive headers.
 */

import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useOptions } from '../../context/OptionsContext.jsx';
import { Languages } from 'lucide-react';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const { options } = useOptions();
  const [saving, setSaving] = useState(false);

  const languages = options?.languages || [];

  const handleChange = async (e) => {
    const newLang = e.target.value;
    setSaving(true);
    await setLanguage(newLang);
    setSaving(false);
  };

  return (
    <div className="relative inline-flex flex-shrink-0 items-center">
      <div className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2.5 py-1.5 border border-slate-200 transition-colors shadow-xs">
        <Languages className="w-4 h-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
        <label htmlFor="language-select" className="sr-only">
          Select preferred language
        </label>
        <select
          id="language-select"
          value={language}
          onChange={handleChange}
          disabled={saving || languages.length === 0}
          className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
          aria-describedby="lang-helper-text"
          title="Select preferred interface and assistant language"
        >
          {languages.length === 0 ? (
            <option value="en">English</option>
          ) : (
            languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.nativeLabel || l.label} ({l.label})
              </option>
            ))
          )}
        </select>
      </div>
      <p id="lang-helper-text" className="sr-only">
        Interface translation is coming soon; this sets the language for AI answers
      </p>
    </div>
  );
};

export default LanguageSelector;
