import React, { useState, useMemo } from 'react';
import { Header, ActiveTab } from './components/Header';
import { UploadDropzone } from './components/UploadDropzone';
import { SplitCorrectionEditor } from './components/SplitCorrectionEditor';
import { BatchQueueView } from './components/BatchQueueView';
import { DocumentVault } from './components/DocumentVault';
import { DocumentStore } from './core/document_store';
import { BatchProcessor } from './core/batch_processor';
import { DigitizedDocument } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('SCANNER');
  const [editingDoc, setEditingDoc] = useState<DigitizedDocument | null>(null);
  const [, setRefreshTick] = useState<number>(0);

  const documentStore = useMemo(() => new DocumentStore(true), []);
  const batchProcessor = useMemo(() => new BatchProcessor(), []);

  const triggerRefresh = () => setRefreshTick((t) => t + 1);

  const handleDocumentCreated = (doc: DigitizedDocument) => {
    documentStore.save(doc);
    setEditingDoc(doc);
    setActiveTab('EDITOR');
    triggerRefresh();
  };

  const handleDocumentSaved = (doc: DigitizedDocument) => {
    documentStore.save(doc);
    setEditingDoc(doc);
    triggerRefresh();
  };

  const handleOpenDocument = (doc: DigitizedDocument) => {
    setEditingDoc(doc);
    setActiveTab('EDITOR');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        documentCount={documentStore.list().length}
      />

      <main className="flex-1 flex flex-col">
        {activeTab === 'SCANNER' && (
          <UploadDropzone onDocumentCreated={handleDocumentCreated} />
        )}

        {activeTab === 'EDITOR' && (
          editingDoc ? (
            <SplitCorrectionEditor
              document={editingDoc}
              onSave={handleDocumentSaved}
              onBack={() => setActiveTab('VAULT')}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-lg font-semibold text-slate-200">No document currently loaded</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Scan a new handwritten document or pick one from your vault to start editing.
              </p>
              <button
                onClick={() => setActiveTab('SCANNER')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20"
              >
                Go to Scanner
              </button>
            </div>
          )
        )}

        {activeTab === 'BATCH' && (
          <BatchQueueView batchProcessor={batchProcessor} />
        )}

        {activeTab === 'VAULT' && (
          <DocumentVault
            documentStore={documentStore}
            onOpenDocument={handleOpenDocument}
            onRefresh={triggerRefresh}
          />
        )}
      </main>
    </div>
  );
};

export default App;
