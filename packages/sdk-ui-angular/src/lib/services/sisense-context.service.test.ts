import { createClientApplication, ClientApplication } from '@sisense/sdk-ui-preact';
import { SisenseContextService, SisenseContextConfig } from './sisense-context.service';
import { Mock } from 'vitest';

vi.mock('@sisense/sdk-ui-preact', () => ({
  createClientApplication: vi.fn().mockResolvedValue(undefined),
}));

const createClientApplicationMock = createClientApplication as Mock<
  Parameters<typeof createClientApplication>,
  ReturnType<typeof createClientApplication>
>;

describe('SisenseContextService', () => {
  let sisenseContextService: SisenseContextService;
  let sisenseConfigMock: SisenseContextConfig;

  beforeEach(() => {
    sisenseConfigMock = {
      url: 'https://example.com/sisense',
      token: 'mocked-token',
      defaultDataSource: 'Sample',
    };

    sisenseContextService = new SisenseContextService(sisenseConfigMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(sisenseContextService).toBeTruthy();
  });

  it('should initialize the appPromise with createClientApplication', async () => {
    const mockApp: ClientApplication = { httpClient: {} } as ClientApplication;

    createClientApplicationMock.mockResolvedValue(mockApp);
    // recreate system-under-test with mocked createClientApplication behavior
    sisenseContextService = new SisenseContextService(sisenseConfigMock);

    const app = await sisenseContextService.getApp();

    expect(app).toBe(mockApp);
    expect(createClientApplicationMock).toHaveBeenCalledWith(sisenseConfigMock);
  });

  it('should return the correct configuration', () => {
    const config = sisenseContextService.getConfig();

    expect(config).toEqual({
      ...sisenseConfigMock,
      enableTracking: true,
      showRuntimeErrors: true,
    });
  });
});
