import { Alert } from '@mui/material';
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

const nlgParams: UseGetNlgQueryResultParams = {
  dataSource: 'Sample ECommerce',
  dimensions: [DM.Commerce.Date.Months],
  measures: [measureFactory.sum(DM.Commerce.Cost)],
};

const Page = () => {
  return (
    <>
      <div>
        <h3>Chatbot</h3>
        <Chatbot config={{ enableFollowupQuestions: true }} />
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
    </>
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
