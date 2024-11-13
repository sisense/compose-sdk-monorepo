import { generateCode } from './generate-code.js';

const dataForTemplate: Record<string, string> = {
  componentString: 'Chart',
  extraImportsString: `import { filterFactory, measureFactory } from '@sisense/sdk-data';`,
  dataSourceString: 'data-source',
  titleString: 'My Chart',
  chartTypeString: 'bar',
  dataOptionsString:
    '{ category: [DM.Commerce.Date.Years], value: [measureFactory.sum(DM.Commerce.Revenue)] }',
  filtersString: '[filterFactory.greaterThan(DM.Commerce.Revenue, 0)]',
};

describe('generateCode', () => {
  it('should generate code from template for React', () => {
    const code = generateCode('chartWidgetTmpl', dataForTemplate);

    expect(code).toMatchSnapshot();
  });

  it('should generate code from template for Vue', () => {
    const code = generateCode('chartWidgetTmpl', dataForTemplate, 'vue');

    expect(code).toMatchSnapshot();
  });

  it('should generate code from template for Angular', () => {
    const code = generateCode('chartWidgetTmpl', dataForTemplate, 'angular');

    expect(code).toMatchSnapshot();
  });
});
