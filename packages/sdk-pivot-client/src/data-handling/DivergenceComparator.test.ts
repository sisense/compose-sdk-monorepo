/* eslint-disable no-unused-expressions */
import { DivergenceComparator } from './DivergenceComparator.js';
import { treeNode } from '../tree-structure/utils/index.js';

describe('DivergenceComparator', () => {
  let sut: DivergenceComparator;
  const createTreeNode = treeNode.create.bind(treeNode);
  beforeEach(() => {
    sut = new DivergenceComparator();
  });

  describe('one level items', () => {
    it('should return divergence 1 when there are odd number of items', () => {
      const root = createTreeNode(treeNode.ROOT, [createTreeNode('single-item')]);
      sut = new DivergenceComparator(treeNode.getChildren(root), sut);
      expect(sut.getDivergence()).to.be.equal(1);
    });

    it('should return divergence 0 when there are even number of items', () => {
      const root = createTreeNode(treeNode.ROOT, [
        createTreeNode('multi-item'),
        createTreeNode('multi-item'),
      ]);

      sut = new DivergenceComparator(treeNode.getChildren(root), sut);
      expect(sut.getDivergence()).to.be.equal(0);
    });
  });

  describe('multiple level items', () => {
    it('should return divergence 1 when there are odd number of items', () => {
      const root = createTreeNode(treeNode.ROOT, [
        createTreeNode('merged-item-1', [
          createTreeNode('single-item-1-1'),
          createTreeNode('single-item-1-2'),
          createTreeNode('single-item-1-3'),
        ]),
      ]);

      sut = new DivergenceComparator(treeNode.getChildren(root), sut);
      expect(sut.getDivergence()).to.be.equal(1);
    });

    it('should return divergence 0 when there are even number of items', () => {
      const root = createTreeNode(treeNode.ROOT, [
        createTreeNode('merged-item-1', [
          createTreeNode('single-item-1-1'),
          createTreeNode('single-item-1-2'),
          createTreeNode('single-item-1-3'),
        ]),
        createTreeNode('merged-item-2', [
          createTreeNode('single-item-2-1'),
          createTreeNode('single-item-2-2'),
          createTreeNode('single-item-2-3'),
        ]),
      ]);

      sut = new DivergenceComparator(treeNode.getChildren(root), sut);
      expect(sut.getDivergence()).to.be.equal(0);
    });
  });
});
