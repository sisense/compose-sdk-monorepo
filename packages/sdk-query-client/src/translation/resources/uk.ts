import { TranslationDictionary } from './index.js';

export const translation: TranslationDictionary = {
  errors: {
    invalidAttribute: `Недійсний атрибут {{attributeName}}. Підказка: атрибути для запиту повинні бути витягнуті з моделі даних, створеної за допомогою CLI-інструменту.`,
    noDimensionsOrMeasures: `Не знайдено ні розмірів, ні показників. Запит повинен мати щонайменше один розмір або показник.`,
    invalidMeasure: `Недійсний показник "{{measureName}}". Підказка: показники для запиту можна створити за допомогою функцій "measures".`,
    invalidFilter: `Недійсний фільтр "{{filterName}}". Підказка: фільтри для запиту можна створити за допомогою функцій "filters".`,
    invalidHighlight: `Недійсне виділення "{{highlightName}}". Підказка: виділення для запиту можна створити за допомогою функцій "filters".`,
    invalidCountNegative: `Недійсний count "{{count}}". Count повинен бути не від'ємним.`,
    invalidCountLimit: `Недійсний count "{{count}}". Count не повинен перевищувати {{limit}}.`,
    invalidOffset: `Недійсний offset "{{offset}}". Offset повинен бути не від'ємним.`,
    missingHttpClient: `Для запиту потрібен httpClient, щоб працювати належним чином.`,
    missingPostMethod: `httpClient повинен мати метод "post".`,
  },
};
