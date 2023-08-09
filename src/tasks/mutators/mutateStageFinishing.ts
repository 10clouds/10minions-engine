import { getEditorManager } from '../../managers/EditorManager';
import { playNotificationSound } from '../../utils/playSound';
import { TaskContext } from '../TaskContext';
import { mutateAppendSectionToLog } from './mutateAppendSectionToLog';
import { ShortNameContext } from './mutateGenerateShortName';

export async function mutateStageFinishing<TC extends TaskContext & ShortNameContext>(task: TC) {
  getEditorManager().showInformationMessage(`${task.shortName} is ready to be applied!`);

  mutateAppendSectionToLog(task, task.executionStage);

  playNotificationSound();
}
