/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// NOTE: This file is not necessary if we put the following code
// inside @sisense/sisense-charts
import Highcharts from '@sisense/sisense-charts';

(function (H: any) {
  // Use the legend drawing method from area
  // Based off of https://stackoverflow.com/a/17990505
  H.seriesTypes.line.prototype.drawLegendSymbol = H.seriesTypes.area.prototype.drawLegendSymbol;
})(Highcharts);
