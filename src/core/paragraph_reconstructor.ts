/**
 * Structural Paragraph and Document Reconstructor for Inkify.
 * Groups segmented lines into cohesive paragraphs, headers, and bulleted lists.
 */

import { OCRLine, DigitizedDocument } from '../types';
import { FormattingCorrector } from './formatting_corrector';

export class ParagraphReconstructor {
  /**
   * Reconstructs an array of lines into semantic paragraphs.
   */
  reconstruct(lines: OCRLine[]): string[] {
    if (lines.length === 0) return [];

    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedText = line.text.trim();
      if (!trimmedText) continue;

      // Check if line looks like a header (short, title case or uppercase, no period at end)
      const isHeader =
        line.isHeader ||
        (trimmedText.length < 50 &&
          !trimmedText.endsWith('.') &&
          !trimmedText.endsWith(',') &&
          (trimmedText === trimmedText.toUpperCase() ||
            /^[A-Z][a-zA-Z0-9\s]{2,40}$/.test(trimmedText)) &&
          i < lines.length - 1);

      // Check if line is a bullet item
      const isBullet =
        line.isBullet ||
        /^[-*•]\s+/.test(trimmedText) ||
        /^\d+\.\s+/.test(trimmedText);

      if (isHeader) {
        if (currentParagraph.length > 0) {
          paragraphs.push(FormattingCorrector.cleanText(currentParagraph.join(' ')));
          currentParagraph = [];
        }
        paragraphs.push(`## ${FormattingCorrector.cleanText(trimmedText)}`);
        continue;
      }

      if (isBullet) {
        if (currentParagraph.length > 0) {
          paragraphs.push(FormattingCorrector.cleanText(currentParagraph.join(' ')));
          currentParagraph = [];
        }
        paragraphs.push(FormattingCorrector.cleanText(trimmedText));
        continue;
      }

      // Check for paragraph termination (line ends with terminal punctuation: . ! ?)
      if (/[.!?]["']?$/.test(trimmedText)) {
        currentParagraph.push(trimmedText);
        paragraphs.push(FormattingCorrector.cleanText(currentParagraph.join(' ')));
        currentParagraph = [];
      } else {
        // Line continuation
        currentParagraph.push(trimmedText);
      }
    }

    if (currentParagraph.length > 0) {
      paragraphs.push(FormattingCorrector.cleanText(currentParagraph.join(' ')));
    }

    return paragraphs;
  }

  /**
   * Compiles reconstructed paragraphs into markdown document format.
   */
  toMarkdown(paragraphs: string[], documentTitle: string = 'Digitized Document'): string {
    const header = `# ${documentTitle}\n\n`;
    const body = paragraphs.join('\n\n');
    return header + body;
  }

  /**
   * Reconstructs full markdown for an entire digitized document across all pages.
   */
  reconstructDocumentMarkdown(doc: DigitizedDocument): string {
    const allParagraphs: string[] = [];

    for (const page of doc.pages) {
      const pageParagraphs = this.reconstruct(page.rawLines);
      page.reconstructedParagraphs = pageParagraphs;
      allParagraphs.push(...pageParagraphs);
    }

    return this.toMarkdown(allParagraphs, doc.title);
  }

  // Static aliases for backward compatibility
  static reconstruct(lines: OCRLine[]): string[] {
    return new ParagraphReconstructor().reconstruct(lines);
  }

  static toMarkdown(paragraphs: string[], documentTitle: string = 'Digitized Document'): string {
    return new ParagraphReconstructor().toMarkdown(paragraphs, documentTitle);
  }
}
