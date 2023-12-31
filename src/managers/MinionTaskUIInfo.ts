export type MinionTaskUIInfo = {
  id: string;
  minionIndex: number;
  documentName: string;
  documentURI: string;
  userQuery: string;
  executionStage: string;
  progress: number;
  stopped: boolean;
  inlineMessage: string;
  modificationDescription: string;
  modificationProcedure: string;
  selectedText: string;
  shortName: string;
  isError: boolean;
};
