import { describe, it, expect } from 'vitest';
import { ParagraphReconstructor } from '../src/core/paragraph_reconstructor';
import { OCRLine } from '../src/types';

describe('ParagraphReconstructor', () => {
  const reconstructor = new ParagraphReconstructor();

  it('groups lines into a single paragraph when punctuated at end', () => {
    const lines: OCRLine[] = [
      {
        lineNumber: 1,
        text: 'This is the beginning of a handwritten sentence',
        confidence: 0.95,
        words: [],
      },
      {
        lineNumber: 2,
        text: 'that flows continuously across multiple lines.',
        confidence: 0.94,
        words: [],
      },
    ];

    const paragraphs = reconstructor.reconstruct(lines);
    expect(paragraphs.length).toBe(1);
    expect(paragraphs[0]).toBe(
      'This is the beginning of a handwritten sentence that flows continuously across multiple lines.'
    );
  });

  it('detects header lines and prepends markdown header syntax', () => {
    const lines: OCRLine[] = [
      {
        lineNumber: 1,
        text: 'CHAPTER 1 INTRODUCTION',
        confidence: 0.98,
        words: [],
        isHeader: true,
      },
      {
        lineNumber: 2,
        text: 'The fundamental theory behind digital handwriting conversion starts here.',
        confidence: 0.96,
        words: [],
      },
    ];

    const paragraphs = reconstructor.reconstruct(lines);
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0]).toBe('## CHAPTER 1 INTRODUCTION');
    expect(paragraphs[1]).toContain('fundamental theory');
  });

  it('identifies bullet points and preserves list formatting', () => {
    const lines: OCRLine[] = [
      {
        lineNumber: 1,
        text: 'Meeting Highlights:',
        confidence: 0.92,
        words: [],
        isHeader: true,
      },
      {
        lineNumber: 2,
        text: '- Deliver clean modular architecture',
        confidence: 0.95,
        words: [],
        isBullet: true,
      },
      {
        lineNumber: 3,
        text: '- Maintain 100% test passing gates',
        confidence: 0.94,
        words: [],
        isBullet: true,
      },
    ];

    const paragraphs = reconstructor.reconstruct(lines);
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[1]).toMatch(/^- Deliver clean modular architecture/);
    expect(paragraphs[2]).toMatch(/^- Maintain 100% test passing gates/);
  });

  it('generates complete markdown document with title', () => {
    const paragraphs = ['First paragraph of notes.', 'Second paragraph of notes.'];
    const md = reconstructor.toMarkdown(paragraphs, 'Lecture Summary');
    expect(md).toContain('# Lecture Summary');
    expect(md).toContain('First paragraph of notes.');
    expect(md).toContain('Second paragraph of notes.');
  });
});
