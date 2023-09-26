import { MinionTaskUIInfo } from './MinionTaskUIInfo';

export enum MessageToWebViewType {
  CLEAR_AND_FOCUS_ON_INPUT,
  EXECUTIONS_UPDATED,
  UPDATE_SIDEBAR_VISIBILITY,
  API_KEY_SET,
  API_KEY_MISSING_MODELS,
  TOKEN_COUNT,
  CHOSEN_CODE_UPDATED,
  SUGGESTIONS,
}

export enum MessageToVSCodeType {
  NEW_MINION_TASK,
  OPEN_DOCUMENT,
  OPEN_LOG,
  SHOW_DIFF,
  RERUN_EXECUTION,
  STOP_EXECUTION,
  SUGGESTION_GET,
  CLOSE_EXECUTION,
  READY_FOR_MESSAGES,
  APPLY_AND_REVIEW_TASK,
  OPEN_SELECTION,
  MARK_AS_APPLIED,
  EDIT_API_KEY,
}
export type MessageToWebView =
  | { type: MessageToWebViewType.CLEAR_AND_FOCUS_ON_INPUT }
  | {
      type: MessageToWebViewType.EXECUTIONS_UPDATED;
      executions: MinionTaskUIInfo[];
    }
  | { type: MessageToWebViewType.UPDATE_SIDEBAR_VISIBILITY; value: boolean }
  | { type: MessageToWebViewType.API_KEY_SET; value: boolean }
  | { type: MessageToWebViewType.API_KEY_MISSING_MODELS; models: string[] }
  | { type: MessageToWebViewType.TOKEN_COUNT; value: number }
  | { type: MessageToWebViewType.CHOSEN_CODE_UPDATED; code: string }
  | {
      type: MessageToWebViewType.SUGGESTIONS;
      suggestions: string[];
      forInput: string;
    };

export type MessageToVSCode =
  | { type: MessageToVSCodeType.NEW_MINION_TASK; value?: string }
  | { type: MessageToVSCodeType.OPEN_DOCUMENT; minionTaskId: string }
  | { type: MessageToVSCodeType.OPEN_LOG; minionTaskId: string }
  | { type: MessageToVSCodeType.SHOW_DIFF; minionTaskId: string }
  | {
      type: MessageToVSCodeType.RERUN_EXECUTION;
      minionTaskId: string;
      newUserQuery?: string;
    }
  | { type: MessageToVSCodeType.STOP_EXECUTION; minionTaskId: string }
  | { type: MessageToVSCodeType.SUGGESTION_GET; input: string }
  | { type: MessageToVSCodeType.CLOSE_EXECUTION; minionTaskId: string }
  | { type: MessageToVSCodeType.READY_FOR_MESSAGES }
  | { type: MessageToVSCodeType.EDIT_API_KEY }
  | {
      type: MessageToVSCodeType.APPLY_AND_REVIEW_TASK;
      minionTaskId: string;
      reapply: boolean;
    }
  | { type: MessageToVSCodeType.OPEN_SELECTION; minionTaskId: string }
  | { type: MessageToVSCodeType.MARK_AS_APPLIED; minionTaskId: string };
