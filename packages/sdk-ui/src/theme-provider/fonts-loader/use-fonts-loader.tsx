import { useEffect, useMemo, useState } from 'react';
import { ThemeSettingsFont } from '@/types';

/** Helper to produce a unique string that identifies a font */
function getFontIdentifier(font: ThemeSettingsFont): string {
  return `${font.fontFamily}|${font.fontWeight}|${font.fontStyle}`;
}

export function useFontsLoader(fonts: ThemeSettingsFont[], prevLoadedFonts: string[]) {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [areAllFontsLoaded, setAreAllFontsLoaded] = useState<boolean>(false);

  // Determine which fonts are not yet loaded
  const notLoadedFonts = useMemo(() => {
    return fonts.filter((font) => !prevLoadedFonts.includes(getFontIdentifier(font)));
  }, [fonts, prevLoadedFonts]);

  useEffect(() => {
    // If there are no new fonts to load, mark as all loaded and exit
    if (notLoadedFonts.length === 0) {
      setAreAllFontsLoaded(true);
      return;
    }

    let isCancelled = false;

    // Load each new font via the FontFace constructor
    const loadPromises = notLoadedFonts.map((font) => {
      // Convert all font sources into a single comma-separated string
      // e.g. "url('/fonts/MyFont.woff2') format('woff2'), url('/fonts/MyFont.woff') format('woff')"
      const srcString = font.src
        .map((srcObj) => {
          const parts = Object.entries(srcObj).map(([key, val]) => {
            // keys are 'url', 'format', 'local' etc.
            return `${key}('${val}')`;
          });
          return parts.join(' ');
        })
        .join(', ');

      // Create the FontFace object with style/weight descriptors
      const fontFace = new FontFace(font.fontFamily, srcString, {
        style: font.fontStyle,
        weight: font.fontWeight.toString(),
      });

      // Load the font asynchronously
      return fontFace.load().then((loadedFace) => {
        // Avoid adding to document.fonts if the effect has unmounted
        if (!isCancelled) {
          document.fonts.add(loadedFace);
        }
        return getFontIdentifier(font);
      });
    });

    // Wait until all fonts finish loading
    Promise.all(loadPromises)
      .then((identifiers) => {
        if (!isCancelled) {
          setLoadedFonts((prev) => [...prev, ...identifiers]);
          setAreAllFontsLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load fonts:', err);
        setAreAllFontsLoaded(true);
      });

    // Cleanup if effect re-runs or unmounts
    return () => {
      isCancelled = true;
    };
  }, [notLoadedFonts]);

  return {
    loadedFonts,
    areAllFontsLoaded,
  };
}
