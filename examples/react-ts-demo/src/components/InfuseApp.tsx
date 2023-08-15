/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import {
  IndicatorChart,
  IndicatorChartProps,
  IndicatorStyleOptions,
  NumberFormatConfig,
} from '@sisense/sdk-ui';
import { useState } from 'react';
import { MdQuestionMark } from 'react-icons/md';
import { CustomChart } from './semiconductor/BinWaferMap';
import { HighchartsOptions } from '@sisense/sdk-ui/dist/chart-options-processor/chart_options_service';

const sparkOptions = (data: number[]): HighchartsOptions => ({
  title: {
    text: '',
  },
  chart: {
    renderTo: 'container',
    width: 120,
    height: 20,
    type: 'area',
    margin: [2, 0, 2, 0],
    style: {
      overflow: 'visible',
    },
  },
  yAxis: {
    endOnTick: false,
    startOnTick: false,
    labels: {
      enabled: false,
    },
    title: {
      text: null,
    },
    tickPositions: [0],
  },
  xAxis: {
    labels: {
      enabled: false,
    },
    title: {
      text: null,
    },
    startOnTick: false,
    endOnTick: false,
    tickPositions: [],
  },
  plotOptions: { series: { dataLabels: { enabled: false }, marker: { enabled: false } } },
  legend: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  series: [{ type: 'area', data }],
});

const defaultNumberFormat: NumberFormatConfig = {
  name: 'Percent',
  decimalScale: 'auto',
  trillion: true,
  billion: true,
  million: true,
  kilo: true,
  thousandSeparator: true,
  prefix: true,
  symbol: '$',
};

const sparklineData = [
  3, 4, 7, 5, 8, 9, 7, 9, 12, 11, 9, 15, 27, 13, 22, 24, 21, 26, 28, 29, 22, 23, 23, 29, 31, 37, 34,
  48, 52, 60,
];

const data = {
  columns: [
    { name: 'Managers', type: 'number' },
    { name: 'Min', type: 'number' },
    { name: 'Max', type: 'number' },
  ],
  rows: [['0.75', '0', '1.0']],
};

const productManagersPercent = '75%';

const indicatorStyleOptions: IndicatorStyleOptions = {
  indicatorComponents: {
    title: {
      shouldBeShown: true,
      text: 'Product Managers',
    },
    secondaryTitle: {
      text: '',
    },
    ticks: {
      shouldBeShown: true,
    },
    labels: {
      shouldBeShown: true,
    },
  },
  subtype: 'indicator/gauge',
  skin: 1,
};

const indicatorArgs: IndicatorChartProps = {
  dataSet: data,
  dataOptions: {
    value: [
      {
        column: { name: 'Managers', aggregation: 'sum', title: 'Managers' },
        numberFormatConfig: defaultNumberFormat,
      },
    ],
    secondary: [],
    min: [{ name: 'Min', aggregation: 'min', title: 'Min' }],
    max: [{ name: 'Max', aggregation: 'max', title: 'Max' }],
  },
  styleOptions: indicatorStyleOptions,
};

export const InfuseApp = () => {
  const [infoDialog, setInfoDialog] = useState(false);

  return (
    <>
      <div
        style={{
          borderBottom: '1px solid lightgray',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div style={{ height: '100%', minWidth: '71px', maxWidth: '72px' }}>
          <img src={'/seismicnav.png'}></img>
        </div>
        <div
          style={{
            flexGrow: '1',
            borderLeft: '1px solid lightgray',
            backgroundColor: 'rgb(243, 244, 246)',
          }}
        >
          <div style={{ backgroundColor: 'white' }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <img
                style={{ left: '0px' }}
                width={'235px'}
                height={'50px'}
                src={'/seismiclogo.png'}
              ></img>
              <div style={{ flexGrow: '1' }} />
              <img
                style={{ padding: '5px' }}
                width={'280px'}
                height={'20px'}
                src={'/seismicsearch.png'}
              ></img>
              <div style={{ flexGrow: '1' }} />
              <img
                style={{ right: '0px' }}
                width={'165px'}
                height={'45px'}
                src={'/seismicuser.png'}
              ></img>
            </div>
          </div>
          <div style={{ width: 'calc(100vw - 200px)', height: '110px', overflow: 'clip' }}>
            <div style={{ width: '1790px', height: '110px' }}>
              <img style={{ objectPosition: '0% 0%' }} src={'/seismicbanner.png'}></img>
            </div>
          </div>
          <div>
            <div style={{ top: '0px', paddingTop: '30px', paddingLeft: '45px' }}>
              <img width={'219px'} height={'219px'} src={'/seismicnew.png'}></img>
            </div>
            <style>
              {`.info-icon:hover {
                background-color: #DDDDEE;
                color: white;
                font-size: 2em
              }
              .info-dialog:hover {
                background-color: #DDDDEE;
                color: white;
                font-size: 2em
              }
              .info-dialog{
                position: relative;
                border: 1px solid #73a7f0;
                width: 200px;
                margin-left: 20px;
                padding: 5px 14px;
                border-radius: 4px;
                -webkit-border-radius: 4px;
                -moz-border-radius: 4px;
                box-shadow: 0px 0px 6px rgba(0, 0, 0, .7);
                -webkit-box-shadow: -0px 0px 6px rgba(0, 0, 0, .7);
                -moz-box-shadow: 0px 0px 6px rgba(0, 0, 0, .7);
            }
            .info-dialog:before{
                content: ' ';
                display: block;
                position: absolute;
                left: -8px;
                top: 100px;
                width: 14px;
                height: 14px;
                border-color: #73a7f0;
                border-width: 1px;
                border-style: none none solid solid;
                background-color: #fff;
                box-shadow: -2px 2px 3.5px rgba(0, 0, 0, .5);
                -webkit-box-shadow: -2px 2px 3.5px rgba(0, 0, 0, .5);
                -moz-box-shadow: -2px 2px 3.5px rgba(0, 0, 0, .5);
                transform: rotate(45deg);
                -webkit-transform: rotate(45deg);
                -moz-transform: rotate(45deg);
            }
              `}
            </style>
            <div
              onClick={() => setInfoDialog(true)}
              className={'info-icon'}
              style={{
                color: '#333333',
                display: 'flex',
                alignItems: 'center',
                height: '19px',
                width: '19px',
                borderRadius: '50%',
                zIndex: '100',
                top: '485px',
                left: '410px',
                position: 'absolute',
                border: '1px solid darkgray',
              }}
            >
              <MdQuestionMark />
            </div>
            {infoDialog && (
              <div
                onMouseLeave={() => setInfoDialog(false)}
                className={'info-dialog'}
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  fontSize: '14px',
                  background: 'white',
                  color: 'black',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '250px',
                  width: '250px',
                  zIndex: '200',
                  top: '400px',
                  left: '425px',
                  borderRadius: '20px',
                  position: 'absolute',
                  border: '1px solid darkgray',
                }}
              >
                <div>
                  {`Don't miss out! ${productManagersPercent} of Product Managers have already seen this!`}
                </div>
                <div style={{ paddingTop: '20px' }}>
                  <IndicatorChart {...indicatorArgs} />
                </div>
              </div>
            )}
            <div style={{ paddingTop: '30px', paddingLeft: '30px' }}>
              <img width={'846px'} height={'235px'} src={'/seismicfeatured.png'}></img>
            </div>
            <div style={{ position: 'absolute', zIndex: '100', top: '710px', left: '815px' }}>
              <span style={{ fontSize: '12px' }}>Popularity is growing!</span>
              <CustomChart options={sparkOptions(sparklineData)} />
            </div>
            <div style={{ top: '0px', paddingTop: '20px', paddingLeft: '45px' }}>
              <img width={'675px'} height={'275px'} src={'/seismiclanding.png'}></img>
            </div>
            <div style={{ top: '0px', paddingTop: '20px', paddingLeft: '45px' }}>
              <img width={'675px'} height={'600px'} src={'/seismicother.png'}></img>
            </div>
            <div style={{ flexGrow: '1' }}></div>
          </div>
        </div>
      </div>
    </>
  );
};
