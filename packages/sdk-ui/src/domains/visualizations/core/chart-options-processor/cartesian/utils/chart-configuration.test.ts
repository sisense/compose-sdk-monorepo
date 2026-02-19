import { AxisSettings } from '../../translations/axis-section.js';
import { withXAxisLabelPositioning, withYAxisLabelPositioning } from './chart-configuration.js';

describe('withXAxisLabelPositioning', () => {
  it('should return a curried function that applies X-axis positioning', () => {
    // Arrange
    const xAxisSettings: AxisSettings[] = [
      {
        plotBands: [
          {
            from: 0,
            to: 1,
            label: {
              text: 'Test Band',
              x: 5,
              y: 10,
            },
          },
        ],
      },
    ];

    const config = {
      totalLabelRightSpacing: 20,
      totalLabelTopSpacing: 30,
    };

    // Act
    const positionLabels = withXAxisLabelPositioning(config);
    const result = positionLabels(xAxisSettings);

    // Assert
    expect(typeof positionLabels).toBe('function');
    expect(result).not.toBe(xAxisSettings);

    const expectedXAdjustment = 20 + 15; // totalLabelRightSpacing + ADDITIONAL_SPACING
    const expectedYAdjustment = 30 + 15; // totalLabelTopSpacing + ADDITIONAL_SPACING
    expect(result[0].plotBands?.[0].label?.x).toBe(5 + expectedXAdjustment);
    expect(result[0].plotBands?.[0].label?.y).toBe(10 - expectedYAdjustment);
  });

  it('should allow for partial application and reuse', () => {
    // Arrange
    const config = {
      totalLabelRightSpacing: 10,
      totalLabelTopSpacing: 15,
    };

    const xAxisSettings1: AxisSettings[] = [
      {
        plotBands: [
          {
            from: 0,
            to: 1,
            label: { text: 'Band 1', x: 0, y: 0 },
          },
        ],
      },
    ];

    const xAxisSettings2: AxisSettings[] = [
      {
        plotBands: [
          {
            from: 0,
            to: 1,
            label: { text: 'Band 2', x: 5, y: 5 },
          },
        ],
      },
    ];

    // Act
    const positionLabels = withXAxisLabelPositioning(config);
    const result1 = positionLabels(xAxisSettings1);
    const result2 = positionLabels(xAxisSettings2);

    // Assert - Same transformation function can be reused
    const expectedAdjustment = 10 + 15; // config + ADDITIONAL_SPACING
    expect(result1[0].plotBands?.[0].label?.x).toBe(0 + expectedAdjustment);
    expect(result2[0].plotBands?.[0].label?.x).toBe(5 + expectedAdjustment);
  });
});

describe('withYAxisLabelPositioning', () => {
  it('should return a curried function that applies Y-axis positioning', () => {
    // Arrange
    const yAxisSettings: AxisSettings[] = [
      {
        stackLabels: {
          style: { fontSize: '12px' },
          crop: false,
          allowOverlap: false,
          enabled: true,
          rotation: 0,
          labelrank: 1,
          x: 10,
          y: 20,
        },
      },
    ];

    const config = {
      rightShift: 100,
      topShift: 200,
    };

    // Act
    const positionLabels = withYAxisLabelPositioning(config);
    const result = positionLabels(yAxisSettings);

    // Assert
    expect(typeof positionLabels).toBe('function');
    expect(result).not.toBe(yAxisSettings);
    expect(result[0].stackLabels?.x).toBe(110);
    expect(result[0].stackLabels?.y).toBe(220);
  });

  it('should allow for composition with other functional operations', () => {
    // Arrange
    const yAxisSettings: AxisSettings[] = [
      {
        stackLabels: {
          style: { fontSize: '12px' },
          crop: false,
          allowOverlap: false,
          enabled: true,
          rotation: 0,
          labelrank: 1,
          x: 0,
          y: 0,
        },
      },
      {
        stackLabels: {
          style: { fontSize: '14px' },
          crop: false,
          allowOverlap: false,
          enabled: true,
          rotation: 0,
          labelrank: 2,
          x: 0,
          y: 0,
        },
      },
    ];

    const config = {
      rightShift: 25,
      topShift: 50,
    };

    // Act - Example of composing with array operations
    const positionLabels = withYAxisLabelPositioning(config);
    const result = positionLabels(yAxisSettings);
    const enabledAxes = result.filter((axis) => axis.stackLabels?.enabled);

    // Assert
    expect(enabledAxes).toHaveLength(2);
    expect(enabledAxes[0].stackLabels?.x).toBe(25);
    expect(enabledAxes[0].stackLabels?.y).toBe(50);
    expect(enabledAxes[1].stackLabels?.x).toBe(25);
    expect(enabledAxes[1].stackLabels?.y).toBe(50);
  });
});
