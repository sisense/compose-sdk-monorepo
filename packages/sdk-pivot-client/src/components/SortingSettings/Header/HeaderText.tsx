import React, { useState, useRef, useLayoutEffect, RefObject } from 'react';

import { Tooltip } from '@sisense/sdk-shared-ui/Tooltip';

function wrapWithLeftSingleQuotationMark(str: string): string {
  return `\u2018${str}\u2019`;
}

function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

type Props = {
  hierarchy: string[];
  prependedText: string;
};

export const HeaderText = (props: Props) => {
  const { hierarchy, prependedText } = props;
  const containerRef: RefObject<HTMLSpanElement> = useRef(null);
  const textRef: RefObject<HTMLSpanElement> = useRef(null);

  const initialText = hierarchy.map(wrapWithLeftSingleQuotationMark).join(' \u2192 ');
  const [text, setText] = useState(initialText);

  useLayoutEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.offsetWidth;

      if (textWidth > containerWidth) {
        const nextText = wrapWithLeftSingleQuotationMark(last(hierarchy));
        setText(nextText);
      }
    }
  }, [hierarchy]);

  return (
    <div className="header-text">
      <span className="header-text__sort-by">{prependedText}</span>
      <Tooltip placement="top" title={text} arrow>
        <span ref={containerRef} className="header-text__hierarchy-container">
          <span ref={textRef}>{text}</span>
        </span>
      </Tooltip>
    </div>
  );
};
