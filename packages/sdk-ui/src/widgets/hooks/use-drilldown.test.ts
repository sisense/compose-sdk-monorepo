import { createAttribute } from '@sisense/sdk-data';
import { useDrilldown } from './use-drilldown.js';
import { renderHook } from '@testing-library/react';
import { act } from 'react';

const ageRange = createAttribute({
  name: 'Age Range',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});

const gender = createAttribute({
  name: 'Gender',
  type: 'text-attribute',
  expression: '[Commerce.Gender]',
});

const category = createAttribute({
  name: 'Category',
  type: 'text-attribute',
  expression: '[Commerce.Category]',
});

const openMenuMock = vi.fn();

describe('useDrilldown', () => {
  beforeEach(() => {
    openMenuMock.mockClear();
  });

  it('should return correct initial drilldown props', () => {
    const { result } = renderHook(() =>
      useDrilldown({
        drilldownSelections: [
          {
            points: [
              {
                categoryValue: 'Male',
              },
            ],
            nextDimension: category,
          },
        ],
        drilldownPaths: [ageRange],
        initialDimension: gender,
        openMenu: openMenuMock,
      }),
    );

    const { drilldownDimension, drilldownFilters, breadcrumbs, openDrilldownMenu } = result.current;
    expect(drilldownDimension).toStrictEqual(category);
    expect(drilldownFilters).toMatchObject([{ attribute: gender, members: ['Male'] }]);
    expect(breadcrumbs).toBeDefined();
    expect(openDrilldownMenu).toBeInstanceOf(Function);
  });

  it('should open menu by running openDrilldownMenu', () => {
    const menuPosition = {
      left: 10,
      top: 20,
    };
    const { result } = renderHook(() =>
      useDrilldown({
        drilldownSelections: [
          {
            points: [
              {
                categoryValue: 'Male',
              },
            ],
            nextDimension: category,
          },
        ],
        drilldownPaths: [ageRange],
        initialDimension: gender,
        openMenu: openMenuMock,
      }),
    );

    const { openDrilldownMenu } = result.current;

    act(() => openDrilldownMenu(menuPosition, []));

    expect(openMenuMock.mock.lastCall[0].position).toStrictEqual(menuPosition);
    expect(openMenuMock.mock.lastCall[0].itemSections[0].id).toBe(
      'drilldown-chart-points-selection',
    );
    expect(openMenuMock.mock.lastCall[0].itemSections[1].id).toBe('drilldown-drill-directions');
    expect(openMenuMock.mock.lastCall[0].itemSections[1].items[0].caption).toBe(ageRange.name);
  });

  it('should make selection via menu item', () => {
    const onDrilldownSelectionsChange = vi.fn();
    const menuPosition = {
      left: 10,
      top: 20,
    };
    const params = {
      drilldownSelections: [
        {
          points: [
            {
              categoryValue: 'Male',
            },
          ],
          nextDimension: category,
        },
      ],
      drilldownPaths: [ageRange],
      initialDimension: gender,
      openMenu: openMenuMock,
      onDrilldownSelectionsChange,
    };
    const { result } = renderHook(() => useDrilldown(params));

    const { openDrilldownMenu } = result.current;

    act(() =>
      openDrilldownMenu(menuPosition, [
        {
          categoryValue: 'Cell Phones',
        },
      ]),
    );

    act(() => openMenuMock.mock.lastCall[0].itemSections[1].items[0].onClick());

    expect(onDrilldownSelectionsChange.mock.lastCall[0][0]).toMatchObject(
      params.drilldownSelections[0],
    );
    expect(onDrilldownSelectionsChange.mock.lastCall[0][1]).toMatchObject({
      points: [
        {
          categoryValue: 'Cell Phones',
        },
      ],
      nextDimension: ageRange,
    });
  });
});
