/**
 * Handwriting and OCR artifact correction layer for Inkify.
 * Eliminates punctuation spacing bugs, re-connects split hyphenated words, disambiguates characters, and fixes casing.
 */

export class FormattingCorrector {
  /**
   * Corrects standard typographic and OCR segmentation artifacts.
   */
  cleanArtifacts(rawText: string): string {
    if (!rawText) return '';

    let text = rawText;

    // Remove unwanted scanner noise symbols (~, stray pipes, duplicate underscores)
    text = text.replace(/~+/g, '');
    text = text.replace(/\s*\|\s*/g, ' ');
    text = text.replace(/_+/g, ' ');

    // Reconnect hyphenated words split across lines
    text = this.reconnectHyphenatedWords(text);

    // Fix spaces before punctuation (e.g. "word , another" -> "word, another")
    text = text.replace(/\s+([,.:;?!])/g, '$1');

    // Ensure single space after punctuation if followed by a letter
    text = text.replace(/([,.:;?!])([A-Za-z])/g, '$1 $2');

    // Normalize multiple consecutive spaces
    text = text.replace(/[ \t]+/g, ' ');

    // Normalize lines
    text = text
      .split('\n')
      .map((l) => l.trim())
      .join('\n');

    return text.trim();
  }

  /**
   * Reconnect hyphenated words split across line breaks
   */
  reconnectHyphenatedWords(text: string): string {
    return text.replace(/(\b\w+)-\s*\r?\n\s*(\w+\b)/g, '$1$2');
  }

  /**
   * Disambiguates OCR confusion between letters and numbers in numeric contexts.
   */
  disambiguateNumbers(text: string): string {
    let result = text;
    // Replace multiple O/o with 0s after digits (e.g. 2OO -> 200, 1O5.5O -> 105.50)
    result = result.replace(/(\d+)([Oo]+)\b/g, (_m, digits, os) => digits + '0'.repeat(os.length));
    result = result.replace(/(\d+)[Oo](\d+)/g, '$10$2');
    result = result.replace(/(\d+\.)\s*([Oo]+)\b/g, (_m, prefix, os) => prefix + '0'.repeat(os.length));
    result = result.replace(/(?<=\d|\$|\.)[Oo](?=\d|\.|\b)/g, '0');
    result = result.replace(/(?<=\b)[Oo](?=\.\d)/g, '0');

    // Replace l/I with 1 in numeric patterns like 202l, l00
    result = result.replace(/(?<=\d)[lI](?=\d|\.|\b)|(?<=\b)[lI](?=\d)/g, '1');

    return result;
  }

  /**
   * Capitalizes sentence beginnings.
   */
  capitalizeSentences(text: string): string {
    return text.replace(/(^|[.?!]\s+)([a-z])/g, (_match, prefix, char) => `${prefix}${char.toUpperCase()}`);
  }

  /**
   * Static alias for backward compatibility.
   */
  static cleanText(rawText: string): string {
    const corrector = new FormattingCorrector();
    return corrector.capitalizeSentences(corrector.cleanArtifacts(rawText));
  }
}
