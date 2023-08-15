/* eslint-disable complexity */
import dayjs from 'dayjs';
import { SecondaryButton } from '../../common/index.js';
import { SecondaryButtonWithTooltip } from '../../common/Buttons.js';

type ButtonId = 'earliest' | 'today' | 'latest';
type QuickDateSelectionButtonsProps = {
  onDateSelected: (selectedDate: dayjs.Dayjs) => void;
  enabledButtons: ButtonId[];
  limit: {
    maxDate: dayjs.Dayjs;
    minDate: dayjs.Dayjs;
  };
};
export const QuickDateSelectionButtons = (props: QuickDateSelectionButtonsProps) => {
  const today = dayjs(new Date());
  const maxDate = props.limit.maxDate;
  const minDate = props.limit.minDate;
  const isTodayBeforeMinDate = minDate && today.isBefore(minDate);
  const isTodayAfterMaxDate = maxDate && today.isAfter(maxDate);
  const isTodayOutOfAllowedDateRange = isTodayBeforeMinDate || isTodayAfterMaxDate;
  return (
    <div
      className={
        (props.enabledButtons.includes('earliest') ? 'left-[16px]' : 'right-[16px]') + ' p-[16px]'
      }
    >
      {props.enabledButtons.includes('earliest') && (
        <SecondaryButton
          className="mr-[12px]"
          onClick={() => {
            const selectedDate = dayjs(props.limit?.minDate || new Date());
            props.onDateSelected(selectedDate);
          }}
        >
          Earliest Date
        </SecondaryButton>
      )}

      {props.enabledButtons.includes('today') && (
        <SecondaryButtonWithTooltip
          className="mr-[12px]"
          onClick={() => {
            const selectedDate = dayjs(new Date());
            props.onDateSelected(selectedDate);
          }}
          disabled={isTodayOutOfAllowedDateRange}
          tooltipTitle="Today is out of available date range"
          disableTooltip={!isTodayOutOfAllowedDateRange}
        >
          Today
        </SecondaryButtonWithTooltip>
      )}
      {props.enabledButtons.includes('latest') && (
        <SecondaryButton
          onClick={() => {
            const selectedDate = dayjs(props.limit?.maxDate || new Date());
            props.onDateSelected(selectedDate);
          }}
        >
          Latest Day
        </SecondaryButton>
      )}
    </div>
  );
};
