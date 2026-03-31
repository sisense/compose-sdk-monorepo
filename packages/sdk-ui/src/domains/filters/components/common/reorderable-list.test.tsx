/** @vitest-environment jsdom */
import { screen } from '@testing-library/react';

import { setup } from '@/__test-helpers__';

import { ReorderableList } from './reorderable-list.js';

const minTouchTargetStyle = { minWidth: '24px', minHeight: '24px' };

describe('ReorderableList', () => {
  describe('A11Y-03 minimum touch target size', () => {
    it('applies 24×24 min dimensions to the drag handle wrapper', () => {
      setup(
        <ReorderableList
          items={['item-1']}
          onReorder={() => {}}
          renderItem={({ withDragHandle }) =>
            withDragHandle(<span data-testid="handle-content">Title</span>)
          }
        />,
      );

      const content = screen.getByTestId('handle-content');
      const handleWrapper = content.parentElement!;
      expect(handleWrapper).toHaveStyle(minTouchTargetStyle);
    });
  });
});
