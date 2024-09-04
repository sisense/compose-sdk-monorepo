export interface Authenticator {
  readonly type: 'password' | 'bearer' | 'wat' | 'sso' | 'base' | 'fusion';

  isValid: () => boolean;

  invalidate: () => void;

  authenticate: () => Promise<boolean>;

  isAuthenticating: () => boolean;

  authenticated: () => Promise<boolean>;

  applyHeader: (headers: HeadersInit) => void;
}
