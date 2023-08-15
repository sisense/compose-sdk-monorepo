/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import type { DateFormat } from './apply_date_format';

type replacement = string;
type getReplacementFn = (matchForSearchText: string) => replacement;

/**
 * Returns a new date format string.
 *
 * If `searchText` is found in `oldDateFormat`, then
 * all occurrences of `searchText` are replaced. The replacement text
 * will be whatever is returned by the `getReplacement` function.
 *
 * @param oldDateFormat
 * @param searchText
 * @param getReplacement
 */
export function newDateFormat(
  oldDateFormat: DateFormat,
  searchText: string,
  getReplacement: getReplacementFn,
): DateFormat {
  const re = new RegExp("'[^']+'|(" + searchText + ')', 'g');

  const newDateFormat: DateFormat = oldDateFormat.replace(
    re,

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_the_replacement
    function (matchForSearchText: string, matchedTextInFirstCaptureGroup: string | undefined) {
      if (!matchedTextInFirstCaptureGroup) {
        return matchForSearchText;
      }

      return getReplacement(matchForSearchText);
    },
  );

  return newDateFormat;
}
