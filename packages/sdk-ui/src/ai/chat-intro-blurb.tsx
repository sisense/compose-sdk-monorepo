import { useChatStyle } from './chat-style-provider';

export default function ChatIntroBlurb(props: { title: string }) {
  const { secondaryTextColor } = useChatStyle();
  return (
    <div className="csdk-text-center csdk-text-text-active" style={{ color: secondaryTextColor }}>
      <h1 className="csdk-text-ai-lg csdk-font-semibold">Explore {props.title}</h1>
      <p className="csdk-text-ai-base csdk-mb-[8px] csdk-mt-[32px]">
        You can ask questions about your data, and I'll provide insights based on the data model
        you're working with.
      </p>
    </div>
  );
}
