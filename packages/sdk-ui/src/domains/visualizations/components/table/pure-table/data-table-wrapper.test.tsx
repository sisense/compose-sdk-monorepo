/** @vitest-environment jsdom */
import React from 'react';

import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TableDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';
import { CompleteThemeSettingsInternal } from '@/types';

import { DataTableWrapper } from './data-table-wrapper.js';
import { calcColumnWidths } from './helpers/calc-column-widths.js';

type CapturedTableProps = {
  onColumnResizeEndCallback?: (newWidth: number, columnKey: string) => void;
};

type FdtCapture = {
  tableProps: CapturedTableProps | undefined;
  columns: Array<Record<string, unknown>>;
};

const fdtCapture: FdtCapture = {
  tableProps: undefined,
  columns: [],
};

const resetFdtCapture = () => {
  fdtCapture.columns.length = 0;
  fdtCapture.tableProps = undefined;
};

vi.mock('fixed-data-table-2', () => ({
  Cell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Column: (props: Record<string, unknown>) => {
    fdtCapture.columns.push(props);
    return null;
  },
  Table: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => {
    fdtCapture.tableProps = props as CapturedTableProps;
    return <div data-testid="fdt-table">{children}</div>;
  },
}));

const themeSettings = getDefaultThemeSettings() as CompleteThemeSettingsInternal;

const dataTable = {
  columns: [
    { name: 'AgeRange', type: 'string', index: 0, direction: 0 },
    { name: 'Cost', type: 'number', index: 1, direction: 0 },
  ],
  rows: [
    [{ displayValue: '0-18' }, { displayValue: '1000' }],
    [{ displayValue: '19-28' }, { displayValue: '19.123' }],
  ],
};

const dataOptions: TableDataOptionsInternal = {
  columns: [
    { column: { name: 'AgeRange', type: 'string' } },
    { column: { name: 'Cost', type: 'number' } },
  ],
};

describe('DataTableWrapper column resize', () => {
  beforeEach(() => {
    resetFdtCapture();
  });

  it('passes controlled column widths to Column when widths are supplied', () => {
    render(
      <DataTableWrapper
        dataTable={dataTable}
        dataOptions={dataOptions}
        height={400}
        width={600}
        themeSettings={themeSettings}
        onSortUpdate={vi.fn()}
        customStyles={{
          columns: {
            resizable: true,
            widths: [180, 220],
          },
        }}
      />,
    );

    expect(fdtCapture.columns[0]?.width).toBe(180);
    expect(fdtCapture.columns[1]?.width).toBe(220);
  });

  it('enables column resize by default without an explicit resizable flag', () => {
    render(
      <DataTableWrapper
        dataTable={dataTable}
        dataOptions={dataOptions}
        height={400}
        width={600}
        themeSettings={themeSettings}
        onSortUpdate={vi.fn()}
      />,
    );

    expect(fdtCapture.columns[0]?.isResizable).toBe(true);
    expect(fdtCapture.columns[0]?.minWidth).toBe(120);
    expect(fdtCapture.columns[0]?.maxWidth).toBe(350);
    expect(fdtCapture.tableProps?.onColumnResizeEndCallback).toBeTypeOf('function');
    expect(screen.getByTestId('data-table-wrapper')).toHaveStyle({
      '--csdk-table-column-resizer-color': themeSettings.general.brandColor,
    });
  });

  it('passes custom minWidth and maxWidth to Column', () => {
    render(
      <DataTableWrapper
        dataTable={dataTable}
        dataOptions={dataOptions}
        height={400}
        width={600}
        themeSettings={themeSettings}
        onSortUpdate={vi.fn()}
        customStyles={{
          columns: {
            minWidth: 80,
            maxWidth: 500,
          },
        }}
      />,
    );

    expect(fdtCapture.columns[0]?.minWidth).toBe(80);
    expect(fdtCapture.columns[0]?.maxWidth).toBe(500);
  });

  it('disables column resize when resizable is false', () => {
    render(
      <DataTableWrapper
        dataTable={dataTable}
        dataOptions={dataOptions}
        height={400}
        width={600}
        themeSettings={themeSettings}
        onSortUpdate={vi.fn()}
        customStyles={{
          columns: {
            resizable: false,
          },
        }}
      />,
    );

    expect(fdtCapture.columns[0]?.isResizable).toBe(false);
    expect(fdtCapture.tableProps?.onColumnResizeEndCallback).toBeUndefined();
  });

  it('wires resize callback and emits the full widths array on resize end', () => {
    const onColumnsResize = vi.fn();

    render(
      <DataTableWrapper
        dataTable={dataTable}
        dataOptions={dataOptions}
        height={400}
        width={600}
        themeSettings={themeSettings}
        onSortUpdate={vi.fn()}
        customStyles={{
          columns: {
            resizable: true,
            onColumnsResize,
          },
        }}
      />,
    );

    expect(fdtCapture.tableProps?.onColumnResizeEndCallback).toBeTypeOf('function');
    expect(fdtCapture.columns[0]?.isResizable).toBe(true);
    expect(fdtCapture.columns[0]?.minWidth).toBe(120);
    expect(fdtCapture.columns[0]?.maxWidth).toBe(350);

    const onColumnResizeEndCallback = fdtCapture.tableProps?.onColumnResizeEndCallback;
    if (!onColumnResizeEndCallback) {
      throw new Error('expected onColumnResizeEndCallback to be defined');
    }

    // Column '0' is the resized column ('AgeRange'); column '1' ('Cost') is expected to keep
    // its originally-computed width, matching what DataTableWrapper passes to calcColumnWidths.
    const [, expectedCostWidth] = calcColumnWidths(
      dataTable,
      true,
      [{ isHtml: false }, { isHtml: false }],
      {
        fontFamily: themeSettings.typography?.fontFamily,
      },
    );

    act(() => {
      onColumnResizeEndCallback(200, '0');
    });

    expect(onColumnsResize).toHaveBeenCalledWith([200, expectedCostWidth]);
  });
});
