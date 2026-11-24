import { describe, it, expect } from 'vitest';
import { FormattingCorrector } from '../src/core/formatting_corrector';
import { OCREngine } from '../src/core/ocr_engine';
import { DocumentExporter } from '../src/core/document_exporter';
import { DocumentStore } from '../src/core/document_store';

describe('Inkify End-to-End Processing Pipeline', () => {
  it('processes raw noisy handwriting scan through entire digitization lifecycle', () => {
    // 1. Raw noisy text simulating optical scan with stray symbols & split hyphens
    const rawNoisyOCR = `
    LAB EXPERIMENT 4 ~ ELECTRICAL RESISTANCE |
    
    1. Overview and Objectives
    Measure the resist-
    ance of ohmic conductors across temperatures.
    
    2. Observations:
    - Current measured at 2.5 A with voltage 1O.O V .
    - Resistance calculated as 4.O Ohms.
    `;

    // 2. Formatting & artifact cleanup
    const corrector = new FormattingCorrector();
    const disambiguated = corrector.disambiguateNumbers(rawNoisyOCR);
    const cleaned = corrector.cleanArtifacts(disambiguated);

    expect(cleaned).not.toContain('~');
    expect(cleaned).not.toContain('|');
    expect(cleaned).toContain('resistance'); // hyphen reconnected
    expect(cleaned).toContain('10.0'); // O -> 0 disambiguated
    expect(cleaned).toContain('4.0');

    // 3. OCR line segmentation & geometry
    const engine = new OCREngine();
    const rawLines = cleaned.split('\n').filter((l) => l.trim().length > 0);
    const segmentedLines = rawLines.map((l, idx) => engine.segmentLine(l, idx + 1, 0.95));

    expect(segmentedLines.length).toBeGreaterThan(3);
    expect(segmentedLines[0].words.length).toBeGreaterThan(0);
    expect(segmentedLines[0].words[0].bbox.height).toBe(22);

    // 4. Page building & paragraph reconstruction
    const page = engine.buildPage(1, segmentedLines);
    expect(page.averageConfidence).toBeGreaterThan(0.9);
    expect(page.reconstructedParagraphs.length).toBeGreaterThan(1);

    // 5. Document creation
    const doc = engine.createDocument(
      'Physics Lab 4 Resistance',
      'lab_scan_4.png',
      'IMAGE',
      [page],
      ['Physics', 'Lab']
    );

    expect(doc.id).toBeDefined();
    expect(doc.overallConfidence).toBeGreaterThan(0.9);

    // 6. Save in DocumentStore
    const store = new DocumentStore(false);
    store.save(doc);
    expect(store.list().length).toBe(1);

    // 7. Multi-format export
    const exporter = new DocumentExporter();
    const docxResult = exporter.export(doc, 'DOCX');
    expect(docxResult.content).toContain('<w:document');
    expect(docxResult.fileName).toBe('Physics_Lab_4_Resistance.docx');

    const pdfResult = exporter.export(doc, 'PDF');
    expect(pdfResult.content).toContain('<!DOCTYPE html>');
    expect(pdfResult.content).toContain('Physics Lab 4 Resistance');

    const txtResult = exporter.export(doc, 'TXT');
    expect(txtResult.content).toContain('Physics Lab 4 Resistance');
  });
});
