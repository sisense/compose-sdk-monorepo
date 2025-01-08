import { ThemeSettingsFont } from '@/types';
import { useFontsLoader } from '@/theme-provider/fonts-loader/use-fonts-loader';
import { useThemeContext } from '@/theme-provider';
import { createContext, useContext } from 'react';

const FontLoaderContext = createContext<{
  loadedFonts: string[];
}>({
  loadedFonts: [],
});

export const FontsLoader = ({
  fonts,
  children,
}: {
  fonts?: ThemeSettingsFont[];
  children?: any;
}) => {
  const { loadedFonts: prevLoadedFonts } = useContext(FontLoaderContext);
  const { themeSettings } = useThemeContext();
  const { loadedFonts, areAllFontsLoaded } = useFontsLoader(
    fonts || themeSettings.typography.fontsLoader?.fonts || [],
    prevLoadedFonts,
  );

  return (
    <FontLoaderContext.Provider value={{ loadedFonts: [...prevLoadedFonts, ...loadedFonts] }}>
      {areAllFontsLoaded && children}
    </FontLoaderContext.Provider>
  );
};
