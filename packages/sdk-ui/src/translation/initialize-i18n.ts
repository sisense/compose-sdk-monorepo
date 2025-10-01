import { initI18next } from '@ethings-os/sdk-common';
import { initReactI18next } from 'react-i18next';
import { resources, PACKAGE_NAMESPACE } from './resources/index.js';

export function initializeI18n() {
  return initI18next({
    resource: resources,
    plugins: [initReactI18next],
    language: 'en',
    namespace: PACKAGE_NAMESPACE,
  });
}

export const { i18nextInstance } = initializeI18n();
