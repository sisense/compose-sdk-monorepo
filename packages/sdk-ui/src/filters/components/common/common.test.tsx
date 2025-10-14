/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { render, screen } from '@testing-library/react';

import { MockedSisenseContextProvider, setup } from '../../../__test-helpers__/';
import { Dropdown, DropdownProps } from './dropdown';
import { RadioGroup, RadioGroupProps } from './radio';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('common component tests', () => {
  it('should render Dropdown options when clicked', async () => {
    const props: DropdownProps = {
      elements: [<div key={1}>test1</div>, <div key={2}>test2</div>],
      icon: <div>icon</div>,
      selectedIdx: 0,
    };
    const { user } = setup(
      <MockedSisenseContextProvider>
        <Dropdown {...props} />
      </MockedSisenseContextProvider>,
    );
    const element = screen.getByText('test1');
    expect(element).toBeInTheDocument();
    await user.click(element);
    const elts = screen.getAllByText('test1');
    expect(elts.length).toBe(2);
    const element2 = screen.getByText('test2');
    expect(element2).toBeInTheDocument();
  });
  it('should render RadioGroup options with correct selected option', () => {
    const props: RadioGroupProps = {
      items: ['test1', 'test2'],
      currentSelection: 'test1',
      title: 'title',
    };
    render(
      <MockedSisenseContextProvider>
        <RadioGroup {...props} />
      </MockedSisenseContextProvider>,
    );
    const title = screen.getByText('title');
    expect(title).toBeInTheDocument();
    const element1 = screen.getByText('test1').children[0];
    expect(element1).toBeInTheDocument();
    expect(element1).toBeChecked();
    const element2 = screen.getByText('test2').children[0];
    expect(element2).toBeInTheDocument();
    expect(element2).not.toBeChecked();
  });
});
