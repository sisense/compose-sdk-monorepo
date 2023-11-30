import ArrowLeftIcon from './icons/arrow-left-icon';

interface Props {
  onClick: () => void;
}

export default function NavBackButton({ onClick }: Props) {
  const sizeStyle = 'csdk-w-5 csdk-h-5';
  const layoutStyle = 'csdk-flex csdk-p-[4px] csdk-ml-[6px]';
  const interactionStyle = 'csdk-cursor-pointer';

  return (
    <div className={`${sizeStyle} ${layoutStyle} ${interactionStyle}`} onClick={onClick}>
      <ArrowLeftIcon />
    </div>
  );
}
