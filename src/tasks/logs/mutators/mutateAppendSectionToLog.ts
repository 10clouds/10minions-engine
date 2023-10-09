import { LogContext } from '../LogContext';
import { mutateAppendToLogNoNewline } from './mutateAppendToLogNoNewline';

export function mutateAppendSectionToLog(
  task: LogContext,
  section: string,
): void {
  mutateAppendToLogNoNewline(
    task,
    `${[
      `////////////////////////////////////////////////////////////////////////////////`,
      `// ${section}`,
      `////////////////////////////////////////////////////////////////////////////////`,
    ].join('\n')}\n\n`,
  );
}
