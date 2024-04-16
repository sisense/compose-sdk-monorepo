import { useChatConfig } from '../chat-config';
import TextMessage from './text-message';

export default function ChatWelcomeMessage() {
  const { welcomeText } = useChatConfig();

  if (welcomeText === false) {
    return null;
  }

  return (
    <TextMessage align="left">
      {welcomeText ?? (
        <>
          <div className="csdk-font-semibold">Welcome to the Query Assistant!</div>
          <br />
          <div>
            You can ask questions about your data, and I'll provide insights based on the data model
            you're working with.
          </div>
        </>
      )}
    </TextMessage>
  );
}
