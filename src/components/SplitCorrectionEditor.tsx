import React, { useState } from 'react';
import { DigitizedDocument, ExportFormat } from '../types';
import { DocumentExporter } from '../core/document_exporter';
import { FormattingCorrector } from '../core/formatting_corrector';

interface SplitCorrectionEditorProps {
  document: DigitizedDocument;
  onSave: (doc: DigitizedDocument) => void;
  onBack: () => void;
}

export const SplitCorrectionEditor: React.FC<SplitCorrectionEditorProps> = ({
  document,
  onSave,
  onBack,
}) => {
  const [doc, setDoc] = useState<DigitizedDocument>({ ...document });
  const [activePageIdx, setActivePageIdx] = useState<number>(0);
  const [editedText, setEditedText] = useState<string>(
    doc.reconstructedMarkdown || doc.fullText
  );
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const activePage = doc.pages[activePageIdx] || doc.pages[0];

  const handleExport = (format: ExportFormat) => {
    const exporter = new DocumentExporter();
    exporter.downloadFile(doc, format);
    setDownloadNotice(`Exported as ${format} successfully!`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleApplyAutoCorrection = () => {
    const corrector = new FormattingCorrector();
    const fixed = corrector.cleanArtifacts(editedText);
    setEditedText(fixed);
    setDoc({
      ...doc,
      reconstructedMarkdown: fixed,
      fullText: fixed,
    });
  };

  const handleSave = () => {
    const updated = {
      ...doc,
      reconstructedMarkdown: editedText,
      fullText: editedText,
      updatedAt: Date.now(),
    };
    setDoc(updated);
    onSave(updated);
    setDownloadNotice('Document saved to local vault.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const getConfidenceBadge = (confidence: number) => {
    const pct = Math.round(confidence * 100);
    let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (pct < 85) colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (pct < 70) colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        {pct}% Confidence
      </span>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      {/* Top action bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={doc.title}
                onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                className="bg-transparent font-bold text-slate-100 text-base focus:bg-slate-800 px-2 py-0.5 rounded border border-transparent focus:border-slate-700 outline-none"
              />
              {getConfidenceBadge(doc.overallConfidence)}
            </div>
            <p className="text-xs text-slate-400 px-2">
              Source: {doc.sourceFileName} • {doc.pages.length} page(s)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {downloadNotice && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
              {downloadNotice}
            </span>
          )}

          <button
            onClick={handleApplyAutoCorrection}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition-all"
            title="Clean artifacts, connect hyphenated words, disambiguate characters"
          >
            ✨ Auto-Clean
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            💾 Save
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Export buttons */}
          <button
            onClick={() => handleExport('DOCX')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-all"
          >
            DOCX
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 transition-all"
          >
            PDF
          </button>
          <button
            onClick={() => handleExport('MARKDOWN')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 transition-all"
          >
            Markdown
          </button>
          <button
            onClick={() => handleExport('TXT')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            TXT
          </button>
        </div>
      </div>

      {/* Split view content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
        {/* Left: OCR Segmentation & Visual Preview */}
        <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
          <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              OCR Line Segmentation & Confidence
            </span>
            {doc.pages.length > 1 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-slate-400 mr-2">Page:</span>
                {doc.pages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePageIdx(idx)}
                    className={`w-6 h-6 rounded text-xs font-semibold ${
                      activePageIdx === idx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {activePage?.rawLines.map((line) => {
              const linePct = Math.round(line.confidence * 100);
              const isLow = linePct < 85;

              return (
                <div
                  key={line.lineNumber}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isLow
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-slate-800/80 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-sans">
                    <span className="font-semibold text-slate-300">Line {line.lineNumber}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        isLow ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500'
                      }`}
                    >
                      {linePct}% conf
                    </span>
                  </div>

                  <p className="text-slate-200">{line.text}</p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {line.words.map((w) => (
                      <span
                        key={w.id}
                        title={`bbox: [${w.bbox.x}, ${w.bbox.y}, ${w.bbox.width}, ${w.bbox.height}] | ${(w.confidence * 100).toFixed(0)}%`}
                        className={`px-1.5 py-0.5 rounded text-[10px] border cursor-help ${
                          w.confidence < 0.85
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700/50'
                        }`}
                      >
                        {w.text}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Manual Correction & Markdown Output */}
        <div className="flex flex-col h-full bg-slate-900/30 overflow-hidden">
          <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Reconstructed Document (Editable)
            </span>
            <span className="text-xs text-slate-500">Live Markdown Editor</span>
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-200 leading-relaxed outline-none focus:border-indigo-500/50 resize-none shadow-inner"
              placeholder="Reconstructed markdown text appears here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
