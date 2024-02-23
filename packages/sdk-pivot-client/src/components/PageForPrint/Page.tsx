import * as React from 'react';
import { Header, OnChangesApplyProps } from './Header.js';
import { LAYOUT } from './constants.js';

type Props = {
  total: number;
  pageNumber: number;
  isHeader: boolean;
  titleName: string;
  onApplyHeaderChanges: (options: OnChangesApplyProps) => void;
  position: string;
  size: string;
  pageStyles: React.CSSProperties;
  children: Function;
  previewText?: string;
  isPreview?: boolean;
};

export const Page: React.FunctionComponent<Props> = (props: Props) => {
  const {
    total,
    pageNumber,
    isHeader,
    titleName,
    position,
    size,
    pageStyles,
    onApplyHeaderChanges,
    children,
    previewText = 'Partial page due to preview',
    isPreview,
  } = props;

  return (
    <div style={pageStyles} className={LAYOUT.PAGE}>
      {titleName.length || isPreview ? (
        <Header
          isHeader={isHeader}
          titleName={titleName}
          size={size}
          position={position}
          onChangesApply={onApplyHeaderChanges}
        />
      ) : null}
      {children(pageNumber - 1)}
      <div className={LAYOUT.FOOTER}>
        <div>
          {/* eslint-disable-next-line */}
          <span>{pageNumber}</span>
          <span>/</span>
          <span>{total}</span>
        </div>
        {isPreview ? <span className={LAYOUT.FOOTER_PREVIEW_TEXT}>{previewText}</span> : null}
      </div>
    </div>
  );
};

export default Page;
