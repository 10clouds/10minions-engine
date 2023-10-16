import { getOpenAiModels } from '../openAiRequests';
import { GPTModel, MODEL_DATA, ModelsResponseData } from '../types';

/**
 * Function to check the availability of all models in OpenAI.
 */
export async function getMissingOpenAIModels(
  openAIApiKey: string,
): Promise<GPTModel[]> {
  const missingModels: GPTModel[] = Object.keys(MODEL_DATA) as GPTModel[];

  try {
    const response = await getOpenAiModels(openAIApiKey);

    const responseData = (await response.json()) as ModelsResponseData;
    if (!responseData || !responseData.data) {
      console.error('No data received from OpenAI models API.');

      return missingModels;
    }

    const availableModels = responseData.data.map((model) => model.id);

    return missingModels.filter((model) => !availableModels.includes(model));
  } catch (error) {
    console.error(`Error occurred while checking models: ${error}`);

    return missingModels;
  }
}
