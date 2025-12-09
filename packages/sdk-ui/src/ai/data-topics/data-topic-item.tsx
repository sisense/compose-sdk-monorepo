import styled from '@/styled';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import { getSlightlyDifferentColor } from '@/utils/color';

import ArrowLeftIcon from '../icons/arrow-left-icon';

const Container = styled.button<Themable>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  padding: 20px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  border-radius: 15px;
  box-shadow: 0px 1px 2px rgba(9, 9, 10, 0.1), 0px 2px 4px rgba(9, 9, 10, 0.1);
  cursor: pointer;

  background-color: ${({ theme }) => theme.aiChat.dataTopics.items.backgroundColor};
`;

const Title = styled.div<Themable>`
  font-size: 1.05rem;
  line-height: 28px;

  color: ${({ theme }) => theme.aiChat.dataTopics.items.textColor};
`;

const Description = styled.div<Themable>`
  font-size: ${({ theme }) => theme.aiChat.primaryFontSize[0]};
  line-height: ${({ theme }) => theme.aiChat.primaryFontSize[1]};

  color: ${({ theme }) =>
    getSlightlyDifferentColor(theme.aiChat.dataTopics.items.textColor, 0, 0.5)};
`;

const IconContainer = styled.div`
  width: 16px;
  height: 16px;
  transform: rotate(180deg);
`;

type Props = {
  title: string;
  description?: string;
  onClick?: () => void;
};

export default function DataTopicItem(props: Props) {
  const { title, description, onClick } = props;

  const { themeSettings } = useThemeContext();

  return (
    <Container onClick={onClick} theme={themeSettings}>
      <div>
        <Title theme={themeSettings}>{title}</Title>
        <Description theme={themeSettings}>{description}</Description>
      </div>
      <IconContainer>
        <ArrowLeftIcon color={themeSettings.aiChat.icons.color} />
      </IconContainer>
    </Container>
  );
}
