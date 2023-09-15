/* eslint-disable max-lines */
import styled from '@emotion/styled';
import { CompleteThemeSettings } from '../../../../types.js';
import DatePicker, { type ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { applyOpacity } from '../../../../utils/color/index.js';

type DatePickerProps = ReactDatePickerProps & {
  theme: CompleteThemeSettings;
};

const DatePickerWithCustomCalendar = ({
  className: calendarClassName,
  ...rest
}: DatePickerProps) => {
  return <DatePicker {...rest} calendarClassName={calendarClassName} />;
};

export const StyledDatePicker = styled(DatePickerWithCustomCalendar)<DatePickerProps>`
  border: none;
  background-color: ${({ theme }) => theme.general.backgroundColor};
  display: flex;
  align-items: stretch;
  flex-direction: column;
  .react-datepicker__header {
    background-color: ${({ theme }) => theme.general.backgroundColor};
  }
  .react-datepicker__day-name {
    color: ${({ theme }) => theme.typography.secondaryTextColor};
  }
  .react-datepicker__day {
    width: 2rem;
    margin-left: 0;
    margin-right: 0;
    border-radius: 0;
    background-color: ${({ theme }) => theme.general.backgroundColor};
    color: ${({ theme }) => theme.typography.primaryTextColor};
    position: relative;
    z-index: 1;
  }

  // ----------------- Days in range styling ------------------------------
  .react-datepicker__day--in-range {
    &:before {
      content: '';
      position: absolute;
      display: block;
      background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.5)};
      width: calc(100% + 1px);
      top: -1px;
      height: calc(100% + 2px);
      z-index: -1;
      left: 0%;
    }
  }

  // Days in range that becomes out of selecting range when user is hovering dates in calendar
  .react-datepicker__month--selecting-range .react-datepicker__day--in-range {
    &:not(.react-datepicker__day--in-selecting-range) {
      background-color: ${({ theme }) => theme.general.backgroundColor};
      color: ${({ theme }) => theme.typography.secondaryTextColor};
      &:before {
        background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.15)};
      }
    }
  }

  // Selecting days out of existing range
  .react-datepicker__month--selecting-range .react-datepicker__day--in-selecting-range {
    &:not(.react-datepicker__day--in-range) {
      &:before {
        content: '';
        position: absolute;
        display: block;
        width: calc(100% + 1px);
        top: -1px;
        height: calc(100% + 2px);
        z-index: -1;
        left: 0%;
        background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.15)};
      }
      color: ${({ theme }) => theme.typography.secondaryTextColor};
    }
    &.react-datepicker__day--selecting-range-start {
      &:before {
        width: calc(50% + 1px);
        left: 50%;
      }
    }
    &.react-datepicker__day--selecting-range-end {
      &:before {
        width: calc(50% + 1px);
        right: 50%;
      }
    }
  }

  // ----------------- Range start and end styling ------------------------------
  .react-datepicker__month--selecting-range .react-datepicker__day--selecting-range-start,
  .react-datepicker__day--range-start,
  .react-datepicker__day--range-end,
  .react-datepicker__month--selecting-range .react-datepicker__day--selecting-range-end {
    &:after {
      content: '';
      position: absolute;
      display: block;
      background-color: ${({ theme }) => theme.general.brandColor};
      width: 100%;
      top: -1px;
      height: calc(100% + 2px);
      border-radius: 50%;
      z-index: -1;
    }

    &:before {
      content: '';
      position: absolute;
      display: block;
      background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.5)};
      width: calc(50% + 1px);
      top: -1px;
      height: calc(100% + 2px);
      z-index: -1;
    }

    &.react-datepicker__day--range-start {
      &:before {
        left: 50%;
      }
    }

    &.react-datepicker__day--range-end {
      &.before {
        right: 50%;
      }
    }
  }

  // Hide background highlighting if range-start and range-end is the same day
  .react-datepicker__month:not(.react-datepicker__month--selecting-range)
    .react-datepicker__day--range-start.react-datepicker__day--range-end {
    &:before {
      display: none;
    }
  }

  // Circle around 'hovered' day. Didn't use :hover to avoid flickering
  .react-datepicker__month--selecting-range {
    & .react-datepicker__day--selecting-range-start,
    .react-datepicker__day--selecting-range-end {
      &:after {
        border: 1px solid ${({ theme }) => theme.typography.primaryTextColor};
      }
    }
  }

  // Fix for a bug in react-datepicker with range-start day in each month highlighted as a data-range-start
  .react-datepicker__month:not(.react-datepicker__month--selecting-range) {
    & .react-datepicker__day--selecting-range-start:not(.react-datepicker__day--range-start),
    & .react-datepicker__day--selecting-range-end:not(.react-datepicker__day--range-end) {
      &.react-datepicker__day--in-range {
        &:not(.react-datepicker__day--range-start, .react-datepicker__day--range-end) {
          &:after {
            display: none;
          }
          &:before {
            width: calc(100% + 1px);
            left: 0%;
            right: 0%;
          }
        }
      }
    }
  }
  // ------------------------------------------------------

  // Fix cases when selected the same day for start and end:
  .react-datepicker__month--selecting-range
    .react-datepicker__day--range-start.react-datepicker__day--range-end {
    &.react-datepicker__day--selecting-range-end {
      &:before {
        background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.15)};
        left: 0;
        right: 50%;
      }
    }
    &.react-datepicker__day--selecting-range-start {
      &:before {
        background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.15)};
        left: 50%;
        right: 0;
      }
    }
  }

  .react-datepicker__day--disabled {
    color: ${({ theme }) => applyOpacity(theme.typography.primaryTextColor, 0.5)};
  }

  // Hower on day out of the possible selecting range
  // (trying to select 'start day' after selected 'end day' and vice versa)
  .react-datepicker__month--selecting-range .react-datepicker__day {
    &:not(.react-datepicker__day--in-range),
    &:not(.react-datepicker__day--in-selecting-range) {
      &:hover {
        &:after {
          content: '';
          position: absolute;
          display: block;
          background-color: ${({ theme }) => theme.general.brandColor};
          width: 100%;
          top: -1px;
          height: calc(100% + 2px);
          border-radius: 50%;
          z-index: -1;
          border: 1px solid ${({ theme }) => theme.typography.primaryTextColor};
        }
      }
    }
  }
`;
