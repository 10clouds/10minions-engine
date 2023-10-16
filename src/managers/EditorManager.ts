export type EditorPosition = {
  readonly line: number;
  readonly character: number;
};
export type EditorTextEdit = {
  action: string;
  startLine: number;
  startCharacter: number;
  text: string;
  endLine?: number;
  endCharacter?: number;
};

export interface WorkspaceEdit {
  replace(uri: EditorUri, range: EditorRange, newText: string): void;
  insert(uri: EditorUri, position: EditorPosition, newText: string): void;
  getEntries(): [EditorUri, EditorTextEdit[]][];
}

export type EditorRange = {
  readonly start: EditorPosition;
  readonly end: EditorPosition;
};

export type EditorUri = {
  readonly fsPath: string;
  toString(): string;
};

export type EditorDocument = {
  readonly languageId: string;
  getText(range?: EditorRange): string;
  readonly lineCount: number;
  readonly uri: EditorUri;
  lineAt(line: number): {
    readonly text: string;
    readonly lineNumber: number;
  };
};

export interface EditorManager {
  applyWorkspaceEdit(
    fillEdit: <T extends WorkspaceEdit>(edit: T) => Promise<void>,
  ): void;
  showInformationMessage(message: string): void;
  openTextDocument(uri: EditorUri): Promise<EditorDocument>;
  closeTextDocument?(uri: EditorUri): void;
  showErrorMessage(message: string): void;
  createUri(uri: string): EditorUri;
}

let globalEditorManger: EditorManager | undefined = undefined;

export function setEditorManager(editorManager: EditorManager | undefined) {
  if (editorManager === undefined) {
    globalEditorManger = undefined;

    return;
  }

  if (globalEditorManger) {
    throw new Error(`EditorManager is already set.`);
  }
  globalEditorManger = editorManager;
}

export function getEditorManager(): EditorManager {
  if (!globalEditorManger) {
    throw new Error(`EditorManager is not set.`);
  }

  return globalEditorManger;
}
