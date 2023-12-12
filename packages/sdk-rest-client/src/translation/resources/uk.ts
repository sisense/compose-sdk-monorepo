import { TranslationDictionary } from './index.js';

/**
 * Translation dictionary for Ukrainian language.
 */
export const translation: TranslationDictionary = {
  errorPrefix: '[request-error]',
  errors: {
    networkError:
      'Помилка мережі. Можливо ви забули додати свій домен до «CORS Allowed Origins» в панелі адміністратора Sisense -> Security Settings.',
    ssoNotEnabled:
      'SSO не ввімкнено на цьому сервері, будь ласка, виберіть інший метод аутентифікації',
    passwordAuthFailed:
      '$t(errorPrefix) Помилка автентифікації за допомогою імені користувача та пароля. Перевірте дані для входу.',
    tokenAuthFailed:
      '$t(errorPrefix) Помилка автентифікації за допомогою токена. Перевірте дані для входу.',
    responseError_onlyStatus: '$t(errorPrefix) Статус: {{status}}',
    responseError_withStatusText: '$t(errorPrefix) Статус: {{status}} - {{statusText}}',
  },
};
