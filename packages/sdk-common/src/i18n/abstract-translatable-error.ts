import { TFunction } from 'i18next';
import { basicI18Next } from './i18next.js';

export abstract class AbstractTranslatableError<Namespace extends string = string> extends Error {
  namespace: string;

  interpolationOptions: Record<string, string>;

  key: string;

  constructor(
    namespace: Namespace,
    errorParams: {
      key: string;
      interpolationOptions?: Record<string, string>;
    },
    defaultTFunction?: TFunction<Namespace>,
  ) {
    const { key, interpolationOptions } = errorParams;
    const tFunction: TFunction = defaultTFunction || basicI18Next.i18nextInstance.t;
    const extendedInterpolationObject = { ...interpolationOptions, ns: namespace };
    const message = tFunction(key, { ...extendedInterpolationObject, lng: 'en' });
    super(message);
    this.key = key;
    this.namespace = namespace;
    this.interpolationOptions = extendedInterpolationObject;
  }
}
