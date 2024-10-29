import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomTranslationsLoaderProps } from '../props.js';

/**
 * Utility wrapper component to load custom translations into the i18n instance.
 *
 * @internal
 * @param customTranslations - array of custom translation objects to be loaded
 * @returns CustomTranslationsLoader component
 */
export const CustomTranslationsLoader: React.FC<CustomTranslationsLoaderProps> = ({
  customTranslations = [],
  children,
}) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    for (const { language, resources, packageName = 'sdkUi' } of customTranslations) {
      i18n.addResourceBundle(language, packageName, resources);
    }
  }, [i18n, customTranslations]);

  return <>{children}</>;
};
