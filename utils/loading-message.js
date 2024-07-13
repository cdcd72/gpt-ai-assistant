import config from '../config/index.js';
import { loading } from '../services/line.js';

const loadingMessage = ({ chatId, loadingSeconds = 60 }) => {
  if (config.APP_ENV !== 'production') return { chatId, loadingSeconds };
  return loading({ chatId, loadingSeconds });
};

export default loadingMessage;
