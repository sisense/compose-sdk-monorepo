import { CSSProperties, ReactNode } from 'react';
import { useChatStyle } from './chat-style-provider';

type ChatFrameProps = {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  children: ReactNode;
};

const MIN_ALLOWED_WIDTH = 500;
const MIN_ALLOWED_HEIGHT = 500;

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 900;

export default function ChatFrame({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  children,
}: ChatFrameProps) {
  const { border } = useChatStyle();
  return (
    <div
      className={`csdk-relative csdk-flex csdk-flex-col csdk-border csdk-border-[#c6c9ce] csdk-rounded-[30px] csdk-bg-background-workspace csdk-overflow-hidden`}
      style={{
        minWidth: MIN_ALLOWED_WIDTH,
        minHeight: MIN_ALLOWED_HEIGHT,
        width,
        height,
        border: border === false ? 'none' : border,
      }}
    >
      {children}
    </div>
  );
}
