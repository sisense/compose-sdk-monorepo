import { useChatConfig } from '../chat-config';
import TextMessage from './text-message';

export default function ChatWelcomeMessage() {
  const { welcomeText } = useChatConfig();

  if (welcomeText === false) {
    return null;
  }

  return <TextMessage align="left">{welcomeText}</TextMessage>;
}
