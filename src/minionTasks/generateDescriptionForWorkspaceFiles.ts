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

export const generateDescriptionForFiles = async (files: WorkspaceFileData[]) => {
  const workspaceFilesKnowledge: WorkspaceFilesKnowledge[] = [];

  files.forEach(async (file, i) => {
    const { path, content } = file;
    console.log('GENERATING DATA FOR: ', path, ' iteration: ', i);
    try {
      const data = await mutateCreateFileDescription(file);

      if (data) {
        const { description, functions } = data;

        workspaceFilesKnowledge.push({
          id: path,
          description,
          functions,
          content: content,
          summaryContentTokensCount: countKnowledgeTokens(content),
        });
      }
    } catch (err) {
      console.error(err);
    }
  });

  return workspaceFilesKnowledge;
};
