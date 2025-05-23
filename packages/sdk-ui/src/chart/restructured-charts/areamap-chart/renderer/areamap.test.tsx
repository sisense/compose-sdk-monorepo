/** @vitest-environment jsdom */

import { countriesGeoJson } from './__mocks__/countries-geo-json.js';
import { countriesGeoData } from './__mocks__/countries-geo-data.js';
import { render } from '@testing-library/react';
import { Areamap } from './areamap.js';
import { AreamapChartDesignOptions } from '../types.js';

// mock useGeoJson hook
vi.mock('./use-geo-json.js', () => ({
  useGeoJson: () => ({
    geoJson: countriesGeoJson,
  }),
}));

// mock AreamapMap component
vi.mock('./areamap-map.js', () => ({
  AreamapMap: () => <div>Mock AreamapMap</div>,
}));

describe('Areamap', () => {
  it('renders Areamap component with AreamapMap inside', async () => {
    const { findByText } = render(
      <Areamap
        chartData={{ type: 'areamap', geoData: countriesGeoData }}
        dataOptions={{
          color: {
            column: {
              name: 'color',
              title: 'Color',
            },
          },
          geo: {
            column: {
              name: 'geo',
              type: 'string',
            },
          },
        }}
        designOptions={
          {
            mapType: 'world',
          } as AreamapChartDesignOptions
        }
      />,
    );

    expect(await findByText('Mock AreamapMap')).toBeDefined();
  });
});
