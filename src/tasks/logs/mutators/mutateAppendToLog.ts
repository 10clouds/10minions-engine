import { TaskContext } from '../../TaskContext';
import { mutateAppendToLogNoNewline } from './mutateAppendToLogNoNewline';

export function mutateAppendToLog(task: TaskContext, content: string): void {
  mutateAppendToLogNoNewline(task, content + '\n');
}
