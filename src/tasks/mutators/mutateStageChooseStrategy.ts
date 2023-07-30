import { z } from 'zod';
import { DEBUG_PROMPTS, DEBUG_RESPONSES } from '../../const';
import { ensureICanRunThis } from '../../gpt/ensureIcanRunThis';
import { gptExecute } from '../../gpt/gptExecute';
import { GPTMode, MODEL_NAMES } from '../../gpt/types';
import { MinionTask } from '../../minionTasks/MinionTask';
import { mutateAppendSectionToLog } from './mutateAppendSectionToLog';
import { mutateAppendToLog } from './mutateAppendToLog';
import { PRE_STAGES, TASK_STRATEGIES, TASK_STRATEGY_IDS } from '../../minionTasks/strategies';
import { mutateReportSmallProgress } from './mutateReportSmallProgress';

export async function mutateStageChooseStrategy(task: MinionTask) {
  const document = await task.document();

  const fileContext = task.selectedText
    ? `
==== FILE CONTEXT (Language: ${document.languageId}) ====
${task.originalContent}  
`
    : '';

  const promptWithContext = `
You are an expert senior software architect, with 10 years of experience, experience in numerous projects and up to date knowledge and an IQ of 200.
Your collegue asked you to help him with some code, the task is provided below in TASK section.

Your job is to choose strategy for handling the task, so tomorrow, when you get back to this task, you know what to do.

Possible strategies:
${TASK_STRATEGIES.map((c) => `* ${c.name} - ${c.description}`).join('\n')}

===== CODE ${
    task.selectedText
      ? `(starts on line ${task.selection.start.line + 1} column: ${task.selection.start.character + 1} in the file)`
      : `(Language: ${document.languageId})`
  } ====
${task.selectedText ? task.selectedText : task.originalContent}

${fileContext}

===== TASK (applies to CODE) ====
${task.userQuery}


Choose strategy for the task.
`.trim();

  if (DEBUG_PROMPTS) {
    mutateAppendSectionToLog(task, task.executionStage);
    mutateAppendToLog(task, '<<<< PROMPT >>>>\n\n');
    mutateAppendToLog(task, promptWithContext + '\n\n');
    mutateAppendToLog(task, '<<<< EXECUTION >>>>\n\n');
  }

  ensureICanRunThis({ prompt: promptWithContext, maxTokens: 50, mode: GPTMode.FAST });

  const { result, cost } = await gptExecute({
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
    maxTokens: 50,
    mode: GPTMode.FAST,
    controller: new AbortController(),
    outputName: 'classification',
    outputSchema: z
      .object({
        strategy: z.enum(TASK_STRATEGY_IDS),
        model: z.enum([MODEL_NAMES[0], MODEL_NAMES.slice(1)[0]]),
      })
      .describe('Classification'),
  });

  task.totalCost += cost;

  mutateAppendToLog(task, '\n\n');

  //find classification in text
  const strategies = TASK_STRATEGIES.filter((c) => result.strategy === c.name);

  if (strategies.length !== 1) {
    throw new Error(`Could not find strategy in the text: ${result}`);
  }

  task.strategy = strategies[0].name;

  task.stages = [...PRE_STAGES, ...strategies[0].stages];
  task.currentStageIndex = PRE_STAGES.length - 1;

  if (DEBUG_PROMPTS) {
    mutateAppendToLog(task, `Strategy: ${task.strategy}\n\n`);
  }
}
