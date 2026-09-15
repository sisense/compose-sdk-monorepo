import type { Authenticator } from './interfaces.js';
import type { TranslatableError } from './translation/translatable-error.js';

/**
 * Classifies a failed HTTP request.
 * @alpha
 */
export type HttpErrorKind = 'unauthorized' | 'forbidden' | 'network' | 'server' | 'client';

/**
 * Describes a failed HTTP request made by `HttpClient`.
 * @alpha
 */
export interface HttpErrorEvent {
  readonly kind: HttpErrorKind;
  /** HTTP status. Absent for network failures. */
  readonly status?: number;
  readonly url: string;
  readonly method: string;
  readonly authType: Authenticator['type'];
  /** The translatable error that is (or would be) thrown to the caller. */
  readonly error: TranslatableError;
}

/**
 * Receives every failed request before the error propagates.
 * @alpha
 */
export type HttpErrorListener = (event: HttpErrorEvent) => void;

/**
 * Configures optional behavior of `HttpClient`.
 * @alpha
 */
export interface HttpClientOptions {
  /** Invoked for every failed request. Exceptions thrown by the listener are swallowed. */
  onError?: HttpErrorListener;
}

/**
 * Carries per-request context to the interceptors.
 * @internal
 */
export interface HttpRequestContext {
  readonly url: string;
  readonly method: string;
  readonly onError?: HttpErrorListener;
}

/**
 * Classifies a non-OK HTTP status.
 * @param status - HTTP response status code
 * @returns The matching {@link HttpErrorKind}.
 * @internal
 */
export function asHttpErrorKind(status: number): HttpErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status >= 500) return 'server';
  return 'client';
}

/**
 * Invokes the request's `onError` listener, never letting a listener failure break the request.
 * @param context - Per-request context carrying the optional `onError` listener
 * @param event - The classified HTTP failure to report
 * @internal
 */
export function emitHttpError(context: HttpRequestContext, event: HttpErrorEvent): void {
  if (!context.onError) return;
  try {
    context.onError(event);
  } catch (listenerError) {
    console.warn('HttpClient onError listener threw an error', listenerError);
  }
}
