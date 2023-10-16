import { GPTMode, GPTModel } from '../types';

export function getModel(mode: GPTMode): GPTModel {
  return mode === GPTMode.FAST ? 'gpt-3.5-turbo-16k-0613' : 'gpt-4-0613';
}
