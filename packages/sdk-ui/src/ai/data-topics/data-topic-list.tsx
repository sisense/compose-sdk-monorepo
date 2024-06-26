import styled from '@emotion/styled';
import DataTopicItem from './data-topic-item';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';

export interface DataTopic {
  title: string;
  onClick?: () => void;
}

export interface Props {
  dataTopics: DataTopic[];
}

const FlexContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: auto;
`;

const Title = styled.div<Themable>`
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 4px;

  color: ${({ theme }) => theme.aiChat.primaryTextColor};
`;

const Subtitle = styled.div<Themable>`
  font-size: 15px;
  line-height: 22px;

  color: ${({ theme }) => theme.aiChat.primaryTextColor};
`;

export default function DataTopicList(props: Props) {
  const { dataTopics } = props;

  const { themeSettings } = useThemeContext();

  return (
    <FlexContainer>
      <Title theme={themeSettings}>Data Topics</Title>
      <Subtitle theme={themeSettings}>
        Analytics Chatbot is designed to help you interact with your data using natural language.
        <br />
        <br />
        Pick a topic you would like to explore:
      </Subtitle>
      {dataTopics.map((dataTopic) => {
        return <DataTopicItem {...dataTopic} key={dataTopic.title} />;
      })}
    </FlexContainer>
  );
}
