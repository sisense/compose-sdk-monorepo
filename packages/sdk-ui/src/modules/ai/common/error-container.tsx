import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';
import ExclamationMarkIcon from '@/shared/icons/exclamation-mark-icon';

type ErrorPageProps = {
  text: string;
  action?: {
    text: string;
    onClick: () => void;
  };
};

const Container = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 21px;
`;

const Title = styled.div<Themable>`
  color: ${({ theme }) => theme.aiChat.primaryTextColor};
  text-align: center;
  font-weight: 600;
`;

const ActionButton = styled.div`
  color: rgba(54, 163, 217, 1);
  cursor: pointer;
`;

export default function ErrorContainer({ text, action }: ErrorPageProps) {
  const { themeSettings } = useThemeContext();

  return (
    <Container>
      <Title theme={themeSettings}>{text}</Title>
      <ExclamationMarkIcon />
      {action && <ActionButton onClick={action.onClick}>{action.text}</ActionButton>}
    </Container>
  );
}
