import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { QueryResultData } from '@sisense/sdk-data';
import { Datum } from 'plotly.js';
import { DataPointsEventHandler } from '../../props';
import { MenuPosition } from '../../types';

type Props = {
  rawData: QueryResultData;
  onDataPointsSelected: DataPointsEventHandler;
  onContextMenu: (menuPosition: MenuPosition) => void;
};

const generateTrace = (
  data: { [key: string]: Datum }[],
  name: string,
  markerColor: string,
): Partial<Plotly.ScatterData> => ({
  type: 'scatter',
  x: data.map((d) => d.revenue),
  y: data.map((d) => d.category),
  mode: 'markers',
  name: name,
  marker: {
    color: markerColor,
    line: {
      width: 1,
    },
    symbol: 'circle',
    size: 16,
  },
});

export const PlotlyDotChart: React.FC<Props> = ({
  rawData,
  onDataPointsSelected: onSelected,
  onContextMenu,
}) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  useEffect(() => {
    const filteredCountries = selectedColumns.filter((category) =>
      rawData.rows.some((row) => row[0].data === category),
    );

    if (filteredCountries.length !== selectedColumns.length) {
      setSelectedColumns(filteredCountries);
    }
  }, [selectedColumns, rawData]);

  const data = rawData.rows.map(([category, revenue]) => ({
    category: category.data as string,
    revenue: revenue.data as string | number,
  }));

  const getColorForCountry = (category: string) => {
    return selectedColumns.includes(category) ? 'orange' : 'lightgreen';
  };

  const trace = generateTrace(data, 'Revenue', 'lightgreen');

  const coloredTrace = {
    ...trace,
    marker: {
      ...trace.marker,
      color: data.map((d) => getColorForCountry(d.category)),
    },
  };

  const layout = {
    title: `Revenue by ${rawData.columns[0].name}`,
    // ... (other layout properties as needed)
  };

  const handlePlotClick = (eventData: Plotly.PlotMouseEvent) => {
    const clickedIndex = eventData.points[0].pointNumber;
    const selectedCountry = data[clickedIndex].category;
    const newselectedColumns = selectedColumns.includes(selectedCountry)
      ? selectedColumns.filter((country) => country !== selectedCountry)
      : [...selectedColumns, selectedCountry];

    setSelectedColumns(newselectedColumns);

    onSelected(
      newselectedColumns.map((category) => ({
        value: undefined,
        categoryValue: category,
        categoryDisplayValue: category,
        seriesValue: undefined,
      })),
      eventData.event,
    );
  };

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      if (!selectedColumns.length) return;
      event.preventDefault();
      onContextMenu({ left: event.clientX, top: event.clientY });
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [selectedColumns, onSelected, onContextMenu]);

  return (
    <Plot
      data={[coloredTrace]}
      layout={layout}
      config={{ responsive: true }}
      onClick={handlePlotClick}
    />
  );
};
