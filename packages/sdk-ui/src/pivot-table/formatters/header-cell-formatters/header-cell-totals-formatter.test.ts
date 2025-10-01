import { resources } from '@/translation/resources';
import get from 'lodash-es/get';
import { TFunction } from '@ethings-os/sdk-common/dist/i18n/i18next';
import { PivotTableDataOptions } from '@/chart-data-options/types';
import { createHeaderCellTotalsFormatter } from './header-cell-totals-formatter';
import { UserType, PanelType } from '@ethings-os/sdk-pivot-client';

const translate = ((path: string, replacements?: Record<string, string>) => {
  let translation = get(resources.en, path);

  if (replacements) {
    Object.keys(replacements).forEach((key) => {
      translation = translation.replace(`{{${key}}}`, replacements[key]);
    });
  }

  return translation;
}) as TFunction;

describe('createHeaderCellTotalsFormatter', () => {
  it('should translate subtotal for header cell', () => {
    const dataOptions = {} as PivotTableDataOptions;
    const headerCellTotalsFormatter = createHeaderCellTotalsFormatter(dataOptions, translate);

    const cell = {
      userType: UserType.SUB_TOTAL,
      content: 'Test',
    };

    headerCellTotalsFormatter(cell);

    expect(cell.content).toBe('Test Total');
  });

  it('should translate grand total for column header cell', () => {
    const dataOptions = {} as PivotTableDataOptions;
    const headerCellTotalsFormatter = createHeaderCellTotalsFormatter(dataOptions, translate);

    const cell = {
      userType: UserType.GRAND_TOTAL,
      content: 'Test',
      metadataType: PanelType.COLUMNS,
      parent: {},
    };

    headerCellTotalsFormatter(cell);

    expect(cell.content).toBe('Grand Total');
  });

  it('should not translate grand total for column header cell without parent', () => {
    const dataOptions = {} as PivotTableDataOptions;
    const headerCellTotalsFormatter = createHeaderCellTotalsFormatter(dataOptions, translate);

    const cell = {
      userType: UserType.GRAND_TOTAL,
      content: 'Test',
      metadataType: PanelType.COLUMNS,
    };

    headerCellTotalsFormatter(cell);

    expect(cell.content).toBe('Test');
  });

  it('should translate grand total for row header cell', () => {
    const dataOptions = {} as PivotTableDataOptions;
    const headerCellTotalsFormatter = createHeaderCellTotalsFormatter(dataOptions, translate);

    const cell = {
      userType: UserType.GRAND_TOTAL,
      content: 'Test',
      metadataType: PanelType.ROWS,
    };

    headerCellTotalsFormatter(cell);

    expect(cell.content).toBe('Grand Total');
  });

  it('should use measure name in grand total for row header cell when no column and single measure provided', () => {
    const dataOptions = {
      values: [{ name: 'Measure Total' }],
    } as PivotTableDataOptions;
    const headerCellTotalsFormatter = createHeaderCellTotalsFormatter(dataOptions, translate);

    const cell = {
      userType: UserType.GRAND_TOTAL,
      content: 'Test',
      metadataType: PanelType.ROWS,
    };

    headerCellTotalsFormatter(cell);

    expect(cell.content).toBe('Measure Total');
  });
});
