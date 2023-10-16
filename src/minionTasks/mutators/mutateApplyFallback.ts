import { getEditorManager } from '../../managers/EditorManager';
import { mutateAppendToLogNoNewline } from '../../tasks/logs/mutators/mutateAppendToLogNoNewline';
import { decomposeMarkdownString } from '../../utils/string/decomposeMarkdownString';
import { ApplicationStatus, MinionTask } from '../MinionTask';

export const LOG_PLAIN_COMMENT_MARKER = `\nPLAIN COMMENT FALLBACK\n`;

export async function mutatorApplyFallback(minionTask: MinionTask) {
  const document = await minionTask.document();
  const language = document.languageId || 'javascript';

  const decomposedString = decomposeMarkdownString(
    `
Task: ${minionTask.userQuery}

${minionTask.modificationDescription}
`.trim(),
    language,
  ).join('\n');

  mutateAppendToLogNoNewline(minionTask, LOG_PLAIN_COMMENT_MARKER);

  minionTask.setOriginalContent = document.getText();
  minionTask.applicationStatus = ApplicationStatus.APPLIED_AS_FALLBACK;

  getEditorManager().applyWorkspaceEdit(async (edit) => {
    edit.insert(
      minionTask.documentURI,
      { line: 0, character: 0 },
      `${decomposedString}\n`,
    );
  });

  getEditorManager().showInformationMessage(
    `Modification applied successfully.`,
  );
}
