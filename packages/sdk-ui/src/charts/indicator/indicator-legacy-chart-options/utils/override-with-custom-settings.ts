import cloneDeep from 'lodash-es/cloneDeep';

/**
 * Overrides the default options with custom settings based on a mapping dictionary.
 *
 * @param customSettings - The custom settings to apply.
 * @param defaultOptionsToCustomSettingsDictionary - The dictionary mapping default options to custom settings keys.
 * @param defaultOptions - The default options to override.
 * @returns The overridden options object.
 * @example
  const customSettings = { a: { b: { c: 'custom_cc' } } };
  const defaultOptions = { aa: { bb: { cc: 'cc' } }, cc: 'cc' };
  const customSettingsToDefaultOptionsDictionary = {
    'aa.bb.cc': 'a.b.c',
    cc: 'a.b.c',
  };
  const overriddenOptions = overrideWithCustomSettings(
      customSettings,
      customSettingsToDefaultOptionsDictionary,
      defaultOptions,
    );
  // overriddenOptions = { aa: { bb: { cc: 'custom_cc' } }, cc: 'custom_cc' };
 */
export function overrideWithCustomSettings<DefaultOptions extends Record<string, any>>(
  customSettings: Record<string, any>,
  defaultOptionsToCustomSettingsDictionary: Record<string, string>,
  defaultOptions: DefaultOptions,
): DefaultOptions {
  const overriddenOptions: DefaultOptions = cloneDeep(defaultOptions);

  for (const defaultOptionPath in defaultOptionsToCustomSettingsDictionary) {
    const customSettingPath = defaultOptionsToCustomSettingsDictionary[defaultOptionPath];
    const customSettingValue = getCustomSettingValue(customSettings, customSettingPath);

    if (customSettingValue) {
      setNestedValue(overriddenOptions, defaultOptionPath, customSettingValue);
    }
  }

  return overriddenOptions;
}

function setNestedValue(obj: Record<string, unknown>, keyPath: string, value: unknown): void {
  const keys = keyPath.split('.');

  if (keys.length === 1) {
    if (keys[0] in obj) {
      obj[keys[0]] = value;
    } else {
      return;
    }
  } else {
    const [currentKey, ...remainingKeys] = keys;
    if (!(currentKey in obj)) {
      return;
    }
    const nestedValue = obj[currentKey];
    if (!isObject(nestedValue)) {
      return;
    }
    setNestedValue(nestedValue, remainingKeys.join('.'), value);
  }
}

function getCustomSettingValue(
  customSettings: Record<string, unknown>,
  customSettingPath: string,
): unknown {
  const keys = customSettingPath.split('.');
  let value: unknown = customSettings;

  for (const key of keys) {
    if (!isObject(value) || !(key in value)) {
      return undefined;
    }
    value = value[key];
  }

  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
