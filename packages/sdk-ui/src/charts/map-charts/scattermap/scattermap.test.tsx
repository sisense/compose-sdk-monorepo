import { fireEvent, render, waitFor } from '@testing-library/react';
import { Scattermap } from '@/charts/map-charts/scattermap/scattermap';
import { ScattermapChartDataOptionsInternal } from '@/chart-data-options/types';
import { scattermapData } from '@/chart-data/scattermap-data';
import { ScattermapChartDesignOptions } from '@/chart-options-processor/translations/design-options';
import { DataTable } from '@/chart-data-processor/table-processor';
import { SisenseContext } from '@/sisense-context/sisense-context';
import { HttpClient } from '@sisense/sdk-rest-client/src/http-client';
import { ClientApplication } from '@/app/client-application';

const dataSet = {
  columns: [
    { name: 'Country', type: 'string', index: 0 },
    { name: 'Lat', type: 'number', index: 1 },
    { name: 'Lng', type: 'number', index: 2 },
    { name: 'Quantity', type: 'number', index: 3 },
  ],
  rows: [
    [
      { displayValue: 'Canada' },
      { displayValue: 55.5859012851966 },
      { displayValue: -105.750595856519 },
      { displayValue: 6781 },
    ],
    [
      { displayValue: 'United States' },
      { displayValue: 37.201902 },
      { displayValue: -113.187854 },
      { displayValue: 4012 },
    ],
    [
      { displayValue: 'Albania' },
      { displayValue: 40.641089555859 },
      { displayValue: 20.1566908111252 },
      { displayValue: 4471 },
    ],
    [
      { displayValue: 'Algeria' },
      { displayValue: 28.1632395923063 },
      { displayValue: 2.63238813336793 },
      { displayValue: 1812 },
    ],
    [
      { displayValue: 'Argentina' },
      { displayValue: -36.252002 },
      { displayValue: -63.954193 },
      { displayValue: 5001 },
    ],
    [
      { displayValue: 'Bermuda' },
      { displayValue: 32.3179203152518 },
      { displayValue: -64.7370103996652 },
      { displayValue: 4001 },
    ],
    [
      { displayValue: 'Kyrgyzstan' },
      { displayValue: 41.465053955426 },
      { displayValue: 74.5555962804371 },
      { displayValue: 4242 },
    ],
    [
      { displayValue: 'Ukraine' },
      { displayValue: 49.3227937844972 },
      { displayValue: 31.3202829593814 },
      { displayValue: 936 },
    ],
  ],
} as unknown as DataTable;

const cat1 = {
  column: {
    name: 'Country',
    type: 'string',
  },
};
const cat2 = {
  column: { name: 'Lat', type: 'number' },
};
const cat3 = {
  column: {
    name: 'Lng',
    type: 'number',
  },
};

const meas1 = { column: { name: 'Quantity', aggregation: 'sum' } };

const designOptions = {
  markers: {
    size: {
      minSize: 5,
      maxSize: 15,
      defaultSize: 10,
    },
    fill: 'filled',
  },
} as ScattermapChartDesignOptions;
describe('Scattermap Chart', () => {
  it('render a scattermap with coordinates', async () => {
    const dataOptions = {
      locations: [cat2, cat3],
      size: meas1,
      locationLevel: 'country',
      colorBy: meas1,
    } as ScattermapChartDataOptionsInternal;
    render(
      <Scattermap
        dataSource={'test'}
        dataOptions={dataOptions}
        chartData={scattermapData(dataOptions, dataSet)}
        designOptions={designOptions}
      />,
    );

    await waitFor(() => {
      const map = document.querySelector('.csdk-map-container');
      expect(map).toBeDefined();
      const markers = document.querySelectorAll('.leaflet-interactive');
      expect(markers.length).toBe(8);

      Array.from(markers).forEach((marker) => expect(marker.getAttribute('fill')).toBe('#00cee6'));
    });
  });

  it('render a scattermap with geo names', async () => {
    const dataOptions = {
      locations: [cat1],
      size: meas1,
      locationLevel: 'auto',
    } as ScattermapChartDataOptionsInternal;
    const chartData = scattermapData(dataOptions, dataSet);

    const { findByText } = render(
      <SisenseContext.Provider
        value={{
          app: {
            httpClient: {
              post: () => {
                return Promise.resolve(
                  chartData.locations
                    // Filter one of values to pass missing item response case
                    .filter((location) => location.name !== 'Kyrgyzstan')
                    .map((location) => {
                      return {
                        _id: '1',
                        lookupKey: '',
                        placetype: null,
                        context: null,
                        err: null,
                        latLng: {
                          lat: 1,
                          lng: 1,
                        },
                        name: location.name,
                        place_name: location.name,
                        text: location.name,
                        version: '1',
                      };
                    }),
                );
              },
              get: () => {
                return Promise.resolve({
                  geo: {
                    maps_api_provider: 'https://api.mapbox.com/',
                  },
                });
              },
            } as unknown as HttpClient,
          } as ClientApplication,
          isInitialized: true,
          tracking: {
            enabled: false,
            packageName: 'sdk-ui',
          },
          errorBoundary: {
            showErrorBox: true,
          },
        }}
      >
        <Scattermap
          dataSource={'test'}
          dataOptions={dataOptions}
          chartData={chartData}
          designOptions={designOptions}
        />
      </SisenseContext.Provider>,
    );

    await waitFor(async () => {
      const map = document.querySelector('.csdk-map-container');
      expect(map).toBeDefined();

      const copyright = await findByText('OpenStreetMap');
      expect(copyright).toBeDefined();

      const markers = document.querySelectorAll('.leaflet-interactive');
      expect(markers.length).toBe(7);
    });
  });

  it('render a scattermap and call tooltip', async () => {
    const dataOptions = {
      locations: [cat2, cat3],
      size: meas1,
      locationLevel: 'country',
    } as ScattermapChartDataOptionsInternal;
    render(
      <Scattermap
        dataSource={'test'}
        dataOptions={dataOptions}
        chartData={scattermapData(dataOptions, dataSet)}
        designOptions={designOptions}
      />,
    );

    await waitFor(() => {
      const markers = document.querySelectorAll('.leaflet-interactive');
      fireEvent.click(markers[0]);
      const tooltip = document.querySelector('.leaflet-tooltip');
      expect(tooltip?.innerHTML).toMatchSnapshot();
    });
  });
});
