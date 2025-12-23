import { Metadata, TreeServiceI } from '@sisense/sdk-pivot-query-client';

export interface PivotI {
  initialize(
    newRowsTreeService?: TreeServiceI,
    newColumnsTreeService?: TreeServiceI,
    newCornerTreeService?: TreeServiceI,
    options?: { isLastPage?: boolean; cellsMetadata?: Map<string, Metadata> },
  ): void;
  addMore(newRowsTreeService?: TreeServiceI, isLastPage?: boolean): void;
}
