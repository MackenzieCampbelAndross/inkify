/**
 * Multi-format document exporter for Inkify.
 * Formats digitized texts into DOCX, PDF printable payloads, Markdown, and TXT.
 */

import { DigitizedDocument, ExportFormat } from '../types';

export interface ExportResult {
  fileName: string;
  mimeType: string;
  content: string; // Text or XML payload
}

export class DocumentExporter {
  export(document: DigitizedDocument, format: ExportFormat): ExportResult {
    return DocumentExporter.export(document, format);
  }

  downloadFile(document: DigitizedDocument, format: ExportFormat): ExportResult {
    const res = this.export(document, format);
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([res.content], { type: res.mimeType });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = res.fileName;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // Fallback for mock environments
      }
    }
    return res;
  }

  static export(document: DigitizedDocument, format: ExportFormat): ExportResult {
    const sanitizedTitle = document.title.replace(/[^a-zA-Z0-9_-]/g, '_');

    switch (format) {
      case 'TXT':
        return {
          fileName: `${sanitizedTitle}.txt`,
          mimeType: 'text/plain',
          content: `${document.title}\n${'='.repeat(document.title.length)}\n\n${document.fullText}`,
        };

      case 'MARKDOWN':
        return {
          fileName: `${sanitizedTitle}.md`,
          mimeType: 'text/markdown',
          content: document.reconstructedMarkdown,
        };

      case 'PDF':
        return {
          fileName: `${sanitizedTitle}.html`,
          mimeType: 'application/pdf',
          content: this.generatePrintableHTML(document),
        };

      case 'DOCX':
      default:
        return {
          fileName: `${sanitizedTitle}.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          content: this.generateWordprocessingML(document),
        };
    }
  }

  static generatePrintableHTML(doc: DigitizedDocument): string {
    const paragraphsHTML = doc.pages
      .flatMap((p) => p.reconstructedParagraphs)
      .map((p) => {
        if (p.startsWith('## ')) {
          return `<h2>${p.replace('## ', '')}</h2>`;
        }
        return `<p>${p}</p>`;
      })
      .join('\n      ');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${doc.title}</title>
    <style>
      body { font-family: 'Times New Roman', Times, serif; margin: 2in 1.5in; line-height: 1.6; color: #111; }
      h1 { font-size: 24pt; margin-bottom: 24pt; border-bottom: 2px solid #333; padding-bottom: 8pt; }
      h2 { font-size: 16pt; margin-top: 18pt; margin-bottom: 8pt; }
      p { font-size: 12pt; text-align: justify; margin-bottom: 12pt; text-indent: 0.5in; }
      .meta { font-size: 10pt; color: #666; margin-bottom: 20pt; }
    </style>
  </head>
  <body>
    <h1>${doc.title}</h1>
    <div class="meta">Digitized by Inkify • Accuracy: ${(doc.overallConfidence * 100).toFixed(0)}%</div>
    <div class="content">
      ${paragraphsHTML}
    </div>
  </body>
</html>`;
  }

  static generateWordprocessingML(doc: DigitizedDocument): string {
    const paragraphsXML = doc.pages
      .flatMap((p) => p.reconstructedParagraphs)
      .map((p) => {
        const escaped = p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<w:p><w:r><w:t>${escaped}</w:t></w:r></w:p>`;
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="48"/></w:rPr><w:t>${doc.title}</w:t></w:r></w:p>
    ${paragraphsXML}
  </w:body>
</w:document>`;
  }
}
