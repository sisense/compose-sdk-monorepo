type Props = {
  children: string | JSX.Element;
  align: 'left' | 'right' | 'full';
  onClick?: () => void;
};

export default function TextMessage({ children, align, onClick }: Props) {
  const alignStyle =
    align === 'right' ? 'csdk-ml-auto csdk-text-right' : 'csdk-mr-auto csdk-text-left';

  const messageStyle = `${
    align !== 'full' ? 'csdk-max-w-[414px]' : ''
  } csdk-p-2 csdk-rounded-[10px] csdk-text-ai-sm csdk-text-text-content csdk-whitespace-pre-wrap csdk-break-words`;

  const clickableStyle = onClick
    ? 'csdk-group csdk-cursor-pointer csdk-bg-background-priority hover:csdk-text-white hover:csdk-bg-text-content csdk-rounded-[20px] csdk-border csdk-border-text-content'
    : 'csdk-bg-background-workspace';

  return (
    <div className={`${alignStyle} ${messageStyle} ${clickableStyle}`} onClick={onClick}>
      {children}
    </div>
  );
}
