import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { translation as en } from './resources/en.js';

/**
 * Ratchet: a locale value identical to the English one is a translation left undone.
 * Existing identical values are frozen in `untranslated-values.baseline.json`; new ones fail.
 * Regenerate the baseline (after a deliberate review) with `UPDATE_I18N_BASELINE=1 yarn test untranslated`.
 */
const here = dirname(fileURLToPath(import.meta.url));
const baselinePath = join(here, 'untranslated-values.baseline.json');
const localesDir = join(here, 'resources', '__external__');

type Flat = Map<string, string>;
const flatten = (obj: Record<string, unknown>, prefix = ''): Flat => {
  const out: Flat = new Map();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && typeof v === 'object')
      for (const [ik, iv] of flatten(v as Record<string, unknown>, `${prefix}${k}.`))
        out.set(ik, iv);
    else out.set(`${prefix}${k}`, String(v));
  }
  return out;
};

/** Values that legitimately match English everywhere: placeholders, numbers, punctuation, i18next references. */
const isNeutral = (v: string): boolean =>
  v.trim() === '' ||
  /^[{}\s%\d.,:;\-–—()[\]/+*|]*$/.test(v) ||
  /^\{\{[^}]+\}\}$/.test(v) ||
  /^\$t\(/.test(v);

const enFlat = flatten(en);
// The locales directory contains only locale modules.
const localeFiles = readdirSync(localesDir).filter(
  (f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== 'en-us.ts',
);

type LocaleModule = { default: Array<{ resources: Record<string, unknown> }> };

// Locale modules are imported in parallel: each import goes through the Vite transform (with
// coverage instrumentation in CI), and importing a dozen of them sequentially is what pushed
// this test past the default timeout on a loaded runner.
const collect = async (): Promise<Record<string, string[]>> => {
  const entries = await Promise.all(
    [...localeFiles].sort().map(async (file) => {
      const mod = (await import(
        /* @vite-ignore */ `./resources/__external__/${file}`
      )) as LocaleModule;
      const flat = flatten(mod.default[0].resources);
      const keys = [...flat]
        .filter(([k, v]) => enFlat.get(k) === v && !isNeutral(v))
        .map(([k]) => k)
        .sort();
      return [file.replace(/\.ts$/, ''), keys] as const;
    }),
  );
  return Object.fromEntries(entries);
};

// Transform-bound (see collect); generous so a loaded CI runner cannot turn it into a flake.
const LOCALE_IMPORT_TIMEOUT_MS = 60_000;

describe('external locales: untranslated values ratchet', () => {
  it(
    'does not introduce new values identical to English',
    async () => {
      const current = await collect();
      if (process.env.UPDATE_I18N_BASELINE === '1') {
        writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
      }
      const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as Record<string, string[]>;
      const added: string[] = [];
      const prunable: string[] = [];
      for (const [locale, keys] of Object.entries(current)) {
        const known = new Set(baseline[locale] ?? []);
        for (const k of keys) if (!known.has(k)) added.push(`${locale}: ${k}`);
        for (const k of known) if (!keys.includes(k)) prunable.push(`${locale}: ${k}`);
      }
      if (prunable.length)
        console.warn(
          `untranslated-values baseline has ${prunable.length} prunable entries:\n  ${prunable.join(
            '\n  ',
          )}`,
        );
      expect(
        added,
        `New untranslated values (identical to English). Translate them or, if identical on purpose, add to untranslated-values.baseline.json:\n  ${added.join(
          '\n  ',
        )}`,
      ).toEqual([]);
    },
    LOCALE_IMPORT_TIMEOUT_MS,
  );
});
