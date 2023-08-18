import { getLogProvider } from '../../../managers/LogProvider';
import { LogContext } from '../LogContext';

export function mutateClearLog(task: LogContext) {
  task.logContent = '';
  getLogProvider().reportChangeInTask(task.id);
}
