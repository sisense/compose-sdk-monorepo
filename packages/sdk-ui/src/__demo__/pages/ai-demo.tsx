import Alert from '@mui/material/Alert';
import {
  AiContextProvider,
  Chatbot,
  GetNlgQueryResult,
  useGetNlgQueryResult,
  UseGetNlgQueryResultParams,
  useGetQueryRecommendations,
} from '@/ai';
import * as DM from '../sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';
import { ChangeEvent, useState } from 'react';
import { ChatMode } from '@/ai/api/types';
import { ThemeProvider } from '@/theme-provider';
import { getDefaultThemeSettings } from '@/index';

const nlgParams: UseGetNlgQueryResultParams = {
  dataSource: 'Sample ECommerce',
  dimensions: [DM.Commerce.Date.Months],
  measures: [measureFactory.sum(DM.Commerce.Cost)],
};

const Page = () => {
  const [chatMode, setChatMode] = useState<ChatMode>('analyze');
  const handleChatModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newChatMode = event.target.value as ChatMode;
    setChatMode(newChatMode);
  };

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [enableHeader, setEnableHeader] = useState(true);
  const [enableInsights, setEnableInsights] = useState(true);
  const theme = getDefaultThemeSettings(isDarkMode);
  return (
    <ThemeProvider theme={theme}>
      <div className="csdk-flex csdk-flex-col">
        <h3>Chatbot</h3>
        <div>
          Chat Mode:
          <select
            id="chatModeSelect"
            value={chatMode}
            onChange={handleChatModeChange}
            style={{ border: '1px solid grey', borderRadius: '5px' }}
          >
            <option value="analyze">Analyze (Data Exploration)</option>
            <option value="develop">Develop (Chat-to-Code)</option>
          </select>
        </div>
        <label>
          - Dark Mode:
          <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
        </label>
        <label>
          - Enable Header:
          <input
            type="checkbox"
            checked={enableHeader}
            onChange={() => setEnableHeader(!enableHeader)}
          />
        </label>
        <label>
          - Enable Insights:
          <input
            type="checkbox"
            checked={enableInsights}
            onChange={() => setEnableInsights(!enableInsights)}
          />
        </label>
        <Chatbot
          config={{
            enableFollowupQuestions: true,
            chatMode: chatMode,
            enableHeader,
            enableInsights,
          }}
        />
      </div>
      <div>
        <h3>GetNlgQueryResult</h3>
        <div className="csdk-border csdk-rounded csdk-p-4">
          <GetNlgQueryResult {...nlgParams} />
        </div>
      </div>
      <div>
        <h3>useGetNlgQueryResult</h3>
        <div className="csdk-border csdk-rounded csdk-p-4 csdk-whitespace-pre-wrap">
          {useGetNlgQueryResult(nlgParams).data}
        </div>
      </div>
      <div>
        <h3>useGetQueryRecommendations</h3>
        <div className="csdk-border csdk-rounded csdk-p-4">
          {useGetQueryRecommendations({ contextTitle: 'Sample ECommerce', count: 8 }).data.map(
            (r, i) => (
              <li key={i}>{r.nlqPrompt}</li>
            ),
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export const AiDemo = () => (
  <div className="csdk-h-fit">
    <Alert severity="info">
      In order to render correctly, components on this page require a Sisense instance with
      additional AI features enabled.
    </Alert>
    <br />
    <AiContextProvider>
      <Page />
    </AiContextProvider>
  </div>
);
