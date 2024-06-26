const COMMANDS = ['get-data-model', 'get-api-token'] as const;

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

export type GetDataModelOptions = {
  url: string;
  dataSource: string;
  username: string | undefined;
  password: string | undefined;
  token: string | undefined;
  wat: string | undefined;
  output: string | undefined;
};

export type GetApiTokenOptions = {
  url: string;
  username: string;
  password: string | undefined;
};

/**
 * Data source schema table
 *
 * @internal
 */
export type DataSourceSchemaTable = {
  name: string;
  columns: {
    name: string;
    description: string | null;
  }[];
};

/**
 * Data source schema table
 *
 * @internal
 */
export type DataSourceSchemaDataset = {
  schema: {
    tables: DataSourceSchemaTable[];
  };
};
