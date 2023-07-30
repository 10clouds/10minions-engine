import { capitalizeFirstLetterAndLowerRest } from './capitalizeFirstLetterAndLowerRest';

export function underscoreToTitleCase(str: string) {
  return str
    .split('_')
    .map((word) => capitalizeFirstLetterAndLowerRest(word))
    .join(' ');
}
