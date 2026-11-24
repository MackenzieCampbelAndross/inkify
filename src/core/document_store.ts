import { DigitizedDocument } from '../types';

export class DocumentStore {
  private documents: Map<string, DigitizedDocument> = new Map();
  private storageKey = 'inkify_documents_v1';

  constructor(loadFromStorage = false) {
    if (loadFromStorage && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const list: DigitizedDocument[] = JSON.parse(raw);
          for (const doc of list) {
            this.documents.set(doc.id, doc);
          }
        }
      } catch {
        // Fallback to memory
      }
    }
  }

  save(doc: DigitizedDocument): DigitizedDocument {
    const updated = {
      ...doc,
      updatedAt: Date.now(),
    };
    this.documents.set(doc.id, updated);
    this.syncStorage();
    return updated;
  }

  get(id: string): DigitizedDocument | undefined {
    return this.documents.get(id);
  }

  list(): DigitizedDocument[] {
    return Array.from(this.documents.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  search(query: string): DigitizedDocument[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.list();

    return this.list().filter(doc => {
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchContent = doc.fullText.toLowerCase().includes(q);
      const matchSource = doc.sourceFileName.toLowerCase().includes(q);
      const matchTag = doc.tags?.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchSource || matchTag;
    });
  }

  update(id: string, updates: Partial<DigitizedDocument>): DigitizedDocument {
    const existing = this.documents.get(id);
    if (!existing) {
      throw new Error(`Document with ID "${id}" not found.`);
    }

    const updated: DigitizedDocument = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    this.documents.set(id, updated);
    this.syncStorage();
    return updated;
  }

  delete(id: string): boolean {
    const deleted = this.documents.delete(id);
    if (deleted) {
      this.syncStorage();
    }
    return deleted;
  }

  clear(): void {
    this.documents.clear();
    this.syncStorage();
  }

  private syncStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const arr = Array.from(this.documents.values());
        localStorage.setItem(this.storageKey, JSON.stringify(arr));
      } catch {
        // Storage limit or blocked
      }
    }
  }
}
