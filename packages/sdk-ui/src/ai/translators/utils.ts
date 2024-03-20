export function toKebabCase(str: string): string {
  return str
    .replace(/\s+/g, '-') // Replace whitespace with hyphens
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .toLowerCase(); // Convert to lowercase
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
