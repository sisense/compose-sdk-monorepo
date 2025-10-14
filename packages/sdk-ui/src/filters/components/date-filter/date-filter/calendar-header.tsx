/* eslint-disable sonarjs/no-duplicate-string */
import styled from '@emotion/styled';
import dayjs from 'dayjs';

import { useThemeContext } from '../../../../theme-provider/index.js';
import { CompleteThemeSettings } from '../../../../types.js';
import { ArrowIcon } from '../../icons/arrow-icon';
import { DoubleArrowIcon } from '../../icons/double-arrow-icon';

type HeaderProps = {
  date: Date;
  changeYear: (value: number) => void;
  changeMonth: (value: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
};

const MonthTitle = styled.span<{ theme: CompleteThemeSettings }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.typography.primaryTextColor};
  width: 70px;
  text-align: center;
`;

const MonthSelectionButton = styled.button<{ theme: CompleteThemeSettings }>`
  border: none;
  background-color: transparent;
  color: ${({ theme, disabled }) => (disabled ? 'transparent' : theme.typography.primaryTextColor)};
  margin: 0 5px;
  :hover {
    border-radius: 50%;

    font-weight: 500;
  }
`;

const HeaderBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 10px;
`;

export const CalendarHeader = (props: HeaderProps) => {
  const year = dayjs(props.date).year();
  const { themeSettings: theme } = useThemeContext();
  return (
    <HeaderBlock>
      <MonthSelectionButton
        onClick={() => {
          props.changeYear(year - 1);
        }}
        theme={theme}
        disabled={props.prevMonthButtonDisabled}
      >
        <DoubleArrowIcon
          direction="left"
          disabled={props.prevMonthButtonDisabled}
          className={'csdk-transition'}
          theme={theme}
        />
      </MonthSelectionButton>
      <MonthSelectionButton
        theme={theme}
        onClick={props.decreaseMonth}
        disabled={props.prevMonthButtonDisabled}
      >
        <ArrowIcon
          direction="left"
          disabled={props.prevMonthButtonDisabled}
          className={'csdk-transition'}
          theme={theme}
        />
      </MonthSelectionButton>
      <MonthTitle theme={theme}>{dayjs(props.date).format('MMM YYYY')}</MonthTitle>
      <MonthSelectionButton
        theme={theme}
        onClick={props.increaseMonth}
        disabled={props.nextMonthButtonDisabled}
      >
        <ArrowIcon
          direction="right"
          disabled={props.nextMonthButtonDisabled}
          className={'csdk-transition'}
          theme={theme}
        />
      </MonthSelectionButton>
      <MonthSelectionButton
        theme={theme}
        onClick={() => {
          props.changeYear(year + 1);
        }}
        disabled={props.nextMonthButtonDisabled}
      >
        <DoubleArrowIcon
          direction="right"
          disabled={props.nextMonthButtonDisabled}
          className={'csdk-transition'}
          theme={theme}
        />
      </MonthSelectionButton>
    </HeaderBlock>
  );
};
