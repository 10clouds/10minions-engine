import { Criterion } from './Criterion';

export const criteriaDefinition: Criterion<string>[] = [
  {
    name: 'Avoid emojis',
    maxPointsIf: 'there are no emojis',
    maxPoints: 20,
    calculate: 'GPT',
    suggestions: 'GPT',
  },
  {
    name: '700-800 characters long',
    maxPointsIf: 'The length of the post is between 700 and 800 characters',
    maxPoints: 20,
    calculate: (solution) => {
      if (solution.length > 800) {
        return 20 - (solution.length - 800) / 20;
      }

      if (solution.length < 700) {
        return 20 - (700 - solution.length) / 20;
      }

      return 20;
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
    calculate: 'GPT',
    suggestions: 'GPT',
  },
  {
    name: 'Personal story',
    maxPointsIf: 'the post contains a touching personal story',
    maxPoints: 20,
    calculate: 'GPT',
    suggestions: 'GPT',
  },
  {
    name: 'Virality',
    maxPointsIf: 'post should be written in a way so it can get a lot of likes',
    maxPoints: 20,
    calculate: 'GPT',
    suggestions: 'GPT',
  },
  {
    name: 'Style of great CEO',
    maxPointsIf: 'post should be written in a style that a person like Steve Jobs, Bill Gates or Elon Musk could have written it',
    maxPoints: 20,
    calculate: 'GPT',
    suggestions: 'GPT',
  },
];
