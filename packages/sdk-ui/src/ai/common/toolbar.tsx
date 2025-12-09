import { forwardRef, ReactNode } from 'react';

import styled from '@/styled';

type ToolbarStyle = {
  textColor: string;
  backgroundColor: string;
};
export interface Props {
  title: string;
  leftNav: ReactNode;
  rightNav?: JSX.Element;
  style: ToolbarStyle;
}

type Styleable = {
  style: ToolbarStyle;
};

const ToolbarContainer = styled.div<Styleable>`
  flex: 0 0 80px;
  padding-left: 14px;
  padding-right: 14px;
  display: flex;
  align-items: center;
  position: relative;

  background-color: ${({ style }) => style.backgroundColor};
`;

const ToolbarTitle = styled.div<Styleable>`
  font-size: 18px;
  line-height: 22px;
  font-weight: 600;
  margin-left: 20px;

  color: ${({ style }) => style.textColor};
`;
export default forwardRef<HTMLDivElement, Props>(function Toolbar(
  { title, leftNav, rightNav, style },
  ref,
) {
  return (
    <ToolbarContainer ref={ref} style={style}>
      {leftNav}
      <ToolbarTitle style={style}>{title}</ToolbarTitle>
      {rightNav && <div className="csdk-ml-auto">{rightNav}</div>}
    </ToolbarContainer>
  );
});
