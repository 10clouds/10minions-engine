import { getLogProvider } from '../../managers/LogProvider';
import { TaskContext } from '../TaskContext';

export function mutateClearLog(task: TaskContext) {
  task.logContent = '';
  getLogProvider().reportChangeInTask(task.id);
}
