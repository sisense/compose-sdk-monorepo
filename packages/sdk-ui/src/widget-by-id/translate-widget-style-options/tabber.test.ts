import { describe, expect, it } from 'vitest';

import { TabberButtonsWidgetStyleOptions } from '@/types.js';

import { TabberWidgetDto, TabberWidgetDtoStyle } from '../types.js';
import {
  extractTabberButtonsWidgetCustomOptions,
  extractTabberButtonsWidgetStyleOptions,
} from './tabber.js';

describe('Tabber Style Options Translation', () => {
  describe('extractTabberButtonsWidgetStyleOptions', () => {
    it('should extract and transform style options correctly', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '1',
        showTitle: false,
        showSeparators: true,
        useSelectedBkg: true,
        useUnselectedBkg: false,
        tabsSize: 'MEDIUM',
        tabsInterval: 'LARGE',
        tabsAlignment: 'CENTER',
        selectedColor: '#94F5F0',
        selectedBkgColor: '#ffffff',
        unselectedColor: '#666666',
        unselectedBkgColor: '#f0f0f0',
        descriptionColor: '#666666',
        tabCornerRadius: 'SMALL',
        showDescription: false,
        tabs: [
          {
            title: 'TAB 1',
            displayWidgetIds: ['widget1'],
            hideWidgetIds: ['widget2'],
          },
          {
            title: 'TAB 2',
            displayWidgetIds: ['widget2'],
            hideWidgetIds: ['widget1'],
          },
        ],
      };

      const result = extractTabberButtonsWidgetStyleOptions(tabberStyleDto);

      expect(result).toEqual({
        showSeparators: true,
        selectedColor: '#94F5F0',
        unselectedColor: '#666666',
        descriptionColor: '#666666',
        showDescription: false,
        tabCornerRadius: 'small',
        tabsAlignment: 'center',
        tabsInterval: 'large',
        tabsSize: 'medium',
        selectedBackgroundColor: '#ffffff',
        // unselectedBackgroundColor is not included because useUnselectedBkg is false
      } as TabberButtonsWidgetStyleOptions);

      // Verify that tabs and activeTab are not in the result
      expect((result as any).tabs).toBeUndefined();
      expect((result as any).activeTab).toBeUndefined();
    });

    it('should handle NONE tab corner radius', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '0',
        showTitle: true,
        showSeparators: false,
        useSelectedBkg: false,
        useUnselectedBkg: false,
        tabsSize: 'SMALL',
        tabsInterval: 'SMALL',
        tabsAlignment: 'LEFT',
        selectedColor: '#000000',
        selectedBkgColor: '#ffffff',
        unselectedColor: '#666666',
        unselectedBkgColor: '#ffffff',
        descriptionColor: '#666666',
        tabCornerRadius: 'NONE',
        showDescription: true,
        tabs: [],
      };

      const result = extractTabberButtonsWidgetStyleOptions(tabberStyleDto);

      expect(result.tabCornerRadius).toBe('none');
      expect(result.tabsAlignment).toBe('left');
      expect(result.tabsInterval).toBe('small');
      expect(result.tabsSize).toBe('small');
    });

    it('should handle RIGHT alignment and LARGE sizes', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '0',
        showTitle: true,
        showSeparators: true,
        useSelectedBkg: false,
        useUnselectedBkg: false,
        tabsSize: 'LARGE',
        tabsInterval: 'MEDIUM',
        tabsAlignment: 'RIGHT',
        selectedColor: '#000000',
        selectedBkgColor: '#ffffff',
        unselectedColor: '#666666',
        unselectedBkgColor: '#ffffff',
        descriptionColor: '#666666',
        tabCornerRadius: 'LARGE',
        showDescription: false,
        tabs: [],
      };

      const result = extractTabberButtonsWidgetStyleOptions(tabberStyleDto);

      expect(result.tabCornerRadius).toBe('large');
      expect(result.tabsAlignment).toBe('right');
      expect(result.tabsInterval).toBe('medium');
      expect(result.tabsSize).toBe('large');
    });

    it('should only include background colors when useSelectedBkg/useUnselectedBkg flags are true', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '0',
        showTitle: false,
        showSeparators: true,
        useSelectedBkg: false,
        useUnselectedBkg: false,
        tabsSize: 'MEDIUM',
        tabsInterval: 'MEDIUM',
        tabsAlignment: 'CENTER',
        selectedColor: '#000000',
        selectedBkgColor: '#ff0000',
        unselectedColor: '#666666',
        unselectedBkgColor: '#00ff00',
        descriptionColor: '#666666',
        tabCornerRadius: 'NONE',
        showDescription: false,
        tabs: [],
      };

      const result = extractTabberButtonsWidgetStyleOptions(tabberStyleDto);

      // When flags are false, background colors should not be included
      expect(result.selectedBackgroundColor).toBeUndefined();
      expect(result.unselectedBackgroundColor).toBeUndefined();
    });

    it('should include both background colors when both flags are true', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '0',
        showTitle: false,
        showSeparators: true,
        useSelectedBkg: true,
        useUnselectedBkg: true,
        tabsSize: 'MEDIUM',
        tabsInterval: 'MEDIUM',
        tabsAlignment: 'CENTER',
        selectedColor: '#000000',
        selectedBkgColor: '#ff0000',
        unselectedColor: '#666666',
        unselectedBkgColor: '#00ff00',
        descriptionColor: '#666666',
        tabCornerRadius: 'NONE',
        showDescription: false,
        tabs: [],
      };

      const result = extractTabberButtonsWidgetStyleOptions(tabberStyleDto);

      expect(result.selectedBackgroundColor).toBe('#ff0000');
      expect(result.unselectedBackgroundColor).toBe('#00ff00');
    });
  });

  describe('extractTabberButtonsWidgetCustomOptions', () => {
    it('should extract tab names and active tab correctly', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '2',
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
          {
            title: 'Third Tab',
            displayWidgetIds: ['widget3'],
            hideWidgetIds: [],
          },
        ],
      };

      const result = extractTabberButtonsWidgetCustomOptions({
        style: tabberStyleDto,
      } as unknown as TabberWidgetDto);

      expect(result).toEqual({
        tabNames: ['First Tab', 'Second Tab', 'Third Tab'],
        activeTab: 2,
      });
    });

    it('should default to 0 when activeTab is missing', () => {
      const tabberStyleDto = {
        activeTab: undefined,
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
        tabs: [
          {
            title: 'Tab 1',
            displayWidgetIds: ['widget1'],
            hideWidgetIds: [],
          },
        ],
      } as unknown as TabberWidgetDtoStyle;

      const result = extractTabberButtonsWidgetCustomOptions({
        style: tabberStyleDto,
      } as unknown as TabberWidgetDto);

      expect(result.activeTab).toBe(0);
      expect(result.tabNames).toEqual(['Tab 1']);
    });

    it('should handle empty tabs array', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
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

      const result = extractTabberButtonsWidgetCustomOptions({
        style: tabberStyleDto,
      } as unknown as TabberWidgetDto);

      expect(result).toEqual({
        tabNames: [],
        activeTab: 0,
      });
    });

    it('should parse activeTab as integer', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '5',
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
        tabs: [
          { title: 'Tab 1', displayWidgetIds: [], hideWidgetIds: [] },
          { title: 'Tab 2', displayWidgetIds: [], hideWidgetIds: [] },
        ],
      };

      const result = extractTabberButtonsWidgetCustomOptions({
        style: tabberStyleDto,
      } as unknown as TabberWidgetDto);

      expect(result.activeTab).toBe(5);
      expect(typeof result.activeTab).toBe('number');
    });
    it('should get tabs from widgetDto if no tabs in styles defined', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '5',
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
      };

      const result = extractTabberButtonsWidgetCustomOptions({
        style: tabberStyleDto,
        tabs: [
          { title: 'Tab 1', displayWidgetIds: [], hideWidgetIds: [] },
          { title: 'Tab 2', displayWidgetIds: [], hideWidgetIds: [] },
        ],
      } as unknown as TabberWidgetDto);

      expect(result.tabNames).toEqual(['Tab 1', 'Tab 2']);
      expect(result.activeTab).toBe(5);
    });
    it('should get tabs from styles first if defined in both styles and widgetDto', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '5',
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
        tabs: [
          { title: 'Tab 1', displayWidgetIds: [], hideWidgetIds: [] },
          { title: 'Tab 2', displayWidgetIds: [], hideWidgetIds: [] },
        ],
      };

      const result = extractTabberButtonsWidgetCustomOptions({
        style: tabberStyleDto,
        tabs: [
          { title: 'Tab 2', displayWidgetIds: [], hideWidgetIds: [] },
          { title: 'Tab 3', displayWidgetIds: [], hideWidgetIds: [] },
        ],
      } as unknown as TabberWidgetDto);

      expect(result.tabNames).toEqual(['Tab 1', 'Tab 2']);
      expect(result.activeTab).toBe(5);
    });
  });

  describe('tabsInterval mapping with number', () => {
    it('should pass through number values as-is', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '0',
        showTitle: false,
        showSeparators: true,
        useSelectedBkg: false,
        useUnselectedBkg: false,
        tabsSize: 'MEDIUM',
        tabsInterval: 16,
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

      const result = extractTabberButtonsWidgetStyleOptions(tabberStyleDto);

      expect(result.tabsInterval).toBe(16);
      expect(typeof result.tabsInterval).toBe('number');
    });

    it('should still handle string literals correctly', () => {
      const stringCases: Array<'SMALL' | 'MEDIUM' | 'LARGE'> = ['SMALL', 'MEDIUM', 'LARGE'];

      stringCases.forEach((tabsInterval) => {
        const tabberStyleDto: TabberWidgetDtoStyle = {
          activeTab: '0',
          showTitle: false,
          showSeparators: true,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          tabsSize: 'MEDIUM',
          tabsInterval,
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

        const result = extractTabberButtonsWidgetStyleOptions(tabberStyleDto);

        expect(result.tabsInterval).toBe(tabsInterval.toLowerCase());
      });
    });
  });

  describe('tabsSize mapping with number', () => {
    it('should pass through number values as-is', () => {
      const tabberStyleDto: TabberWidgetDtoStyle = {
        activeTab: '0',
        showTitle: false,
        showSeparators: true,
        useSelectedBkg: false,
        useUnselectedBkg: false,
        tabsSize: 14,
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

      const result = extractTabberButtonsWidgetStyleOptions(tabberStyleDto);

      expect(result.tabsSize).toBe(14);
      expect(typeof result.tabsSize).toBe('number');
    });

    it('should still handle string literals correctly', () => {
      const stringCases: Array<'SMALL' | 'MEDIUM' | 'LARGE'> = ['SMALL', 'MEDIUM', 'LARGE'];

      stringCases.forEach((tabsSize) => {
        const tabberStyleDto: TabberWidgetDtoStyle = {
          activeTab: '0',
          showTitle: false,
          showSeparators: true,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          tabsSize,
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

        const result = extractTabberButtonsWidgetStyleOptions(tabberStyleDto);

        expect(result.tabsSize).toBe(tabsSize.toLowerCase());
      });
    });
  });
});
