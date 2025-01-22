import { GetNlgInsightsRequest } from '@/ai';
import styled from '@emotion/styled';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';
import FeedbackWrapper from '@/ai/messages/feedback-wrapper';
import Collapsible from '@/ai/common/collapsible';
import AiIcon from '@/ai/icons/ai-icon';

export interface ChartInsightsProps {
  summary: string;
  nlgRequest: GetNlgInsightsRequest;
}

const FlexDiv = styled.div<Themable>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin: 24px 0;
  max-width: 640px;
`;

const IconDiv = styled.div<Themable>`
  align-self: flex-start;
`;

export const ChartInsights = ({ summary, nlgRequest }: ChartInsightsProps) => {
  const { themeSettings } = useThemeContext();

  return (
    <FeedbackWrapper
      sourceId={nlgRequest.jaql.datasource.title}
      data={nlgRequest}
      type="chart/insights"
      buttonVisibility="always"
      renderContent={(buttonRow) => (
        <FlexDiv theme={themeSettings}>
          <IconDiv theme={themeSettings}>
            <AiIcon theme={themeSettings}></AiIcon>
          </IconDiv>
          <Collapsible text={summary} />
          {buttonRow}
        </FlexDiv>
      )}
    />
  );
};
