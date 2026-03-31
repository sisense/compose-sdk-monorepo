export const messages = {
  xAxis: 'X-Axis',
  gridLines: 'Grid Lines',
  labels: 'Labels',
  title: 'Title',
  x2Title: 'X2 Title',
  logarithmic: 'Logarithmic',
  min: 'Min',
  auto: 'Auto',
  max: 'Max',
  interval: 'Interval',
  lineType: 'Line Type',
  straight: 'Straight',
  smooth: 'Smooth',
};

export const useIntl = () => {
  return { formatMessage: (message: string) => message || 'unknown message' };
};
