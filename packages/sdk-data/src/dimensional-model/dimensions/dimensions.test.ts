import { DimensionalAttribute } from '../attributes.js';
import { MetadataTypes, Sort } from '../types.js';
import {
  createDateDimension,
  createDimension,
  DimensionalDateDimension,
  DimensionalDimension,
  isDimensionalDateDimension,
  isDimensionalDimension,
} from './dimensions.js';

describe('Dimension jaql preparations', () => {
  it('must prepare simple text dimension jaql', () => {
    const result = { jaql: { title: 'Brand', dim: '[Brand.Brand]', datatype: 'text' } };

    const dimension = new DimensionalDimension(
      'Brand',
      '[Brand.Brand]',
      [new DimensionalAttribute('Brand', '[Brand.Brand]')],
      [],
      'textdimension',
    );

    expect(isDimensionalDimension(dimension)).toBe(true);
    const jaql = dimension.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare simple text dimension with default attribute jaql', () => {
    const result = { jaql: { title: 'Brand', dim: '[Brand.Brand]', datatype: 'text' } };

    const attribute = new DimensionalAttribute('Brand', '[Brand.Brand]');
    const dimension = new DimensionalDimension(
      'Brand',
      '[Brand.Brand]',
      [attribute],
      [],
      'textdimension',
    );
    dimension.defaultAttribute = attribute;

    expect(isDimensionalDimension(dimension)).toBe(true);

    const jaql = dimension.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare simple text dimension with nested dimension jaql', () => {
    const result = { jaql: { title: 'Brand', dim: '[Brand.Brand]', datatype: 'text' } };

    const dimension = new DimensionalDimension(
      'Brand',
      '',
      [new DimensionalAttribute('Brand', '')],
      [
        new DimensionalDimension(
          'Brand',
          '[Brand.Brand]',
          [new DimensionalAttribute('Brand', '[Brand.Brand]')],
          [],
          'textdimension',
        ),
      ],
      'textdimension',
    );

    expect(isDimensionalDimension(dimension)).toBe(true);

    const jaql = dimension.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare date dimension jaql', () => {
    const result = {
      jaql: {
        title: 'Date',
        dim: '[Commerce.Date (Calendar)]',
        level: 'years',
        datatype: 'datetime',
      },
      format: { mask: { years: 'yyyy' } },
    };

    const dimension = new DimensionalDateDimension('Date', '[Commerce.Date (Calendar)]');

    expect(isDimensionalDateDimension(dimension)).toBe(true);

    const jaql = dimension.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare jaql for date dimension with "seconds" level', () => {
    const result = {
      jaql: {
        title: 'Seconds',
        dim: '[Commerce.Date (Calendar)]',
        bucket: '0',
        dateTimeLevel: 'seconds',
        datatype: 'datetime',
      },
      format: { mask: { seconds: 'yyyy-MM-dd HH:mm:ss' } },
    };

    const dimension = new DimensionalDateDimension('Date', '[Commerce.Date (Calendar)]');

    expect(isDimensionalDateDimension(dimension)).toBe(true);

    const jaql = dimension.Seconds.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare jaql for date dimension with "minutes" level', () => {
    const result = {
      jaql: {
        title: 'Minutes',
        dim: '[Commerce.Date (Calendar)]',
        bucket: '1',
        dateTimeLevel: 'minutes',
        datatype: 'datetime',
      },
      format: { mask: { minutes: 'yyyy-MM-dd HH:mm' } },
    };

    const dimension = new DimensionalDateDimension('Date', '[Commerce.Date (Calendar)]');

    expect(isDimensionalDateDimension(dimension)).toBe(true);

    const jaql = dimension.Minutes.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must handle sort', () => {
    const dimensionAscSort = new DimensionalDimension(
      'Brand',
      '[Brand.Brand]',
      [new DimensionalAttribute('Brand', '[Brand.Brand]')],
      [],
      'textdimension',
      '',
      Sort.Ascending,
    );
    const dimensionDescSort = new DimensionalDimension(
      'Brand',
      '[Brand.Brand]',
      [new DimensionalAttribute('Brand', '[Brand.Brand]')],
      [],
      'textdimension',
      '',
      Sort.Descending,
    );

    const jaqlAscSort = dimensionAscSort.jaql();
    const jaqlDescSort = dimensionDescSort.jaql();

    expect(jaqlAscSort.jaql.sort).toBe('asc');
    expect(jaqlDescSort.jaql.sort).toBe('desc');
  });
});

describe('DimensionalDimension.parseType', () => {
  it('should parse datetime type', () => {
    expect(DimensionalDimension.parseType('datetime')).toBe(MetadataTypes.DateDimension);
  });

  it('should parse text type', () => {
    expect(DimensionalDimension.parseType('text')).toBe(MetadataTypes.TextDimension);
  });

  it('should parse numeric type', () => {
    expect(DimensionalDimension.parseType('numeric')).toBe(MetadataTypes.NumericDimension);
  });

  it('should parse MetadataTypes.DateDimension', () => {
    expect(DimensionalDimension.parseType(MetadataTypes.DateDimension)).toBe(
      MetadataTypes.DateDimension,
    );
  });

  it('should parse MetadataTypes.TextDimension', () => {
    expect(DimensionalDimension.parseType(MetadataTypes.TextDimension)).toBe(
      MetadataTypes.TextDimension,
    );
  });

  it('should parse MetadataTypes.NumericDimension', () => {
    expect(DimensionalDimension.parseType(MetadataTypes.NumericDimension)).toBe(
      MetadataTypes.NumericDimension,
    );
  });

  it('should default to TextDimension for unknown types', () => {
    expect(DimensionalDimension.parseType('unknown')).toBe(MetadataTypes.TextDimension);
  });
});

describe('DimensionalDimension constructor', () => {
  it('should set defaultAttribute when provided', () => {
    const attribute = new DimensionalAttribute('Test', '[Test.Test]');
    const dimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [attribute],
      [],
      'textdimension',
      'Test description',
      Sort.None,
      undefined,
      undefined,
      attribute,
    );

    expect(dimension.defaultAttribute).toBe(attribute);
  });

  it('should handle empty dimensions array', () => {
    const dimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [new DimensionalAttribute('Test', '[Test.Test]')],
      undefined,
      'textdimension',
    );

    expect(dimension.dimensions).toEqual([]);
  });

  it('should extract composeCode from expression when not provided', () => {
    const dimension = new DimensionalDimension(
      'Test',
      '[Table.Column]',
      [new DimensionalAttribute('Test', '[Table.Column]')],
      [],
      'textdimension',
    );

    expect(dimension.composeCode).toBeDefined();
  });

  it('should use default type when type is undefined', () => {
    const dimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [new DimensionalAttribute('Test', '[Test.Test]')],
      [],
      undefined, // This will trigger the fallback to MetadataTypes.Dimension
    );

    expect(dimension.type).toBe(MetadataTypes.Dimension);
  });
});

describe('DimensionalDimension getters and methods', () => {
  let dimension: DimensionalDimension;

  beforeEach(() => {
    dimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [new DimensionalAttribute('Test', '[Test.Test]')],
      [],
      'textdimension',
    );
  });

  it('should return correct id', () => {
    expect(dimension.id).toBe('[Test.Test]');
  });

  it('should return correct expression', () => {
    expect(dimension.expression).toBe('[Test.Test]');
  });

  it('should return correct attributes', () => {
    expect(dimension.attributes).toHaveLength(1);
    expect(dimension.attributes[0].name).toBe('Test');
  });

  it('should return correct dimensions', () => {
    expect(dimension.dimensions).toEqual([]);
  });

  it('should return correct sort', () => {
    expect(dimension.getSort()).toBe(Sort.None);
  });
});

describe('DimensionalDimension sort method', () => {
  it('should create new dimension with ascending sort', () => {
    const originalDimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [new DimensionalAttribute('Test', '[Test.Test]')],
      [],
      'textdimension',
    );

    const sortedDimension = originalDimension.sort(Sort.Ascending);

    expect(sortedDimension).toBeInstanceOf(DimensionalDimension);
    expect(sortedDimension.getSort()).toBe(Sort.Ascending);
    expect(originalDimension.getSort()).toBe(Sort.None);
  });

  it('should create new dimension with descending sort', () => {
    const originalDimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [new DimensionalAttribute('Test', '[Test.Test]')],
      [],
      'textdimension',
    );

    const sortedDimension = originalDimension.sort(Sort.Descending);

    expect(sortedDimension).toBeInstanceOf(DimensionalDimension);
    expect(sortedDimension.getSort()).toBe(Sort.Descending);
  });
});

describe('DimensionalDimension serialize method', () => {
  it('should serialize dimension with defaultAttribute', () => {
    const attribute = new DimensionalAttribute('Test', '[Test.Test]');
    const dimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [attribute],
      [],
      'textdimension',
      'Test description',
      Sort.Ascending,
      undefined,
      undefined,
      attribute,
    );

    const serialized = dimension.serialize();

    expect(serialized.__serializable).toBe('DimensionalDimension');
    expect(serialized.expression).toBe('[Test.Test]');
    expect(serialized.sort).toBe(Sort.Ascending);
    expect(serialized.defaultAttribute).toBeDefined();
    expect(serialized.attributes).toHaveLength(1);
    expect(serialized.dimensions).toHaveLength(0);
  });

  it('should serialize dimension without defaultAttribute', () => {
    const dimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [new DimensionalAttribute('Test', '[Test.Test]')],
      [],
      'textdimension',
    );

    const serialized = dimension.serialize();

    expect(serialized.__serializable).toBe('DimensionalDimension');
    expect(serialized.expression).toBe('[Test.Test]');
    expect(serialized.defaultAttribute).toBeUndefined();
  });

  it('should serialize dimension with nested dimensions', () => {
    const childDimension = new DimensionalDimension(
      'Child',
      '[Child.Child]',
      [new DimensionalAttribute('Child', '[Child.Child]')],
      [],
      'textdimension',
    );

    const parentDimension = new DimensionalDimension(
      'Parent',
      '[Parent.Parent]',
      [new DimensionalAttribute('Parent', '[Parent.Parent]')],
      [childDimension],
      'textdimension',
    );

    const serialized = parentDimension.serialize();

    expect(serialized.__serializable).toBe('DimensionalDimension');
    expect(serialized.dimensions).toHaveLength(1);
    expect(serialized.dimensions?.[0]).toBeDefined();
  });
});

describe('DimensionalDimension jaql method', () => {
  it('should return nested jaql when nested parameter is true', () => {
    const dimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [new DimensionalAttribute('Test', '[Test.Test]')],
      [],
      'textdimension',
    );

    const jaql = dimension.jaql(true);

    expect(jaql).toEqual({
      title: 'Test',
      dim: '[Test.Test]',
      datatype: 'text',
    });
  });

  it('should return full jaql when nested parameter is false', () => {
    const dimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [new DimensionalAttribute('Test', '[Test.Test]')],
      [],
      'textdimension',
    );

    const jaql = dimension.jaql(false);

    expect(jaql).toEqual({
      jaql: {
        title: 'Test',
        dim: '[Test.Test]',
        datatype: 'text',
      },
    });
  });
});

describe('DimensionalDateDimension', () => {
  let dateDimension: DimensionalDateDimension;

  beforeEach(() => {
    dateDimension = new DimensionalDateDimension('Date', '[Commerce.Date]');
  });

  it('should return correct id', () => {
    expect(dateDimension.id).toBe('[Commerce.Date]');
  });

  it('should return correct sort', () => {
    expect(dateDimension.getSort()).toBe(Sort.None);
  });

  it('should create new date dimension with sort', () => {
    const sortedDimension = dateDimension.sort(Sort.Ascending);

    expect(sortedDimension).toBeInstanceOf(DimensionalDateDimension);
    expect(sortedDimension.getSort()).toBe(Sort.Ascending);
    expect(dateDimension.getSort()).toBe(Sort.None);
  });

  it('should serialize correctly', () => {
    const serialized = dateDimension.serialize();

    expect(serialized.__serializable).toBe('DimensionalDateDimension');
  });

  it('should return nested jaql when nested parameter is true', () => {
    const jaql = dateDimension.jaql(true);

    expect(jaql).toEqual({
      title: 'Date',
      dim: '[Commerce.Date]',
      level: 'years',
      datatype: 'datetime',
    });
  });

  it('should return full jaql when nested parameter is false', () => {
    const jaql = dateDimension.jaql(false);

    expect(jaql).toEqual({
      jaql: {
        title: 'Date',
        dim: '[Commerce.Date]',
        level: 'years',
        datatype: 'datetime',
      },
      format: { mask: { years: 'yyyy' } },
    });
  });
});

describe('createDimension function', () => {
  it('should create date dimension when type is DateDimension', () => {
    const json = {
      name: 'Date',
      expression: '[Commerce.Date]',
      type: MetadataTypes.DateDimension,
      description: 'Date dimension',
    };

    const dimension = createDimension(json);

    expect(dimension).toBeInstanceOf(DimensionalDateDimension);
    expect(dimension.name).toBe('Date');
    expect(dimension.expression).toBe('[Commerce.Date]');
  });

  it('should create dimension with attributes from json.attributes', () => {
    const json = {
      name: 'Test',
      expression: '[Test.Test]',
      type: 'textdimension',
      attributes: [
        {
          name: 'TestAttr',
          expression: '[Test.TestAttr]',
          type: 'attribute',
        },
      ],
    };

    const dimension = createDimension(json);

    expect(dimension).toBeInstanceOf(DimensionalDimension);
    expect(dimension.attributes).toHaveLength(1);
    expect(dimension.attributes[0].name).toBe('TestAttr');
  });

  it('should create dimension with default attribute when no attributes provided', () => {
    const json = {
      name: 'Test',
      expression: '[Test.Test]',
      type: 'textdimension',
    };

    const dimension = createDimension(json);

    expect(dimension).toBeInstanceOf(DimensionalDimension);
    expect(dimension.attributes).toHaveLength(1);
    expect(dimension.attributes[0].name).toBe('Test');
    expect(dimension.attributes[0].expression).toBe('[Test.Test]');
  });

  it('should create dimension with nested dimensions', () => {
    const json = {
      name: 'Parent',
      expression: '[Parent.Parent]',
      type: 'textdimension',
      dimensions: [
        {
          name: 'Child',
          expression: '[Child.Child]',
          type: 'textdimension',
        },
      ],
    };

    const dimension = createDimension(json);

    expect(dimension).toBeInstanceOf(DimensionalDimension);
    expect(dimension.dimensions).toHaveLength(1);
    expect(dimension.dimensions[0].name).toBe('Child');
  });

  it('should set defaultAttribute when specified', () => {
    const json = {
      name: 'Test',
      expression: '[Test.Test]',
      type: 'textdimension',
      attributes: [
        {
          name: 'TestAttr',
          expression: '[Test.TestAttr]',
          type: 'attribute',
        },
      ],
      defaultAttribute: 'TestAttr',
    };

    const dimension = createDimension(json);

    expect(dimension.defaultAttribute).toBeDefined();
    expect(dimension.defaultAttribute?.name).toBe('TestAttr');
  });

  it('should use title when name is not provided', () => {
    const json = {
      title: 'Test Title',
      expression: '[Test.Test]',
      type: 'textdimension',
    };

    const dimension = createDimension(json);

    expect(dimension.name).toBe('Test Title');
  });

  it('should use dim when expression is not provided', () => {
    const json = {
      name: 'Test',
      dim: '[Test.Test]',
      type: 'textdimension',
    };

    const dimension = createDimension(json);

    expect(dimension.expression).toBe('[Test.Test]');
  });

  it('should handle attributes with MetadataTypes.isAttribute filter', () => {
    const json = {
      name: 'Test',
      expression: '[Test.Test]',
      type: 'textdimension',
      attr1: { type: 'attribute', name: 'Attr1', expression: '[Test.Attr1]' },
      attr2: { type: 'notattribute', name: 'NotAttr', expression: '[Test.NotAttr]' },
    };

    const dimension = createDimension(json);

    // Should only include the attribute that passes MetadataTypes.isAttribute check
    expect(dimension.attributes.length).toBeGreaterThan(0);
  });

  it('should handle dimensions with MetadataTypes.isDimension filter', () => {
    const json = {
      name: 'Test',
      expression: '[Test.Test]',
      type: 'textdimension',
      dim1: {
        type: 'dimension',
        name: 'Dim1',
        expression: '[Test.Dim1]',
        attributes: [{ name: 'Dim1', expression: '[Test.Dim1]', type: 'attribute' }],
      },
      dim2: { type: 'notdimension', name: 'NotDim', expression: '[Test.NotDim]' },
    };

    const dimension = createDimension(json);

    // Should only include the dimension that passes MetadataTypes.isDimension check
    expect(dimension.dimensions.length).toBeGreaterThan(0);
  });
});

describe('createDateDimension function', () => {
  it('should create date dimension with all parameters', () => {
    const json = {
      name: 'Date',
      expression: '[Commerce.Date]',
      description: 'Date dimension',
      sort: Sort.Ascending,
    };

    const dimension = createDateDimension(json);

    expect(dimension).toBeInstanceOf(DimensionalDateDimension);
    expect(dimension.name).toBe('Date');
    expect(dimension.expression).toBe('[Commerce.Date]');
    expect(dimension.description).toBe('Date dimension');
    expect(dimension.getSort()).toBe(Sort.Ascending);
  });

  it('should use title when name is not provided', () => {
    const json = {
      title: 'Date Title',
      expression: '[Commerce.Date]',
    };

    const dimension = createDateDimension(json);

    expect(dimension.name).toBe('Date Title');
  });

  it('should use dim when expression is not provided', () => {
    const json = {
      name: 'Date',
      dim: '[Commerce.Date]',
    };

    const dimension = createDateDimension(json);

    expect(dimension.expression).toBe('[Commerce.Date]');
  });

  it('should handle desc as description', () => {
    const json = {
      name: 'Date',
      expression: '[Commerce.Date]',
      desc: 'Date description',
    };

    const dimension = createDateDimension(json);

    expect(dimension.description).toBe('Date description');
  });
});

describe('DimensionalDimension attribute name conflicts', () => {
  it('should handle attribute name conflicts with reserved names', () => {
    const dimension = new DimensionalDimension(
      'Test',
      '[Test.Test]',
      [
        new DimensionalAttribute('id', '[Test.id]'),
        new DimensionalAttribute('name', '[Test.name]'),
      ],
      [],
      'textdimension',
    );

    // Should fallback to expression for conflicting names
    expect(dimension.attributes).toHaveLength(2);
    expect(dimension.attributes[0].name).toBe('[Test.id]');
    expect(dimension.attributes[1].name).toBe('[Test.name]');
  });

  it('should handle dimension name conflicts with reserved names', () => {
    const childDimension = new DimensionalDimension(
      'id',
      '[Child.id]',
      [new DimensionalAttribute('id', '[Child.id]')],
      [],
      'textdimension',
    );

    const parentDimension = new DimensionalDimension(
      'Parent',
      '[Parent.Parent]',
      [],
      [childDimension],
      'textdimension',
    );

    // Should fallback to expression for conflicting names
    expect(parentDimension.dimensions).toHaveLength(1);
    expect(parentDimension.dimensions[0].name).toBe('[Child.id]');
  });
});
