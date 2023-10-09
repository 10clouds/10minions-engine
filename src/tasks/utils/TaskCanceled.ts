import { CANCELED_STAGE_NAME } from '../stageNames';

export class TaskCanceledError extends Error {
  constructor() {
    super(CANCELED_STAGE_NAME);
    this.name = 'TaskCanceledError';
  }
}
