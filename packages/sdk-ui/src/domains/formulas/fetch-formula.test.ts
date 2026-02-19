/* eslint-disable vitest/no-conditional-expect */
import { TranslatableError } from '@/infra/translation/translatable-error';

import { ClientApplication } from '../../infra/app/client-application';
import { translation } from '../../infra/translation/resources/en';
import { fetchFormula, fetchFormulaByOid } from './fetch-formula';

const formulaParamsMock = {
  name: 'mock formula',
  dataSource: 'MockDatasource',
  oid: 'random-oid',
};

const fetchMock = vi.fn();

const appMock = {
  httpClient: {
    get: fetchMock,
  },
} as unknown as ClientApplication;

const fetchedFormulaMock = {
  title: formulaParamsMock.name,
  formula: 'randomFunction()',
  context: {},
  datasourceTitle: formulaParamsMock.dataSource,
};

describe('fetchFormula', () => {
  it('should return calculated measure if formula found', async () => {
    fetchMock.mockResolvedValue([fetchedFormulaMock]);
    const result = await fetchFormula(
      formulaParamsMock.name,
      formulaParamsMock.dataSource,
      appMock,
    );
    expect(result).not.toBeNull();
    expect(result?.type).toBe('calculatedmeasure');
    expect(result?.expression).toBe(fetchedFormulaMock.formula);
  });

  it('should return null if formula not found', async () => {
    fetchMock.mockResolvedValue([{ title: '', datasourceTitle: formulaParamsMock.dataSource }]);
    const result = await fetchFormula(
      formulaParamsMock.name,
      formulaParamsMock.dataSource,
      appMock,
    );
    expect(result).toBeNull();
  });

  it('should throw an error if fetch failed', async () => {
    fetchMock.mockRejectedValue('500');
    try {
      await fetchFormula(formulaParamsMock.name, formulaParamsMock.dataSource, appMock);
      // should never get here
      expect(false).toBe(true);
    } catch (err) {
      expect((err as Error).message).toBe(
        new TranslatableError(translation.errors.sharedFormula.failedToFetchByName, {
          name: formulaParamsMock.name,
          dataSource: formulaParamsMock.dataSource,
        }).message,
      );
    }
  });
});

describe('fetchFormulaByOid', () => {
  it('should return calculated measure if formula found', async () => {
    fetchMock.mockResolvedValue(fetchedFormulaMock);
    const result = await fetchFormulaByOid(formulaParamsMock.oid, appMock);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('calculatedmeasure');
    expect(result?.expression).toBe(fetchedFormulaMock.formula);
  });

  it('should return null if formula not found', async () => {
    fetchMock.mockResolvedValue(undefined);
    const result = await fetchFormulaByOid(formulaParamsMock.oid, appMock);
    expect(result).toBeNull();
  });

  it('should throw an error if fetch failed', async () => {
    fetchMock.mockRejectedValue('500');
    try {
      await fetchFormulaByOid(formulaParamsMock.oid, appMock);
      // should never get here
      expect(false).toBe(true);
    } catch (err) {
      expect((err as Error).message).toBe(
        new TranslatableError(translation.errors.sharedFormula.failedToFetchByOid, {
          oid: formulaParamsMock.oid,
        }).message,
      );
    }
  });
});
