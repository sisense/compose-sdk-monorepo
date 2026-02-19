import { useChatConfig } from '../chat-config.js';
import TextMessage from './text-message.js';

export default function ChatWelcomeMessage() {
  const { welcomeText } = useChatConfig();

  if (welcomeText === false) {
    return null;
  }

  return <TextMessage align="left">{welcomeText}</TextMessage>;
}
