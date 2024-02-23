import { Alert } from '@mui/material';
import {
  AiContextProvider,
  Chatbot,
  GetNlgQueryResult,
  GetNlgQueryResultRequest,
  useGetNlgQueryResult,
  useGetQueryRecommendations,
} from '@/ai';

const nlgRequest: GetNlgQueryResultRequest = {
  jaql: {
    datasource: { title: 'Sample ECommerce' },
    metadata: [
      {
        jaql: {
          column: 'Date',
          datatype: 'datetime',
          dim: '[Commerce.Date]',
          firstday: 'mon',
          level: 'years',
          table: 'Commerce',
          title: 'Date',
        },
      },
      {
        jaql: {
          agg: 'sum',
          column: 'Revenue',
          datatype: 'numeric',
          dim: '[Commerce.Revenue]',
          table: 'Commerce',
          title: 'total of Revenue',
        },
      },
    ],
  },
  style: 'Large',
};

const Page = () => {
  return (
    <>
      <div>
        <h3>Chatbot</h3>
        <Chatbot width="700px" config={{ enableFollowupQuestions: true }} />
      </div>
      <div>
        <h3>GetNlgQueryResult</h3>
        <div className="csdk-border csdk-rounded csdk-p-4">
          <GetNlgQueryResult {...nlgRequest} />
        </div>
      </div>
      <div>
        <h3>useGetNlgQueryResult</h3>
        <div className="csdk-border csdk-rounded csdk-p-4">
          {useGetNlgQueryResult(nlgRequest).data}
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
