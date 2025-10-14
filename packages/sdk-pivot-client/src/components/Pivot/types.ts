import { Metadata } from '../../data-handling/utils/plugins/types.js';
import { TreeServiceI } from '../../tree-structure';

export interface PivotI {
  initialize(
    newRowsTreeService?: TreeServiceI,
    newColumnsTreeService?: TreeServiceI,
    newCornerTreeService?: TreeServiceI,
    options?: { isLastPage?: boolean; cellsMetadata?: Map<string, Metadata> },
  ): void;
  addMore(newRowsTreeService?: TreeServiceI, isLastPage?: boolean): void;
}
