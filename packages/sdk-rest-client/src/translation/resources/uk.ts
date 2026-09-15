import { TranslationDictionary } from './index.js';

/**
 * Translation dictionary for Ukrainian language.
 */
export const translation: TranslationDictionary = {
  errorPrefix: '[request-error]',
  errors: {
    networkError:
      'Помилка мережі. Можливо ви забули додати свій домен до «CORS Allowed Origins» в панелі адміністратора Sisense -> Security Settings.',
    authFailed: 'Автентифікація не вдалася.',
    ssoNotEnabled:
      'SSO не ввімкнено на цьому сервері, будь ласка, виберіть інший метод аутентифікації',
    ssoNoLoginUrl: 'Неможливо отримати SSO login URL з сервера. Перевірте налаштування SSO.',
    passwordAuthFailed:
      '$t(errorPrefix) Помилка автентифікації за допомогою імені користувача та пароля. Перевірте дані для входу.',
    tokenAuthFailed:
      '$t(errorPrefix) Помилка автентифікації за допомогою токена. Перевірте дані для входу.',
    authRedirectLimitExceeded:
      'Досягнуто ліміт перенаправлень SSO. Автентифікацію може блокувати налаштування конфіденційності браузера або обмеження сторонніх cookie. Перевірте конфігурацію SSO або спробуйте інший браузер.',
    sessionExpired: '$t(errorPrefix) Сесія завершилася. Потрібна повторна автентифікація.',
    forbidden:
      '$t(errorPrefix) Доступ заборонено ({{status}}). У вас немає прав для виконання цього запиту.',
    responseError: '$t(errorPrefix) Запит не вдався зі статусом {{status}}.',
    responseError_onlyStatus: '$t(errorPrefix) Запит не вдався зі статусом {{status}}.',
    responseError_withStatusText:
      '$t(errorPrefix) Запит не вдався зі статусом {{status}} {{statusText}}.',
  },
};
