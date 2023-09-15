import { simpleColumnType } from './simple-column-types.js';

const typeMap = {
  number: [
    // INTEGER
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
    // DECIMAL
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
    // OTHER
    'numeric-attribute',
  ],
  text: [
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
    'RANDOM_TEXT',
  ],
  datetime: [
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
  ],
  boolean: ['bool', 'boolean', 'bit', 'logical'],
};

describe('simpleColumnType', () => {
  it('should return correct type', () => {
    Object.entries(typeMap).forEach(([outputType, inputTypes]) => {
      inputTypes.forEach((inputType) => {
        expect(simpleColumnType(inputType)).toBe(outputType);
      });
    });
  });
});
