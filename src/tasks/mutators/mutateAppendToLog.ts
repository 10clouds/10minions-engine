import { getLogProvider } from '../../managers/LogProvider';
import { TaskContext } from '../TaskContext';

export function mutateAppendToLog(task: TaskContext, content: string): void {
  task.logContent += content;

  getLogProvider().reportChangeInTask(task.id);
}