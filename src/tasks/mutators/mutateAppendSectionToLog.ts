import { TaskContext } from '../TaskContext';
import { mutateAppendToLog } from './mutateAppendToLog';

export function mutateAppendSectionToLog<T extends TaskContext<T>>(task: T, section: string): void {
  mutateAppendToLog(
    task,
    [
      `////////////////////////////////////////////////////////////////////////////////`,
      `// ${section}`,
      `////////////////////////////////////////////////////////////////////////////////`,
    ].join('\n') + '\n\n',
  );
}
