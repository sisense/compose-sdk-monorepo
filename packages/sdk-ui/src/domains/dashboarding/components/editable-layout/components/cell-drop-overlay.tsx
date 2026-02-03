import { Z_INDEX_CELL_DROPZONE } from '@/domains/dashboarding/components/editable-layout/const';
import styled from '@/infra/styled';

import { DropType } from '../types';
import { DroppableZone } from './droppable-zone';

const Wrapper = styled.div`
  position: absolute;
  z-index: ${Z_INDEX_CELL_DROPZONE};
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

const ReplaceZone = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

const LeftZone = styled.div`
  position: absolute;
  width: 35%;
  height: 100%;
  top: 0;
  left: 0;
`;

const RightZone = styled.div`
  position: absolute;
  width: 35%;
  height: 100%;
  right: 0;
  top: 0;
`;

/**
 * Props for the CellDropOverlay component
 *
 * @internal
 */
type CellDropOverlayProps = {
  /**
   * The unique identifier for the cell drop overlay
   */
  id: string;
  /**
   * The ID of the widget related to the cell drop overlay
   */
  widgetId: string;
  /**
   * The index of the column the widget is in
   */
  columnIndex: number;
  /**
   * The index of the row the widget is in
   */
  rowIndex: number;
  /**
   * Whether to disable the side zones
   */
  disableSideZones?: boolean;
};

/**
 * Renders a cell drop overlay component that displays a replace zone and side zones for drag and drop operations.
 *
 * @internal
 */
export const CellDropOverlay = ({
  id,
  widgetId,
  columnIndex,
  rowIndex,
  disableSideZones = false,
}: CellDropOverlayProps) => {
  return (
    <Wrapper>
      <ReplaceZone>
        <DroppableZone
          id={`${DropType.SWAP}/${id}`}
          data={{
            type: DropType.SWAP,
            widgetId,
            columnIndex,
            rowIndex,
          }}
        />
      </ReplaceZone>
      {!disableSideZones && (
        <>
          <LeftZone>
            <DroppableZone
              id={`${DropType.PLACE_LEFT}/${id}`}
              data={{
                type: DropType.PLACE_LEFT,
                widgetId,
                columnIndex,
                rowIndex,
              }}
            />
          </LeftZone>
          <RightZone>
            <DroppableZone
              id={`${DropType.PLACE_RIGHT}/${id}`}
              data={{
                type: DropType.PLACE_RIGHT,
                widgetId,
                columnIndex,
                rowIndex,
              }}
            />
          </RightZone>
        </>
      )}
    </Wrapper>
  );
};
