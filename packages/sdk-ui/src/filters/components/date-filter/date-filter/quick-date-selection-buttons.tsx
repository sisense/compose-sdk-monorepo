/* eslint-disable complexity */
import dayjs from 'dayjs';
import { SecondaryButton } from '../../common/index.js';
import {
  ButtonProps,
  ButtonWithTooltipProps,
  SecondaryButtonWithTooltip,
} from '../../common/buttons';
import styled from '@emotion/styled';
import { CompleteThemeSettings } from '../../../../types';
import { useThemeContext } from '../../../../theme-provider';

type ButtonId = 'earliest' | 'today' | 'latest';
type QuickDateSelectionButtonsProps = {
  onDateSelected: (selectedDate: dayjs.Dayjs) => void;
  enabledButtons: ButtonId[];
  limit: {
    maxDate: dayjs.Dayjs;
    minDate: dayjs.Dayjs;
  };
};

type ThemePropMixin = {
  theme: CompleteThemeSettings;
};

type ThemedButtonProps = ButtonProps & ThemePropMixin;

const ThemedSecondaryButton = styled(SecondaryButton)<ThemedButtonProps>`
  background-color: #edeef1;
  color: ${({ theme }) => theme.general.primaryButtonTextColor};
`;

type ThemedSecondaryButtonWithTooltipProps = ButtonWithTooltipProps & ThemePropMixin;

const ThemedSecondaryButtonWithTooltip = styled(
  SecondaryButtonWithTooltip,
)<ThemedSecondaryButtonWithTooltipProps>`
  background-color: #edeef1;
  color: ${({ theme }) => theme.general.primaryButtonTextColor};
`;

const ThemedButtonsContainer = styled.div<ThemePropMixin>`
  background-color: ${({ theme }) => theme.general.backgroundColor};
`;

export const QuickDateSelectionButtons = (props: QuickDateSelectionButtonsProps) => {
  const { themeSettings } = useThemeContext();

  const today = dayjs(new Date());
  const maxDate = props.limit.maxDate;
  const minDate = props.limit.minDate;
  const isTodayBeforeMinDate = minDate && today.isBefore(minDate);
  const isTodayAfterMaxDate = maxDate && today.isAfter(maxDate);
  const isTodayOutOfAllowedDateRange = isTodayBeforeMinDate || isTodayAfterMaxDate;
  return (
    <ThemedButtonsContainer
      className={
        (props.enabledButtons.includes('earliest') ? 'csdk-left-[10px]' : 'csdk-right-[10px]') +
        ' csdk-p-[10px] csdk-pb-[0px]'
      }
      theme={themeSettings}
    >
      <ThemedSecondaryButton
        className="csdk-mr-[10px]"
        onClick={() => {
          const selectedDate = dayjs(props.limit?.minDate || new Date());
          props.onDateSelected(selectedDate);
        }}
        theme={themeSettings}
        style={{ visibility: props.enabledButtons.includes('earliest') ? 'visible' : 'hidden' }}
      >
        Earliest Date
      </ThemedSecondaryButton>

      <ThemedSecondaryButtonWithTooltip
        className="csdk-mr-[12px]"
        onClick={() => {
          const selectedDate = dayjs(new Date());
          props.onDateSelected(selectedDate);
        }}
        disabled={isTodayOutOfAllowedDateRange}
        tooltipTitle="Today is out of available date range"
        disableTooltip={!isTodayOutOfAllowedDateRange}
        theme={themeSettings}
        style={{ visibility: props.enabledButtons.includes('today') ? 'visible' : 'hidden' }}
      >
        Today
      </ThemedSecondaryButtonWithTooltip>

      <ThemedSecondaryButton
        onClick={() => {
          const selectedDate = dayjs(props.limit?.maxDate || new Date());
          props.onDateSelected(selectedDate);
        }}
        theme={themeSettings}
        style={{ visibility: props.enabledButtons.includes('latest') ? 'visible' : 'hidden' }}
      >
        Latest Day
      </ThemedSecondaryButton>
    </ThemedButtonsContainer>
  );
};
