/*
 TODO: i18next should be updated to the latest version when the issue with the types imports will be fixed.
 https://github.com/i18next/i18next/issues/2008
 */
import i18next, { type i18n, type Module, type Resource } from 'i18next';

import { resources as defaultResources, PACKAGE_NAMESPACE } from './resources/index.js';

type I18NextInstanceConfig = {
  resource: Resource;
  plugins?: Module[];
  namespace: string;
  language: string;
};
export type I18NextInstance = i18n;
export type I18NextInitResult = {
  i18nextInstance: I18NextInstance;
  initPromise: Promise<I18NextInstance>;
};

/**
 * Basic i18next instance with default resources
 *
 * @type {I18NextInstance}
 */
export const basicI18nextInstance: I18NextInstance = i18next.createInstance({
  defaultNS: PACKAGE_NAMESPACE,
  resources: insertNamespaceIntoResource(defaultResources, PACKAGE_NAMESPACE),
  lng: 'en',
  fallbackLng: 'en',
});

export const basicI18Next: I18NextInitResult = {
  i18nextInstance: basicI18nextInstance,
  initPromise: basicI18nextInstance.init().then(() => basicI18nextInstance),
};

const alreadyLoadedNamespaces = new Map<string, I18NextInitResult>();
alreadyLoadedNamespaces.set('common', basicI18Next);

/**
 * Initialize i18next with the given configuration
 *
 * @param config - i18next configuration
 * @returns i18next instance
 */
export const initI18next = (config: I18NextInstanceConfig): I18NextInitResult => {
  if (alreadyLoadedNamespaces.has(config.namespace)) {
    return alreadyLoadedNamespaces.get(config.namespace)!;
  }

  if (config.plugins) {
    for (const plugin of config.plugins) {
      basicI18nextInstance.use(plugin);
    }
  }

  Object.keys(config.resource).forEach((lng) => {
    basicI18nextInstance.addResourceBundle(lng, config.namespace, config.resource[lng]);
  });

  // create new instance with bounded default namespace -
  // all plugins and resources will be shared between instances
  const newI18next = basicI18nextInstance.cloneInstance({
    defaultNS: config.namespace,
  });

  let initPromise: Promise<I18NextInstance> = basicI18Next.initPromise.then(() => newI18next);

  // two-way language binding between all created i18next instances
  newI18next.on('languageChanged', (lng) => {
    if (basicI18nextInstance.language !== lng) {
      void basicI18nextInstance.changeLanguage(lng);
    }
  });
  basicI18nextInstance.on('languageChanged', (lng) => {
    if (newI18next.language !== lng) {
      void newI18next.changeLanguage(lng);
    }
  });

  // if requested language for new i18next instance is not the same as in basic i18next instance - change it
  const language = config.language || 'en';
  if (basicI18nextInstance.language !== language) {
    initPromise = initPromise
      .then(() => newI18next.changeLanguage(language))
      .then(() => newI18next);
  }

  const result = { initPromise, i18nextInstance: newI18next };

  alreadyLoadedNamespaces.set(config.namespace, result);

  return result;
};

function insertNamespaceIntoResource(resource: Resource, namespace: string): Resource {
  return Object.keys(resource).reduce((acc, language) => {
    acc[language] = {
      [namespace]: resource[language],
    };
    return acc;
  }, {} as Resource);
}

export { type TFunction, type TOptions } from 'i18next';
