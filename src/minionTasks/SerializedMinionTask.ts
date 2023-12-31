import { getEditorManager } from '../managers/EditorManager';
import { getMinionTasksManager } from '../managers/MinionTasksManager';
import { WorkspaceFilesKnowledge } from './generateDescriptionForWorkspaceFiles';
import { ApplicationStatus, MinionTask } from './MinionTask';
import { MINION_TASK_STRATEGY_ID } from './strategies';

export type SerializedMinionTask = {
  id: string;
  minionIndex: number;
  documentURI: string;
  userQuery: string;
  selection: {
    startLine: number;
    startCharacter: number;
    endLine: number;
    endCharacter: number;
  };
  selectedText: string;
  originalContent: string;
  finalContent: string;
  startTime: number;
  shortName: string;
  modificationDescription: string;
  modificationProcedure: string;
  inlineMessage: string;
  executionStage: string;
  strategy: string | null;
  logContent: string;
  contentWhenDismissed: string;
  aplicationStatus?: ApplicationStatus;
  relevantKnowledge?: WorkspaceFilesKnowledge[];
};

export function serializeMinionTask(
  minionTask: MinionTask,
): SerializedMinionTask {
  return {
    id: minionTask.id,
    minionIndex: minionTask.minionIndex,
    documentURI: minionTask.documentURI.toString(),
    userQuery: minionTask.userQuery,
    selection: {
      startLine: minionTask.selection.start.line,
      startCharacter: minionTask.selection.start.character,
      endLine: minionTask.selection.end.line,
      endCharacter: minionTask.selection.end.character,
    },
    selectedText: minionTask.selectedText,
    originalContent: minionTask.getOriginalContent,
    finalContent: minionTask.contentAfterApply,
    startTime: minionTask.startTime,
    shortName: minionTask.shortName,
    modificationDescription: minionTask.modificationDescription,
    modificationProcedure: minionTask.modificationProcedure,
    inlineMessage: minionTask.inlineMessage,
    executionStage: minionTask.executionStage,
    strategy: minionTask.strategyId === '' ? null : minionTask.strategyId,
    logContent: minionTask.logContent,
    contentWhenDismissed: minionTask.contentWhenDismissed,
    aplicationStatus: minionTask.applicationStatus,
    relevantKnowledge: minionTask.relevantKnowledge,
  };
}

export function deserializeMinionTask(data: SerializedMinionTask): MinionTask {
  const minionTask = new MinionTask({
    id: data.id,
    minionIndex: data.minionIndex || 0,
    documentURI: getEditorManager().createUri(data.documentURI),
    userQuery: data.userQuery,
    selection: {
      start: {
        line: data.selection.startLine,
        character: data.selection.startCharacter,
      },
      end: {
        line: data.selection.endLine,
        character: data.selection.endCharacter,
      },
    },
    selectedText: data.selectedText,
    originalContent: data.originalContent,
    finalContent: data.finalContent,
    startTime: data.startTime,
    shortName: data.shortName,
    modificationDescription: data.modificationDescription,
    modificationProcedure: data.modificationProcedure,
    inlineMessage: data.inlineMessage,
    executionStage: data.executionStage,
    strategyId:
      data.strategy === null ? '' : (data.strategy as MINION_TASK_STRATEGY_ID),
    onChanged: async (important: boolean) => {
      getMinionTasksManager().updateExecution(important, minionTask);
    },
    logContent: data.logContent,
    contentWhenDismissed: data.contentWhenDismissed,
    aplicationStatus: data.aplicationStatus,
    relevantKnowledge: data.relevantKnowledge,
  });

  return minionTask;
}
