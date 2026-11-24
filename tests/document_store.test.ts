import { describe, it, expect } from 'vitest';
import { DocumentStore } from '../src/core/document_store';
import { DigitizedDocument } from '../src/types';

describe('DocumentStore', () => {
  const store = new DocumentStore(false);

  const mockDoc: DigitizedDocument = {
    id: 'doc_alpha_1',
    title: 'Algebra Notes',
    sourceFileName: 'algebra_scan.png',
    fileType: 'IMAGE',
    fullText: 'Quadratic equations and polynomials.',
    reconstructedMarkdown: '# Algebra Notes\nQuadratic equations and polynomials.',
    overallConfidence: 0.95,
    tags: ['Math', 'Algebra'],
    status: 'COMPLETED',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pages: [],
  };

  it('saves and retrieves documents', () => {
    store.save(mockDoc);
    const retrieved = store.get('doc_alpha_1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Algebra Notes');
  });

  it('searches documents by title, content, and tags', () => {
    store.save(mockDoc);

    const matchTitle = store.search('Algebra');
    expect(matchTitle.length).toBeGreaterThan(0);

    const matchContent = store.search('polynomials');
    expect(matchContent.length).toBeGreaterThan(0);

    const matchTag = store.search('Math');
    expect(matchTag.length).toBeGreaterThan(0);

    const matchNone = store.search('nonexistent_term_xyz');
    expect(matchNone.length).toBe(0);
  });

  it('updates document fields', () => {
    store.save(mockDoc);
    const updated = store.update('doc_alpha_1', {
      title: 'Advanced Algebra Notes',
    });

    expect(updated.title).toBe('Advanced Algebra Notes');
    expect(store.get('doc_alpha_1')?.title).toBe('Advanced Algebra Notes');
  });

  it('deletes document and verifies removal', () => {
    store.save(mockDoc);
    expect(store.get('doc_alpha_1')).toBeDefined();

    const success = store.delete('doc_alpha_1');
    expect(success).toBe(true);
    expect(store.get('doc_alpha_1')).toBeUndefined();
  });
});
