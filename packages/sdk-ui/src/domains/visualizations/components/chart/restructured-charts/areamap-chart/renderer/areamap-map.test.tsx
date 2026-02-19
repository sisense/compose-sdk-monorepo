/** @vitest-environment jsdom */
import { render, waitFor } from '@testing-library/react';

import { countriesGeoData } from './__mocks__/countries-geo-data.js';
import { countriesGeoJson } from './__mocks__/countries-geo-json.js';
import { AreamapMap } from './areamap-map.js';

describe('AreamapMap', () => {
  it('renders map container', () => {
    const { container } = render(
      <AreamapMap
        geoJson={countriesGeoJson}
        geoData={countriesGeoData}
        dataOptions={{ originalValueTitle: 'Original Value' }}
        mapType="world"
      />,
    );

    expect(container).toBeInTheDocument();
  });

  it('should render areas for all countries of geoJson (without Antarctica)', async () => {
    const { container } = render(
      <AreamapMap
        geoJson={countriesGeoJson}
        geoData={countriesGeoData}
        dataOptions={{ originalValueTitle: 'Original Value' }}
        mapType="world"
      />,
    );
    await waitFor(() => {
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeDefined();
    });
    const areas = container.querySelectorAll('path');
    // -1 because Antarctica shouldn't be rendered
    expect(areas.length).toBe(countriesGeoJson.features.length - 1);
  });
});
