/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { applyDateFormats } from './query-result-date-formatting';
import cloneDeep from 'lodash-es/cloneDeep';
import type { Cell, QueryResultData } from '@sisense/sdk-data';

describe('applyDateFormats', () => {
  function newData(): QueryResultData {
    const data: QueryResultData = {
      columns: [
        { name: 'Revenue', type: 'basemeasure' },
        { name: 'Years', type: 'datelevel' },
      ],
      rows: [
        [
          { data: 5, text: '5' },
          { data: '2009-01-01T00:00:00', text: '2009' },
        ],
        [
          { data: 3, text: '3' },
          { data: '2010-01-01T00:00:00Z', text: '2010' },
        ],
      ],
    };
    return data;
  }

  describe('when the `text` property of cells are mutated', () => {
    it('mutates `text` with a reformatted date string, on cells for one datetime column with a `dateFormat` configured', () => {
      const dataIn = newData();
      const dataOut = applyDateFormats(dataIn, {
        x: [{ name: 'Years', type: 'datelevel', dateFormat: 'yyyy MMM' }],
        breakBy: [],
      }) as QueryResultData;

      expect(dataOut).toBe(dataIn);
      expect(dataOut).not.toStrictEqual(newData());
      expect(dataOut.rows.map((row: Cell[]) => row[1].text)).toStrictEqual([
        '2009 Jan',
        '2010 Jan',
      ]);
    });

    it('mutates `text` with a reformatted date string, on cells for multiple datetime columns with a `dateFormat` configured', () => {
      const dataIn: QueryResultData = {
        columns: [
          { name: 'Revenue', type: 'basemeasure' },
          { name: 'Year', type: 'datelevel' },
          { name: 'Quarter', type: 'datelevel' },
          { name: 'Timestamp', type: 'datelevel' },
        ],
        rows: [
          [
            { data: 5, text: '5' },
            { data: '2009-01-01T00:00:00', text: '2009' },
            { data: '2009-04-01T00:00:00', text: 'Q2' },
            { data: '2009-04-11T01:23:45', text: '2009 Apr 11 1:23:45 AM' },
          ],
          [
            { data: 3, text: '3' },
            { data: '2009-01-01T00:00:00', text: '2009' },
            { data: '2009-07-01T00:00:00', text: 'Q3' },
            { data: '2009-07-06T02:34:56', text: '2009 Jul 06 2:34:56 AM' },
          ],
        ],
      };
      const originalDataIn = cloneDeep(dataIn);
      const dataOut = applyDateFormats(dataIn, {
        x: [
          { name: 'Quarter', type: 'datelevel', dateFormat: 'QQQQ' },
          { name: 'Timestamp', type: 'datelevel', dateFormat: 'MMM d' },
        ],
        breakBy: [{ name: 'Years', type: 'datelevel', dateFormat: 'yy' }],
      });

      expect(dataOut).toBe(dataIn);
      expect(dataOut).not.toStrictEqual(originalDataIn);
      expect(dataOut.rows).toStrictEqual([
        [
          { data: 5, text: '5' },
          { data: '2009-01-01T00:00:00', text: '2009' },
          { data: '2009-04-01T00:00:00', text: 'Quarter 2Quarter 2' },
          { data: '2009-04-11T01:23:45', text: 'Apr 11' },
        ],
        [
          { data: 3, text: '3' },
          { data: '2009-01-01T00:00:00', text: '2009' },
          { data: '2009-07-01T00:00:00', text: 'Quarter 3Quarter 3' },
          { data: '2009-07-06T02:34:56', text: 'Jul 6' },
        ],
      ]);
    });

    it('mutates `text` with a reformatted date string, when `data` is a valid date string, but `text` was not originally defined', () => {
      const dataIn: QueryResultData = {
        columns: [{ name: 'Years', type: 'datelevel' }],
        rows: [[{ data: '2009-01-01T00:00:00' }]],
      };

      const dataOut = applyDateFormats(dataIn, {
        x: [{ name: 'Years', type: 'datelevel', dateFormat: 'yy' }],
        breakBy: [],
      }) as QueryResultData;

      expect(dataOut).toBe(dataIn);
      expect(dataOut.rows[0][0].text).toBe('09');
    });
  });

  describe('when nothing is mutated', () => {
    it('does nothing when no columns are specified in `x` or `breakBy`', () => {
      const dataIn = newData();
      const dataOut = applyDateFormats(dataIn, {
        x: [],
        breakBy: [],
      });
      expect(dataOut).toBe(dataIn);
      expect(dataOut).toStrictEqual(newData());
    });

    describe('when `dateFormat` is falsy', () => {
      it('does not mutate `text` on cells for datetime columns, when the column is used in `x` with an explicitly undefined `dateFormat`', () => {
        const dataIn = newData();
        const dataOut = applyDateFormats(dataIn, {
          x: [{ name: 'Years', type: 'datelevel', dateFormat: undefined }],
          breakBy: [],
        });
        expect(dataOut).toBe(dataIn);
        expect(dataOut).toStrictEqual(newData());
      });

      it('does not mutate `text` on cells for datetime columns, when the column is used in `breakBy` with an explicitly undefined `dateFormat`', () => {
        const dataIn = newData();
        const dataOut = applyDateFormats(dataIn, {
          x: [],
          breakBy: [{ name: 'Years', type: 'datelevel', dateFormat: undefined }],
        });
        expect(dataOut).toBe(dataIn);
        expect(dataOut).toStrictEqual(newData());
      });

      it('does not mutate `text` on cells for datetime columns, when the column is used in `breakBy` with an implicitly undefined `dateFormat`', () => {
        const dataIn = newData();
        const dataOut = applyDateFormats(dataIn, {
          x: [],
          breakBy: [{ name: 'Years', type: 'datelevel' }],
        });
        expect(dataOut).toBe(dataIn);
        expect(dataOut).toStrictEqual(newData());
      });

      it('does not mutate `text` on cells for datetime columns, when the column is used in `breakBy` with an empty string `dateFormat`', () => {
        const dataIn = newData();
        const dataOut = applyDateFormats(dataIn, {
          x: [],
          breakBy: [{ name: 'Years', type: 'datelevel', dateFormat: '' }],
        });
        expect(dataOut).toBe(dataIn);
        expect(dataOut).toStrictEqual(newData());
      });
    });

    describe('when columns in chartDataOptions do not match the data columns', () => {
      it('does not mutate `text` on cells when the column is a datetime column, but the `name` does not match', () => {
        const dataIn = newData();
        const dataOut = applyDateFormats(dataIn, {
          x: [{ name: 'YEARS', type: 'datelevel', dateFormat: 'yy' }],
          breakBy: [],
        });
        expect(dataOut).toBe(dataIn);
        expect(dataOut).toStrictEqual(newData());
      });

      it('does mutate `text` on cells when the column is a datetime column, but the `type` does not match', () => {
        const dataIn = newData();
        const dataOut = applyDateFormats(dataIn, {
          x: [{ name: 'Years', type: 'timewithtimezone', dateFormat: 'yy' }],
          breakBy: [],
        }) as QueryResultData;
        expect(dataOut.rows[0][1].text).toBe('09');
        expect(dataOut.rows[1][1].text).toBe('10');
      });

      it('does not mutate `text` on non-datetime columns that are configured with a `dateFormat`', () => {
        const dataIn = newData();
        const dataOut = applyDateFormats(dataIn, {
          x: [{ name: 'Revenue', type: 'basemeasure', dateFormat: 'yy' }],
          breakBy: [],
        });
        expect(dataOut).toBe(dataIn);
        expect(dataOut).toStrictEqual(newData());
      });
    });

    describe('cells with `data` that cannot be used', () => {
      it('does not set `text` on cells with `data: undefined`', () => {
        const dataIn: QueryResultData = {
          columns: [{ name: 'Years', type: 'datelevel' }],
          rows: [[{ data: undefined }]],
        };

        const dataOut = applyDateFormats(dataIn, {
          x: [{ name: 'Years', type: 'datelevel', dateFormat: 'yy' }],
          breakBy: [],
        });

        expect(dataOut).toBe(dataIn);
        expect(dataOut.rows).toStrictEqual([[{ data: undefined }]]);
      });

      it('does not set `text` on cells with `data: null`', () => {
        const dataIn: QueryResultData = {
          columns: [{ name: 'Years', type: 'datelevel' }],
          rows: [[{ data: null }]],
        };

        const dataOut = applyDateFormats(dataIn, {
          x: [{ name: 'Years', type: 'datelevel', dateFormat: 'yy' }],
          breakBy: [],
        });

        expect(dataOut).toBe(dataIn);
        expect(dataOut.rows).toStrictEqual([[{ data: null }]]);
      });

      it("does not set `text` on cells with `data: ''`", () => {
        const dataIn: QueryResultData = {
          columns: [{ name: 'Years', type: 'datelevel' }],
          rows: [[{ data: '' }]],
        };

        const dataOut = applyDateFormats(dataIn, {
          x: [{ name: 'Years', type: 'datelevel', dateFormat: 'yy' }],
          breakBy: [],
        });

        expect(dataOut).toBe(dataIn);
        expect(dataOut.rows).toStrictEqual([[{ data: '' }]]);
      });

      it('does not mutate `text` when `data` is an invalid date string, and logs the Error with `console.error()`', () => {
        const dataIn: QueryResultData = {
          columns: [{ name: 'Years', type: 'datelevel' }],
          rows: [[{ data: '2009-01-01-01-01 0:0', text: '2009' }]],
        };

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementationOnce(() => {});
        const dataOut = applyDateFormats(dataIn, {
          x: [{ name: 'Years', type: 'datelevel', dateFormat: 'yy' }],
          breakBy: [],
        }) as QueryResultData;

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy.mock.calls[0][0].message).toMatch(/Invalid time value/);
        consoleErrorSpy.mockRestore();

        expect(dataOut).toBe(dataIn);
        expect(dataOut.rows[0][0].text).toBe('2009');
      });
    });
  });
});
