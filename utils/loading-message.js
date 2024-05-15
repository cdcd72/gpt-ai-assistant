import config from '../config/index.js';
import { loading } from '../services/line.js';

const loadingMessage = ({ chatId, loadingSeconds = 20 }) => {
  if (config.APP_ENV !== 'production') return { chatId, loadingSeconds };
  return loading({ chatId, loadingSeconds });
};

export default loadingMessage;
