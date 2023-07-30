import { getLogProvider } from '../../managers/LogProvider';
import { TaskContext } from '../TaskContext';

export function mutateClearLog<T extends TaskContext<T>>(task: T) {
  task.logContent = '';
  getLogProvider().reportChangeInTask(task.id);
}
