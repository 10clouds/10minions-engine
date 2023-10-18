import {
  EditorDocument,
  EditorManager,
  EditorUri,
  WorkspaceEdit,
} from '../managers/EditorManager';
import { CLIEditorDocument } from './CLIEditorDocument';
import { CLIWorkspaceEdit } from './CLIWorkspaceEdit';
export class CLIEditorManager implements EditorManager {
  private openDocuments: EditorDocument[] = [];

  constructor(public dryRun = false) {}

  applyWorkspaceEdit(
    fillEdit: <T extends WorkspaceEdit>(edit: T) => Promise<void>,
  ) {
    const edit = new CLIWorkspaceEdit();
    fillEdit(edit);
    this.applyEdit(edit);
  }

  async applyEdit(edit: CLIWorkspaceEdit) {
    const promises = edit.getEntries().map(async ([uri, edits]) => {
      const document = (await this.openTextDocument(uri)) as CLIEditorDocument;

      edits.forEach((edit) => {
        const range = {
          start: {
            line: edit.startLine,
            character: edit.startCharacter,
          },
          end: {
            line: edit.endLine ?? edit.startLine,
            character: edit.endCharacter ?? edit.startCharacter,
          },
        };
        const text = edit.text;

        if (edit.action === 'replace') {
          document.replace(range, text);
        } else if (edit.action === 'insert') {
          document.insert(range.start, text);
        }
      });

      if (!this.dryRun) {
        document.save();
      }
    });

    // Await for all the promises to complete.
    await Promise.all(promises);
  }

  showErrorMessage(message: string): void {
    console.error(message);
  }

  async openTextDocument(uri: EditorUri) {
    const existingDocument = this.openDocuments.find(
      (doc) => doc.uri.toString() === uri.toString(),
    );
    if (existingDocument) {
      return existingDocument;
    }

    const document = new CLIEditorDocument(uri);
    this.openDocuments.push(document);

    return document;
  }

  closeTextDocument(uri: EditorUri) {
    const index = this.openDocuments.findIndex(
      (doc) => doc.uri.toString() === uri.toString(),
    );
    if (index !== -1) {
      this.openDocuments.splice(index, 1);
    }
  }

  showInformationMessage(message: string): void {
    console.log(message);
  }

  createUri(uri: string): EditorUri {
    return {
      fsPath: uri,
      toString: () => uri,
    };
  }
}
