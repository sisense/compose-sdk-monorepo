import { useChatStyle } from './chat-style-provider';

export default function AiDisclaimer() {
  const { secondaryTextColor } = useChatStyle();

  return (
    <div
      className="csdk-pt-1.5 csdk-px-4 csdk-text-center csdk-text-ai-xs csdk-text-text-secondary csdk-whitespace-pre-wrap csdk-w-full csdk-flex csdk-flex-wrap csdk-items-center csdk-justify-center"
      style={{
        color: secondaryTextColor,
      }}
    >
      <div>Content is powered by AI, so surprises and mistakes are possible.</div>
      <div> Please rate responses so we can improve!</div>
    </div>
  );
}
