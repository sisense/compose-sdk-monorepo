import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { Radio } from '@/common/components/radio';

type ChildrenFn = (select: () => void) => ReactNode;

type SelectableSectionProps = {
  selected: boolean;
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
  children,
  onSelect,
  ...rest
}: SelectableSectionProps) => {
  const select = () => {
    onSelect(true);
  };

  return (
    <Section {...rest}>
      <Radio checked={selected} onChange={onSelect} aria-label={'Select button'} />
      <>{typeof children === 'function' ? children(select) : children}</>
    </Section>
  );
};
