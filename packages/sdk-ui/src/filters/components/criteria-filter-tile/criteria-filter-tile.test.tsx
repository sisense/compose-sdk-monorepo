/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { render, screen } from '@testing-library/react';
import { MockedSisenseContextProvider, setup } from '../../../__test-helpers__/index.js';
import { CriteriaFilterTile, CriteriaFilterTileProps } from './criteria-filter-tile';
import {
  NumericFilter,
  RankingFilter,
  TextFilter,
  createAttribute,
  createMeasure,
  filterFactory,
} from '@sisense/sdk-data';

const mockAttribute = createAttribute({
  name: 'BrandID',
  type: 'numeric-attribute',
  expression: '[Commerce.Brand ID]',
});
const measureAOutline = {
  name: 'avg Revenue',
  type: 'basemeasure',
  desc: '',
  sort: 0,
  aggregation: 'avg',
  attribute: mockAttribute,
};
const measureBOutline = {
  name: 'sum Revenue',
  type: 'basemeasure',
  desc: '',
  sort: 0,
  aggregation: 'sum',
  attribute: mockAttribute,
};
const measureCOutline = {
  name: 'max Revenue',
  type: 'basemeasure',
  desc: '',
  sort: 0,
  aggregation: 'max',
  attribute: mockAttribute,
};
const mockMeasureA = createMeasure(measureAOutline);
const mockMeasureB = createMeasure(measureBOutline);
const mockMeasureC = createMeasure(measureCOutline);
const measures = [mockMeasureA, mockMeasureB, mockMeasureC];

const propsBetween: CriteriaFilterTileProps = {
  title: 'Test Title',
  filter: filterFactory.between(mockAttribute, 0, 100) as NumericFilter,
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
        <CriteriaFilterTile {...propsBetween} />
      </MockedSisenseContextProvider>,
    );
    const element = screen.getByText('All items between 0 and 100');
    expect(element).toBeInTheDocument();
  });

  it('renders input boxes when expanded', async () => {
    const { user } = setup(
      <MockedSisenseContextProvider>
        <CriteriaFilterTile {...propsBetween} />
      </MockedSisenseContextProvider>,
    );
    const textElt = screen.getByText('All items between 0 and 100');
    expect(textElt).toBeInTheDocument();
    await user.click(screen.getByLabelText('arrow-down'));
    expect(textElt).not.toBeInTheDocument();
    expect(screen.getByText('≥')).toBeInTheDocument();
    expect(screen.getByText('≤')).toBeInTheDocument();
  });

  it('renders text input boxes when expanded', async () => {
    const propsNotContain: CriteriaFilterTileProps = {
      title: 'Test Title',
      filter: filterFactory.doesntContain(mockAttribute, 'boop') as TextFilter,
      onUpdate: vi.fn(),
    };
    const { user } = setup(
      <MockedSisenseContextProvider>
        <CriteriaFilterTile {...propsNotContain} />
      </MockedSisenseContextProvider>,
    );
    const textElt = screen.getByText("All items doesn't contain boop");
    expect(textElt).toBeInTheDocument();
    await user.click(screen.getByLabelText('arrow-down'));
    expect(textElt).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('boop')).toBeInTheDocument();
  });

  it('renders ranked controls when expanded', async () => {
    const propsTopRank: CriteriaFilterTileProps = {
      title: 'Test Title',
      filter: filterFactory.topRanking(mockAttribute, mockMeasureB, 5) as RankingFilter,
      onUpdate: vi.fn(),
      measures,
    };
    const { user } = setup(
      <MockedSisenseContextProvider>
        <CriteriaFilterTile {...propsTopRank} />
      </MockedSisenseContextProvider>,
    );
    const textElt = screen.getByText(`All items top 5 by ${mockMeasureB.name}`);
    expect(textElt).toBeInTheDocument();
    await user.click(screen.getByLabelText('arrow-down'));
    expect(textElt).not.toBeInTheDocument();
    expect(screen.getByText('By measure')).toBeInTheDocument();
    expect(screen.getByLabelText(mockMeasureB.name)).toBeChecked();
  });

  it('renders dropdown for horizontal ranked variant', async () => {
    const propsTopRank: CriteriaFilterTileProps = {
      title: 'Test Title',
      filter: filterFactory.bottomRanking(mockAttribute, mockMeasureA, 5) as RankingFilter,
      arrangement: 'horizontal',
      onUpdate: vi.fn(),
      measures,
    };
    const { user } = setup(
      <MockedSisenseContextProvider>
        <CriteriaFilterTile {...propsTopRank} />
      </MockedSisenseContextProvider>,
    );
    const label = screen.getByText('Last');
    expect(label).toBeInTheDocument();
    const button1 = screen.getByText('avg Revenue');
    expect(button1).toBeInTheDocument();
    await user.click(button1);
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    const item = screen.getByText('max Revenue');
    expect(item).toBeInTheDocument();
    await user.click(item);
    expect(propsTopRank.onUpdate).toHaveBeenCalledWith({
      ...filterFactory.bottomRanking(mockAttribute, mockMeasureC, 5),
      guid: expect.any(String),
    });
    expect(button1).not.toBeInTheDocument();
    expect(screen.getByText('max Revenue')).toBeInTheDocument();
  });

  it('should not have delete button by default', async () => {
    const { queryByTestId } = render(
      <MockedSisenseContextProvider>
        <CriteriaFilterTile {...propsBetween} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = queryByTestId('filter-delete-button');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should have delete button if onDelete is provided', async () => {
    const { findByTestId } = render(
      <MockedSisenseContextProvider>
        <CriteriaFilterTile {...propsBetween} onDelete={() => {}} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const { findByTestId } = render(
      <MockedSisenseContextProvider>
        <CriteriaFilterTile {...propsBetween} onDelete={onDelete} />
      </MockedSisenseContextProvider>,
    );
    const deleteButton = await findByTestId('filter-delete-button');
    deleteButton.click();
    expect(onDelete).toHaveBeenCalled();
  });
});
