import { TotalLabels } from '../types';
import { prepareStackLabels } from './stack-labels';

describe('prepareStackLabels', () => {
  describe('when totalLabels is empty object', () => {
    it('should return object with enabled: false and empty style', () => {
      const totalLabels: TotalLabels = { enabled: false };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: false,
      });
    });
  });

  describe('enabled property', () => {
    it('should map enabled: true correctly', () => {
      const totalLabels: TotalLabels = { enabled: true };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });
    });

    it('should map enabled: false correctly', () => {
      const totalLabels: TotalLabels = { enabled: false };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: false,
      });
    });
  });

  describe('rotation property', () => {
    it('should map rotation when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        rotation: 45,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        rotation: 45,
      });
    });

    it('should not include rotation when undefined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        rotation: undefined,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });
      expect(result).not.toHaveProperty('rotation');
    });
  });

  describe('alignment properties', () => {
    it('should map align when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        align: 'left',
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        align: 'left',
      });
    });

    it('should map verticalAlign when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        verticalAlign: 'top',
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        verticalAlign: 'top',
      });
    });

    it('should not include align when undefined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        align: undefined,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });
      expect(result).not.toHaveProperty('align');
    });

    it('should not include verticalAlign when undefined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        verticalAlign: undefined,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });
      expect(result).not.toHaveProperty('verticalAlign');
    });
  });

  describe('animation property', () => {
    it('should map delay to animation.defer when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        delay: 1000,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        animation: { defer: 1000 },
      });
    });

    it('should not include animation when delay is undefined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        delay: undefined,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });
      expect(result).not.toHaveProperty('animation');
    });
  });

  describe('style properties', () => {
    it('should map backgroundColor when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        backgroundColor: '#ff0000',
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        backgroundColor: '#ff0000',
      });
    });

    it('should map borderColor when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        borderColor: '#00ff00',
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        borderColor: '#00ff00',
      });
    });

    it('should map borderRadius when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        borderRadius: 5,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        borderRadius: 5,
      });
    });

    it('should map borderWidth when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        borderWidth: 2,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        borderWidth: 2,
      });
    });

    it('should not include style properties when undefined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        backgroundColor: undefined,
        borderColor: undefined,
        borderRadius: undefined,
        borderWidth: undefined,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });
      expect(result).not.toHaveProperty('backgroundColor');
      expect(result).not.toHaveProperty('borderColor');
      expect(result).not.toHaveProperty('borderRadius');
      expect(result).not.toHaveProperty('borderWidth');
    });
  });

  describe('textStyle property', () => {
    it('should map textStyle when defined', () => {
      const textStyle = { fontSize: '12px', color: 'red' };
      const totalLabels: TotalLabels = {
        enabled: true,
        textStyle,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        style: textStyle,
      });
    });

    it('should extract align from textStyle and map to textAlign', () => {
      const textStyle = { fontSize: '12px', color: 'red', align: 'center' as const };
      const totalLabels: TotalLabels = {
        enabled: true,
        textStyle,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        style: { fontSize: '12px', color: 'red' },
        textAlign: 'center',
      });
    });

    it('should handle textStyle without align', () => {
      const textStyle = { fontSize: '12px', color: 'red' };
      const totalLabels: TotalLabels = {
        enabled: true,
        textStyle,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        style: textStyle,
      });
      expect(result).not.toHaveProperty('textAlign');
    });

    it('should include empty style when textStyle is undefined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        textStyle: undefined,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });
      expect(result).not.toHaveProperty('textAlign');
    });
  });

  describe('offset properties', () => {
    it('should map xOffset to x when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        xOffset: 15,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        x: 15,
      });
    });

    it('should map yOffset to y when defined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        yOffset: -10,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        y: -10,
      });
    });

    it('should not include offset properties when undefined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        xOffset: undefined,
        yOffset: undefined,
      };
      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });
      expect(result).not.toHaveProperty('x');
      expect(result).not.toHaveProperty('y');
    });
  });

  describe('combined properties', () => {
    it('should handle multiple properties correctly', () => {
      const textStyle = { fontSize: '14px', fontWeight: 'bold', align: 'right' as const };
      const totalLabels: TotalLabels = {
        enabled: true,
        rotation: 30,
        align: 'center',
        verticalAlign: 'middle',
        delay: 500,
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 3,
        borderWidth: 1,
        textStyle,
        xOffset: 5,
        yOffset: -5,
      };

      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        rotation: 30,
        align: 'center',
        verticalAlign: 'middle',
        animation: { defer: 500 },
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderRadius: 3,
        borderWidth: 1,
        style: { fontSize: '14px', fontWeight: 'bold' },
        textAlign: 'right',
        x: 5,
        y: -5,
      });
    });
  });

  describe('undefined properties handling', () => {
    it('should not include properties that are undefined', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        rotation: undefined,
        align: undefined,
        verticalAlign: undefined,
        delay: undefined,
        backgroundColor: undefined,
        borderColor: undefined,
        borderRadius: undefined,
        borderWidth: undefined,
        textStyle: undefined,
        xOffset: undefined,
        yOffset: undefined,
      };

      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });

      // Verify that undefined properties are not included
      expect(result).not.toHaveProperty('rotation');
      expect(result).not.toHaveProperty('align');
      expect(result).not.toHaveProperty('verticalAlign');
      expect(result).not.toHaveProperty('animation');
      expect(result).not.toHaveProperty('backgroundColor');
      expect(result).not.toHaveProperty('borderColor');
      expect(result).not.toHaveProperty('borderRadius');
      expect(result).not.toHaveProperty('borderWidth');
      expect(result).not.toHaveProperty('textAlign');
      expect(result).not.toHaveProperty('x');
      expect(result).not.toHaveProperty('y');
    });
  });

  describe('edge cases', () => {
    it('should handle zero values correctly', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        rotation: 0,
        borderRadius: 0,
        borderWidth: 0,
        xOffset: 0,
        yOffset: 0,
        delay: 0,
      };

      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        rotation: 0,
        borderRadius: 0,
        borderWidth: 0,
        x: 0,
        y: 0,
        animation: { defer: 0 },
      });
    });

    it('should handle negative values correctly', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        rotation: -45,
        xOffset: -10,
        yOffset: -20,
        delay: -100,
      };

      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        rotation: -45,
        x: -10,
        y: -20,
        animation: { defer: -100 },
      });
    });

    it('should handle backgroundColor with auto value', () => {
      const totalLabels: TotalLabels = {
        enabled: true,
        backgroundColor: 'auto',
      };

      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        backgroundColor: 'auto',
      });
    });

    it('should handle empty textStyle object', () => {
      const textStyle = {};
      const totalLabels: TotalLabels = {
        enabled: true,
        textStyle,
      };

      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
      });
    });

    it('should handle textStyle with only align property', () => {
      const textStyle = { align: 'left' as const };
      const totalLabels: TotalLabels = {
        enabled: true,
        textStyle,
      };

      const result = prepareStackLabels(totalLabels);

      expect(result).toEqual({
        enabled: true,
        textAlign: 'left',
      });
    });
  });

  describe('type safety', () => {
    it('should handle all valid align values', () => {
      const alignValues: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];

      alignValues.forEach((align) => {
        const totalLabels: TotalLabels = {
          enabled: true,
          align,
        };
        const result = prepareStackLabels(totalLabels);

        expect(result).toEqual({
          enabled: true,
          align,
        });
      });
    });

    it('should handle all valid verticalAlign values', () => {
      const verticalAlignValues: Array<'top' | 'middle' | 'bottom'> = ['top', 'middle', 'bottom'];

      verticalAlignValues.forEach((verticalAlign) => {
        const totalLabels: TotalLabels = {
          enabled: true,
          verticalAlign,
        };
        const result = prepareStackLabels(totalLabels);

        expect(result).toEqual({
          enabled: true,
          verticalAlign,
        });
      });
    });

    it('should handle all valid textStyle align values', () => {
      const textAlignValues: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];

      textAlignValues.forEach((align) => {
        const textStyle = { align };
        const totalLabels: TotalLabels = {
          enabled: true,
          textStyle,
        };
        const result = prepareStackLabels(totalLabels);

        expect(result).toEqual({
          enabled: true,
          textAlign: align,
        });
      });
    });
  });
});
