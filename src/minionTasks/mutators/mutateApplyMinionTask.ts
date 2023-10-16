import { getEditorManager } from '../../managers/EditorManager';
import { mutateAppendToLog } from '../../tasks/logs/mutators/mutateAppendToLog';
import { mutateAppendToLogNoNewline } from '../../tasks/logs/mutators/mutateAppendToLogNoNewline';
import {
  APPLIED_STAGE_NAME,
  APPLYING_STAGE_NAME,
  FINISHED_STAGE_NAME,
} from '../../tasks/stageNames';
import { applyModificationProcedure } from '../applyModificationProcedure';
import { ApplicationStatus, MinionTask } from '../MinionTask';
import { mutatorApplyFallback } from './mutateApplyFallback';

export const LOG_NO_FALLBACK_MARKER = `Applied changes for user review.\n\n`;

export async function mutatorApplyMinionTask(minionTask: MinionTask) {
  const document = await minionTask.document();

  if (minionTask.executionStage !== FINISHED_STAGE_NAME) {
    getEditorManager().showErrorMessage(`Cannot apply unfinished task.`);
    minionTask.applicationStatus = ApplicationStatus.NOT_APPLIED;

    return;
  }

  minionTask.executionStage = APPLYING_STAGE_NAME;
  minionTask.progress = 0;
  await minionTask.onChange(true);

  const interval = setInterval(() => {
    minionTask.progress = minionTask.progress + (1 - minionTask.progress) * 0.3;
    minionTask.onChange(false);
  }, 100);

  try {
    if (!minionTask.modificationProcedure) {
      throw new Error(`Modification procedure is empty.`);
    }

    const currentDocContent = document.getText();

    if (minionTask.contentAfterApply === currentDocContent) {
      minionTask.executionStage = APPLIED_STAGE_NAME;
      minionTask.progress = 1;

      minionTask.onChange(true);
      getEditorManager().showErrorMessage(`Already applied.`);

      return;
    }

    minionTask.setOriginalContent = currentDocContent;

    const preprocessedContent = minionTask.getOriginalContent;

    const modifiedContent = await applyModificationProcedure(
      preprocessedContent,
      minionTask.modificationProcedure,
      document.languageId,
    );
    minionTask.applicationStatus = ApplicationStatus.APPLIED;

    getEditorManager().applyWorkspaceEdit(async (edit) => {
      edit.replace(
        document.uri,
        {
          start: { line: 0, character: 0 },
          end: {
            line: document.lineCount - 1,
            character: document.lineAt(document.lineCount - 1).text.length,
          },
        },
        modifiedContent,
      );
    });
  } catch (error) {
    console.log(error);
    await mutatorApplyFallback(minionTask);

    minionTask.executionStage = APPLIED_STAGE_NAME;
    minionTask.contentAfterApply = document.getText();
    minionTask.progress = 1;
    mutateAppendToLog(minionTask, `Applied modification as plain top comments`);
    mutateAppendToLog(minionTask, ``);
    minionTask.onChange(true);

    return;
  } finally {
    clearInterval(interval);
  }

  minionTask.executionStage = APPLIED_STAGE_NAME;
  minionTask.contentAfterApply = document.getText();
  minionTask.progress = 1;
  mutateAppendToLogNoNewline(minionTask, LOG_NO_FALLBACK_MARKER);
  minionTask.onChange(true);
  getEditorManager().showInformationMessage(
    `Modification applied successfully.`,
  );
}
