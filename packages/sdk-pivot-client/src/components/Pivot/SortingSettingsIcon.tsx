import React from 'react';

// const {
//     Popover,
//     AlignPoints,
// } = require('@sisense/shared-ui-components'); // eslint-disable-line @typescript-eslint/no-var-requires

type Props = {
  // onRequestClose: (typeof Popover)['onRequestClose'],
  onClick: React.MouseEventHandler<HTMLSpanElement>;
  onKeyPress: React.KeyboardEventHandler<HTMLSpanElement>;
  sortingPopup: JSX.Element | null;
  className: string;
  getTooltipContainer?: () => HTMLElement;
};

export const SortingSettingsIcon = (props: Props) => {
  const {
    // onRequestClose,
    onClick,
    onKeyPress,
    sortingPopup,
    className,
    getTooltipContainer,
  } = props;

  return (
    <span></span>
    // <Popover
    //     bubbleMouseEvents
    //     level={0}
    //     mask
    //     placement="bottom"
    //     onVisibleChange={() => {}}
    //     trigger="click"
    //     overlay={() => sortingPopup}
    //     onRequestClose={onRequestClose}
    //     getTooltipContainer={getTooltipContainer}
    //     visible={sortingPopup !== null}
    //     align={{
    //         points: [AlignPoints.topLeft, AlignPoints.bottomRight],
    //     }}
    // >
    //     <span
    //         role="button"
    //         aria-label="Show sorting settings pop-up"
    //         tabIndex={0}
    //         onClick={onClick}
    //         onKeyPress={onKeyPress}
    //         className={className}
    //     />
    // </Popover>
  );
};
