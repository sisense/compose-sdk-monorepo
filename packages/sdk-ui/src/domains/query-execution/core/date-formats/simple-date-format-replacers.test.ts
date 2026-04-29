import { describe, expect, it } from 'vitest';

import { newDateFormatWithEscapedNonTokenChars } from './simple-date-format-replacers.js';

describe('newDateFormatWithEscapedNonTokenChars', () => {
  describe('valid tokens are passed through unchanged', () => {
    it.each([
      'yyyy',
      'yy',
      'MM',
      'MMM',
      'MMMM',
      'dd',
      'EEE',
      'EEEE',
      'HH',
      'hh',
      'mm',
      'ss',
      'SSS',
      'ww',
    ])('leaves %s alone', (format) => {
      expect(newDateFormatWithEscapedNonTokenChars(format)).toBe(format);
    });
  });

  describe('composite valid-token formats are unchanged', () => {
    it.each([
      'MM/dd/yyyy',
      'yyyy-MM-dd',
      'EEE MMM. d yyyy',
      'EEEE MMMM d yyyy',
      'HH:mm:ss',
      // Note: 'h:mm a' is intentionally excluded — 'a' (AM/PM) is preprocessed
      // by newDateFormatWithExpandedAMPM before this function runs, so bare 'a'
      // is never a valid input at this stage.
      'ww yyyy',
    ])('leaves "%s" unchanged', (format) => {
      expect(newDateFormatWithEscapedNonTokenChars(format)).toBe(format);
    });
  });

  describe('non-token letter sequences are quoted', () => {
    it('wraps a standalone non-token word in single quotes', () => {
      // "WEEK" is not a valid token; should become 'WEEK'
      expect(newDateFormatWithEscapedNonTokenChars('WEEK')).toBe("'WEEK'");
    });

    it('handles WEEK-ww — the prefix WEEK- becomes quoted, ww stays as-is', () => {
      expect(newDateFormatWithEscapedNonTokenChars('WEEK-ww')).toBe("'WEEK-'ww");
    });

    it('handles WEEK-w', () => {
      expect(newDateFormatWithEscapedNonTokenChars('WEEK-w')).toBe("'WEEK-'w");
    });

    it('quotes non-token letters adjacent to non-letter chars in one region', () => {
      // "Qtr" is not a valid token; "Qtr " (with trailing space) should be quoted as one region
      const result = newDateFormatWithEscapedNonTokenChars('Qtr yyyy');
      expect(result).toBe("'Qtr 'yyyy");
    });

    it('quotes non-token suffix after a valid token', () => {
      // e.g. "ww WK" — ww is valid, WK is not
      const result = newDateFormatWithEscapedNonTokenChars('ww WK');
      expect(result).toBe("ww 'WK'");
    });
  });

  describe('already-quoted sections are passed through unchanged', () => {
    it('leaves an already-quoted literal alone', () => {
      expect(newDateFormatWithEscapedNonTokenChars("'literal'")).toBe("'literal'");
    });

    it('leaves a quoted section that contains token-like letters alone', () => {
      expect(newDateFormatWithEscapedNonTokenChars("'WEEK' ww")).toBe("'WEEK' ww");
    });

    it('handles a mix of quoted literal and valid tokens', () => {
      expect(newDateFormatWithEscapedNonTokenChars("'Week' ww, yyyy")).toBe("'Week' ww, yyyy");
    });
  });

  describe('unclosed single quote — treated as opening of a literal till end', () => {
    it('does not crash on an unclosed quote and emits everything after the quote verbatim', () => {
      const result = newDateFormatWithEscapedNonTokenChars("yyyy'unclosed");
      expect(result).toBe("yyyy'unclosed");
    });
  });

  describe('empty and non-letter input', () => {
    it('returns an empty string unchanged', () => {
      expect(newDateFormatWithEscapedNonTokenChars('')).toBe('');
    });

    it('returns a format with only non-letter characters unchanged', () => {
      expect(newDateFormatWithEscapedNonTokenChars('- / :')).toBe('- / :');
    });
  });

  describe('embedded single quotes in non-token literals', () => {
    it('the non-token prefix before an apostrophe is wrapped; the rest is passed through verbatim', () => {
      // "it's": 'it' is a non-token prefix → wrapped as 'it'.
      // The apostrophe at index 2 is then seen as an opening quote with no closing match,
      // so the remainder "'s" is emitted verbatim.  Result: 'it''s
      const result = newDateFormatWithEscapedNonTokenChars("it's");
      expect(result).toBe("'it''s");
    });
  });
});
