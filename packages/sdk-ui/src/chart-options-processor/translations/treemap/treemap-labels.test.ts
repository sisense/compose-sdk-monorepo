import { treemapLabelFormatter } from './treemap-labels';
import { PointLabelObject } from '@sisense/sisense-charts';

describe('Treemap Chart labels formatter', () => {
  it('should prepare small label', () => {
    const point = {
      color: 'white',
      key: 'Test',
      point: {
        shapeArgs: {
          width: 100,
          height: 100,
        },
        options: {
          custom: {
            level: 3,
            levelsCount: 3,
          },
        },
      },
    } as unknown as PointLabelObject;

    expect(treemapLabelFormatter.call(point)).toMatchSnapshot();
  });

  it('should prepare small label with light label text', () => {
    const point = {
      color: 'black',
      key: 'Test',
      point: {
        shapeArgs: {
          width: 100,
          height: 100,
        },
        options: {
          custom: {
            level: 3,
            levelsCount: 3,
          },
        },
      },
    } as unknown as PointLabelObject;

    expect(treemapLabelFormatter.call(point)).toMatchSnapshot();
  });

  it('should prepare big label', () => {
    const point = {
      color: 'white',
      key: 'Test',
      point: {
        shapeArgs: {
          width: 100,
          height: 100,
        },
        options: {
          custom: {
            level: 1,
            levelsCount: 3,
            bigLabelSpacing: true,
          },
        },
      },
    } as unknown as PointLabelObject;

    expect(treemapLabelFormatter.call(point)).toMatchSnapshot();
  });

  it('should skip big label in case of point small size', () => {
    const point = {
      color: 'white',
      key: 'Test',
      point: {
        shapeArgs: {
          width: 20,
          height: 20,
        },
        options: {
          custom: {
            level: 1,
            levelsCount: 3,
            bigLabelSpacing: false,
          },
        },
      },
    } as unknown as PointLabelObject;

    expect(treemapLabelFormatter.call(point)).toMatchSnapshot();
  });

  it('should skip small label in case of point small size', () => {
    const point = {
      color: 'white',
      key: 'Test',
      point: {
        shapeArgs: {
          width: 10,
          height: 10,
        },
        options: {
          custom: {
            level: 3,
            levelsCount: 3,
          },
        },
      },
    } as unknown as PointLabelObject;

    expect(treemapLabelFormatter.call(point)).toMatchSnapshot();
  });
});
