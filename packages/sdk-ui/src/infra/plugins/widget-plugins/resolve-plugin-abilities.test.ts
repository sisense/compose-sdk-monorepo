import { PLUGIN_ABILITY_DEFAULTS } from '@/domains/widgets/widget-identity/ability-defaults';

import { resolvePluginAbilities } from './resolve-plugin-abilities';

describe('resolvePluginAbilities', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('returns the plugin defaults when the manifest declares no abilities', () => {
    expect(resolvePluginAbilities(undefined, 'my-plugin')).toEqual(PLUGIN_ABILITY_DEFAULTS);
    expect(resolvePluginAbilities({}, 'my-plugin')).toEqual(PLUGIN_ABILITY_DEFAULTS);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('merges declared fields over the defaults, layout field by field', () => {
    const abilities = resolvePluginAbilities(
      {
        data: 'none',
        interactions: ['widgetClick'],
        highlights: false,
        drilldown: true,
        layout: { autoHeight: true },
      },
      'my-plugin',
    );

    expect(abilities).toEqual({
      data: 'none',
      interactions: ['widgetClick'],
      highlights: false,
      drilldown: true,
      layout: { autoHeight: true, defaultSize: { width: 400, height: 400 } },
    });
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('returns a frozen copy that does not share the manifest arrays', () => {
    const interactions = ['dataPointClick'];
    const abilities = resolvePluginAbilities({ interactions }, 'my-plugin');

    expect(abilities.interactions).not.toBe(interactions);
    expect(Object.isFrozen(abilities)).toBe(true);
    expect(Object.isFrozen(abilities.interactions)).toBe(true);
  });

  it('ignores invalid and unknown fields with a warning naming the plugin', () => {
    const abilities = resolvePluginAbilities(
      {
        data: 'everything',
        interactions: ['dataPointClick', 'hover'],
        highlights: 'yes',
        drilldown: true,
        noDuplicate: true,
        layout: { autoHeight: 1, defaultSize: { width: 300, height: 250 } },
      },
      'my-plugin',
    );

    expect(abilities).toEqual({
      ...PLUGIN_ABILITY_DEFAULTS,
      drilldown: true,
      layout: { autoHeight: false, defaultSize: { width: 300, height: 250 } },
    });
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Plugin] Plugin "my-plugin" declares invalid widget abilities (data, interactions, highlights, noDuplicate, layout.autoHeight); they are ignored and the defaults apply.',
    );
  });

  it('drops unknown size fields and reports them', () => {
    const resolved = resolvePluginAbilities(
      { layout: { defaultSize: { width: 300, height: 250, depth: 1 } } },
      'my-plugin',
    );

    expect(resolved.layout.defaultSize).toEqual({ width: 300, height: 250 });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('(layout.defaultSize.depth)'),
    );
  });

  it.each([
    ['a non-object value', 'all', 'abilities'],
    ['null', null, 'abilities'],
    ['an array', ['query'], 'abilities'],
    ['a non-object layout', { layout: 'auto' }, 'layout'],
    [
      'a non-positive size',
      { layout: { defaultSize: { width: 0, height: 100 } } },
      'layout.defaultSize',
    ],
    [
      'a non-finite size',
      { layout: { defaultSize: { width: 100, height: Infinity } } },
      'layout.defaultSize',
    ],
  ])('falls back to the defaults for %s', (_, declared, invalidPath) => {
    expect(resolvePluginAbilities(declared, 'my-plugin')).toEqual(PLUGIN_ABILITY_DEFAULTS);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(`(${invalidPath})`));
  });
});
