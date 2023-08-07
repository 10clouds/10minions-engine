import { readFileSync } from 'fs';
import { Knowledge } from './Knowledge';

export const EXAMPLE_KNOWLEDGE: Knowledge[] = [
  {
    id: 'InfoAbout10Clouds',
    description: 'Info About 10Clouds',
    content: readFileSync('./examples/customTaskWithKnowledge/knowledge/info-about-10c.txt', 'utf8'),
  },
  {
    id: 'InfoAboutCEO',
    description: 'Info About CEO',
    content: readFileSync('./examples/customTaskWithKnowledge/knowledge/info-about-ceo.txt', 'utf8'),
  },
  {
    id: 'InfoAboutAILabs',
    description: 'Info About AI Labs',
    content: readFileSync('./examples/customTaskWithKnowledge/knowledge/info-about-ai-labs.txt', 'utf8'),
  },
];
