export type Values<T extends {}> = T[keyof T];

export const PanelType = {
  ROWS: 'rows' as const,
  COLUMNS: 'columns' as const,
  MEASURES: 'measures' as const,
  SCOPE: 'scope' as const,
};
export type ListOfPanelTypes = Values<typeof PanelType>;

export const SortingDirection = {
  ASC: 'asc' as const,
  DESC: 'desc' as const,
};

export type ListOfSortingDirections = Values<typeof SortingDirection>;

export const UserType = {
  SUB_TOTAL: 'subTotal',
  GRAND_TOTAL: 'grandTotal',
  MEASURE_TOP: 'measureTop',
  MEASURE_BOTTOM: 'measureBottom',
  CORNER: 'corner',
};

export const ColorFormatType = {
  COLOR: 'color',
  CONDITION: 'condition',
};

export const JaqlDataType = {
  DATETIME: 'datetime' as const,
  TEXT: 'text' as const,
  NUMERIC: 'numeric' as const,
};

export type ListOfJaqlDataTypes = Values<typeof JaqlDataType>;

export const PluginsTypesFields = {
  MEMBER: 'member',
  VALUE: 'value',
  SUB_TOTAL: 'subtotal',
  GRAND_TOTAL: 'grandtotal',
};

export const PluginsPanelFields = {
  MEMBER: 'member',
  INDEX: 'index',
  TITLE: 'title',
  NAME: 'name',
  AGG: 'agg',
  DIM: 'dim',
};
