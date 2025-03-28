import './translation/initialize-i18n.js';

export * from './interfaces.js';
export { PasswordAuthenticator } from './password-authenticator.js';
export { SsoAuthenticator, isSsoAuthenticator } from './sso-authenticator.js';
export { FusionAuthenticator, isFusionAuthenticator } from './fusion-authenticator.js';
export { BearerAuthenticator, isBearerAuthenticator } from './bearer-authenticator.js';
export { WatAuthenticator, isWatAuthenticator } from './wat-authenticator.js';
export { getAuthenticator } from './authenticator.js';

export { isAuthTokenPending } from './helpers.js';

export { HttpClient } from './http-client.js';

export type {
  TranslationDictionary,
  PACKAGE_NAMESPACE as translationNamespace,
} from './translation/resources/index.js';
