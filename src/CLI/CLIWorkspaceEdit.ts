import {
  EditorPosition,
  EditorRange,
  EditorUri,
  WorkspaceEdit,
} from '../managers/EditorManager';
import { CLIEditEntry } from './CLIEditEntry';

export class CLIWorkspaceEdit implements WorkspaceEdit {
  private entries: [EditorUri, CLIEditEntry[]][] = [];

  replace(uri: EditorUri, range: EditorRange, newText: string): void {
    this.entries.push([
      uri,
      [
        new CLIEditEntry(
          'replace',
          range.start.line,
          range.start.character,
          newText,
          range.end.line,
          range.end.character,
        ),
      ],
    ]);
  }

  insert(uri: EditorUri, position: EditorPosition, newText: string): void {
    this.entries.push([
      uri,
      [new CLIEditEntry('insert', position.line, position.character, newText)],
    ]);
  }

  getEntries() {
    return this.entries;
  }
}
