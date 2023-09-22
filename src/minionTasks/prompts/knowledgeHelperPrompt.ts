import { WorkspaceFilesKnowledge } from '../generateDescriptionForWorkspaceFiles';

export const knowledgeHelperPrompt = (knowledge?: WorkspaceFilesKnowledge[]) =>
  knowledge && knowledge.length
    ? {
        ['KNOWLEDGE']: `Use this knowledge as a helper - this information gives you wider context of the app
        ${knowledge.map(
          ({ id, content, functions }) => `
        ===================

        # File path: ${id}, 
        # File content: ${content},
        # Functions: 
        ${functions?.map(
          ({ functionName, description }) => `
        - Function name: ${functionName},
        - Function description: ${description}
        `,
        )}`,
        )}
        `.trim(),
      }
    : '';
