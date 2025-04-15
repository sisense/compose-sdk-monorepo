export type Listener<T> = (newValue: T) => void;
export interface Subscription {
  unsubscribe: () => void;
}

export class Observable<T> {
  private listeners: Set<Listener<T>> = new Set();

  // Subscribe a listener to the observable
  subscribe(listener: Listener<T>): Subscription {
    this.listeners.add(listener);

    // Return a SubscriptionLike object with unsubscribe method
    return {
      unsubscribe: () => this.listeners.delete(listener),
    };
  }

  // Notify all listeners with the new value
  notify(newValue: T) {
    this.listeners.forEach((listener) => listener(newValue));
  }

  destroy(): void {
    this.listeners.clear();
  }
}
