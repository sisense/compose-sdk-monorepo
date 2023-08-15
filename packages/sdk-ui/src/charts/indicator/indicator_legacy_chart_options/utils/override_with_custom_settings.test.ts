import { overrideWithCustomSettings } from './override_with_custom_settings';
describe('overrideWithCustomSettings', () => {
  const customSettings = { a: { b: { c: 'custom_cc' } } };
  const defaultOptions = { aa: { bb: { cc: 'cc' } }, cc: 'cc' };
  const customSettingsToDefaultOptionsDictionary = {
    'aa.bb.cc': 'a.b.c',
    cc: 'a.b.c',
  };

  it('should extend default options with custom settings', () => {
    const extendedOptions = overrideWithCustomSettings(
      customSettings,
      customSettingsToDefaultOptionsDictionary,
      defaultOptions,
    );

    const expectedOptions = { aa: { bb: { cc: 'custom_cc' } }, cc: 'custom_cc' };
    expect(extendedOptions).toEqual(expectedOptions);
  });

  it('should not modify the original default options', () => {
    const extendedOptions = overrideWithCustomSettings(
      customSettings,
      customSettingsToDefaultOptionsDictionary,
      defaultOptions,
    );

    expect(extendedOptions).not.toEqual(defaultOptions);
  });

  it('should skip missing keys of default options if they are exists in dictionary', () => {
    const invalidCustomSettingsDictionary = {
      dd: 'a.b.c', // 'dd' key does not exist in default options
    };
    const extendedOptions = overrideWithCustomSettings(
      customSettings,
      invalidCustomSettingsDictionary,
      defaultOptions,
    );

    expect(extendedOptions).toEqual(defaultOptions);
  });

  it('should skip missing keys of custom settings if they are exists in dictionary', () => {
    const invalidCustomSettingsDictionary = {
      'aa.bb.cc': 'a.b.d', // 'd' key does not exist in custom settings
    };
    const extendedOptions = overrideWithCustomSettings(
      customSettings,
      invalidCustomSettingsDictionary,
      defaultOptions,
    );

    expect(extendedOptions).toEqual(defaultOptions);
  });
});
