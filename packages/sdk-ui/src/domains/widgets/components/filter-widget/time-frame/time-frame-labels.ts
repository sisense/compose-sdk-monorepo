/**
 * Localised labels and range wording for Time Frame rows, tooltips and the preview
 * bar. Every label reaches the DOM through i18n — never built by lower-casing a
 * grain word and appending an `s` — so plural forms and word order follow the
 * locale, not English.
 *
 * The range wording (`Sep 15, 2026 – Sep 21, 2026`) is formatted through
 * `Intl.DateTimeFormat` at the reader's locale, taken from `useDateMask` — the same
 * locale the Calendar filter reads. English hard-codes `MMM D, YYYY` order; every
 * other locale gets whatever `Intl` produces natively.
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExactRange } from './time-frame-arithmetic';
import type { RelativeSpec } from './time-frame-catalogue';

/** Lower-cased grain name — the segment of the i18n key that names the noun. */
const GRAIN_KEY = {
  Day: 'day',
  Week: 'week',
  Month: 'month',
  Quarter: 'quarter',
  Year: 'year',
} as const;

/**
 * The reader-facing label for a single frame — `Today`, `Last week`, `Last 30 days`,
 * `This & last month`.
 * @param spec - The frame to label.
 * @returns The translated label, or `undefined` while translations are still loading.
 * @internal
 */
export function useTimeFrameLabel(spec: RelativeSpec): string {
  const { t } = useTranslation();
  const count = spec.tense === 'this' ? 1 : Math.max(1, Math.floor(spec.count) || 1);
  const grain = GRAIN_KEY[spec.grain];

  // Day-grain single day — `Today` / `Yesterday` / `Tomorrow` — takes the calendar word,
  // never `Last day` / `Next day` (which would read as arithmetic on the calendar).
  if (spec.grain === 'Day' && count === 1) {
    if (spec.tense === 'this') return t('filterWidget.timeFrame.labels.today');
    if (spec.tense === 'last') return t('filterWidget.timeFrame.labels.yesterday');
    if (spec.tense === 'next') return t('filterWidget.timeFrame.labels.tomorrow');
  }
  // Paired frames — `This & last X`, `This & next X`. Day grain has no such pair.
  if (spec.withCurrent && count === 2 && spec.grain !== 'Day') {
    const key = spec.tense === 'last' ? 'thisAndLast' : 'thisAndNext';
    return t(`filterWidget.timeFrame.labels.${key}.${grain}`);
  }
  // `This X` — always a single period, no count in the label.
  if (spec.tense === 'this') {
    return t(`filterWidget.timeFrame.labels.this.${grain}`);
  }
  // `Last N X` / `Next N X` — i18next reads `count` to pick `_one` (singular, count
  // dropped) or `_other` (plural, `{{count}}` interpolated). Locales with more plural
  // forms add `_few`, `_many`, `_two` etc. in their resources.
  return t(`filterWidget.timeFrame.labels.${spec.tense}.${grain}`, { count });
}

/**
 * The reader-facing range for a resolved frame — `Sep 15, 2026 – Sep 21, 2026` in
 * English; the equivalent `Intl.DateTimeFormat` output elsewhere. A one-day range
 * shows the single date once (Today / Yesterday / Tomorrow).
 * @param range - The `resolveRelative` output for a spec + today.
 * @returns The formatted range in the reader's locale.
 * @internal
 */
export function useTimeFrameRangeLabel(range: ExactRange | undefined): string {
  const { i18n } = useTranslation();
  const format = useMemo(
    // Formatted through `i18n.language` rather than `app.settings.locale` so the dates
    // follow the same signal the frame labels do — the two must never disagree. i18next is
    // a single shared instance, and its language is the always-up-to-date source: an app
    // that only overrides `translationConfig.language` in a nested provider still changes
    // the whole page's i18n language, and the preview dates should track that switch even
    // though `app.settings.locale` on the outer provider did not move.
    // `dateStyle: 'medium'` produces `MMM D, YYYY` in en-US and the locale-native
    // equivalent elsewhere — the format the Calendar's own tooltip reads by.
    () => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }),
    [i18n.language],
  );
  if (!range) return '';
  const start = format.format(range.start);
  const end = format.format(range.end);
  return start === end ? start : `${start} – ${end}`;
}

/**
 * The at-rest span `min` – `max` for the preview bar, in the reader's locale.
 * @param min - The dimension's earliest data date.
 * @param max - The dimension's latest data date.
 * @returns The formatted span, or an empty string when either bound is missing.
 * @internal
 */
export function useDataSpanLabel(min: Date | undefined, max: Date | undefined): string {
  const { i18n } = useTranslation();
  const format = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }),
    [i18n.language],
  );
  if (!min || !max) return '';
  return `${format.format(min)} – ${format.format(max)}`;
}
