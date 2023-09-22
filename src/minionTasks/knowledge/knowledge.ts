import { GPTMode } from '../../gpt/types';
import { WorkspaceFilesKnowledge, countKnowledgeTokens } from '../generateDescriptionForWorkspaceFiles';
import { typescriptKnowledge } from './typescriptKnowledge';

export const minionsKnowledge: WorkspaceFilesKnowledge[] = [
  {
    id: 'InfoAboutTypescript',
    description:
      'Info Typescript language, use it if project use typescript (has .ts or .tsx file extensions) and if you need to know how to use it and what it is.',
    content: typescriptKnowledge,
    summaryContentTokensCount: countKnowledgeTokens(typescriptKnowledge),
  },
];
