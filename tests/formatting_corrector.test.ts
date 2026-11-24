import { describe, it, expect } from 'vitest';
import { FormattingCorrector } from '../src/core/formatting_corrector';

describe('FormattingCorrector', () => {
  const corrector = new FormattingCorrector();

  it('cleans scanner artifacts and speckle noise', () => {
    const raw = 'Hello | world ~ this is a test _ with stray bars |';
    const cleaned = corrector.cleanArtifacts(raw);
    expect(cleaned).not.toContain('~');
    expect(cleaned).toContain('Hello');
    expect(cleaned).toContain('world');
  });

  it('re-connects hyphenated words split across lines', () => {
    const broken = 'We need to recon-\nnect these parts of the docu-\nment.';
    const fixed = corrector.reconnectHyphenatedWords(broken);
    expect(fixed).toContain('reconnect');
    expect(fixed).toContain('document');
  });

  it('disambiguates letter O and digit 0 in numeric contexts', () => {
    const text = 'The total amount is $1O5.5O with 2OO items.';
    const corrected = corrector.disambiguateNumbers(text);
    expect(corrected).toContain('105.50');
    expect(corrected).toContain('200');
  });

  it('disambiguates letter l and digit 1 in numeric contexts', () => {
    const text = 'The year is 202l and speed is l00 km/h.';
    const corrected = corrector.disambiguateNumbers(text);
    expect(corrected).toContain('2021');
    expect(corrected).toContain('100');
  });

  it('capitalizes sentence starts properly', () => {
    const text = 'this is line one. this is line two! what about three? yes.';
    const capitalized = corrector.capitalizeSentences(text);
    expect(capitalized).toMatch(/^This is line one\. This is line two! What about three\? Yes\./);
  });
});
