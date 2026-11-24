/**
 * Domain types and models for Inkify (Handwriting to Digital Document Converter).
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRWord {
  id: string;
  text: string;
  confidence: number; // 0.0 - 1.0
  bbox: BoundingBox;
}

export interface OCRLine {
  lineNumber: number;
  text: string;
  confidence: number;
  words: OCRWord[];
  isHeader?: boolean;
  isBullet?: boolean;
}

export interface OCRPage {
  pageNumber: number;
  rawLines: OCRLine[];
  reconstructedParagraphs: string[];
  averageConfidence: number;
  imagePreviewUrl?: string;
}

export interface DigitizedDocument {
  id: string;
  title: string;
  sourceFileName: string;
  fileType: 'IMAGE' | 'PDF';
  pages: OCRPage[];
  fullText: string;
  reconstructedMarkdown: string;
  overallConfidence: number;
  tags?: string[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  createdAt: number;
  updatedAt: number;
}

export type ExportFormat = 'DOCX' | 'PDF' | 'TXT' | 'MARKDOWN';

export interface BatchItem {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  pageCount: number;
  documentId?: string;
  error?: string;
}

export interface BatchJob {
  id: string;
  name: string;
  createdAt: number;
  items: BatchItem[];
  progressPercent: number;
}
