import {
  Cell,
  Column,
  EMPTY_PIVOT_QUERY_RESULT_DATA,
  PivotGrid,
  PivotQueryResultData,
} from '@sisense/sdk-data';

import { InitPageData } from '../data-handling';
import { DataService } from '../data-handling/DataService.js';
import { SisenseDataLoadService } from '../data-load/index.js';
import { DataLoadServiceI, JaqlRequest, SocketI } from '../data-load/types.js';
import { TreeNode } from '../tree-structure';

export class PivotDataBuilder {
  /**
   * DataLoadServiceI instance
   */
  private dataLoadService?: DataLoadServiceI;

  /**
   * SocketI instance
   */
  private readonly socket: SocketI;

  /**
   * @param socket - socket instance
   */
  constructor(socket: SocketI) {
    this.socket = socket;
  }

  destroy() {}

  prepareRequest(jaql: JaqlRequest): Promise<JaqlRequest> {
    return Promise.resolve(jaql);
  }

  prepareLoadService(jaql?: JaqlRequest, useCache = false): DataLoadServiceI {
    if (this.dataLoadService && (useCache || this.dataLoadService.isFormattingChanges(jaql))) {
      return this.dataLoadService;
    }
    return new SisenseDataLoadService(this.socket);
  }

  prepareDataService(dataLoadService: DataLoadServiceI) {
    const dataService = new DataService(dataLoadService);
    return {
      loadData: (jaql?: JaqlRequest, pageSize?: number, isPaginated?: boolean) => {
        if (!dataService) {
          throw new Error('No DataService defined during "prepareDataService"');
        }

        return dataService.loadData(jaql, { pageSize, isPaginated });
      },
    };
  }

  async loadInitData(
    jaql: JaqlRequest,
    isPaginated = true,
    elementsPerPage = 100,
    useCache = false,
  ): Promise<PivotQueryResultData> {
    const pageSize = isPaginated ? elementsPerPage : undefined;

    try {
      const jaqlInternal = await this.prepareRequest(jaql);

      // Currently, each jaql need a separate dataLoadService instance
      // In other words, each dataLoadService is associated with a jaql
      this.dataLoadService = this.prepareLoadService(jaqlInternal, useCache);
      const { loadData } = this.prepareDataService(this.dataLoadService);

      const { rowsTreeService, columnsTreeService, cornerTreeService, isLastPage } = await loadData(
        useCache ? undefined : jaqlInternal,
        pageSize,
        isPaginated,
      );

      return this.transformTreeStructuresToResultData({
        rowsTreeService,
        columnsTreeService,
        cornerTreeService,
        isLastPage,
      });
    } catch (err) {
      console.error('Error during loading initial page"', err);
    }

    return EMPTY_PIVOT_QUERY_RESULT_DATA;
  }

  private buildColumnsHelper(
    columnType: string,
    columns: Column[],
    prefix: string,
    treeNode: TreeNode,
  ): void {
    const columnName = `${prefix}${prefix === '' ? '' : ' | '}${treeNode.value?.toString()}`;
    if (treeNode.children) {
      treeNode.children.forEach((child) => {
        this.buildColumnsHelper(columnType, columns, columnName, child);
      });
    } else {
      columns.push({ name: columnName, type: columnType });
    }
  }

  /**
   * Transforms Pivot Grid to Columns of Table structure
   *
   * @param columnType - type of column
   * @param grid - pivot grid
   * @returns An array of columns
   */
  private transformGridToColumns(
    columnType: string,
    grid?: Array<Array<TreeNode | string>>,
  ): Column[] {
    if (!grid || grid.length === 0) {
      return [];
    }

    const columns: Column[] = [];
    grid?.[0].forEach((cell) => {
      if (typeof cell === 'string') return;

      this.buildColumnsHelper(columnType, columns, '', cell);
    });

    return columns || [];
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity,max-lines-per-function
  private transformTreeStructuresToResultData(pivotTreeData: InitPageData): PivotQueryResultData {
    const { rowsTreeService, columnsTreeService, cornerTreeService } = pivotTreeData;

    if (!rowsTreeService && !columnsTreeService && !cornerTreeService) {
      return EMPTY_PIVOT_QUERY_RESULT_DATA;
    }

    const cornerGrid: PivotGrid = cornerTreeService ? cornerTreeService.getGrid() : [];
    const columnsGrid: PivotGrid = columnsTreeService ? columnsTreeService.getGrid() : [];
    const rowsGrid: PivotGrid = rowsTreeService ? rowsTreeService.getGrid() : [];

    const cornerColumns = this.transformGridToColumns('string', cornerGrid);

    const columnsColumns = this.transformGridToColumns('number', columnsGrid);
    const columns: Column[] = [...cornerColumns, ...columnsColumns];

    const FILL_IN_THE_BLANKS = true;

    const valuesGrid: PivotGrid = rowsTreeService
      ? rowsTreeService.extractData(columnsTreeService)
      : [];

    const rowCount = rowsGrid.length;
    const columnCount = columns.length;

    const rows: Cell[][] = [];

    let curRowIndex = 0;
    let curColIndex = 0;

    Array.from(Array(rowCount)).map((c, rowIndex) => {
      const row: Cell[] = [];

      Array.from(Array(columnCount)).map((c, colIndex) => {
        let dataNode: string | TreeNode;
        if (colIndex < cornerColumns.length) {
          curRowIndex = rowIndex;
          curColIndex = colIndex;
          try {
            dataNode = rowsGrid[curRowIndex][curColIndex];
          } catch (err) {
            throw new Error(`Can't find data item for ${curRowIndex}-${curColIndex}`);
          }
        } else {
          curRowIndex = rowIndex;
          curColIndex = colIndex - cornerColumns.length;
          try {
            dataNode = valuesGrid[curRowIndex][curColIndex];
          } catch (err) {
            throw new Error(`Can't find data item for ${curRowIndex}-${curColIndex}`);
          }
        }

        let value: string;
        if (typeof dataNode === 'string') {
          if (FILL_IN_THE_BLANKS) {
            const indexes = dataNode.split('-');
            // eslint-disable-next-line max-lines
            if (indexes.length === 2) {
              const parentRowIndex = Number(indexes[0]);
              const parentColIndex = Number(indexes[1]);
              dataNode = rowsGrid[parentRowIndex][parentColIndex] as TreeNode;

              value = dataNode.value?.toString() || '';
            } else {
              // eslint-disable-next-line max-lines
              value = '';
            }
          } else {
            value = '';
          }
          // eslint-disable-next-line max-lines
        } else {
          value = dataNode.value?.toString() || '';
        }

        row.push({ data: value, text: value });
      });

      rows.push(row);
    });

    return {
      table: {
        columns: columns,
        rows: rows,
      },
      grids: {
        corner: cornerGrid,
        rows: rowsGrid,
        columns: columnsGrid,
        values: valuesGrid,
      },
    };
  }
}
