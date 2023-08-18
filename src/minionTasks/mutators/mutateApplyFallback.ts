import { ApplicationStatus, MinionTask } from '../MinionTask';
import { mutateAppendToLogNoNewline } from '../../tasks/logs/mutators/mutateAppendToLogNoNewline';
import { getEditorManager } from '../../managers/EditorManager';
import { decomposeMarkdownString } from '../../utils/string/decomposeMarkdownString';

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

  minionTask.originalContent = document.getText();
  minionTask.aplicationStatus = ApplicationStatus.APPLIED_AS_FALLBACK;

  await getEditorManager().applyWorkspaceEdit(async (edit) => {
    edit.insert(minionTask.documentURI, { line: 0, character: 0 }, decomposedString + '\n');
  });
  getEditorManager().showInformationMessage(`Modification applied successfully.`);
}
