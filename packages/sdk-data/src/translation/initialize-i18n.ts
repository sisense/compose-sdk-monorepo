import { initI18next } from '@sisense/sdk-common';

import { PACKAGE_NAMESPACE, resources } from './resources/index.js';

export function initializeI18n() {
  return initI18next({
    resource: resources,
    language: 'en',
    namespace: PACKAGE_NAMESPACE,
  });
}

export const { i18nextInstance } = initializeI18n();
