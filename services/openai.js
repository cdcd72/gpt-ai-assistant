import axios from 'axios';
import FormData from 'form-data';
import config from '../config/index.js';
import { handleFulfilled, handleRejected, handleRequest } from './utils/index.js';

export const ROLE_SYSTEM = 'system';
export const ROLE_AI = 'assistant';
export const ROLE_HUMAN = 'user';

export const FINISH_REASON_STOP = 'stop';
export const FINISH_REASON_LENGTH = 'length';

export const IMAGE_SIZE_256 = '256x256';
export const IMAGE_SIZE_512 = '512x512';
export const IMAGE_SIZE_1024 = '1024x1024';

export const MODEL_GPT_3_5_TURBO = 'gpt-3.5-turbo';
export const MODEL_GPT_4_OMNI = 'gpt-4o';
export const MODEL_WHISPER_1 = 'whisper-1';

const client = axios.create({
  baseURL: config.OPENAI_BASE_URL,
  timeout: config.OPENAI_TIMEOUT,
  headers: {
    'Accept-Encoding': 'gzip, deflate, compress',
  },
});

client.interceptors.request.use((c) => {
  c.headers.Authorization = `Bearer ${config.OPENAI_API_KEY}`;
  return handleRequest(c);
});

client.interceptors.response.use(handleFulfilled, (err) => {
  if (err.response?.data?.error?.message) {
    err.message = err.response.data.error.message;
  }
  return handleRejected(err);
});

const isAboutImageCompletion = ({ messages }) => {
  let flag = false;
  messages.forEach((message) => {
    if (message.role === ROLE_AI && message.content === 'Get Image') {
      flag = true;
    }
  });
  return flag;
};

const createChatCompletion = ({
  model = config.OPENAI_COMPLETION_MODEL,
  messages,
  temperature = config.OPENAI_COMPLETION_TEMPERATURE,
  maxTokens = config.OPENAI_COMPLETION_MAX_TOKENS,
  frequencyPenalty = config.OPENAI_COMPLETION_FREQUENCY_PENALTY,
  presencePenalty = config.OPENAI_COMPLETION_PRESENCE_PENALTY,
}) => {
  const body = {
    model: isAboutImageCompletion({ messages }) ? MODEL_GPT_4_OMNI : model,
    messages,
    temperature,
    max_tokens: maxTokens,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
  };
  return client.post('/v1/chat/completions', body);
};

const createTextCompletion = ({
  model = config.OPENAI_COMPLETION_MODEL,
  prompt,
  temperature = config.OPENAI_COMPLETION_TEMPERATURE,
  maxTokens = config.OPENAI_COMPLETION_MAX_TOKENS,
  frequencyPenalty = config.OPENAI_COMPLETION_FREQUENCY_PENALTY,
  presencePenalty = config.OPENAI_COMPLETION_PRESENCE_PENALTY,
  stop = config.OPENAI_COMPLETION_STOP_SEQUENCES,
}) => client.post('/v1/completions', {
  model,
  prompt,
  temperature,
  max_tokens: maxTokens,
  frequency_penalty: frequencyPenalty,
  presence_penalty: presencePenalty,
  stop,
});

const createImage = ({
  model = config.OPENAI_IMAGE_GENERATION_MODEL,
  prompt,
  size = config.OPENAI_IMAGE_GENERATION_SIZE,
  quality = config.OPENAI_IMAGE_GENERATION_QUALITY,
  n = 1,
}) => {
  // DALL-E 3 only supports 1024x1024 image size.
  if (model === 'dall-e-3' && [IMAGE_SIZE_256, IMAGE_SIZE_512].includes(size)) {
    size = IMAGE_SIZE_1024;
  }

  return client.post('/v1/images/generations', {
    model,
    prompt,
    size,
    quality,
    n,
  });
};

const createAudioTranscriptions = ({
  buffer,
  file,
  model = MODEL_WHISPER_1,
}) => {
  const formData = new FormData();
  formData.append('file', buffer, file);
  formData.append('model', model);
  return client.post('/v1/audio/transcriptions', formData.getBuffer(), {
    headers: formData.getHeaders(),
  });
};

export {
  createChatCompletion,
  createTextCompletion,
  createImage,
  createAudioTranscriptions,
};
