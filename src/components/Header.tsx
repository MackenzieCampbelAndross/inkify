import React from 'react';

export type ActiveTab = 'SCANNER' | 'EDITOR' | 'BATCH' | 'VAULT';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  documentCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, documentCount }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
          ✍️
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
              INKIFY
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v1.0.0
            </span>
          </div>
          <p className="text-xs text-slate-400">Handwriting to Digital Document Converter</p>
        </div>
      </div>

      <nav className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
        <button
          onClick={() => onTabChange('SCANNER')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'SCANNER'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          📷 Scan & OCR
        </button>
        <button
          onClick={() => onTabChange('EDITOR')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'EDITOR'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          ✏️ Correction Editor
        </button>
        <button
          onClick={() => onTabChange('BATCH')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'BATCH'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          ⚡ Batch Processing
        </button>
        <button
          onClick={() => onTabChange('VAULT')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
            activeTab === 'VAULT'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <span>📁 Vault</span>
          <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-700 text-indigo-300">
            {documentCount}
          </span>
        </button>
      </nav>
    </header>
  );
};
