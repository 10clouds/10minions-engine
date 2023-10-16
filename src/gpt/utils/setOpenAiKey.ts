let openAIApiKey: string | undefined;

export function setOpenAIApiKey(apiKey: string) {
  openAIApiKey = apiKey;
}

export function getOpenAIApiKey() {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found. Please set it in the settings.');
  }

  return openAIApiKey;
}
