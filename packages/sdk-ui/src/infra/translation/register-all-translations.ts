import { i18nextInstance } from './initialize-i18n.js';
import deDe from './resources/__external__/de-de.js';
import esAr from './resources/__external__/es-ar.js';
import esEs from './resources/__external__/es-es.js';
import frFr from './resources/__external__/fr-fr.js';
import itIt from './resources/__external__/it-it.js';
import jaJp from './resources/__external__/ja-jp.js';
import koKr from './resources/__external__/ko-kr.js';
import nlNl from './resources/__external__/nl-nl.js';
import ptBr from './resources/__external__/pt-br.js';
import ruRu from './resources/__external__/ru-ru.js';
import trTr from './resources/__external__/tr-tr.js';
import zhCn from './resources/__external__/zh-cn.js';

const ALL_TRANSLATIONS = [
  deDe,
  esAr,
  esEs,
  frFr,
  itIt,
  jaJp,
  koKr,
  nlNl,
  ptBr,
  ruRu,
  trTr,
  zhCn,
].flat();

/**
 * Adds every locale dictionary shipped with the package to the shared i18next instance.
 *
 * For builds that have no `translations/*` subpath exports (the UMD bundle), so their host
 * cannot pass the dictionaries through `translationConfig.customTranslations`.
 *
 * @internal
 */
export function registerAllTranslations(): void {
  for (const { language, namespace, resources } of ALL_TRANSLATIONS) {
    i18nextInstance.addResourceBundle(language, namespace, resources);
  }
}
