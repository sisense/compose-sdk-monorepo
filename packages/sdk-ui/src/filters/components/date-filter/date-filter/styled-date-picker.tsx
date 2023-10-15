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
  padding-bottom: 10px;
  .react-datepicker__header {
    background-color: ${({ theme }) => theme.general.backgroundColor};
    border-bottom: none;
    padding-bottom: 0;
  }
  .react-datepicker__day-name {
    color: ${({ theme }) => theme.typography.primaryTextColor};
    font-weight: 700;
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

  .react-datepicker__day {
    &:before {
      content: '';
      position: absolute;
      display: block;
      background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.5)};
      width: calc(100%);
      top: -1px;
      height: calc(100% + 2px);
      z-index: -1;
      left: 0%;
      visibility: hidden;
    }

    &:first-child:before {
      border-radius: 100% 0 0 100%;
    }

    &:last-child:before {
      border-radius: 0 100% 100% 0;
    }

    &:after {
      content: '';
      position: absolute;
      display: block;
      background-color: ${({ theme }) => theme.general.brandColor};
      width: 92%;
      padding-top: 92%;
      top: 50%;
      right: 4%;
      transform: translateY(-50%);
      border-radius: 100%;
      z-index: -1;
      visibility: hidden;
    }
  }

  // ----------------- Days in range styling ------------------------------
  .react-datepicker__day--in-range:before {
    visibility: visible;
  }

  .react-datepicker__day--in-range.react-datepicker__day--selecting-range-start {
    &:before {
      border-radius: 100% 0 0 100%;
    }
  }
  .react-datepicker__day--in-range.react-datepicker__day--selecting-range-end {
    &:before {
      border-radius: 0 100% 100% 0;
    }
  }
  .react-datepicker__day--in-range.react-datepicker__day--selecting-range-start.react-datepicker__day--selecting-range-end {
    border-radius: 100%;
  }

  // Days in range that becomes out of selecting range when user is hovering dates in calendar
  .react-datepicker__month--selecting-range .react-datepicker__day--in-range {
    &:not(.react-datepicker__day--in-selecting-range) {
      background-color: ${({ theme }) => theme.general.backgroundColor};
      color: ${({ theme }) => theme.typography.secondaryTextColor};
      &:before {
        visibility: visible;
        background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.15)};
      }
    }
  }

  // Selecting days out of existing range
  .react-datepicker__month--selecting-range .react-datepicker__day--in-selecting-range {
    &:not(.react-datepicker__day--in-range) {
      &:before {
        visibility: visible;
        background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.15)};
      }
      color: ${({ theme }) => theme.typography.secondaryTextColor};
    }
  }

  // ----------------- Range start and end styling ------------------------------
  .react-datepicker__month--selecting-range .react-datepicker__day--selecting-range-start,
  .react-datepicker__day--range-start,
  .react-datepicker__day--range-end,
  .react-datepicker__month--selecting-range .react-datepicker__day--selecting-range-end {
    &:after {
      visibility: visible;
    }

    &:before {
      visibility: visible;
      background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.5)};
    }

    &.react-datepicker__day--range-start {
      &:before {
        width: 90%;
        left: 10%;
        border-radius: 100% 0 0 100%;
      }
    }

    &.react-datepicker__day--range-end {
      &:before {
        width: 90%;
        border-radius: 0 100% 100% 0;
      }
    }
  }

  // Hide background highlighting if range-start and range-end is the same day
  .react-datepicker__month:not(.react-datepicker__month--selecting-range)
    .react-datepicker__day--range-start.react-datepicker__day--range-end {
    &:before {
      visibility: hidden;
    }
  }

  // Circle around 'hovered' day. Didn't use :hover to avoid flickering
  .react-datepicker__month--selecting-range {
    & .react-datepicker__day--selecting-range-start,
    .react-datepicker__day--selecting-range-end {
      &:after {
        visibility: visible;
        opacity: 0.5;
      }
    }
  }

  // Fix for a bug in react-datepicker with rangeeact-datepicker__day--selecting-range-start-start day in each month highlighted as a data-range-start
  .react-datepicker__month:not(.react-datepicker__month--selecting-range) {
    & .react-datepicker__day--selecting-range-start:not(.react-datepicker__day--range-start),
    & .react-datepicker__day--selecting-range-end:not(.react-datepicker__day--range-end) {
      &.react-datepicker__day--in-range {
        &:not(.react-datepicker__day--range-start, .react-datepicker__day--range-end) {
          &:after {
            visibility: hidden;
          }
          &:before {
            visibility: visible;
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
        visibility: visible;
      }
    }
    &.react-datepicker__day--selecting-range-start {
      &:before {
        background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.15)};
        visibility: visible;
      }
    }
  }

  .react-datepicker__day--disabled {
    color: ${({ theme }) => applyOpacity(theme.typography.primaryTextColor, 0.5)};
  }

  // Hover on day out of the possible selecting range
  // (trying to select 'start day' after selected 'end day' and vice versa)
  .react-datepicker__month--selecting-range .react-datepicker__day {
    &:not(.react-datepicker__day--in-range),
    &:not(.react-datepicker__day--in-selecting-range) {
      &:hover {
        &:after {
          visibility: visible;
          background-color: ${({ theme }) => theme.general.brandColor};
        }
      }
    }
  }
`;
