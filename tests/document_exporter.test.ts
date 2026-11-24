import { describe, it, expect } from 'vitest';
import { DocumentExporter } from '../src/core/document_exporter';
import { DigitizedDocument } from '../src/types';

describe('DocumentExporter', () => {
  const exporter = new DocumentExporter();

  const mockDoc: DigitizedDocument = {
    id: 'doc_test_1',
    title: 'Research Findings 2026',
    sourceFileName: 'research_notes.pdf',
    fileType: 'PDF',
    fullText: 'Section 1: Initial results look promising.\nSection 2: Further testing required.',
    reconstructedMarkdown: '# Research Findings 2026\n\n## Section 1\nInitial results look promising.\n\n## Section 2\nFurther testing required.',
    overallConfidence: 0.96,
    status: 'COMPLETED',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pages: [
      {
        pageNumber: 1,
        rawLines: [],
        reconstructedParagraphs: [
          '## Section 1',
          'Initial results look promising.',
          '## Section 2',
          'Further testing required.',
        ],
        averageConfidence: 0.96,
      },
    ],
  };

  it('exports to plain text format', () => {
    const result = exporter.export(mockDoc, 'TXT');
    expect(result.fileName).toBe('Research_Findings_2026.txt');
    expect(result.mimeType).toBe('text/plain');
    expect(result.content).toContain('Research Findings 2026');
    expect(result.content).toContain('Section 1: Initial results');
  });

  it('exports to Markdown format', () => {
    const result = exporter.export(mockDoc, 'MARKDOWN');
    expect(result.fileName).toBe('Research_Findings_2026.md');
    expect(result.mimeType).toBe('text/markdown');
    expect(result.content).toContain('# Research Findings 2026');
  });

  it('exports to printable HTML / PDF format', () => {
    const result = exporter.export(mockDoc, 'PDF');
    expect(result.fileName).toBe('Research_Findings_2026.html');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.content).toContain('<!DOCTYPE html>');
    expect(result.content).toContain('<h2>Section 1</h2>');
    expect(result.content).toContain('Accuracy: 96%');
  });

  it('exports to DOCX WordprocessingML XML format', () => {
    const result = exporter.export(mockDoc, 'DOCX');
    expect(result.fileName).toBe('Research_Findings_2026.docx');
    expect(result.mimeType).toContain('wordprocessingml');
    expect(result.content).toContain('<w:document');
    expect(result.content).toContain('Research Findings 2026');
    expect(result.content).toContain('Initial results look promising.');
  });
});
