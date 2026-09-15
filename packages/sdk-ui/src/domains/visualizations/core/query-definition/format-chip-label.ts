/**
 * Chip **Label** rules. The Value side lives in `toReadableFilterLabel`.
 *
 * 1. A distinct Friendly Name (`title !== name`) is used verbatim — no casing or separator changes.
 * 2. Otherwise the technical name is cleaned: `_`/`-`/`.` → space, camelCase split, then sentence case.
 * 3. System-generated names (no distinct title) take the same clean path; they are not matched
 *    against data-model fields. Internal `$…` names are left untouched so synthesized trend/forecast
 *    measures keep their identity.
 */

type NamedElement = {
  name?: string;
  title?: string;
};

/**
 * Formats a chip label from a dimensional element or a raw technical/generated name.
 * @param source - Attribute/measure-like `{ name, title }`, or a string with no Friendly Name
 * @returns The chip label
 * @internal
 */
export function formatChipLabel(source: string | NamedElement): string {
  if (typeof source === 'string') {
    return cleanTechnicalName(source);
  }
  const name = source.name ?? '';
  const title = source.title;
  if (typeof title === 'string' && title !== '' && title !== name) {
    return title;
  }
  return cleanTechnicalName(title || name);
}

function cleanTechnicalName(value: string): string {
  if (value.startsWith('$')) {
    return value;
  }
  const withSeparators = value.replace(/[_.-]+/g, ' ');
  const withCamelCase = withSeparators
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  const collapsed = withCamelCase.replace(/\s+/g, ' ').trim();
  if (collapsed === '') {
    return '';
  }
  return `${collapsed.charAt(0).toUpperCase()}${collapsed.slice(1).toLowerCase()}`;
}
