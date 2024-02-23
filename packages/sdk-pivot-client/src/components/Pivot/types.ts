import { TreeServiceI } from '../../tree-structure';
import { Metadata } from '../../data-handling/utils/plugins/types.js';

export interface PivotI {
  initialize(
    newRowsTreeService?: TreeServiceI,
    newColumnsTreeService?: TreeServiceI,
    newCornerTreeService?: TreeServiceI,
    options?: { isLastPage?: boolean; cellsMetadata?: Map<string, Metadata> },
  ): void;
  addMore(newRowsTreeService?: TreeServiceI, isLastPage?: boolean): void;
}
