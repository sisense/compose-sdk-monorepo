/**
 * Defines outputFileStrategy model for the `outputFileStrategy` option.
 *
 * @enum
 *
 */
export const OutputFileStrategy = {
  Members: 'members',
  Modules: 'modules',
} as const;

export type OutputFileStrategy =
  (typeof OutputFileStrategy)[keyof typeof OutputFileStrategy];
/**
 *
 * @enum
 */
export const FormatStyle = {
  List: 'list',
  Table: 'table',
} as const;

export type FormatStyle = (typeof FormatStyle)[keyof typeof FormatStyle];

export const ReflectionKind = {
  0x1: 'Project',
  0x2: 'Module',
  0x4: 'Namespace',
  0x8: 'Enum',
  0x10: 'EnumMember',
  0x20: 'Variable',
  0x40: 'Function',
  0x80: 'Class',
  0x100: 'Interface',
  0x200: 'Constructor',
  0x400: 'Property',
  0x800: 'Method',
  0x1000: 'CallSignature',
  0x2000: 'IndexSignature',
  0x4000: 'ConstructorSignature',
  0x8000: 'Parameter',
  0x10000: 'TypeLiteral',
  0x20000: 'TypeParameter',
  0x40000: 'Accessor',
  0x80000: 'GetSignature',
  0x100000: 'SetSignature',
  0x200000: 'TypeAlias',
  0x400000: 'Reference',
  /**
   * Generic non-ts content to be included in the generated docs as its own page.
   */
  0x800000: 'Document',
};
