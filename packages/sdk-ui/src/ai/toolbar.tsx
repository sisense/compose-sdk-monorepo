import { forwardRef, ReactNode } from 'react';

export interface Props {
  title: string;
  leftNav: ReactNode;
  rightNav?: JSX.Element;
}

export default forwardRef<HTMLDivElement, Props>(function Toolbar(
  { title, leftNav, rightNav },
  ref,
) {
  const sizeStyle = 'csdk-w-full csdk-px-[14px] csdk-py-[29px]';
  const layoutStyle = 'csdk-flex csdk-items-center';

  return (
    <div className={`${sizeStyle} ${layoutStyle} csdk-rounded-[30px] csdk-relative`} ref={ref}>
      {leftNav}
      <div className="csdk-text-ai-lg csdk-font-semibold csdk-text-text-content csdk-ml-[20px]">
        {title}
      </div>
      <div className="csdk-ml-auto">{rightNav}</div>
    </div>
  );
});
