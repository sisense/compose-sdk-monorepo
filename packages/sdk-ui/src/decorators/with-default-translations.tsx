import React from 'react';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { I18nProvider } from '../translation/i18n-provider';
import { ComponentDecorator } from './as-sisense-component';

/**
 * Adds default translations provider to the component
 * if it is not wrapped in Sisense context
 */
export const withDefaultTranslations: ComponentDecorator<void> = () => {
  return (Component) => {
    return (props) => {
      const { isInitialized } = useSisenseContext();
      if (!isInitialized) {
        return (
          <I18nProvider>
            <Component {...props} />
          </I18nProvider>
        );
      }

      return <Component {...props} />;
    };
  };
};
