import has from 'lodash-es/has';

export function checkAndNotifyAboutDeprecatedProp(props: any, deprecatedProps: string[]): void {
  for (const deprecatedProp of deprecatedProps) {
    if (has(props, deprecatedProp)) {
      console.warn(
        `Prop '${deprecatedProp}' has been deprecated. Please refer to the documentation at https://developer.sisense.com/guides/sdk/ for the updated prop and use that instead.`,
      );
    }
  }
}
