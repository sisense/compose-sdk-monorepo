import { ReactNode } from 'react';

import { WidgetsPanelRow } from '@/domains/dashboarding/dashboard-model';
import { checkForAutoHeight } from '@/domains/dashboarding/utils';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import styled from '@/infra/styled';

import { WIDGET_HEADER_HEIGHT } from '../const';
import { getRowHeight, getRowMaxHeight, getRowMinHeight } from '../helpers';
import { ResizableRow } from './resizable-row';

const SimpleRow = styled.div`
  border-bottom: 4px solid #f2f2f2;
`;

export interface EditableLayoutRowProps {
  children: (isAutoHeight: boolean) => ReactNode;
  id: string;
  row: WidgetsPanelRow;
  widgets: WidgetProps[];
  onHeightChange: (height: number) => void;
}

export const EditableLayoutRow = ({
  children,
  id,
  row,
  widgets,
  onHeightChange,
}: EditableLayoutRowProps) => {
  const rowWidgets = widgets.filter((w) => row.cells.some((c) => c.widgetId === w.id));

  return checkForAutoHeight(rowWidgets) ? (
    <SimpleRow>{children(true)}</SimpleRow>
  ) : (
    <ResizableRow
      id={id}
      height={getRowHeight(row, widgets) + WIDGET_HEADER_HEIGHT}
      minHeight={getRowMinHeight(row)}
      maxHeight={getRowMaxHeight(row)}
      onHeightChange={onHeightChange}
    >
      {children(false)}
    </ResizableRow>
  );
};
