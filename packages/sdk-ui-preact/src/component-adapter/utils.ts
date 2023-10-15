/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { type Observable } from 'rxjs';

export function isPromise<T>(object: any): object is Promise<T> {
  return object && typeof object?.then === 'function';
}

export function isObservable<T>(object: any): object is Observable<T> {
  return object && typeof object?.subscribe === 'function';
}
