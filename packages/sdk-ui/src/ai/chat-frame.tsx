import { CSSProperties, ReactNode } from 'react';

type ChatFrameProps = {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  children: ReactNode;
};

const MIN_ALLOWED_WIDTH = 500;
const MIN_ALLOWED_HEIGHT = 500;

export default function ChatFrame({
  width = MIN_ALLOWED_WIDTH,
  height = MIN_ALLOWED_HEIGHT,
  children,
}: ChatFrameProps) {
  return (
    <div
      className={`csdk-relative csdk-flex csdk-flex-col csdk-border csdk-border-[#c6c9ce] csdk-rounded-[30px] csdk-bg-background-workspace csdk-overflow-hidden`}
      style={{
        minWidth: MIN_ALLOWED_WIDTH,
        minHeight: MIN_ALLOWED_HEIGHT,
        width,
        height,
      }}
    >
      {children}
    </div>
  );
}
