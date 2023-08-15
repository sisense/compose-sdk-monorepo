function _1(md) {
  return md`
# Multiple Histograms
  `;
}

function _data(FileAttachment) {
  return FileAttachment('athletes.csv').csv({ typed: true });
}

function _chart(Plot, data) {
  return Plot.rectY(data, Plot.binX({ y: 'count' }, { x: 'weight', fill: 'sex' })).plot();
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() {
    return this.url;
  }
  const fileAttachments = new Map([
    [
      'athletes.csv',
      {
        url: new URL(
          './files/31ca24545a0603dce099d10ee89ee5ae72d29fa55e8fc7c9ffb5ded87ac83060d80f1d9e21f4ae8eb04c1e8940b7287d179fe8060d887fb1f055f430e210007c.csv',
          import.meta.url,
        ),
        mimeType: 'text/csv',
        toString,
      },
    ],
  ]);
  main.builtin(
    'FileAttachment',
    runtime.fileAttachments((name) => fileAttachments.get(name)),
  );
  main.variable(observer()).define(['md'], _1);
  main.variable(observer('data')).define('data', ['FileAttachment'], _data);
  main.variable(observer('chart')).define('chart', ['Plot', 'data'], _chart);
  return main;
}
