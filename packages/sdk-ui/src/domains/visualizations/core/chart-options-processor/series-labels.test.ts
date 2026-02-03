import { SeriesLabels } from '../../../../types';
import { prepareDataLabelsOptions } from './series-labels';

describe('prepareDataLabelsOptions', () => {
  describe('when seriesLabels is undefined', () => {
    it('should return object with enabled: false', () => {
      const result = prepareDataLabelsOptions(undefined);

      expect(result).toEqual({
        enabled: false,
      });
    });
  });

  describe('when seriesLabels is empty object', () => {
    it('should return object with enabled: false', () => {
      const seriesLabels: SeriesLabels = { enabled: false };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: false,
      });
    });
  });

  describe('enabled property', () => {
    it('should map enabled: true correctly', () => {
      const seriesLabels: SeriesLabels = { enabled: true };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
      });
    });

    it('should map enabled: false correctly', () => {
      const seriesLabels: SeriesLabels = { enabled: false };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: false,
      });
    });
  });

  describe('rotation property', () => {
    it('should map rotation when defined', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        rotation: 45,
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        rotation: 45,
      });
    });

    it('should not include rotation when undefined', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        rotation: undefined,
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
      });
      expect(result).not.toHaveProperty('rotation');
    });
  });

  describe('alignment properties', () => {
    it('should map alignInside to inside', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        alignInside: true,
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        inside: true,
      });
    });

    it('should map align to align', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        align: 'left',
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        align: 'left',
      });
    });

    it('should map verticalAlign to verticalAlign', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        verticalAlign: 'top',
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        verticalAlign: 'top',
      });
    });
  });

  describe('style properties', () => {
    it('should map style object', () => {
      const textStyle = { fontSize: '12px', color: 'red' };
      const seriesLabels: SeriesLabels = {
        enabled: true,
        textStyle,
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        style: textStyle,
      });
    });

    it('should map backgroundColor', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        backgroundColor: '#ff0000',
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        backgroundColor: '#ff0000',
      });
    });

    it('should map borderColor', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        borderColor: '#00ff00',
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        borderColor: '#00ff00',
      });
    });

    it('should map borderRadius', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        borderRadius: 5,
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        borderRadius: 5,
      });
    });

    it('should map borderWidth', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        borderWidth: 2,
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        borderWidth: 2,
      });
    });

    it('should map padding', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        padding: 10,
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        padding: 10,
      });
    });
  });

  describe('offset properties', () => {
    it('should map xOffset to x', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        xOffset: 15,
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        x: 15,
      });
    });

    it('should map yOffset to y', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        yOffset: -10,
      };
      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        y: -10,
      });
    });
  });

  describe('combined properties', () => {
    it('should handle multiple properties correctly', () => {
      const textStyle = { fontSize: '14px', fontWeight: 'bold' };
      const seriesLabels: SeriesLabels = {
        enabled: true,
        rotation: 30,
        alignInside: false,
        align: 'center',
        verticalAlign: 'middle',
        textStyle,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 3,
        borderWidth: 1,
        padding: 8,
        xOffset: 5,
        yOffset: -5,
      };

      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        rotation: 30,
        inside: false,
        align: 'center',
        verticalAlign: 'middle',
        style: textStyle,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 3,
        borderWidth: 1,
        padding: 8,
        x: 5,
        y: -5,
      });
    });
  });

  describe('undefined properties handling', () => {
    it('should not include properties that are undefined', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        rotation: undefined,
        alignInside: undefined,
        align: undefined,
        verticalAlign: undefined,
        textStyle: undefined,
        backgroundColor: undefined,
        borderColor: undefined,
        borderRadius: undefined,
        borderWidth: undefined,
        padding: undefined,
        xOffset: undefined,
        yOffset: undefined,
      };

      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
      });

      // Verify that undefined properties are not included
      expect(result).not.toHaveProperty('rotation');
      expect(result).not.toHaveProperty('inside');
      expect(result).not.toHaveProperty('align');
      expect(result).not.toHaveProperty('verticalAlign');
      expect(result).not.toHaveProperty('style');
      expect(result).not.toHaveProperty('backgroundColor');
      expect(result).not.toHaveProperty('borderColor');
      expect(result).not.toHaveProperty('borderRadius');
      expect(result).not.toHaveProperty('borderWidth');
      expect(result).not.toHaveProperty('padding');
      expect(result).not.toHaveProperty('x');
      expect(result).not.toHaveProperty('y');
      expect(result).not.toHaveProperty('animation');
    });
  });

  describe('edge cases', () => {
    it('should handle zero values correctly', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        rotation: 0,
        borderRadius: 0,
        borderWidth: 0,
        padding: 0,
        xOffset: 0,
        yOffset: 0,
      };

      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        rotation: 0,
        borderRadius: 0,
        borderWidth: 0,
        padding: 0,
        x: 0,
        y: 0,
      });
    });

    it('should handle negative values correctly', () => {
      const seriesLabels: SeriesLabels = {
        enabled: true,
        rotation: -45,
        xOffset: -10,
        yOffset: -20,
      };

      const result = prepareDataLabelsOptions(seriesLabels);

      expect(result).toEqual({
        enabled: true,
        rotation: -45,
        x: -10,
        y: -20,
      });
    });
  });
});
