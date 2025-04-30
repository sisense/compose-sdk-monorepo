import { EventEmitter } from '@angular/core';

/**
 * An extended version of Angular's `EventEmitter` that tracks
 * whether any listeners (subscribers) are attached.
 *
 * Useful when you need to know if an `@Output()` is being observed
 * in the template (i.e., bound with `(event)="..."`).
 *
 * @template T - The type of values emitted by the EventEmitter.
 */
export class EventEmitterWithHasListeners<T> extends EventEmitter<T> {
  /**
   * Indicates whether the EventEmitter has at least one active subscriber.
   */
  hasListeners = false;

  /**
   * Overrides the default `subscribe()` method to set `hasListeners` to true
   * when a new subscriber is added.
   *
   * @param args - The arguments passed to the `subscribe()` method.
   * @returns A subscription object used to unsubscribe from the event.
   */
  override subscribe(
    ...args: Parameters<EventEmitter<T>['subscribe']>
  ): ReturnType<EventEmitter<T>['subscribe']> {
    this.hasListeners = true;
    return super.subscribe(...args);
  }
}
