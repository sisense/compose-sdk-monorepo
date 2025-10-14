/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// NOTE: This file is not necessary if we put the following code
// inside @sisense/sisense-charts
import Highcharts from '@sisense/sisense-charts';
import highchartsRoundedCorners from 'highcharts-rounded-corners';

export const applyHighchartOverrides = () => {
  (function (H: any) {
    // Use the legend drawing method from area
    // Based off of https://stackoverflow.com/a/17990505
    H.seriesTypes.line.prototype.drawLegendSymbol = H.seriesTypes.area.prototype.drawLegendSymbol;

    // Use blur effect for treemap chart
    Highcharts.wrap(
      Highcharts.Series.types.treemap.prototype,
      'pointAttribs',
      function (this: Highcharts.Series, original, ...args) {
        const attr = original.call(this, ...args);
        const point: Highcharts.Point = args[0];
        if (point.options.custom?.blur) {
          attr.fill = Highcharts.color(point.color as string)
            .setOpacity(0.2)
            .get('rgba');
          attr.stroke = Highcharts.color(attr.stroke as string)
            .setOpacity(0.2)
            .get('rgba');
        }
        return attr;
      },
    );
  })(Highcharts);

  // todo: move the Highcharts improvement, which prevents handlers memoization, into "sisense-charts" package
  (function (H: any) {
    H.Point.prototype.importEvents = function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const point = this;

      if (this.importedEvents) {
        this.importedEvents.forEach(function (unbinder: any) {
          unbinder();
        });
      }

      this.importedEvents = [];

      const options = H.merge(point.series.options.point, point.options),
        events = options.events;

      point.events = events;

      H.objectEach(events, function (event: any, eventType: any) {
        if (H.isFunction(event)) {
          point.importedEvents.push(H.addEvent(point, eventType, event));
        }
      });
    };
  })(Highcharts);

  highchartsRoundedCorners(Highcharts);
};
