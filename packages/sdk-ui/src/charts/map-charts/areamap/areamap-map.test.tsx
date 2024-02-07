/** @vitest-environment jsdom */

// explicit import as workaround for 'Vitest' plugin in VSCode
// https://github.com/IanVS/vitest-fetch-mock/issues/4
import '../../../__test-helpers__/setup-vitest';

import { render, waitFor } from '@testing-library/react';
import { AreamapMap } from './areamap-map.js';
import { countriesGeoJson } from './__mocks__/countries-geo-json.js';
import { countriesGeoData } from './__mocks__/countries-geo-data.js';

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
