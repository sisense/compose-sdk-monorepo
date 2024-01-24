import { AbstractTreeService } from './AbstractTreeService.js';

/**
 * TreeService converts tree structure into grid structure, also it keeps inner grid structure
 * to update cache system (via setCellCache) and receive merged cells (via updateMainCellMargins)
 */
export class TreeService extends AbstractTreeService {}

export default TreeService;
