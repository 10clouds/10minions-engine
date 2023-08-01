import { Criterion } from './Criterion';

export const criteriaDefinition: Criterion[] = [
  {
    name: 'Avoid emojis',
    maxPointsIf: 'there are no emojis',
    maxPoints: 20,
  },
  {
    name: 'Up to 3 paragraphs',
    maxPointsIf: 'there are exactly 3 paragraphs',
    maxPoints: 20,
  },
  {
    name: 'General style',
    maxPointsIf: 'the style is concise, to the point, funny and witty',
    maxPoints: 20,
  },
  {
    name: 'Personal story',
    maxPointsIf: 'the post contains a touching personal story',
    maxPoints: 20,
  },
  {
    name: 'Virality',
    maxPointsIf: 'post should be written in a way so it can get a lot of likes',
    maxPoints: 20,
  },
  {
    name: 'Style of great CEO',
    maxPointsIf: 'post should be written in a style that a person like Steve Jobs, Bill Gates or Elon Musk could have written it',
    maxPoints: 20,
  },
];
