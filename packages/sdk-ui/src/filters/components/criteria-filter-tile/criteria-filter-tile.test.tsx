/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { render, screen } from '@testing-library/react';
import { MockedSisenseContextProvider, setup } from '../../../__test-helpers__/index.js';
import { CriteriaFilterTile, CriteriaFilterTileProps } from './criteria-filter-tile';
import { NumericFilter, createAttribute, filters } from '@sisense/sdk-data';

const mockAttribute = createAttribute({
  name: 'BrandID',
  type: 'numeric-attribute',
  expression: '[Commerce.Brand ID]',
});

const props: CriteriaFilterTileProps = {
  title: 'Test Title',
  filter: filters.between(mockAttribute, 0, 100) as NumericFilter,
  onUpdate: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

const Comp = () => {
  return <div>test</div>;
};

describe('criteria tests', () => {
  it('can actually run a test', () => {
    render(<Comp />);
    const element = screen.getByText('test');
    expect(element).toBeInTheDocument();
  });
  it('renders collapsed display text by default', () => {
    render(
      <MockedSisenseContextProvider>
        <CriteriaFilterTile {...props} />
      </MockedSisenseContextProvider>,
    );
    const element = screen.getByText('criteriaFilter.between');
    expect(element).toBeInTheDocument();
  });

  it('renders input boxes when expanded', async () => {
    const { user } = setup(
      <MockedSisenseContextProvider>
        <CriteriaFilterTile {...props} />
      </MockedSisenseContextProvider>,
    );
    const textElt = screen.getByText('criteriaFilter.between');
    expect(textElt).toBeInTheDocument();
    await user.click(screen.getByLabelText('arrow-down'));
    expect(textElt).not.toBeInTheDocument();
    expect(screen.getByText('≥')).toBeInTheDocument();
    expect(screen.getByText('≤')).toBeInTheDocument();
  });
});
