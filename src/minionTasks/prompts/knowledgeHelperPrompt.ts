import { WorkspaceFilesKnowledge } from '../generateDescriptionForWorkspaceFiles';

export const knowledgeHelperPrompt = (knowledge?: WorkspaceFilesKnowledge[]) =>
  knowledge && knowledge.length
    ? {
        ['KNOWLEDGE']:
          `Use this knowledge as a helper - this information gives you wider context of the task and can help you to understand the task better and provide better answer.
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
