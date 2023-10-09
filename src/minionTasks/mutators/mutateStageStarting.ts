import { MinionTask } from '../MinionTask';
import { getEditorManager } from '../../managers/EditorManager';
import { mutateAppendToLog } from '../../tasks/logs/mutators/mutateAppendToLog';
import { mutateClearLog } from '../../tasks/logs/mutators/mutateClearLog';
import { mutateGenerateShortName } from '../../tasks/mutators/mutateGenerateShortName';

export async function mutateStageStarting(task: MinionTask) {
  const document = await getEditorManager().openTextDocument(task.documentURI);

  task.originalContent = document.getText();

  mutateClearLog(task);
  mutateAppendToLog(task, 'Id: ' + task.id + '');
  mutateAppendToLog(task, 'File: ' + task.baseName + '');
  mutateAppendToLog(task, 'Task: ' + task.userQuery + '');
  mutateAppendToLog(task, '');

  mutateGenerateShortName(task);
}
