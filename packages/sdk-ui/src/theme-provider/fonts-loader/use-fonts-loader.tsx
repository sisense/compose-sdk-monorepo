/* eslint-disable sonarjs/no-nested-template-literals */
import { ThemeSettingsFont } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';

export const useFontsLoader = (fonts: ThemeSettingsFont[], prevLoadedFonts: string[]) => {
  const styleElement = useRef(document.createElement('style'));
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

  const notLoadedFonts = useMemo(
    () => fonts.filter((font) => !prevLoadedFonts.includes(getFontInditifier(font))),
    [fonts, prevLoadedFonts],
  );

  useEffect(() => {
    if (notLoadedFonts.length) {
      styleElement.current = document.createElement('style');
      const fontFaces = notLoadedFonts.map(prepareFontFaceString);
      styleElement.current.innerHTML = fontFaces.join('\n');

      document.head.appendChild(styleElement.current);
      setLoadedFonts(notLoadedFonts.map(getFontInditifier));
    }

    return () => {
      styleElement.current?.remove();
    };
  }, [notLoadedFonts]);

  return loadedFonts;
};

function getFontInditifier(font: ThemeSettingsFont) {
  return `${font.fontFamily}|${font.fontWeight}|${font.fontStyle}`;
}

function prepareFontFaceString(font: ThemeSettingsFont) {
  return `@font-face {
          font-family: "${font.fontFamily}";
          font-weight: ${font.fontWeight};
          font-style: ${font.fontStyle};
          ${font.src
            .map(
              (src) =>
                `src: ${Object.entries(src)
                  .map(([key, value]) => `${key}('${value}')`)
                  .join(' ')};`,
            )
            .join('\n')}
      }`;
}
