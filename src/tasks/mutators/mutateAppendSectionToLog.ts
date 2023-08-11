import { TaskContext } from '../TaskContext';
import { mutateAppendToLogNoNewline } from './mutateAppendToLogNoNewline';

export function mutateAppendSectionToLog(task: TaskContext, section: string): void {
  mutateAppendToLogNoNewline(
    task,
    [
      `////////////////////////////////////////////////////////////////////////////////`,
      `// ${section}`,
      `////////////////////////////////////////////////////////////////////////////////`,
    ].join('\n') + '\n\n',
  );
}
