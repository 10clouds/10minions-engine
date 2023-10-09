import {
  countKnowledgeTokens,
  WorkspaceFilesKnowledge,
} from '../generateDescriptionForWorkspaceFiles';
import { oopKnowledge } from './oopKnowledge';
import { reactKnowledge } from './reactKnowlede';
import { scssKnowledge } from './scssKnowledge';
import { typescriptKnowledge } from './typescriptKnowledge';

// TODO: add knowledge about other languages eg. python
export const minionsKnowledge: WorkspaceFilesKnowledge[] = [
  {
    id: 'InfoAboutTypescript',
    description:
      'Info about Typescript language, use it if project use typescript (has .ts or .tsx file extensions) and if you need to know how to use it and what it is.',
    content: typescriptKnowledge,
    summaryContentTokensCount: countKnowledgeTokens(typescriptKnowledge),
  },
  {
    id: 'InfoAboutObjectOrientedProgramming',
    description:
      'Info about Object Oriented Programming, use it if file is based on OOP (has classes, interfaces, inheritance, etc.) and if you need to know how to use it and what it is.',
    content: typescriptKnowledge,
    summaryContentTokensCount: countKnowledgeTokens(oopKnowledge),
  },
  {
    id: 'InfoAboutScss',
    description:
      'Info about SCSS language, use it if project use SCSS (has .scss file extensions) and if you need to know how to use it and what it is',
    content: typescriptKnowledge,
    summaryContentTokensCount: countKnowledgeTokens(scssKnowledge),
  },
  {
    id: 'InfoAboutReact',
    description:
      'Info about React library, use it if project use React and if you need to know how to use it and what it is',
    content: reactKnowledge,
    summaryContentTokensCount: countKnowledgeTokens(reactKnowledge),
  },
];
