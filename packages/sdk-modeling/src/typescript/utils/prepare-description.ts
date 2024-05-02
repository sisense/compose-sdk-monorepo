export function prepareDescription(description: string): string {
  return '`' + description.replace(/\\/g, '\\\\').replace(/`/g, '\\`') + '`';
}
