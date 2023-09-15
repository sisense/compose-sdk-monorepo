/**
 * @param type
 * @internal
 */
export const isInteger = (type: string): boolean => {
  return [
    '__int4',
    '__int8',
    'int',
    'tinyint',
    'bigint',
    'int2',
    'int4',
    'int8',
    'smallint',
    'mediumint',
    'serial',
    'integer',
    'byteint',
    'int64',
  ].includes(type.toLowerCase());
};

/**
 * @param type
 * @internal
 */
export const isDecimal = (type: string): boolean => {
  return [
    'basemeasure',
    'calculatedmeasure',
    'float',
    'float4',
    'float8',
    'double precision',
    'double',
    'numeric',
    'decimal',
    'real',
    'number',
    'float64',
  ].includes(type.toLowerCase());
};

/**
 * @param type
 * @internal
 */
export const isNumber = (type: string): boolean => {
  return isInteger(type) || isDecimal(type) || type === 'numeric-attribute';
};

/**
 * @param type
 * @internal
 */
export const isText = (type: string): boolean => {
  return [
    'textdimension',
    'string',
    'varchar',
    'text',
    'ntext',
    'char',
    'character',
    'character varying',
    'smalltext',
    'nchar',
    'nvarchar',
    'json',
    'jsonb',
    'object',
    'text-attribute',
  ].includes(type.toLowerCase());
};

/**
 * @param type
 * @internal
 */
export const isDatetime = (type: string): boolean => {
  return [
    'datelevel',
    'date',
    'time',
    'datetime',
    'timestamp without time zone',
    'timestamp',
    'timestamp with time zone',
    'timestamp(6)',
    'timestamp_tz',
    'timestamp_ntz',
    'timestamp_ltz',
    'timestampltz',
    'timestampntz',
    'timestamptz',
    'datetime64[ns]',
    'timewithtimezone',
    'timestampwithtimezone',
    'timestamp_with_timezone',
  ].includes(type.toLowerCase());
};

/**
 * @param type
 * @internal
 */
export const isBoolean = (type: string): boolean => {
  return ['bool', 'boolean', 'bit', 'logical'].includes(type.toLowerCase());
};

/**
 * @internal
 */
export type SimpleColumnType = 'number' | 'text' | 'datetime' | 'boolean';

/**
 * @param type
 * @internal
 */
export const simpleColumnType = (type: string): SimpleColumnType => {
  if (isNumber(type)) {
    return 'number';
  }
  if (isDatetime(type)) {
    return 'datetime';
  }
  if (isText(type)) {
    return 'text';
  }
  if (isBoolean(type)) {
    return 'boolean';
  }
  return 'text';
};
