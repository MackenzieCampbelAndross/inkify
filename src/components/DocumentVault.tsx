import React, { useState } from 'react';
import { DigitizedDocument, ExportFormat } from '../types';
import { DocumentStore } from '../core/document_store';
import { DocumentExporter } from '../core/document_exporter';

interface DocumentVaultProps {
  documentStore: DocumentStore;
  onOpenDocument: (doc: DigitizedDocument) => void;
  onRefresh: () => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documentStore,
  onOpenDocument,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const docs = documentStore.search(searchQuery);

  const handleExport = (doc: DigitizedDocument, format: ExportFormat, e: React.MouseEvent) => {
    e.stopPropagation();
    const exporter = new DocumentExporter();
    exporter.downloadFile(doc, format);
    setDownloadMsg(`Exported "${doc.title}" as ${format}`);
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  const handleDelete = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    documentStore.delete(docId);
    onRefresh();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Document Vault</h2>
          <p className="text-slate-400 text-sm">
            Archived and digitized handwritten records with exportable formats.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or content..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {downloadMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
          {downloadMsg}
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 border border-slate-800 rounded-2xl">
          <div className="text-4xl mb-3">🗂️</div>
          <h3 className="text-base font-medium text-slate-300">No documents found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Scan a handwritten document or load a sample note to populate your digital vault.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => {
            const confPct = Math.round(doc.overallConfidence * 100);

            return (
              <div
                key={doc.id}
                onClick={() => onOpenDocument(doc)}
                className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {doc.fileType}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        confPct >= 85
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {confPct}% conf
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-200 mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 truncate">
                    {doc.sourceFileName} • {doc.pages.length} page(s)
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-3 bg-slate-950/60 p-2.5 rounded-lg font-mono border border-slate-800/60 mb-4">
                    {doc.reconstructedMarkdown || doc.fullText}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex space-x-1.5">
                    <button
                      onClick={(e) => handleExport(doc, 'DOCX', e)}
                      title="Export Word document"
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-medium"
                    >
                      DOCX
                    </button>
                    <button
                      onClick={(e) => handleExport(doc, 'PDF', e)}
                      title="Export PDF document"
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 text-[11px] font-medium"
                    >
                      PDF
                    </button>
                    <button
                      onClick={(e) => handleExport(doc, 'TXT', e)}
                      title="Export plain text"
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                    >
                      TXT
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete document"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
