import { AbstractTranslatableError } from '@sisense/sdk-common';
import { i18nextInstance } from './initialize-i18n.js';
import { PACKAGE_NAMESPACE } from './resources/index.js';

export class TranslatableError extends AbstractTranslatableError<typeof PACKAGE_NAMESPACE> {
  constructor(translationKey: string, interpolationOptions?: Record<string, string>) {
    super(
      PACKAGE_NAMESPACE,
      {
        key: translationKey,
        interpolationOptions: interpolationOptions,
      },
      i18nextInstance.t,
    );
  }
}
