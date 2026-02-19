import { ReactNode } from 'react';

import styled from '@/infra/styled';
import { Radio } from '@/shared/components/radio';

type ChildrenFn = (select: () => void) => ReactNode;

type SelectableSectionProps = {
  selected: boolean;
  onSelect: (selected: boolean) => void;
  children: ReactNode | ChildrenFn;
  disabled?: boolean;
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
  disabled,
  ...rest
}: SelectableSectionProps) => {
  const select = () => {
    onSelect(true);
  };

  return (
    <Section {...rest}>
      <Radio
        disabled={disabled}
        checked={selected}
        onChange={onSelect}
        aria-label={'Select button'}
      />
      <>{typeof children === 'function' ? children(select) : children}</>
    </Section>
  );
};
