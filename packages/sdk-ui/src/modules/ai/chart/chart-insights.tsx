import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';
import { GetNlgInsightsRequest } from '@/modules/ai';
import Collapsible from '@/modules/ai/common/collapsible';
import AiIcon from '@/modules/ai/icons/ai-icon';
import FeedbackWrapper from '@/modules/ai/messages/feedback-wrapper';

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
  color: ${({ theme }) => theme.chart.textColor};
  background-color: ${({ theme }) => theme.chart.backgroundColor};
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
