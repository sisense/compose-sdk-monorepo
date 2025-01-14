import React, { useRef, useState } from 'react';

import { Checkbox } from '@sisense/sdk-shared-ui/Checkbox';
import { Tooltip } from '@sisense/sdk-shared-ui/Tooltip';

import { DirectionSelector } from './DirectionSelector/index.js';
import { ListOfSortingDirections, SortingDirection } from '../../../data-handling/constants.js';

type Props = {
  title: string;
  fieldTypes: Array<{ caption: string; id: 'asc' } | { caption: string; id: 'desc' }>;
  selected: boolean;
  direction: ListOfSortingDirections | null;
  onSettingsItemStateChange: (arg: {
    title: string;
    selected: boolean;
    direction: 'asc' | 'desc' | null;
  }) => void;
  subtotalsCaption: null | JSX.Element;
};

export const SettingsItemComponent = (props: Props) => {
  const { title, fieldTypes, selected, onSettingsItemStateChange, subtotalsCaption } = props;

  const [isCheckboxSelected, changeCheckboxState] = useState<boolean>(selected);

  const directionState = props.direction || SortingDirection.ASC;

  const handleCheckboxChange = (): void => {
    changeCheckboxState(!isCheckboxSelected);

    onSettingsItemStateChange({
      title,
      selected: !isCheckboxSelected,
      direction: directionState,
    });
  };

  const handleDirectionChange = (userSelectedDirection: ListOfSortingDirections): void => {
    onSettingsItemStateChange({
      title,
      selected: isCheckboxSelected,
      direction: userSelectedDirection,
    });
  };

  const orderSelector =
    isCheckboxSelected === false ? null : (
      <DirectionSelector
        direction={directionState}
        items={fieldTypes}
        onChange={handleDirectionChange}
      />
    );

  const textWrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [tooltipVisible, setTooltipVisibility] = useState(false);

  const handleMouseEnterText = (): void => {
    const wrapperElement = textWrapperRef.current;
    const spanElement = textRef.current;

    if (wrapperElement === null || spanElement === null) {
      return;
    }
    if (wrapperElement.offsetWidth < spanElement.offsetWidth) {
      setTooltipVisibility(true);
    }
  };
  const handleMouseLeaveText = (): void => {
    const wrapperElement = textWrapperRef.current;
    const spanElement = textRef.current;

    if (wrapperElement === null || spanElement === null) {
      return;
    }
    if (wrapperElement.offsetWidth < spanElement.offsetWidth) {
      setTooltipVisibility(false);
    }
  };

  const handleClickOnItem = (): void => {
    changeCheckboxState(!isCheckboxSelected);

    onSettingsItemStateChange({
      title,
      selected: !isCheckboxSelected,
      direction: directionState,
    });
  };

  const [isMouseOverLabel, setMouseOverLabelState] = useState(false);
  const handleMouseEnterLabel = (): void => setMouseOverLabelState(true);
  const handleMouseLeaveLabel = (): void => setMouseOverLabelState(false);
  // const nativeCheckboxInputStyle = isMouseOverLabel ? 'wrapper-of-input-highlighted' : '';

  return (
    <div className="settings-item" key={title}>
      <div className="checkbox-input">
        <Checkbox
          checked={isCheckboxSelected}
          onChange={handleCheckboxChange}
          // inputCheckboxClassName={nativeCheckboxInputStyle}
        />
        <div
          className="checkbox-input__label"
          tabIndex={0}
          role="button"
          aria-pressed="false"
          onClick={handleClickOnItem}
          onKeyUp={handleClickOnItem}
          onMouseEnter={handleMouseEnterLabel}
          onMouseLeave={handleMouseLeaveLabel}
        >
          <Tooltip placement="top" title={title}>
            <div
              ref={textWrapperRef}
              className="checkbox-input__text-wrapper"
              onMouseEnter={handleMouseEnterText}
              onMouseLeave={handleMouseLeaveText}
            >
              <span ref={textRef}>{title}</span>
            </div>
          </Tooltip>
          {subtotalsCaption}
        </div>
      </div>

      {orderSelector}
    </div>
  );
};
