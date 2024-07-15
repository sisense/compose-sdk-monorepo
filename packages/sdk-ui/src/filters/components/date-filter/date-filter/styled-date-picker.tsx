import styled from '@emotion/styled';
import DatePicker, { type DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { applyOpacity, getSlightlyDifferentColor } from '../../../../utils/color/index.js';
import { Themable } from '@/theme-provider/types.js';

type ThemableDatePickerProps = DatePickerProps & Themable;

const DatePickerWithCustomCalendar = ({
  className: calendarClassName,
  ...rest
}: ThemableDatePickerProps) => {
  return <DatePicker {...rest} calendarClassName={calendarClassName} />;
};

export const StyledDatePicker = styled(DatePickerWithCustomCalendar)`
  border: none;
  background-color: ${({ theme }) => theme.general.backgroundColor};
  display: flex;
  align-items: stretch;
  flex-direction: column;
  padding-bottom: 5px;
  .react-datepicker__header {
    background-color: ${({ theme }) => theme.general.backgroundColor};
    border-bottom: none;
    padding-bottom: 0;
    & > div > button {
      height: 34px;
      width: 34px;
      &:hover {
        background-color: ${({ theme }) =>
          getSlightlyDifferentColor(theme.general.backgroundColor)};
        transition: 0.1s;
      }
      &:disabled {
        background-color: ${({ theme }) => theme.general.backgroundColor};
      }
    }
  }
  .react-datepicker__day-name {
    color: ${({ theme }) => theme.typography.primaryTextColor};
    font-weight: 700;
  }
  .react-datepicker__day {
    width: 32px;
    height: 32px;
    line-height: 32px;
    margin-left: 0;
    margin-right: 0;
    margin-top: 1px;
    margin-bottom: 1px;
    border-radius: 100%;
    background-color: ${({ theme }) => theme.general.backgroundColor};
    color: ${({ theme }) => theme.typography.primaryTextColor};
    position: relative;
    z-index: 1;
    &:hover {
      background-color: ${({ theme }) => theme.general.brandColor};
      color: ${({ theme }) => theme.typography.primaryTextColor};
      transition: 0.1s;
    }

    // before - background highlight
    &:before {
      content: '';
      position: absolute;
      display: block;
      background-color: ${({ theme }) => applyOpacity(theme.general.brandColor, 0.5)};
      width: 100%;
      height: 100%;
      z-index: -1;
      left: 0%;
      visibility: hidden;
    }

    // rounds ends of the week rows
    &:first-of-type:before {
      border-radius: 100% 0 0 100%;
    }
    &:last-of-type:before {
      border-radius: 0 100% 100% 0;
    }

    // after - "bright circle" highlight
    &:after {
      content: '';
      position: absolute;
      display: block;
      background-color: ${({ theme }) => theme.general.brandColor};
      width: 100%;
      padding-top: 100%;
      top: 50%;
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
      &.react-datepicker__day--selecting-range-start:before {
        border-radius: 100% 0 0 100%;
      }
      &.react-datepicker__day--selecting-range-end:before {
        border-radius: 0 100% 100% 0;
      }
      color: ${({ theme }) => theme.typography.secondaryTextColor};
    }
  }

  // Hide background highlighting if range-start and range-end is the same day (when selecting range)
  .react-datepicker__month--selecting-range
    .react-datepicker__day:not(.react-datepicker__day--in-selecting-range) {
    &.react-datepicker__day--range-start.react-datepicker__day--range-end {
      &:before {
        visibility: hidden;
      }
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

    &.react-datepicker__day--range-start:not(.react-datepicker__day--range-end) {
      &:before {
        border-radius: 100% 0 0 100%;
      }
    }

    &.react-datepicker__day--range-end:not(.react-datepicker__day--range-start) {
      &:before {
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

  // ----------------- Fixing react-datepicker internal bugs with wrong classes applied ------------------------------

  // Fix react-datepicker bug with 'react-datepicker__day--selecting-range-start' class duplicated in each month
  .react-datepicker__month:not(.react-datepicker__month--selecting-range)
    .react-datepicker__day--selecting-range-start:not(.react-datepicker__day--range-start) {
    &:not(:first-of-type):not(:last-of-type) {
      &:before {
        border-radius: 0;
      }
      &.react-datepicker__day--range-end {
        &:before {
          border-radius: 0 100% 100% 0;
        }
      }
    }
    &:first-of-type {
      &:before {
        border-radius: 100% 0 0 100%;
      }
    }
    &:last-of-type {
      &:before {
        border-radius: 0 100% 100% 0;
      }
    }
  }

  // Fix react-datepicker bug with 'react-datepicker__day--selecting-range-end' class duplicated in each month
  .react-datepicker__month:not(.react-datepicker__month--selecting-range)
    .react-datepicker__day--selecting-range-end:not(.react-datepicker__day--range-end) {
    &:not(:first-of-type):not(:last-of-type) {
      &:before {
        border-radius: 0;
      }
      &.react-datepicker__day--range-start {
        &:before {
          border-radius: 100% 0 0 100%;
        }
      }
    }
    &:first-of-type {
      &:before {
        border-radius: 100% 0 0 100%;
      }
    }
    &:last-of-type {
      &:before {
        border-radius: 0 100% 100% 0;
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

  .react-datepicker__day--selected {
    &:after {
      visibility: visible;
    }
  }

  // ---------- Smooth background transition during selection new range ends ---------------

  .react-datepicker__month--selecting-range {
    .react-datepicker__day--selecting-range-start,
    .react-datepicker__day--range-start.react-datepicker__day--in-selecting-range:not(
        .react-datepicker__day--selecting-range-start
      ) {
      &.react-datepicker__day--in-range:not(
          .react-datepicker__day--range-start.react-datepicker__day--selecting-range-start,
          .react-datepicker__day--range-end.react-datepicker__day--selecting-range-end
        ) {
        &:before {
          border-radius: 0;
          background: linear-gradient(
            to right,
            ${({ theme }) => applyOpacity(theme.general.brandColor, 0.15)} 50%,
            ${({ theme }) => applyOpacity(theme.general.brandColor, 0.5)} 50%
          );
        }
      }
    }
  }

  .react-datepicker__month--selecting-range {
    .react-datepicker__day--selecting-range-end,
    .react-datepicker__day--range-end.react-datepicker__day--in-selecting-range:not(
        .react-datepicker__day--selecting-range-end
      ) {
      &.react-datepicker__day--in-range:not(
          .react-datepicker__day--range-start.react-datepicker__day--selecting-range-start,
          .react-datepicker__day--range-end.react-datepicker__day--selecting-range-end
        ) {
        &:before {
          border-radius: 0;
          background: linear-gradient(
            to right,
            ${({ theme }) => applyOpacity(theme.general.brandColor, 0.5)} 50%,
            ${({ theme }) => applyOpacity(theme.general.brandColor, 0.15)} 50%
          );
        }
      }
    }
  }

  // ------------------------------------------------------
`;
