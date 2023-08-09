import { TaskContext } from '../TaskContext';
import { mutateAppendToLog } from './mutateAppendToLog';

export function mutateAppendSectionToLog(task: TaskContext, section: string): void {
  mutateAppendToLog(
    task,
    [
      `////////////////////////////////////////////////////////////////////////////////`,
      `// ${section}`,
      `////////////////////////////////////////////////////////////////////////////////`,
    ].join('\n') + '\n\n',
  );
}
