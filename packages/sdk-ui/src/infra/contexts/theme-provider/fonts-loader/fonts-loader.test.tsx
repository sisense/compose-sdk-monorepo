/* eslint-disable @typescript-eslint/unbound-method */
import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { FontFaceMock } from '@/__mocks__/font-face-polyfill';
import { FontsLoader } from '@/infra/contexts/theme-provider/fonts-loader/fonts-loader';
import { ThemeSettingsFont } from '@/types';

// Just an example font for tests:
const FONT_MOCK: ThemeSettingsFont = {
  fontFamily: 'FontTest1',
  fontWeight: 'bold',
  fontStyle: 'normal',
  src: [
    { url: 'FontTest1-Bold.eot' },
    { local: 'FontTest1-Bold' },
    { url: 'FontTest1-Bold.eot?#iefix', format: 'embedded-opentype' },
    { url: 'FontTest1-Bold.ttf', format: 'truetype' },
  ],
};

const FONT_MOCK2: ThemeSettingsFont = {
  ...FONT_MOCK,
  fontFamily: 'AnotherFont',
};

// We'll also need to mock "document.fonts.add"
const mockDocumentFontsAdd = vi.fn();

describe('FontsLoader', () => {
  beforeAll(() => {
    vi.spyOn(FontFaceMock.prototype, 'load').mockImplementation(function (this: FontFaceMock) {
      return Promise.resolve(this);
    });

    (document as any).fonts = {
      add: mockDocumentFontsAdd,
      load: vi.fn(),
    };
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load font correctly', async () => {
    render(
      <FontsLoader fonts={[FONT_MOCK]}>
        <div data-testid="child-content">Test</div>
      </FontsLoader>,
    );

    // Because we only render children when all fonts are loaded,
    // we wait for the child div to appear.
    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    // Now check if "load" was called
    expect(FontFaceMock.prototype.load).toHaveBeenCalledTimes(1);
    // And we should have added it to document.fonts
    expect(mockDocumentFontsAdd).toHaveBeenCalledTimes(1);
    const addedFont = mockDocumentFontsAdd.mock.calls[0][0];
    expect(addedFont.family).toBe('FontTest1');
  });

  it('should avoid duplication on multiple instance', async () => {
    // Same font passed to nested FontsLoader
    render(
      <FontsLoader fonts={[FONT_MOCK]}>
        <FontsLoader fonts={[FONT_MOCK]}>
          <div data-testid="child-content">Test</div>
        </FontsLoader>
      </FontsLoader>,
    );

    // Wait for child content (indicating fonts are loaded)
    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    // Because it's the same font, we expect to see only 1 load call
    // depending on your hook logic (deduping). Adjust if your logic differs.
    expect(FontFaceMock.prototype.load).toHaveBeenCalledTimes(1);

    // Similarly, added to document.fonts once
    expect(mockDocumentFontsAdd).toHaveBeenCalledTimes(1);
  });

  it('should load different fonts on multiple instances', async () => {
    // Two different fonts in nested loaders
    render(
      <FontsLoader fonts={[FONT_MOCK]}>
        <FontsLoader fonts={[FONT_MOCK2]}>
          <div data-testid="child-content">Test</div>
        </FontsLoader>
      </FontsLoader>,
    );

    // Wait for children
    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    // We expect 2 loads for 2 unique fonts
    expect(FontFaceMock.prototype.load).toHaveBeenCalledTimes(2);

    // And two calls to document.fonts.add
    expect(mockDocumentFontsAdd).toHaveBeenCalledTimes(2);

    // Check each added font
    expect(mockDocumentFontsAdd.mock.calls[0][0].family).toBe('FontTest1');
    expect(mockDocumentFontsAdd.mock.calls[1][0].family).toBe('AnotherFont');
  });
});
