import { CSSProperties, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';

import throttle from 'lodash-es/throttle';

import styled from '@/infra/styled';

export type ScrollWrapperOnScrollEvent = {
  top: number;
  direction: 'down' | 'up';
};

const ON_SCROLL_THROTTLE_MS = 300;

const Wrapper = styled.div`
  max-height: 100%;
  overflow: auto;
`;

/**
 * @internal
 */
export const ScrollWrapper = (props: {
  onScroll?: (event: ScrollWrapperOnScrollEvent) => void;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  const { onScroll, style, children } = props;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const prevScrollTop = useRef(0);

  const throttledOnScroll = useMemo(
    () => (onScroll ? throttle(onScroll, ON_SCROLL_THROTTLE_MS) : undefined),
    [onScroll],
  );

  const scrollHandler = useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement;
      const top = target.scrollTop / (target.scrollHeight - target.clientHeight);
      const direction = target.scrollTop > prevScrollTop.current ? 'down' : 'up';

      prevScrollTop.current = target.scrollTop;
      throttledOnScroll?.({ top, direction });
    },
    [throttledOnScroll],
  );

  useEffect(() => {
    const target = wrapperRef.current;
    target?.addEventListener('scroll', scrollHandler);
    return () => {
      target?.removeEventListener('scroll', scrollHandler);
    };
  }, [scrollHandler]);

  return (
    <Wrapper ref={wrapperRef} style={style}>
      {children}
    </Wrapper>
  );
};
