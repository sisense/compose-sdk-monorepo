import { Alert } from '@mui/material';
import { ChatApiContextProvider, Chatbot } from '../../ai';

export const AiDemo = () => (
  <div className="csdk-h-fit">
    <Alert severity="info">
      In order to render correctly, components on this page require a Sisense instance with
      additional AI features enabled.
    </Alert>
    <br />
    <ChatApiContextProvider>
      <Chatbot />
    </ChatApiContextProvider>
  </div>
);
