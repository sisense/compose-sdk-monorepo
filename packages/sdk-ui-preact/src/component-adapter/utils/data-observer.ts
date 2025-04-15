import { Listener, Observable, Subscription } from './observable';

/** @internal */
export class DataObserver<T> {
  private data: T | undefined;

  private observable: Observable<T> = new Observable<T>();

  constructor(initialValue?: T) {
    this.data = initialValue;
  }

  // Subscribe a listener, optionally triggering it immediately with the last data
  subscribe(listener: Listener<T>, immediateTriggerLastData = true): Subscription {
    const subscription = this.observable.subscribe(listener);

    if (immediateTriggerLastData && this.data !== undefined) {
      listener(this.data);
    }

    return subscription;
  }

  // Update value and notify listeners
  setValue(newValue: T): void {
    if (this.data !== newValue) {
      this.data = newValue;
      this.observable.notify(newValue);
    }
  }

  // Get the current value
  getValue(): T | undefined {
    return this.data;
  }

  destroy(): void {
    this.observable.destroy();
  }
}

export function isDataObserver<T>(object: any): object is DataObserver<T> {
  return object instanceof DataObserver;
}
