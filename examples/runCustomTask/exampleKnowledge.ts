import { readFileSync } from 'fs';
import { Knowledge } from '../../src/strategyAndKnowledge/Knowledge';

export const EXAMPLE_KNOWLEDGE: Knowledge[] = [
  {
    id: 'InfoAbout10Clouds',
    description: 'Info About 10Clouds company, use it if you need to know more about the company.',
    content: readFileSync('./examples/runCustomTask/knowledge/info-about-10c.txt', 'utf8'),
  },
  {
    id: 'InfoAboutCEO',
    description: 'Info About CEO of 10Clouds, use it if you need to know more about the CEO.',
    content: readFileSync('./examples/runCustomTask/knowledge/info-about-ceo.txt', 'utf8'),
  },
  {
    id: 'InfoAboutAILabs',
    description: 'Info About AI Labs (formed by 10Clouds), use it if you need to know more about the AI Labs.',
    content: readFileSync('./examples/runCustomTask/knowledge/info-about-ai-labs.txt', 'utf8'),
  },
];
