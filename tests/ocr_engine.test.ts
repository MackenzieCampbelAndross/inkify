import { describe, it, expect } from 'vitest';
import { OCREngine } from '../src/core/ocr_engine';

describe('OCREngine', () => {
  const engine = new OCREngine();

  it('segments text into line with bounding boxes for each word', () => {
    const text = 'Handwritten notes capture ideas quickly';
    const line = engine.segmentLine(text, 1, 0.95);

    expect(line.lineNumber).toBe(1);
    expect(line.words.length).toBe(5);
    expect(line.words[0].text).toBe('Handwritten');
    expect(line.words[0].bbox.x).toBe(20);
    expect(line.words[0].bbox.height).toBe(22);
    expect(line.words[1].bbox.x).toBeGreaterThan(line.words[0].bbox.x);
    expect(line.confidence).toBeGreaterThan(0.7);
  });

  it('builds an OCRPage with calculated average confidence', () => {
    const line1 = engine.segmentLine('First line of text', 1, 0.95);
    const line2 = engine.segmentLine('Second line of text', 2, 0.91);

    const page = engine.buildPage(1, [line1, line2]);
    expect(page.pageNumber).toBe(1);
    expect(page.rawLines.length).toBe(2);
    expect(page.averageConfidence).toBeCloseTo(0.93, 1);
    expect(page.reconstructedParagraphs.length).toBeGreaterThan(0);
  });

  it('creates complete DigitizedDocument with metadata', () => {
    const line = engine.segmentLine('Important contract agreement', 1, 0.98);
    const page = engine.buildPage(1, [line]);

    const doc = engine.createDocument(
      'Service Agreement',
      'contract_scan_01.png',
      'IMAGE',
      [page],
      ['Contract', 'Legal']
    );

    expect(doc.id).toMatch(/^doc_/);
    expect(doc.title).toBe('Service Agreement');
    expect(doc.fileType).toBe('IMAGE');
    expect(doc.pages.length).toBe(1);
    expect(doc.tags).toContain('Legal');
    expect(doc.status).toBe('COMPLETED');
    expect(doc.overallConfidence).toBeGreaterThan(0.9);
  });
});
