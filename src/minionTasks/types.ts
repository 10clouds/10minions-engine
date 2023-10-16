import { ScoreTestType } from '../../score/types';
import { SolutionWithMeta } from '../stepEvolve/FitnessFunction';

export interface MinionTaskSolution {
  resultingCode: string;
  modificationProcedure: string;
  modificationDescription: string;
  originalCode?: string;
}
export interface ParsedCriteriaDefinition {
  items: ScoreTestType[];
}
export type MinionTaskSolutionWithMeta = SolutionWithMeta<MinionTaskSolution>;
