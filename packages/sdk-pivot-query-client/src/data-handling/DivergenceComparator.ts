import { treeNode } from '../tree-structure/utils/index.js';
import { PivotTreeNode } from './types.js';

export class DivergenceComparator {
  divergence = 0;

  constructor(items: Array<PivotTreeNode> = [], prevComparator?: DivergenceComparator) {
    const prevDivergence = prevComparator ? prevComparator.getDivergence() : 0;
    const itemsLastLevel = treeNode.getLastLevelNodes(items);
    this.divergence = (prevDivergence + itemsLastLevel.length) % 2;
    for (let i = 0; i < itemsLastLevel.length; i += 1) {
      itemsLastLevel[i].indexDivergence = (i + prevDivergence) % 2;
    }
  }

  getDivergence() {
    return this.divergence;
  }
}

export default DivergenceComparator;
