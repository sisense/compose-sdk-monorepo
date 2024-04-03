import React from 'react';

import { Popover, AlignPoints, type PopoverProps } from '../../shared-ui-components/Popover';

type Props = {
  onRequestClose: PopoverProps['onRequestClose'];
  onClick: React.MouseEventHandler<HTMLSpanElement>;
  onKeyPress: React.KeyboardEventHandler<HTMLSpanElement>;
  sortingPopup: JSX.Element | null;
  className: string;
  getTooltipContainer?: () => HTMLElement;
};

export const SortingSettingsIcon = (props: Props) => {
  const { onRequestClose, onClick, onKeyPress, sortingPopup, className, getTooltipContainer } =
    props;

  return (
    <Popover
      bubbleMouseEvents
      level={0}
      mask
      placement="bottom"
      onVisibleChange={(visible?: boolean) => {}}
      trigger={['click']}
      overlay={() => sortingPopup as React.ReactElement}
      onRequestClose={onRequestClose}
      getTooltipContainer={getTooltipContainer}
      visible={sortingPopup !== null}
      align={{
        points: [AlignPoints.topLeft, AlignPoints.bottomRight],
      }}
    >
      <span
        role="button"
        aria-label="Show sorting settings pop-up"
        tabIndex={0}
        onClick={onClick}
        onKeyPress={onKeyPress}
        className={className}
      />
    </Popover>
  );
};
