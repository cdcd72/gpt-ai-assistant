import { TYPE_TRANSLATE } from '../../constants/command.js';
import { t } from '../../locales/index.js';
import Command from './command.js';
import config from '../../config/index.js';

export default new Command({
  type: TYPE_TRANSLATE,
  label: t('__COMMAND_TRANSLATE_TO_ZH_LABEL'),
  text: t('__COMMAND_TRANSLATE_TO_ZH_TEXT'),
  prompt: t('__COMMAND_TRANSLATE_TO_ZH_PROMPT')(config.APP_LANG),
  aliases: [
    '/translate-to-zh',
    'Translate to Zhong Wen',
    'Translate to ZH',
  ],
});
