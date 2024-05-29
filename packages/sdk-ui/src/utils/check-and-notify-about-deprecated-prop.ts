import has from 'lodash/has';

export function checkAndNotifyAboutDeprecatedProp(props: any, deprecatedProps: string[]): void {
  for (const deprecatedProp of deprecatedProps) {
    if (has(props, deprecatedProp)) {
      console.warn(
        `Prop '${deprecatedProp}' has been deprecated. Please refer to the documentation at https://sisense.dev/guides/sdk/ for the updated prop and use that instead.`,
      );
    }
  }
}
