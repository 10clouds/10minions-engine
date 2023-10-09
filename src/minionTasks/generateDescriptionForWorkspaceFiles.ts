import { countTokens } from '../gpt/countTokens';
import { GPTMode } from '../gpt/types';
import { mutateCreateFileDescription } from './mutators/mutateCreateFileDescription';

export interface WorkspaceFilesKnowledge {
  id: string;
  description: string;
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
export const generateDescriptionForFile = async (file: {
  content: string;
  path: string;
}) => {
  const { path, content } = file;
  console.log('GENERATING DATA FOR: ', path);
  try {
    const data = await mutateCreateFileDescription(file);
    if (data) {
      const { description } = data;

      return {
        id: path,
        description,
        content,
        summaryContentTokensCount: countKnowledgeTokens(content),
      };
    }
  } catch (err) {
    console.error(err);
  }
};
