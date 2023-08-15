import React from 'react';

interface Props {
  /**
   * Highcharts chart configuration object.
   * Please refer to the Highcharts (API documentation)[https://api.highcharts.com/highcharts/].
   */
  options: object;
}

export const MockedHighchartsWrapper = ({ options }: Props) => {
  return <div>{JSON.stringify(options)}</div>;
};
