export interface Authenticator {
  isValid: () => boolean;

  invalidate: () => void;

  authenticate: () => Promise<boolean>;

  isAuthenticating: () => boolean;

  applyHeader: (headers: HeadersInit) => void;
}
