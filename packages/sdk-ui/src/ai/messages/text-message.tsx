import { useChatStyle } from '../chat-style-provider';

type Props = {
  children: string | JSX.Element;
  align: 'left' | 'right' | 'full';
};

export default function TextMessage({ children, align }: Props) {
  const { primaryTextColor, messageBackgroundColor } = useChatStyle();

  const messageStyle = `${
    align !== 'full' ? 'csdk-max-w-[382px]' : ''
  } csdk-py-[8.5px] csdk-px-2 csdk-rounded-[10px] csdk-text-ai-sm csdk-text-text-content csdk-whitespace-pre-wrap csdk-break-words csdk-bg-background-workspace`;

  const alignStyle =
    align === 'right' ? 'csdk-justify-end csdk-text-right' : 'csdk-justify-start csdk-text-left';

  return (
    <div className={`csdk-flex ${alignStyle}`}>
      <div
        className={`${messageStyle}`}
        style={{
          backgroundColor: messageBackgroundColor,
          color: primaryTextColor,
        }}
      >
        {children}
      </div>
    </div>
  );
}
