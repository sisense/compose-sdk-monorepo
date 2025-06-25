import { useLayoutEffect, useRef } from 'preact/hooks';

/** @internal */
export const CustomElement = ({
  nativeElement,
  onDestroy,
}: {
  nativeElement: HTMLDivElement;
  onDestroy?: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.appendChild(nativeElement);
    }
  }, [nativeElement]);

  useLayoutEffect(() => {
    return () => {
      if (onDestroy) {
        onDestroy();
      }
    };
  }, [onDestroy]);

  return <div ref={contentRef} style="width: 100%; height: 100%"></div>;
};
