import { MinionTask } from '../MinionTask';
import { getEditorManager } from '../../managers/EditorManager';
import { mutateAppendToLog } from '../../tasks/mutators/mutateAppendToLog';
import { mutateClearLog } from '../../tasks/mutators/mutateClearLog';

export async function mutateStageStarting(task: MinionTask) {
  const document = await getEditorManager().openTextDocument(task.documentURI);

  task.originalContent = document.getText();

  mutateClearLog(task);
  mutateAppendToLog(task, 'Id: ' + task.id + '\n');
  mutateAppendToLog(task, 'File: ' + task.baseName + '\n');
  mutateAppendToLog(task, 'Task: ' + task.userQuery + '\n');
  mutateAppendToLog(task, '\n');
}
