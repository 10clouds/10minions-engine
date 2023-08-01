import { z } from 'zod';
import { Stage } from './Stage';
import { TaskContext } from './TaskContext';

export type Strategy<T extends TaskContext<T>> = {
  id: string;
  description: string;
  stages: Stage<T>[];
  outputSchema: z.ZodType<any, any>;
};
