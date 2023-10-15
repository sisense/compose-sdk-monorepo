/* eslint-disable sonarjs/no-duplicate-string */
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { CompleteThemeSettings } from '../../../../types.js';
import { useThemeContext } from '../../../../theme-provider/index.js';
import { ArrowRightIcon } from '../../icons/arrow-right-icon';
import { DoubleArrowRightIcon } from '../../icons/double-arrow-right-icon';

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
        <DoubleArrowRightIcon
          className={`csdk-scale-x-[-1] csdk-transition ${
            props.prevMonthButtonDisabled ? 'csdk-opacity-0' : ''
          }`}
        />
      </MonthSelectionButton>
      <MonthSelectionButton
        theme={theme}
        onClick={props.decreaseMonth}
        disabled={props.prevMonthButtonDisabled}
      >
        <ArrowRightIcon
          className={`csdk-scale-x-[-1] csdk-transition ${
            props.prevMonthButtonDisabled ? 'csdk-opacity-0' : ''
          }`}
        />
      </MonthSelectionButton>
      <MonthTitle theme={theme}>{dayjs(props.date).format('MMM YYYY')}</MonthTitle>
      <MonthSelectionButton
        theme={theme}
        onClick={props.increaseMonth}
        disabled={props.nextMonthButtonDisabled}
      >
        <ArrowRightIcon
          className={`csdk-transition ${props.nextMonthButtonDisabled ? 'csdk-opacity-0' : ''}`}
        />
      </MonthSelectionButton>
      <MonthSelectionButton
        theme={theme}
        onClick={() => {
          props.changeYear(year + 1);
        }}
        disabled={props.nextMonthButtonDisabled}
      >
        <DoubleArrowRightIcon
          className={`csdk-transition ${props.nextMonthButtonDisabled ? 'csdk-opacity-0' : ''}`}
        />
      </MonthSelectionButton>
    </HeaderBlock>
  );
};
