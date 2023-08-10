import { CANCELED_STAGE_NAME } from '../stageNames';

export class TaskCanceled extends Error {
  constructor() {
    super(CANCELED_STAGE_NAME);
  }
}
