/**
 * Resolves the reader's date format for the calendar filter — the one locale source that
 * both the typed entry and the month grid read, so the pattern a reader types can never
 * disagree with the month names beside it.
 *
 * The locale comes from the app's own date settings (`app.settings.locale`, a date-fns
 * `Locale`), which the SDK derives from the configured translation language and which a host
 * may also override outright. Where there is no app — Storybook, a bare unit test — the
 * active translation language stands in.
 * @internal
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getBaseDateFnsLocale } from '@/domains/visualizations/core/chart-data-processor/data-table-date-period';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

import { dateMaskFromPattern } from './date-text';
import type { DateMask } from './date-text';

/** @internal */
export interface ResolvedDateLocale {
  /** The entry format: segment order, separator and widths for this locale. */
  mask: DateMask;
  /** The locale tag `Intl` needs for month, weekday and day names. */
  locale: string;
}

/**
 * Resolves the active date mask and locale tag.
 * @returns The mask for the reader's locale, and that locale's tag
 * @internal
 */
export function useDateMask(): ResolvedDateLocale {
  const { i18n } = useTranslation();
  const { app } = useSisenseContext();
  const language = i18n.language;
  const appLocale = app?.settings.locale;

  return useMemo(() => {
    const locale = appLocale ?? getBaseDateFnsLocale(language);
    /* `formatLong` is optional on date-fns' `Locale`, so a host passing a hand-rolled
       locale object can omit it; `dateMaskFromPattern` answers an empty pattern with the
       `en-US` mask, which is the same answer it gives any pattern it cannot read. */
    const pattern = locale.formatLong?.date({ width: 'short' }) ?? '';
    return {
      mask: dateMaskFromPattern(pattern),
      /* date-fns codes (`de`, `zh-CN`) are valid BCP 47 tags, so `Intl` takes them as they
         are. The translation language is the fallback for a locale carrying no code. */
      locale: locale.code ?? language,
    };
  }, [appLocale, language]);
}
