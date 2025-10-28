import { WidgetDto } from '@/index';
import { TabberWidgetDtoStyle } from '@/widget-by-id/types';

import { processTabberWidget } from './tabber';

describe('processTabberWidget', () => {
  const createTabberWidgetDto = (style: TabberWidgetDtoStyle): WidgetDto => ({
    oid: 'test-tabber-widget',
    type: 'WidgetsTabber',
    subtype: 'WidgetsTabber',
    title: 'Test Tabber',
    desc: 'Test tabber widget',
    datasource: {
      title: 'Sample ECommerce',
      fullname: 'LocalHost/Sample ECommerce',
    },
    style,
    metadata: {
      panels: [],
    },
  });

  const defaultTabberStyle: TabberWidgetDtoStyle = {
    activeTab: '0',
    showTitle: false,
    showSeparators: true,
    useSelectedBkg: false,
    useUnselectedBkg: false,
    tabsSize: 'MEDIUM',
    tabsInterval: 'MEDIUM',
    tabsAlignment: 'CENTER',
    selectedColor: '#000000',
    selectedBkgColor: '#ffffff',
    unselectedColor: '#666666',
    unselectedBkgColor: '#ffffff',
    descriptionColor: '#666666',
    tabCornerRadius: 'NONE',
    showDescription: false,
    tabs: [],
  };

  describe('Return Structure', () => {
    it('should return correct structure with all required properties', () => {
      const widgetDto = createTabberWidgetDto(defaultTabberStyle);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: ['#FF0000', '#00FF00', '#0000FF'],
      });

      expect(result).toHaveProperty('fusionWidgetType', 'custom');
      expect(result).toHaveProperty('customWidgetType', 'tabber-buttons');
      expect(result).toHaveProperty('dataOptions');
      expect(result).toHaveProperty('styleOptions');
      expect(result).toHaveProperty('customOptions');
    });

    it('should always return fusionWidgetType as "custom"', () => {
      const widgetDto = createTabberWidgetDto(defaultTabberStyle);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.fusionWidgetType).toBe('custom');
    });

    it('should always return customWidgetType as "tabber-buttons"', () => {
      const widgetDto = createTabberWidgetDto(defaultTabberStyle);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.customWidgetType).toBe('tabber-buttons');
    });
  });

  describe('Custom Options Extraction', () => {
    it('should extract tab names from tabs array', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        tabs: [
          {
            title: 'First Tab',
            displayWidgetIds: ['widget1'],
            hideWidgetIds: [],
          },
          {
            title: 'Second Tab',
            displayWidgetIds: ['widget2'],
            hideWidgetIds: [],
          },
        ],
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.customOptions.tabNames).toEqual(['First Tab', 'Second Tab']);
    });

    it('should convert activeTab from string to number', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        activeTab: '2',
        tabs: [
          { title: 'Tab 1', displayWidgetIds: [], hideWidgetIds: [] },
          { title: 'Tab 2', displayWidgetIds: [], hideWidgetIds: [] },
          { title: 'Tab 3', displayWidgetIds: [], hideWidgetIds: [] },
        ],
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.customOptions.activeTab).toBe(2);
      expect(typeof result.customOptions.activeTab).toBe('number');
    });

    it('should handle empty tabs array', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        tabs: [],
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.customOptions.tabNames).toEqual([]);
    });

    it('should handle multiple tabs with complex widget IDs', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        tabs: [
          {
            title: 'Sales',
            displayWidgetIds: ['widget-1', 'widget-2', 'widget-3'],
            hideWidgetIds: ['widget-4', 'widget-5'],
          },
          {
            title: 'Marketing',
            displayWidgetIds: ['widget-4', 'widget-5'],
            hideWidgetIds: ['widget-1', 'widget-2', 'widget-3'],
          },
        ],
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.customOptions.tabNames).toEqual(['Sales', 'Marketing']);
    });
  });

  describe('Style Options Processing', () => {
    it('should process style options and normalize values', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        showTitle: true,
        showSeparators: false,
        tabsSize: 'LARGE',
        tabsInterval: 'SMALL',
        tabsAlignment: 'LEFT',
        selectedColor: '#FF0000',
        unselectedColor: '#0000FF',
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.styleOptions).toBeDefined();
      expect(result.styleOptions.showSeparators).toBe(false);
      expect(result.styleOptions.tabsSize).toBe('large');
      expect(result.styleOptions.tabsInterval).toBe('small');
      expect(result.styleOptions.tabsAlignment).toBe('left');
      expect(result.styleOptions.selectedColor).toBe('#FF0000');
      expect(result.styleOptions.unselectedColor).toBe('#0000FF');
    });

    it('should not include tabs in styleOptions', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        tabs: [{ title: 'Tab 1', displayWidgetIds: ['w1'], hideWidgetIds: [] }],
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect((result.styleOptions as any).tabs).toBeUndefined();
    });

    it('should not include activeTab in styleOptions', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        activeTab: '3',
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect((result.styleOptions as any).activeTab).toBeUndefined();
    });

    it('should handle all corner radius options', () => {
      const cornerRadiusOptions: Array<'SMALL' | 'MEDIUM' | 'LARGE' | 'NONE'> = [
        'SMALL',
        'MEDIUM',
        'LARGE',
        'NONE',
      ];

      cornerRadiusOptions.forEach((radius) => {
        const style: TabberWidgetDtoStyle = {
          ...defaultTabberStyle,
          tabCornerRadius: radius,
        };

        const widgetDto = createTabberWidgetDto(style);
        const result = processTabberWidget({
          panels: [],
          widgetDto,
          variantColors: [],
        });

        expect(result.styleOptions.tabCornerRadius).toBe(radius.toLowerCase());
      });
    });

    it('should handle all tabs size options', () => {
      const sizeOptions: Array<'SMALL' | 'MEDIUM' | 'LARGE'> = ['SMALL', 'MEDIUM', 'LARGE'];

      sizeOptions.forEach((size) => {
        const style: TabberWidgetDtoStyle = {
          ...defaultTabberStyle,
          tabsSize: size,
        };

        const widgetDto = createTabberWidgetDto(style);
        const result = processTabberWidget({
          panels: [],
          widgetDto,
          variantColors: [],
        });

        expect(result.styleOptions.tabsSize).toBe(size.toLowerCase());
      });
    });

    it('should handle all tabs alignment options', () => {
      const alignmentOptions: Array<'LEFT' | 'CENTER' | 'RIGHT'> = ['LEFT', 'CENTER', 'RIGHT'];

      alignmentOptions.forEach((alignment) => {
        const style: TabberWidgetDtoStyle = {
          ...defaultTabberStyle,
          tabsAlignment: alignment,
        };

        const widgetDto = createTabberWidgetDto(style);
        const result = processTabberWidget({
          panels: [],
          widgetDto,
          variantColors: [],
        });

        expect(result.styleOptions.tabsAlignment).toBe(alignment.toLowerCase());
      });
    });

    it('should include background colors when DTO flags are true', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        useSelectedBkg: true,
        useUnselectedBkg: true,
        selectedBkgColor: '#AABBCC',
        unselectedBkgColor: '#DDEEFF',
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      // Background colors are included when DTO flags are true
      expect(result.styleOptions.selectedBackgroundColor).toBe('#AABBCC');
      expect(result.styleOptions.unselectedBackgroundColor).toBe('#DDEEFF');
    });

    it('should handle description-related properties', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        showDescription: true,
        descriptionColor: '#123456',
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.styleOptions.showDescription).toBe(true);
      expect(result.styleOptions.descriptionColor).toBe('#123456');
    });
  });

  describe('Data Options Creation', () => {
    it('should create data options from empty panels', () => {
      const widgetDto = createTabberWidgetDto(defaultTabberStyle);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.dataOptions).toBeDefined();
      expect(typeof result.dataOptions).toBe('object');
    });

    it('should pass variant colors to data options creation', () => {
      const widgetDto = createTabberWidgetDto(defaultTabberStyle);
      const variantColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors,
      });

      expect(result.dataOptions).toBeDefined();
    });

    it('should handle panels with data', () => {
      const widgetDto = createTabberWidgetDto(defaultTabberStyle);
      const panels = [
        {
          name: 'values',
          items: [
            {
              jaql: {
                title: 'Total Revenue',
                dim: '[Commerce.Revenue]',
                agg: 'sum',
                datatype: 'numeric',
              },
            },
          ],
        },
      ];

      const result = processTabberWidget({
        panels: panels as any,
        widgetDto,
        variantColors: [],
      });

      expect(result.dataOptions).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle activeTab as "0"', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        activeTab: '0',
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.customOptions.activeTab).toBe(0);
    });

    it('should handle large number of tabs', () => {
      const tabs = Array.from({ length: 20 }, (_, i) => ({
        title: `Tab ${i + 1}`,
        displayWidgetIds: [`widget-${i}`],
        hideWidgetIds: [],
      }));

      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        tabs,
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.customOptions.tabNames).toHaveLength(20);
      expect(result.customOptions.tabNames[0]).toBe('Tab 1');
      expect(result.customOptions.tabNames[19]).toBe('Tab 20');
    });

    it('should handle tabs with special characters in titles', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        tabs: [
          { title: 'Tab & Special', displayWidgetIds: [], hideWidgetIds: [] },
          { title: 'Tab < > "Quotes"', displayWidgetIds: [], hideWidgetIds: [] },
          { title: "Tab's Name", displayWidgetIds: [], hideWidgetIds: [] },
        ],
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.customOptions.tabNames).toEqual([
        'Tab & Special',
        'Tab < > "Quotes"',
        "Tab's Name",
      ]);
    });

    it('should handle empty string widget IDs', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        tabs: [
          {
            title: 'Tab 1',
            displayWidgetIds: [''],
            hideWidgetIds: [''],
          },
        ],
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result.customOptions.tabNames).toEqual(['Tab 1']);
    });

    it('should handle empty variant colors array', () => {
      const widgetDto = createTabberWidgetDto(defaultTabberStyle);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      expect(result).toBeDefined();
      expect(result.dataOptions).toBeDefined();
    });
  });

  describe('Pure Function Behavior', () => {
    it('should not mutate input widgetDto', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        tabs: [{ title: 'Original', displayWidgetIds: [], hideWidgetIds: [] }],
      };

      const widgetDto = createTabberWidgetDto(style);
      const originalWidgetDto = JSON.parse(JSON.stringify(widgetDto));

      processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: ['#FF0000'],
      });

      expect(widgetDto).toEqual(originalWidgetDto);
    });

    it('should not mutate input panels array', () => {
      const panels = [
        {
          name: 'test',
          items: [],
        },
      ];
      const originalPanels = JSON.parse(JSON.stringify(panels));

      processTabberWidget({
        panels: panels as any,
        widgetDto: createTabberWidgetDto(defaultTabberStyle),
        variantColors: [],
      });

      expect(panels).toEqual(originalPanels);
    });

    it('should return consistent results for same input', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        tabs: [{ title: 'Consistent Tab', displayWidgetIds: [], hideWidgetIds: [] }],
      };

      const widgetDto = createTabberWidgetDto(style);
      const params = {
        panels: [],
        widgetDto,
        variantColors: ['#FF0000'],
      };

      const result1 = processTabberWidget(params);
      const result2 = processTabberWidget(params);

      expect(result1).toEqual(result2);
    });
  });

  describe('Integration with Dependent Functions', () => {
    it('should correctly integrate extractTabberButtonsWidgetCustomOptions', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        activeTab: '1',
        tabs: [
          { title: 'Tab A', displayWidgetIds: ['w1'], hideWidgetIds: [] },
          { title: 'Tab B', displayWidgetIds: ['w2'], hideWidgetIds: [] },
        ],
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      // Verify that customOptions match what extractTabberButtonsWidgetCustomOptions should produce
      expect(result.customOptions.activeTab).toBe(1);
      expect(result.customOptions.tabNames).toEqual(['Tab A', 'Tab B']);
    });

    it('should correctly integrate extractStyleOptions', () => {
      const style: TabberWidgetDtoStyle = {
        ...defaultTabberStyle,
        showTitle: true,
        tabsSize: 'LARGE',
      };

      const widgetDto = createTabberWidgetDto(style);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: [],
      });

      // Verify that styleOptions are properly extracted and normalized
      expect(result.styleOptions.tabsSize).toBe('large');
    });

    it('should correctly integrate createDataOptionsFromPanels', () => {
      const widgetDto = createTabberWidgetDto(defaultTabberStyle);
      const result = processTabberWidget({
        panels: [],
        widgetDto,
        variantColors: ['#FF0000', '#00FF00'],
      });

      // Verify that dataOptions object is created
      expect(result.dataOptions).toBeDefined();
      expect(typeof result.dataOptions).toBe('object');
    });
  });
});
