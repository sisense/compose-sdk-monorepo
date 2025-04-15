import './translation/initialize-i18n.js';

export { getAuthenticator } from './authenticator.js';
export { BearerAuthenticator, isBearerAuthenticator } from './bearer-authenticator.js';
export { FusionAuthenticator, isFusionAuthenticator } from './fusion-authenticator.js';
export { isAuthTokenPending } from './helpers.js';
export { HttpClient } from './http-client.js';
export * from './interfaces.js';
export { PasswordAuthenticator } from './password-authenticator.js';
export { isSsoAuthenticator, SsoAuthenticator } from './sso-authenticator.js';
export type {
  TranslationDictionary,
  PACKAGE_NAMESPACE as translationNamespace,
} from './translation/resources/index.js';
export { isWatAuthenticator, WatAuthenticator } from './wat-authenticator.js';
