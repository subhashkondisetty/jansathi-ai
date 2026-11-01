/**
 * @fileoverview Civic footer with national service attribution and FORGE '26 Theme 1 notice.
 */

import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">
                {t('brand_title')} &bull; {t('brand_tagline')}
              </p>
              <p className="text-[11px] text-slate-500">
                FORGE &apos;26 &bull; Theme 1: {t('brand_theme')} &bull; Non-AI MERN Foundation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="inline-flex items-center space-x-1.5 text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Phase 8: Frontend Foundation</span>
            </span>
            <span className="text-slate-500">
              Node 20+ &bull; React 18 &bull; Express 4 &bull; MongoDB Atlas
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-[10px] text-slate-500 leading-relaxed">
          <p>
            An open civic-tech initiative empowering Indian citizens with verified, transparent
            access to government schemes, gazette circulars, and welfare notifications. AI
            capabilities are reserved for future phases.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
