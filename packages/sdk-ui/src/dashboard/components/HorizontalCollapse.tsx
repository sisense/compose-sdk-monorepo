import styled from '@emotion/styled';
import { ReactNode, useState } from 'react';

const ArrowWrapper = styled.div<{ reversed: boolean }>`
  background-color: #b6b6b6;
  width: 8px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: calc(50% - 20px);
  left: 0;
  opacity: 0.4;
  cursor: pointer;

  ${({ reversed }) => (reversed ? 'transform: scaleX(-1);' : '')}

  &:before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    border-left-width: 0;
    border-left-style: solid;
    border-left-color: #b6b6b6;
    transition: border-left-width 100ms ease;
    border-top: 20px solid transparent;
    border-bottom: 20px solid transparent;
  }

  svg {
    margin-left: 1px;
  }

  &:hover {
    opacity: 1;
    &:before {
      border-left-width: 10px;
    }
  }
`;

const Wrapper = styled.div`
  position: relative;

  &:hover .arrow-wrapper {
    opacity: 1;
  }
`;

const ContentWrapper = styled.div<{ collapsed: boolean }>`
  width: ${({ collapsed }) => (collapsed ? '8px' : 'auto')};
  overflow: hidden;
  height: 100%;
`;

export const HorizontalCollapse = ({
  collapsedOnInit,
  children,
}: {
  collapsedOnInit?: boolean;
  children: ReactNode;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsedOnInit ?? false);
  return (
    <Wrapper>
      <ArrowWrapper
        className="arrow-wrapper"
        reversed={isCollapsed}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <svg fill="#fff" height="8px" width="8px" viewBox="0 0 330 330">
          <path d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001  c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213  C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606  C255,161.018,253.42,157.202,250.606,154.389z" />
        </svg>
      </ArrowWrapper>
      <ContentWrapper collapsed={isCollapsed}>{children}</ContentWrapper>
    </Wrapper>
  );
};
