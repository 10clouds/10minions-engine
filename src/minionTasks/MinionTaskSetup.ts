import { Knowledge } from '../../examples/runCustomTask/Knowledge';
import { Stage } from '../tasks/Stage';
import { Strategy } from '../tasks/Strategy';
import { TaskContext } from '../tasks/TaskContext';

export interface MinionTaskSetup<T extends TaskContext<T>> {
  minionTaskSetupId: string;
  availableStrategies: Strategy<T>[];
  availableKnowledge: Knowledge[];
  preStages: Stage<T>[];
}
