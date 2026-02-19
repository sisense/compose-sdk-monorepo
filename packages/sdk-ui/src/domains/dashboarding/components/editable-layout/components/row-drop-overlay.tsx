import { DroppableZone } from '@/domains/dashboarding/components/editable-layout/components/droppable-zone';
import { Z_INDEX_ROW_DROPZONE } from '@/domains/dashboarding/components/editable-layout/const';
import styled from '@/infra/styled';

import { DropType } from '../types';

const Wrapper = styled.div<{ isLastRow?: boolean }>`
  height: ${({ isLastRow }) => (isLastRow ? '100%' : 0)};
  min-height: ${({ isLastRow }) => (isLastRow ? '300px' : 0)};
  width: 100%;
  position: relative;
  overflow: visible;
  z-index: ${Z_INDEX_ROW_DROPZONE};
`;

const Zone = styled.div<{ isLastRow?: boolean }>`
  height: calc(100% + 20px);
  width: 100%;
  position: absolute;
  top: ${({ isLastRow }) => (isLastRow ? 0 : -10)}px;
  left: 0;
`;

/**
 * Props for the RowDropOverlay component
 *
 * @internal
 */
type RowDropOverlayProps = {
  /**
   * The unique identifier
   */
  id: string;
  /**
   * Referring to the column index
   */
  columnIndex: number;
  /**
   * Referring to the row index
   */
  rowIndex?: number;
  /**
   * Whether is referring to the last row (different styling)
   */
  isLastRow?: boolean;
};

/**
 * Renders a row drop overlay component that allows for drop operations.
 *
 * @internal
 */
export const RowDropOverlay = ({ id, columnIndex, rowIndex, isLastRow }: RowDropOverlayProps) => {
  return (
    <Wrapper isLastRow={isLastRow}>
      <Zone isLastRow={isLastRow}>
        <DroppableZone
          id={`${DropType.NEW_ROW}/${id}`}
          data={{
            type: DropType.NEW_ROW,
            columnIndex,
            rowIndex,
          }}
        />
      </Zone>
    </Wrapper>
  );
};
