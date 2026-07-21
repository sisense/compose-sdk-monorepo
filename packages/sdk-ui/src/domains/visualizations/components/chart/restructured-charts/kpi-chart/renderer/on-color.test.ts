import {
  contrastRatio,
  parseHexColor,
  relativeLuminance,
  resolveOnColor,
  resolveSparklineColor,
} from './on-color.js';

describe('parseHexColor', () => {
  it('parses 6-digit hex', () => {
    expect(parseHexColor('#112233')).toEqual({ r: 0x11, g: 0x22, b: 0x33, a: 1 });
  });

  it('parses 3-digit hex by doubling each digit', () => {
    expect(parseHexColor('#123')).toEqual({ r: 0x11, g: 0x22, b: 0x33, a: 1 });
  });

  it('parses 8-digit hex (alpha) into a 0-1 alpha channel', () => {
    expect(parseHexColor('#00000080')).toEqual({ r: 0, g: 0, b: 0, a: 0x80 / 255 });
  });

  it('parses 4-digit hex (alpha) by doubling each digit', () => {
    expect(parseHexColor('#123f')).toEqual({ r: 0x11, g: 0x22, b: 0x33, a: 1 });
  });

  it('is case-insensitive and tolerates surrounding whitespace', () => {
    expect(parseHexColor(' #ABCDEF ')).toEqual({ r: 0xab, g: 0xcd, b: 0xef, a: 1 });
  });

  it('returns undefined for a named color, a functional color, or a missing value', () => {
    expect(parseHexColor('green')).toBeUndefined();
    expect(parseHexColor('rgb(0, 0, 0)')).toBeUndefined();
    expect(parseHexColor(undefined)).toBeUndefined();
    expect(parseHexColor('')).toBeUndefined();
  });
});

describe('relativeLuminance', () => {
  it('resolves black to 0 and white to 1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBe(1);
  });

  it('returns undefined for an unparseable color', () => {
    expect(relativeLuminance('not-a-color')).toBeUndefined();
  });

  it('returns undefined for a mostly transparent color', () => {
    expect(relativeLuminance('#00000000')).toBeUndefined();
  });
});

describe('resolveOnColor', () => {
  it('switches to white text/sparkline on a dark background', () => {
    expect(resolveOnColor('#000000')).toBe(true);
    expect(resolveOnColor('#111111')).toBe(true);
    expect(resolveOnColor('#1a1a2e')).toBe(true);
  });

  it('keeps the default text color on a white or light background', () => {
    expect(resolveOnColor('#ffffff')).toBe(false);
    expect(resolveOnColor('#f5f5f5')).toBe(false);
  });

  it('keeps the default text color on a mid-gray background where white text would fail WCAG contrast', () => {
    // #999999 has relative luminance ~0.32; white text on it is only ~2.85:1, so the
    // 0.179 crossover threshold must resolve to dark (default) text here.
    expect(resolveOnColor('#999999')).toBe(false);
    expect(resolveOnColor('#808080')).toBe(false);
  });

  it('switches to white just below the WCAG crossover luminance', () => {
    // #595959 has relative luminance ~0.11 — below the 0.179 threshold.
    expect(resolveOnColor('#595959')).toBe(true);
  });

  it('keeps the default text color when no background is set', () => {
    expect(resolveOnColor(undefined)).toBe(false);
  });

  it('keeps the default text color for an unparseable/invalid color instead of guessing', () => {
    expect(resolveOnColor('green')).toBe(false);
    expect(resolveOnColor('rgb(0, 0, 0)')).toBe(false);
  });

  it('keeps the default text color for a mostly transparent background', () => {
    expect(resolveOnColor('#00000040')).toBe(false);
  });
});

describe('contrastRatio', () => {
  it('computes 21:1 for black on white and 1:1 for identical colors', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrastRatio('#e74c3c', '#e74c3c')).toBeCloseTo(1, 5);
  });

  it('returns undefined when either color cannot be measured', () => {
    expect(contrastRatio('green', '#ffffff')).toBeUndefined();
    expect(contrastRatio('#ffffff', undefined)).toBeUndefined();
  });
});

describe('resolveSparklineColor', () => {
  const theme = { accent: '#35b6c9', textColor: '#1d2733' };

  it('keeps the theme accent when no custom background is set', () => {
    expect(resolveSparklineColor({ ...theme, backgroundColor: undefined })).toBe('#35b6c9');
  });

  it('keeps the theme accent when the background cannot be measured', () => {
    expect(resolveSparklineColor({ ...theme, backgroundColor: 'rgb(231, 76, 60)' })).toBe(
      '#35b6c9',
    );
  });

  it('keeps the theme accent on backgrounds where it meets the 3:1 graphics contrast', () => {
    // Near-black background: cyan accent contrast is well above 3:1.
    expect(resolveSparklineColor({ ...theme, backgroundColor: '#111111' })).toBe('#35b6c9');
  });

  it('falls back to the theme text color on saturated tiles where the accent is illegible', () => {
    // Demo tile colors: accent contrast is 1.15-1.58:1 on all four; dark text wins over white
    // on every one of them (e.g. yellow: dark 9.09:1 vs white 1.66:1).
    for (const bg of ['#e74c3c', '#f1c40f', '#2ecc71', '#e67e22']) {
      expect(resolveSparklineColor({ ...theme, backgroundColor: bg })).toBe('#1d2733');
    }
  });

  it('falls back to white when it reads better than the theme text color', () => {
    // Dark navy: a dark textColor is illegible (1.1:1), white is (16:1); accent (#0a3d4d-ish
    // teal-on-navy) also fails 3:1, so the white fallback must win.
    expect(
      resolveSparklineColor({
        accent: '#0a3d4d',
        textColor: '#1d2733',
        backgroundColor: '#10162a',
      }),
    ).toBe('#ffffff');
  });
});
