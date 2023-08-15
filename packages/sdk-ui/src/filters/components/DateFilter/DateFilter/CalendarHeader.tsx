import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { CompleteThemeSettings } from '../../../../types.js';
import { useThemeContext } from '../../../../components/ThemeProvider/index.js';

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
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.general.primaryButtonTextColor};
`;

const MonthSelectionButton = styled.button<{ theme: CompleteThemeSettings }>`
  border: none;
  background-color: transparent;
  color: ${({ theme, disabled }) =>
    disabled ? 'transparent' : theme.general.primaryButtonTextColor};
  margin: 0 0.5rem;
  :hover {
    border-radius: 50%;

    font-weight: 500;
  }
`;

const HeaderBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
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
        {'<<'}
      </MonthSelectionButton>
      <MonthSelectionButton
        theme={theme}
        onClick={props.decreaseMonth}
        disabled={props.prevMonthButtonDisabled}
      >
        {'<'}
      </MonthSelectionButton>
      <MonthTitle theme={theme}>{dayjs(props.date).format('MMM YYYY')}</MonthTitle>
      <MonthSelectionButton
        theme={theme}
        onClick={props.increaseMonth}
        disabled={props.nextMonthButtonDisabled}
      >
        {'>'}
      </MonthSelectionButton>
      <MonthSelectionButton
        theme={theme}
        onClick={() => {
          props.changeYear(year + 1);
        }}
        disabled={props.nextMonthButtonDisabled}
      >
        {'>>'}
      </MonthSelectionButton>
    </HeaderBlock>
  );
};
