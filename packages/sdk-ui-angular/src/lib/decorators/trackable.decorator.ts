import { DecoratorsModule } from './decorators.module';
import { trackProductEvent } from '@sisense/sdk-tracking';
import packageVersion from '../../version';
import { TrackingEventType } from '@sisense/sdk-tracking/src/registry';

export function Trackable(target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: unknown[]) {
    track('sdkAngularServiceMethodExecuted', propertyKey);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

type ConstructorOf<T> = { new (...args: any[]): T };

type SubType<Base, Condition> = Pick<
  Base,
  {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
  }[keyof Base]
>;
type MethodsOnly<T> = SubType<T, (...args: any[]) => any>;
type MethodsArray<T> = T extends infer C ? (keyof MethodsOnly<C>)[] : [];

export function TrackableService<T>(trackableMethods: MethodsArray<T>) {
  return function (ServiceClass: ConstructorOf<T>): void | ConstructorOf<T> {
    trackableMethods.forEach((methodName) => {
      // eslint-disable-next-line security/detect-object-injection
      const original = ServiceClass.prototype[methodName];

      // eslint-disable-next-line security/detect-object-injection
      ServiceClass.prototype[methodName] = function (...params: unknown[]) {
        track('sdkAngularServiceMethodExecuted', `${ServiceClass.name}.${methodName}`);
        return original.apply(this, params);
      };
    });
  };
}

async function track(action: TrackingEventType, methodName: string) {
  try {
    const { enableTracking } = DecoratorsModule.sisenseContextService.getConfig();
    const app = await DecoratorsModule.sisenseContextService.getApp();

    const trackingEnabled =
      enableTracking && (app.settings?.trackingConfig?.enabled ?? enableTracking);

    if (app?.httpClient) {
      const payload = {
        packageName: 'sdk-ui-angular',
        packageVersion,
        methodName,
      };

      void trackProductEvent(action, payload, app.httpClient, !trackingEnabled);
    }
  } catch (e) {
    console.warn('tracking error', e);
  }
}
