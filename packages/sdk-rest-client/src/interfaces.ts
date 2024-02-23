export interface Authenticator {
  readonly type: 'password' | 'bearer' | 'wat' | 'sso';

  isValid: () => boolean;

  invalidate: () => void;

  authenticate: () => Promise<boolean>;

  isAuthenticating: () => boolean;

  applyHeader: (headers: HeadersInit) => void;
}
