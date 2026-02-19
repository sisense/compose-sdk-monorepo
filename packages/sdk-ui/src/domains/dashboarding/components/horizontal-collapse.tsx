import { ReactNode } from 'react';

import styled from '@/infra/styled';
import { ArrowCollapseIcon } from '@/shared/icons/arrow-collapse-icon';

const ArrowWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'reversed',
})<{ reversed: boolean }>`
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

const ContentWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'collapsed' && prop !== 'hideCollapseArrow',
})<{ collapsed: boolean; hideCollapseArrow: boolean }>`
  width: ${({ collapsed, hideCollapseArrow }) =>
    collapsed ? (hideCollapseArrow ? '0px' : '8px') : 'auto'};
  overflow: hidden;
  height: 100%;
`;

export const HorizontalCollapse = ({
  collapsed = false,
  onCollapsedChange,
  children,
  hideCollapseArrow = false,
}: {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: ReactNode;
  hideCollapseArrow?: boolean;
}) => {
  return (
    <Wrapper>
      {!hideCollapseArrow && (
        <ArrowWrapper
          className="arrow-wrapper"
          reversed={collapsed}
          data-reversed={collapsed}
          onClick={() => onCollapsedChange?.(!collapsed)}
        >
          <ArrowCollapseIcon color="#fff" height={8} width={8} />
        </ArrowWrapper>
      )}
      <ContentWrapper
        collapsed={collapsed}
        hideCollapseArrow={hideCollapseArrow}
        aria-hidden={collapsed}
      >
        {children}
      </ContentWrapper>
    </Wrapper>
  );
};
