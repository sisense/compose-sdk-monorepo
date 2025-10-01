/* eslint-disable @typescript-eslint/unbound-method */
/** @vitest-environment jsdom */
import { Attribute } from '@ethings-os/sdk-data';
import { type ClientApplication, getHierarchyModels } from '@ethings-os/sdk-ui-preact';
import { Mock, Mocked } from 'vitest';

import { HierarchyService } from './hierarchy.service';
import { SisenseContextService } from './sisense-context.service';

vi.mock('../decorators/trackable.decorator', () => ({
  TrackableService: (_target: any, _key: string, descriptor: PropertyDescriptor) => descriptor,
}));

vi.mock('@ethings-os/sdk-ui-preact', () => ({
  getHierarchyModels: vi.fn(),
}));

const getHierarchyModelsMock = getHierarchyModels as Mock<typeof getHierarchyModels>;

describe('HierarchyService', () => {
  let sisenseContextService: Mocked<SisenseContextService>;

  beforeEach(() => {
    getHierarchyModelsMock.mockClear();
    sisenseContextService = {
      getApp: vi.fn().mockResolvedValue({}),
    } as unknown as Mocked<SisenseContextService>;
  });

  it('should be created', () => {
    const hierarchyService = new HierarchyService(sisenseContextService);
    expect(hierarchyService).toBeTruthy();
  });

  describe('getHierarchyModels', () => {
    it('should retrieve an existing hierarchy models', async () => {
      const expectedHierarchyModels = [
        {
          id: '123',
          title: 'some hierarchy',
          levels: [{ name: 'some level' } as Attribute],
        },
      ];
      sisenseContextService.getApp.mockResolvedValue({ httpClient: {} } as ClientApplication);
      getHierarchyModelsMock.mockResolvedValue(expectedHierarchyModels);

      const hierarchyService = new HierarchyService(sisenseContextService);
      const result = await hierarchyService.getHierarchyModels({
        dimension: { name: 'some dimension' } as Attribute,
      });

      expect(result).toEqual(expectedHierarchyModels);
      expect(sisenseContextService.getApp).toHaveBeenCalled();
    });
  });
});
