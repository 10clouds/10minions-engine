import emojiRegex from 'emoji-regex';

import { Criterion } from './Criterion';

export const criteriaDefinition: Criterion<string>[] = [
  {
    name: 'Avoid emojis',
    maxPointsIf: 'there are no emojis',
    maxPoints: 20,
    maintain: 'Avoid emojis',
    calculate: (solution: string) => {
      const emojiPattern = emojiRegex();
      const emojis = solution.match(emojiPattern);
      const points = 20 - (emojis?.length || 0) * 5;
      return points;
    },
    suggestions: (solution) => {
      if (solution.match(emojiRegex())) {
        return ['Use less emojis', 'Remove emojis'];
      } else {
        return [];
      }
    },
  },
  {
    name: '700-800 characters long',
    maxPointsIf: 'The length of the post is between 700 and 800 characters',
    maxPoints: 20,
    maintain: 'Keep the post between 700 and 800 characters',
    calculate: (solution) => {
      const distance = Math.max(Math.abs(750 - solution.length) - 50, 0);
      const points = 20 / (1 + distance / 50);
      return points;
    },
    suggestions: (solution) => {
      if (solution.length > 800) {
        return ['Shorten the post (keep to maximum of 800 characters)'];
      }

      if (solution.length < 700) {
        return ['Make the post longer (to at least 700 characters total)'];
      }

      return [];
    },
  },
  {
    name: 'General style',
    maxPointsIf: 'the style is concise, to the point, funny and witty',
    maxPoints: 20,
    maintain: 'Keep the style concise, to the point, funny and witty',
    calculate: 'GPT',
    suggestions: 'GPT',
  },
  {
    name: 'Personal story',
    maxPointsIf: 'the post contains a touching personal story',
    maxPoints: 20,
    maintain: 'Keep the personal story in the post',
    calculate: 'GPT',
    suggestions: 'GPT',
  },
  {
    name: 'Virality',
    maxPointsIf: 'post should be written in a way so it can get a lot of likes',
    maxPoints: 20,
    maintain: 'Keep the post in a way so it can get a lot of likes',
    calculate: 'GPT',
    suggestions: 'GPT',
  },
  {
    name: 'Style of great CEO',
    maxPointsIf: 'post should be written in a style that a person like Steve Jobs, Bill Gates or Elon Musk could have written it',
    maintain: 'Keep the post in a style that a person like Steve Jobs, Bill Gates or Elon Musk could have written it',
    maxPoints: 20,
    calculate: 'GPT',
    suggestions: 'GPT',
  },
];
