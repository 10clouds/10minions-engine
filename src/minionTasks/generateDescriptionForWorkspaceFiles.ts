import { countTokens } from '../gpt/countTokens';
import { GPTMode } from '../gpt/types';
import { WorkspaceFileData, mutateCreateFileDescription } from './mutators/mutateCreateFileDescription';

interface FunctionInfo {
  functionName: string;
  description: string;
  fullFunction?: string;
}

export interface WorkspaceFilesKnowledge {
  id: string;
  description: string;
  functions?: FunctionInfo[];
  content: string;
  summaryContentTokensCount: {
    [GPTMode.FAST]: number;
    [GPTMode.QUALITY]: number;
  };
}

export const countKnowledgeTokens = (content: string) => ({
  [GPTMode.FAST]: countTokens(content, GPTMode.FAST),
  [GPTMode.QUALITY]: countTokens(content, GPTMode.QUALITY),
});

// TODO: this loop is no needed anymore - refactor this in future to just accept a WorkspaceFileData not WorkspaceFileData[]
export const generateDescriptionForFiles = async (files: WorkspaceFileData[], onProcessStart?: () => void) => {
  let i = 0;
  const promises = [];
  while (files.length - 1 >= i) {
    const file = files[i];
    const { path, content } = file;
    console.log('GENERATING DATA FOR: ', path);
    try {
      const data = await mutateCreateFileDescription(file, onProcessStart);
      i++;
      if (data) {
        const { description, functions } = data;
        promises.push({
          id: path,
          description,
          functions,
          content,
          summaryContentTokensCount: countKnowledgeTokens(content),
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  const results = await Promise.all(promises);

  return results.filter(Boolean);
};
