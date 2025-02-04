import { CSSProperties, ReactNode } from 'react';
import styled from '@emotion/styled';
import { Radio } from '@/common/components/radio';

type ChildrenFn = (select: () => void) => ReactNode;

type SelectableSectionProps = {
  selected: boolean;
  style?: CSSProperties;
  onSelect: (selected: boolean) => void;
  children: ReactNode | ChildrenFn;
};

const Section = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
`;

/** @internal */
export const SelectableSection = ({
  selected,
  style,
  children,
  onSelect,
}: SelectableSectionProps) => {
  const select = () => {
    onSelect(true);
  };

  return (
    <Section style={style}>
      <Radio checked={selected} onChange={onSelect} />
      <>{typeof children === 'function' ? children(select) : children}</>
    </Section>
  );
};
