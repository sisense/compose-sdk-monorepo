import { describe, it, expect } from 'vitest';
import { isJumpTargetWithDashboardProps, isJumpTargetWithId, JtdTarget } from './jtd-types';

describe('jtd-types', () => {
  describe('isJumpTargetWithDashboardProps', () => {
    it('should return true for targets with dashboard props', () => {
      const targetWithDashboard: JtdTarget = {
        caption: 'Test Dashboard',
        dashboard: {
          title: 'Test Dashboard',
          widgets: [],
        },
      };

      expect(isJumpTargetWithDashboardProps(targetWithDashboard)).toBe(true);
    });

    it('should return false for targets with ID only', () => {
      const targetWithId: JtdTarget = {
        caption: 'Test Dashboard',
        id: 'test-dashboard-1',
      };

      expect(isJumpTargetWithDashboardProps(targetWithId)).toBe(false);
    });

    it('should handle edge cases', () => {
      const emptyTarget = { caption: 'Empty' } as JtdTarget;
      expect(isJumpTargetWithDashboardProps(emptyTarget)).toBe(false);
    });
  });

  describe('isJumpTargetWithId', () => {
    it('should return true for targets with ID', () => {
      const targetWithId: JtdTarget = {
        caption: 'Test Dashboard',
        id: 'test-dashboard-1',
      };

      expect(isJumpTargetWithId(targetWithId)).toBe(true);
    });

    it('should return false for targets with dashboard props', () => {
      const targetWithDashboard: JtdTarget = {
        caption: 'Test Dashboard',
        dashboard: {
          title: 'Test Dashboard',
          widgets: [],
        },
      };

      expect(isJumpTargetWithId(targetWithDashboard)).toBe(false);
    });

    it('should handle edge cases', () => {
      const emptyTarget = { caption: 'Empty' } as JtdTarget;
      expect(isJumpTargetWithId(emptyTarget)).toBe(false);
    });
  });
});
