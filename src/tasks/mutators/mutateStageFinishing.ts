import { getEditorManager } from '../../managers/EditorManager';
import { playNotificationSound } from '../../utils/playSound';
import { TaskContext } from '../TaskContext';
import { mutateAppendSectionToLog } from './mutateAppendSectionToLog';
import { ShortNameContext } from './mutateGenerateShortName';

export async function mutateStageFinishing<T extends TaskContext<T> & ShortNameContext>(task: T) {
  getEditorManager().showInformationMessage(`${task.shortName} is ready to be applied!`);

  mutateAppendSectionToLog(task, task.executionStage);

  playNotificationSound();
}
