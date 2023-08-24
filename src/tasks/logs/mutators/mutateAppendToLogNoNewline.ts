import { getLogProvider } from '../../../managers/LogProvider';
import { TaskContext } from '../../TaskContext';
import { LogContext } from '../LogContext';

export function mutateAppendToLogNoNewline(task: LogContext, content: string): void {
  task.logContent += content;

  getLogProvider().reportChangeInTask(task.id);
}
