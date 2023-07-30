import { z } from 'zod';
import { MinionTask } from '../MinionTask';
import { DEBUG_PROMPTS, DEBUG_RESPONSES } from '../../const';
import { countTokens } from '../../gpt/countTokens';
import { ensureICanRunThis } from '../../gpt/ensureIcanRunThis';
import { gptExecute } from '../../gpt/gptExecute';
import { GPTMode } from '../../gpt/types';
import { EditorDocument, EditorPosition } from '../../managers/EditorManager';
import { mutateAppendToLog } from '../../tasks/mutators/mutateAppendToLog';
import { mutateAppendSectionToLog } from '../../tasks/mutators/mutateAppendSectionToLog';
import { mutateReportSmallProgress } from '../../tasks/mutators/mutateReportSmallProgress';

export function extractRelevantCodePrompt({
  userQuery,
  selectedText,
  fullFileContents,
  selectionPosition,
  document,
}: {
  userQuery: string;
  selectedText: string;
  fullFileContents: string;
  selectionPosition: EditorPosition;
  document: EditorDocument;
}) {
  return `
You are a line assesment AI system for automatic software development with an IQ of 200.
You are about to cut out all irrelevant code from the file below, so a further part of the system can analyse and execute the TASK on them.
The task to be performed is provided below in TASK section.

# TASK ${selectedText ? `(resolve in context of SELECTED CODE)` : ''}
${userQuery}

${
  selectedText
    ? `
# SELECTED CODE (starts on line ${selectionPosition.line + 1} column: ${selectionPosition.character + 1} in the file) 
${selectedText}
`
    : ''
}

# FILE (Language: ${document.languageId}) 
${fullFileContents}  

Now for each line of the above file, decide whenever it's relevant to the task or not. If it's relevant output the line as it is. If it's not relevant output a line cointaining exclusivelly "// IRRELEVANT" instead (no original code). Do not output anything else.
`.trim();
}

export async function stageExtractRelevantCode(task: MinionTask) {
  const document = await task.document();
  const userQuery = task.userQuery;
  const selectionPosition = task.selection.start;
  const selectedText = task.selectedText;
  const fullFileContents = task.originalContent;

  const promptWithContext = extractRelevantCodePrompt({
    userQuery,
    selectedText,
    fullFileContents,
    selectionPosition,
    document,
  });

  if (DEBUG_PROMPTS) {
    mutateReportSmallProgress(task);
    mutateAppendSectionToLog(task, task.executionStage);
    mutateAppendToLog(task, '<<<< PROMPT >>>>\n\n');
    mutateAppendToLog(task, promptWithContext + '\n\n');
    mutateAppendToLog(task, '<<<< EXECUTION >>>>\n\n');
  }

  const tokensNeeded = countTokens(fullFileContents, GPTMode.QUALITY);

  ensureICanRunThis({
    prompt: promptWithContext,
    mode: GPTMode.QUALITY,
    maxTokens: tokensNeeded,
  });

  const { cost } = await gptExecute({
    fullPrompt: promptWithContext,
    onChunk: async (chunk: string) => {
      mutateReportSmallProgress(task);
      if (DEBUG_RESPONSES) {
        mutateAppendToLog(task, chunk);
      } else {
        mutateAppendToLog(task, '.');
      }
    },
    isCancelled: () => {
      return task.stopped;
    },
    maxTokens: tokensNeeded,
    mode: GPTMode.FAST,
    outputSchema: z.string() /*{
      name: "codeSegments",
      description: "Provided code segments",
      parameters: {
        type: "object",
        properties: {
          codeSegments: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["codeSegments"],
      }
    },*/,
    controller: new AbortController(),
  });

  task.totalCost += cost;

  mutateAppendToLog(task, '\n\n');
}
