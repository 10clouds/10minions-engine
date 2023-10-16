import { initMinionTask } from '../../score/initTestMinionTask';
import { Selection } from '../../score/initTestMinionTask';
import { createFitnessAndNextSolutionsFunction } from '../stepEvolve/createFitnessAndNextSolutionsFunction';
import { createNewSolutionFix } from '../stepEvolve/createNewSolutionFix';
import { createSolutionWithMetaWithFitness } from '../stepEvolve/createSolutionWithMetaWithFitness';
import { mutateEndStage } from '../tasks/mutators/mutateEndStage';
import { mutateStartStage } from '../tasks/mutators/mutateStartStage';
import { MinionTask } from './MinionTask';
import { ParsedCriteriaDefinition } from './types';

const BRANCHING = 3;

interface InitialSolutionsResult {
  initialSolutions: any[];
  costs: number;
}

export const generateInitialSolutions = async (
  task: MinionTask,
  iterations: number,
  progressIncrement: number,
  criteriaDefinition: ParsedCriteriaDefinition,
): Promise<InitialSolutionsResult> => {
  const initialSolutionsPromises = [];
  let costs = 0;

  const selectionData: Selection = {
    start: task.selection.start,
    end: task.selection.end,
    selectedText: task.selectedText,
  };

  for (let i = 0; i < iterations; i++) {
    mutateStartStage({
      task,
      name: 'Preparing solutions...',
      progressIncrement,
    });
    if (task.stopped) break;
    const { execution: tempMinionTask } = await initMinionTask(
      task.userQuery,
      task.documentURI.fsPath,
      selectionData,
    );
    tempMinionTask.relevantKnowledge = task.relevantKnowledge;
    initialSolutionsPromises.push(
      createSolutionWithMetaWithFitness({
        solution: await createNewSolutionFix(tempMinionTask),
        createdWith: 'initial',
        fitnessAndNextSolutionsFunction: createFitnessAndNextSolutionsFunction({
          task: tempMinionTask,
          maxBranching: BRANCHING,
          criteriaDefinition,
        }),
      }),
    );

    costs += tempMinionTask.totalCost;
    mutateEndStage(task);
  }

  const initialSolutions = await Promise.all(initialSolutionsPromises);

  return { initialSolutions, costs };
};
