import { AbstractTranslatableError } from './abstract-translatable-error.js';
import { basicI18Next } from './i18next.js';

vi.mock('./i18next.js', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./i18next.js')>();
  return {
    ...mod,
    basicI18Next: {
      i18nextInstance: {
        t: vi.fn().mockReturnValue('Mocked error message'),
      },
    },
  };
});

class ConcreteTranslatableError extends AbstractTranslatableError {}

describe('AbstractTranslatableError', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance of AbstractTranslatableError', () => {
      const error = new ConcreteTranslatableError('namespace', { key: 'error_key' });
      expect(error).toBeInstanceOf(AbstractTranslatableError);
    });

    it('should call i18next t function with correct parameters', () => {
      const namespace = 'testNamespace';
      const key = 'error_key';
      const interpolationOptions = { option1: 'value1', option2: 'value2' };

      new ConcreteTranslatableError(namespace, { key, interpolationOptions });

      expect(basicI18Next.i18nextInstance.t).toHaveBeenCalledWith(key, {
        ...interpolationOptions,
        ns: namespace,
        lng: 'en',
      });
    });

    it('should set key, namespace, and interpolationOptions correctly', () => {
      const namespace = 'testNamespace';
      const key = 'error_key';
      const interpolationOptions = { option1: 'value1', option2: 'value2' };

      const error = new ConcreteTranslatableError(namespace, { key, interpolationOptions });

      expect(error.key).toBe(key);
      expect(error.namespace).toBe(namespace);
      expect(error.interpolationOptions).toEqual({
        ...interpolationOptions,
        ns: namespace,
      });
    });
  });
});
