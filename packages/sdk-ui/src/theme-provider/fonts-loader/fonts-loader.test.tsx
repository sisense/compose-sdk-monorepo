import { describe } from 'vitest';
import { FontsLoader } from '@/theme-provider/fonts-loader/fonts-loader';
import { render, waitFor } from '@testing-library/react';

const FONT_MOCK = {
  fontFamily: 'FontTest1',
  fontWeight: 'bold',
  fontStyle: 'normal',
  src: [
    {
      url: `FontTest1-Bold.eot`,
    },
    {
      local: `FontTest1-Bold`,
    },
    {
      url: `FontTest1-Bold.eot?#iefix`,
      format: 'embedded-opentype',
    },
    {
      url: `FontTest1-Bold.ttf`,
      format: 'truetype',
    },
  ],
};

describe('FontLoader', () => {
  it('should load font correctly', async () => {
    render(<FontsLoader fonts={[FONT_MOCK]}>Test</FontsLoader>);

    await waitFor(() => {
      expect(document.querySelector('head')).toMatchSnapshot();
    });
  });

  it('should avoid duplication on multiple instance', async () => {
    render(
      <FontsLoader fonts={[FONT_MOCK]}>
        <FontsLoader fonts={[FONT_MOCK]}>Test</FontsLoader>
      </FontsLoader>,
    );

    await waitFor(() => {
      expect(document.querySelector('head')).toMatchSnapshot();
    });
  });

  it('should load different fonts on multiple instance', async () => {
    render(
      <FontsLoader fonts={[FONT_MOCK]}>
        <FontsLoader fonts={[{ ...FONT_MOCK, fontFamily: 'AnotherFont' }]}>Test</FontsLoader>
      </FontsLoader>,
    );

    await waitFor(() => {
      expect(document.querySelector('head')).toMatchSnapshot();
    });
  });
});
