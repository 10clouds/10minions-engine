import { getLogProvider } from '../../managers/LogProvider';
import { TaskContext } from '../TaskContext';

export function mutateAppendToLog<T extends TaskContext<T>>(task: T, content: string): void {
  task.logContent += content;

  getLogProvider().reportChangeInTask(task.id);
}
