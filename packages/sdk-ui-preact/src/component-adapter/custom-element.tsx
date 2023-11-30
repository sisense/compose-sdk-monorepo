import { useLayoutEffect, useRef } from 'preact/hooks';

/** @internal */
export const CustomElement = ({ nativeElement }: { nativeElement: HTMLDivElement }) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.appendChild(nativeElement);
    }
  }, [nativeElement]);

  return <div ref={contentRef} style="width: 100%; height: 100%"></div>;
};
