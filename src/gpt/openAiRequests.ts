import fetch from 'node-fetch';

import { GPTExecuteRequestData } from './types';

export const getOpenAiModels = async (openAIApiKey: string) =>
  await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAIApiKey}`,
    },
  });

export const getCompletions = async (
  openAIApiKey: string,
  requestData: GPTExecuteRequestData,
  signal: AbortSignal,
) =>
  await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify(requestData),
    signal,
  });
