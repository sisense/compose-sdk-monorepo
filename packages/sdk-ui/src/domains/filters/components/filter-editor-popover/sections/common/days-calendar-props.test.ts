import { CalendarSelectTypes } from '../../common/select/calendar-select';
import { getDaysCalendarProps } from './days-calendar-props';

describe('getDaysCalendarProps', () => {
  const members = ['2013-11-04T00:00:00', '2013-11-12T00:00:00'];

  describe('when multi-selection is enabled', () => {
    it('should select the multi-select mode with every member as a date', () => {
      const props = getDaysCalendarProps({
        members,
        multiSelectEnabled: true,
        onChange: vi.fn(),
      });

      expect(props.type).toBe(CalendarSelectTypes.MULTI_SELECT);
      expect(props.value).toEqual([
        new Date('2013-11-04T00:00:00Z'),
        new Date('2013-11-12T00:00:00Z'),
      ]);
    });

    it('should report every picked date back as members', () => {
      const onChange = vi.fn();
      const props = getDaysCalendarProps({ members, multiSelectEnabled: true, onChange });

      (props.onChange as (dates: Date[]) => void)([
        new Date('2013-11-04T00:00:00Z'),
        new Date('2013-11-08T00:00:00Z'),
      ]);

      expect(onChange).toHaveBeenCalledWith(['2013-11-04T00:00:00', '2013-11-08T00:00:00']);
    });
  });

  describe('when multi-selection is disabled', () => {
    it('should select the single-select mode with only the first member', () => {
      const props = getDaysCalendarProps({
        members,
        multiSelectEnabled: false,
        onChange: vi.fn(),
      });

      expect(props.type).toBe(CalendarSelectTypes.SINGLE_SELECT);
      expect(props.value).toEqual(new Date('2013-11-04T00:00:00Z'));
    });

    it('should report the picked date back as a single member', () => {
      const onChange = vi.fn();
      const props = getDaysCalendarProps({ members, multiSelectEnabled: false, onChange });

      (props.onChange as (date: Date) => void)(new Date('2013-11-08T00:00:00Z'));

      expect(onChange).toHaveBeenCalledWith('2013-11-08T00:00:00');
    });
  });

  it('should leave the value empty when nothing is selected', () => {
    expect(
      getDaysCalendarProps({ members: [], multiSelectEnabled: false, onChange: vi.fn() }).value,
    ).toBeUndefined();
    expect(
      getDaysCalendarProps({ members: [], multiSelectEnabled: true, onChange: vi.fn() }).value,
    ).toEqual([]);
  });
});
