import { CSSProperties } from 'react';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import ChatBox from './chat-box';
import ChatFrame from './chat-frame';
import ChatHome from './chat-home';
import { ChatbotContextProvider, useChatbotContext } from './chatbot-context';

const ChatBody = () => {
  const { selectedContext } = useChatbotContext();

  return selectedContext ? <ChatBox selectedContext={selectedContext} /> : <ChatHome />;
};

/**
 * Props for {@link Chatbot} component.
 *
 * @internal
 */
export type ChatbotProps = {
  /**
   * Total width of the chatbot
   *
   * If not specified, a default width of 500px will be used
   */
  width?: CSSProperties['width'];

  /**
   * Total height of the chatbot
   *
   * If not specified, a default height of 500px will be used
   */
  height?: CSSProperties['height'];
};

/**
 * React component that renders a chatbot with data topic selection.
 *
 * @param props - {@link ChatbotProps}
 * @internal
 */
export const Chatbot = asSisenseComponent({
  componentName: 'Chatbot',
})((props: ChatbotProps) => {
  const { width, height = '900px' } = props;

  return (
    <ChatbotContextProvider>
      <ChatFrame width={width} height={height}>
        <ChatBody />
      </ChatFrame>
    </ChatbotContextProvider>
  );
});
