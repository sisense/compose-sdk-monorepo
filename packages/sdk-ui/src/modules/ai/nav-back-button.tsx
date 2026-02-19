import ArrowLeftIcon from './icons/arrow-left-icon.js';

type Colorable = {
  color: string;
};

type Clickable = {
  onClick: () => void;
};

export default function NavBackButton({ onClick, color }: Clickable & Colorable) {
  const sizeStyle = 'csdk-w-5 csdk-h-5';
  const layoutStyle = 'csdk-flex csdk-p-[4px] csdk-ml-[6px]';
  const interactionStyle = 'csdk-cursor-pointer';

  return (
    <div
      aria-label="go back"
      className={`${sizeStyle} ${layoutStyle} ${interactionStyle}`}
      onClick={onClick}
    >
      <ArrowLeftIcon color={color} />
    </div>
  );
}
