import { Ref, useCallback, useRef, useState } from 'react';

/**
 * Track whether an element is being hovered over.
 *
 * @privateRemarks Derived from https://github.com/uidotdev/usehooks/blob/dfa6623fcc2dcad3b466def4e0495b3f38af962b/index.js#L426.
 * @internal
 */
export const useHover = <T extends HTMLElement>(): [Ref<T>, boolean] => {
  const [hovering, setHovering] = useState(false);
  const previousNode = useRef<T | null>(null);

  const handleMouseEnter = useCallback(() => {
    setHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
  }, []);

  const customRef = useCallback(
    (node: T) => {
      if (previousNode.current?.nodeType === Node.ELEMENT_NODE) {
        previousNode.current.removeEventListener('mouseenter', handleMouseEnter);
        previousNode.current.removeEventListener('mouseleave', handleMouseLeave);
      }

      if (node?.nodeType === Node.ELEMENT_NODE) {
        node.addEventListener('mouseenter', handleMouseEnter);
        node.addEventListener('mouseleave', handleMouseLeave);
      }

      previousNode.current = node;
    },
    [handleMouseEnter, handleMouseLeave],
  );

  return [customRef, hovering];
};
