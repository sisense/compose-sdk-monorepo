import './translation/initialize-i18n.js';

export { DimensionalQueryClient } from './query-client.js';
export { getJaqlQueryPayload } from './jaql/get-jaql-query-payload.js';

export * from './types.js';
export * from './interfaces.js';

export {
  type TranslationDictionary,
  PACKAGE_NAMESPACE as translationNamespace,
} from './translation/resources/index.js';
