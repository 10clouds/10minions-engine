import { getEditorManager } from '../../managers/EditorManager';
import { playNotificationSound } from '../../utils/playSound';
import { TaskContext } from '../TaskContext';
import { mutateAppendSectionToLog } from './mutateAppendSectionToLog';
import { mutateAppendToLog } from './mutateAppendToLog';
import { ShortNameContext } from './mutateGenerateShortName';
import { mutateStopExecution } from './mutateStopExecution';

export async function mutateStageFinishing<T extends TaskContext<T> & ShortNameContext>(task: T) {
  getEditorManager().showInformationMessage(`${task.shortName} is ready to be applied!`);

  mutateAppendSectionToLog(task, task.executionStage);
  mutateStopExecution(task);
  mutateAppendToLog(task, `Total Cost: ~${task.totalCost.toFixed(2)}$\n\n`);

  playNotificationSound();
}
