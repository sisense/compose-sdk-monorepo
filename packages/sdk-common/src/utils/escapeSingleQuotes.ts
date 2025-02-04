export function escapeSingleQuotes(str?: string) {
  if (!str) {
    return str;
  }
  // Replace single quotes with escaped single quotes
  // Only when the single quote is not preceded by a backslash
  return str.replace(/(?<!\\)'/g, "\\'");
}
