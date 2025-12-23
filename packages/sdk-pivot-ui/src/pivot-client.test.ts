import {
  DataService,
  PivotQueryClient,
  SisenseDataLoadService,
  SocketBuilder,
} from '@sisense/sdk-pivot-query-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PivotBuilder } from './builders';
import { PivotClient } from './pivot-client.js';

// Mock the dependencies
vi.mock('@sisense/sdk-pivot-query-client', () => ({
  DataService: vi.fn(),
  SisenseDataLoadService: vi.fn(),
}));

vi.mock('./builders', () => ({
  PivotBuilder: vi.fn(),
}));

describe('PivotClient', () => {
  let mockPivotQueryClient: PivotQueryClient;
  let mockSocketBuilder: SocketBuilder;
  let mockSocket: { [key: string]: unknown };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock socket
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    };

    // Create mock SocketBuilder
    mockSocketBuilder = {
      socket: mockSocket as never,
    } as unknown as SocketBuilder;

    // Create mock PivotQueryClient
    mockPivotQueryClient = {
      socketBuilder: mockSocketBuilder,
    } as PivotQueryClient;
  });

  describe('constructor', () => {
    it('should initialize with PivotQueryClient and assign socketBuilder', () => {
      const client = new PivotClient(mockPivotQueryClient);

      expect(client.socketBuilder).toBe(mockSocketBuilder);
      expect(client.socketBuilder).toBe(mockPivotQueryClient.socketBuilder);
    });
  });

  describe('prepareDataService', () => {
    it('should create SisenseDataLoadService with socket from socketBuilder', () => {
      const mockDataLoadService = {} as SisenseDataLoadService;
      vi.mocked(SisenseDataLoadService).mockReturnValue(mockDataLoadService);

      const client = new PivotClient(mockPivotQueryClient);
      client.prepareDataService();

      expect(SisenseDataLoadService).toHaveBeenCalledTimes(1);
      expect(SisenseDataLoadService).toHaveBeenCalledWith(mockSocket);
    });

    it('should create DataService with SisenseDataLoadService instance', () => {
      const mockDataLoadService = {} as SisenseDataLoadService;
      const mockDataService = {} as DataService;

      vi.mocked(SisenseDataLoadService).mockReturnValue(mockDataLoadService);
      vi.mocked(DataService).mockReturnValue(mockDataService);

      const client = new PivotClient(mockPivotQueryClient);
      const result = client.prepareDataService();

      expect(DataService).toHaveBeenCalledTimes(1);
      expect(DataService).toHaveBeenCalledWith(mockDataLoadService);
      expect(result).toBe(mockDataService);
    });
  });

  describe('preparePivotBuilder', () => {
    it('should create PivotBuilder with DataService from prepareDataService', () => {
      const mockDataLoadService = {} as SisenseDataLoadService;
      const mockDataService = {} as DataService;
      const mockPivotBuilder = {} as PivotBuilder;

      vi.mocked(SisenseDataLoadService).mockReturnValue(mockDataLoadService);
      vi.mocked(DataService).mockReturnValue(mockDataService);
      vi.mocked(PivotBuilder).mockReturnValue(mockPivotBuilder);

      const client = new PivotClient(mockPivotQueryClient);
      const result = client.preparePivotBuilder();

      expect(SisenseDataLoadService).toHaveBeenCalledTimes(1);
      expect(DataService).toHaveBeenCalledTimes(1);
      expect(PivotBuilder).toHaveBeenCalledTimes(1);
      expect(PivotBuilder).toHaveBeenCalledWith(mockDataService);
      expect(result).toBe(mockPivotBuilder);
    });
  });
});
