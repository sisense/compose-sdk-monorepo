const COMMANDS = ['get-data-model', 'interactive'] as const;

/**
 * The commands supported by the CLI tool.
 *
 * @expandType
 */
/* @privateRemarks
  TypeDoc somehow requires that a package must have some public API items. Otherwise, TypeDoc does not include
  the content from README.md in the generated documentation. So this type is defined and exported
  to meet this requirement.
*/
export type Command = (typeof COMMANDS)[number];