import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import { downloadBlobAsFile, normalizeFileName } from './download-blob-as-file.js';

const urlMocks = vi.hoisted(() => ({
  createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
  revokeObjectURL: vi.fn(),
}));

describe('normalizeFileName', () => {
  it('strips non-alphanumeric characters from the base name and keeps the extension', () => {
    expect(normalizeFileName('My Report.csv')).toBe('MyReport.csv');
  });

  it('handles names without extension', () => {
    expect(normalizeFileName('export data')).toBe('exportdata');
  });

  it('uses default base name when the name part is empty after normalization', () => {
    expect(normalizeFileName('!!!.xlsx')).toBe('file.xlsx');
  });

  it('uses default base name when raw name has only punctuation', () => {
    expect(normalizeFileName('---')).toBe('file');
  });

  it('splits on the last dot so the final segment is the extension', () => {
    expect(normalizeFileName('a.b.c.tar.gz')).toBe('abctar.gz');
  });
});

describe('downloadBlobAsFile', () => {
  let lastAnchor: HTMLAnchorElement | null;
  let lastAnchorClick: ReturnType<typeof vi.fn>;
  let appendSpy: MockInstance<typeof HTMLBodyElement.prototype.appendChild>;

  beforeEach(() => {
    lastAnchor = null;
    lastAnchorClick = vi.fn();
    urlMocks.createObjectURL.mockClear();
    urlMocks.createObjectURL.mockReturnValue('blob:mock-url');
    urlMocks.revokeObjectURL.mockClear();

    vi.stubGlobal(
      'URL',
      class PatchedURL extends URL {
        static createObjectURL = urlMocks.createObjectURL;

        static revokeObjectURL = urlMocks.revokeObjectURL;
      } as typeof URL,
    );

    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, options?: unknown) => {
      if (tag === 'a') {
        const el = originalCreate('a', options as never);
        el.click = lastAnchorClick;
        lastAnchor = el;
        return el;
      }
      return originalCreate(tag, options as never);
    });

    appendSpy = vi.spyOn(document.body, 'appendChild');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('creates object URL, clicks anchor with download filename, then revokes and removes link', () => {
    const blob = new Blob(['x'], { type: 'application/octet-stream' });

    downloadBlobAsFile(blob, 'out.bin');

    expect(urlMocks.createObjectURL).toHaveBeenCalledWith(blob);
    expect(lastAnchor?.href).toBe('blob:mock-url');
    expect(lastAnchor?.download).toBe('out.bin');
    expect(lastAnchorClick).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledWith(lastAnchor);
    expect(urlMocks.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(lastAnchor?.parentNode).toBeNull();
  });

  it('revokes object URL if appendChild throws', () => {
    appendSpy.mockImplementationOnce(() => {
      throw new Error('append failed');
    });

    expect(() => downloadBlobAsFile(new Blob(['x']), 'out.bin')).toThrow('append failed');

    expect(urlMocks.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('revokes object URL and detaches link if click throws', () => {
    lastAnchorClick.mockImplementationOnce(() => {
      throw new Error('click failed');
    });

    expect(() => downloadBlobAsFile(new Blob(['x']), 'out.bin')).toThrow('click failed');

    expect(urlMocks.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(lastAnchor?.parentNode).toBeNull();
  });
});
