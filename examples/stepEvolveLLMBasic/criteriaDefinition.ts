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
    name: 'Up to 600 characters',
    maxPointsIf: 'The lengty of the post is between 500 and 600 characters',
    maxPoints: 20,
    calculate: (solution) => {
      if (solution.length > 600) {
        return 20 - (solution.length - 600) / 20;
      }

      if (solution.length < 500) {
        return 20 - (500 - solution.length) / 20;
      }

      return 20;
    },
    suggestions: (solution) => {
      if (solution.length > 600) {
        return ['Shorten the post (keep to maximum of 600 characters)'];
      }

      if (solution.length < 500) {
        return ['Make the post longer (to at least 500 characters total)'];
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
