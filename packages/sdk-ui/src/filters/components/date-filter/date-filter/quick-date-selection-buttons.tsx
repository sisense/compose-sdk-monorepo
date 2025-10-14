import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import dayjs from 'dayjs';

import { useThemeContext } from '../../../../theme-provider';
import { CompleteThemeSettings } from '../../../../types';
import { getSlightlyDifferentColor } from '../../../../utils/color/index.js';
import {
  ButtonProps,
  ButtonWithTooltipProps,
  SecondaryButtonWithTooltip,
} from '../../common/buttons';
import { SecondaryButton } from '../../common/index.js';

export type ButtonId = 'earliest' | 'today' | 'latest';
type QuickDateSelectionButtonsProps = {
  onDateSelected: (selectedDate: dayjs.Dayjs) => void;
  enabledButtons: ButtonId[];
  limit?: {
    maxDate?: dayjs.Dayjs;
    minDate?: dayjs.Dayjs;
  };
};

type ThemePropMixin = {
  theme: CompleteThemeSettings;
};

type ThemedButtonProps = ButtonProps & ThemePropMixin;

const ThemedSecondaryButton = styled(SecondaryButton)<ThemedButtonProps>`
  background-color: #edeef1;
  color: ${({ theme }) => theme.general.primaryButtonTextColor};
  &:hover {
    background-color: ${() => getSlightlyDifferentColor('#edeef1')};
    transition: 0.2s;
  }
`;

type ThemedSecondaryButtonWithTooltipProps = ButtonWithTooltipProps & ThemePropMixin;

const ThemedSecondaryButtonWithTooltip = styled(
  SecondaryButtonWithTooltip,
)<ThemedSecondaryButtonWithTooltipProps>`
  background-color: #edeef1;
  color: ${({ theme }) => theme.general.primaryButtonTextColor};
  &:hover {
    background-color: ${() => getSlightlyDifferentColor('#edeef1')};
    transition: 0.2s;
  }
`;

const ThemedButtonsContainer = styled.div<ThemePropMixin>`
  background-color: ${({ theme }) => theme.general.popover.input.datepicker.backgroundColor};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export const QuickDateSelectionButtons = (props: QuickDateSelectionButtonsProps) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  const today = dayjs(new Date());
  const maxDate = props.limit?.maxDate;
  const minDate = props.limit?.minDate;
  const isTodayBeforeMinDate = minDate && today.isBefore(minDate);
  const isTodayAfterMaxDate = maxDate && today.isAfter(maxDate);
  const isTodayOutOfAllowedDateRange = isTodayBeforeMinDate || isTodayAfterMaxDate;
  return (
    <ThemedButtonsContainer
      className={'csdk-flex csdk-justify-evenly csdk-gap-1 csdk-p-[10px] csdk-pb-[0px]'}
      theme={themeSettings}
    >
      <ThemedSecondaryButton
        onClick={() => {
          const selectedDate = dayjs(props.limit?.minDate || new Date());
          props.onDateSelected(selectedDate);
        }}
        theme={themeSettings}
        style={{ visibility: props.enabledButtons.includes('earliest') ? 'visible' : 'hidden' }}
      >
        {t('dateFilter.earliestDate')}
      </ThemedSecondaryButton>

      <ThemedSecondaryButtonWithTooltip
        onClick={() => {
          const selectedDate = dayjs(new Date());
          props.onDateSelected(selectedDate);
        }}
        disabled={isTodayOutOfAllowedDateRange}
        tooltipTitle={t('dateFilter.todayOutOfRange')}
        disableTooltip={!isTodayOutOfAllowedDateRange}
        theme={themeSettings}
        style={{ visibility: props.enabledButtons.includes('today') ? 'visible' : 'hidden' }}
      >
        {t('dateFilter.today')}
      </ThemedSecondaryButtonWithTooltip>

      <ThemedSecondaryButton
        onClick={() => {
          const selectedDate = dayjs(props.limit?.maxDate || new Date());
          props.onDateSelected(selectedDate);
        }}
        theme={themeSettings}
        style={{ visibility: props.enabledButtons.includes('latest') ? 'visible' : 'hidden' }}
      >
        {t('dateFilter.latestDate')}
      </ThemedSecondaryButton>
    </ThemedButtonsContainer>
  );
};
