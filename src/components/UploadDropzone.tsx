import React, { useState } from 'react';
import { DigitizedDocument } from '../types';
import { OCREngine } from '../core/ocr_engine';
import { FormattingCorrector } from '../core/formatting_corrector';
import { ParagraphReconstructor } from '../core/paragraph_reconstructor';

interface UploadDropzoneProps {
  onDocumentCreated: (doc: DigitizedDocument) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onDocumentCreated }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulatedScan = (type: 'LECTURE' | 'MEETING' | 'RECIPE') => {
    setIsProcessing(true);

    setTimeout(() => {
      let rawText = '';
      let title = '';

      if (type === 'LECTURE') {
        title = 'Physics 101 - Thermodynamics Lecture Notes';
        rawText = `Chapter 4 - Laws of Thermodynamcs
1. First Law of Thermodynamics
Energy cannot be created or destryed in an isolated system.
Delta U = Q - W
Where U is internal energy, Q is heat added, and W is work done by the syst-
em on its surroundings.

2. Second Law
The entropy of an isolated system always increses over time.
- Entropy is a measure of randomness
- Natural processes tend toward maximum disorder`;
      } else if (type === 'MEETING') {
        title = 'Executive Strategy Sync - Q3 Objectives';
        rawText = `Q3 Architecture and Execution Plan
Key Discussion Points:
1. Product Roadmap Milestones
Deliver all 15 standalone products with verified test gates and automated publ-
ishing pipelines.

2. Action Items:
- Mackenzie to lead technical implementation and release verification
- Ensure zero regression across all test suites
- Target 100% gate compliance before activating scheduled release`;
      } else {
        title = 'Grandma Secret Sourdough Recipe';
        rawText = `Classic Sourdough Bread Recipe
Ingredients:
- 500g strong white bread flour
- 350g lukewarm water
- 100g active sourdough starter
- 10g sea salt

Method:
Mix flour and water. Rest for 30 minutes autolyse.
Add starter and salt. Knead gently until smooth.
Bake in a preheated Dutch oven at 230 C for 25 mins with lid on, then 20 mins uncovered.`;
      }

      const ocrEngine = new OCREngine();
      const corrector = new FormattingCorrector();
      const reconstructor = new ParagraphReconstructor();

      // Clean raw text
      const cleaned = corrector.cleanArtifacts(rawText);

      // Create OCR lines
      const lines = cleaned.split('\n').map((lineText, idx) => {
        return ocrEngine.segmentLine(lineText, idx + 1, 0.94);
      });

      const page = ocrEngine.buildPage(1, lines);
      const doc = ocrEngine.createDocument(
        title,
        `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`,
        'IMAGE',
        [page]
      );

      // Reconstruct
      doc.reconstructedMarkdown = reconstructor.reconstructDocumentMarkdown(doc);

      setIsProcessing(false);
      onDocumentCreated(doc);
    }, 700);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = () => {
      // Create simulated OCR doc for this uploaded file
      const ocrEngine = new OCREngine();
      const reconstructor = new ParagraphReconstructor();

      const sampleLines = [
        ocrEngine.segmentLine(`Document: ${file.name}`, 1, 0.98),
        ocrEngine.segmentLine('Captured via Inkify Optical Scan Engine', 2, 0.95),
        ocrEngine.segmentLine('1. High-precision coordinate segmentation applied.', 3, 0.92),
        ocrEngine.segmentLine('2. Typographic correction and character disambiguation verified.', 4, 0.94),
        ocrEngine.segmentLine('- Multi-page reconstructor ready for manual review.', 5, 0.91),
      ];

      const page = ocrEngine.buildPage(1, sampleLines);
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const doc = ocrEngine.createDocument(
        file.name.replace(/\.[^/.]+$/, ''),
        file.name,
        isPdf ? 'PDF' : 'IMAGE',
        [page]
      );

      doc.reconstructedMarkdown = reconstructor.reconstructDocumentMarkdown(doc);

      setIsProcessing(false);
      onDocumentCreated(doc);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-100 mb-2">
          Digitize Handwriting & Scanned Documents
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Upload photos, scans, or PDFs of handwritten notes. Inkify cleans artifacts, segments
          lines, disambiguates characters, and outputs pristine structured documents.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            handleFileUpload({ target: { files: [file] } } as any);
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-3xl">
          📄
        </div>

        <h3 className="text-lg font-semibold text-slate-200 mb-1">
          Drag and drop your scanned file here
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Supports PNG, JPG, WEBP images and multi-page PDF documents up to 50MB
        </p>

        <label className="cursor-pointer inline-flex items-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all">
          <span>Browse Files</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing}
          />
        </label>
      </div>

      <div className="mt-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Or load an instant handwritten sample:</h4>
            <p className="text-xs text-slate-400">Test OCR parsing, punctuation correction, and multi-format export.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSimulatedScan('LECTURE')}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              📚 Lecture Notes
            </button>
            <button
              onClick={() => handleSimulatedScan('MEETING')}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              💼 Meeting Minutes
            </button>
            <button
              onClick={() => handleSimulatedScan('RECIPE')}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              🥖 Sourdough Recipe
            </button>
          </div>
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center space-x-3 py-4 text-indigo-400">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Scanning handwritten lines & running OCR neural segmentation...</span>
          </div>
        )}
      </div>
    </div>
  );
};
