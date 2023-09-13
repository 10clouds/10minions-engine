import { readFileSync } from 'fs';
import { Knowledge } from '../strategyAndKnowledge/Knowledge';
import path from 'path';

// TODO: add knowledge content
export const MINION_TASK_KNOWLEDGE: Knowledge[] = [
  {
    id: 'CodeInfo',
    description: 'Code Info, use it if you need to know more about the code.',
    content: '',
  },
  // {
  //   id: 'InfoAboutCEO',
  //   description: 'Info About CEO of 10Clouds, use it if you need to know more about the CEO.',
  //   content: readFileSync(path.join(__dirname, 'knowledge', 'info-about-ceo.txt'), 'utf8'),
  // },
  // {
  //   id: 'InfoAboutCEOPersonalBrandingStrategy',
  //   description: 'Info About CEO of 10Clouds personal branding strategy, use it if you need to know more about the CEO personal branding strategy.',
  //   content: readFileSync(path.join(__dirname, 'knowledge', 'info-about-ceo-branding-strategy.txt'), 'utf8'),
  // },
  // {
  //   id: 'InfoAboutAILabs',
  //   description: 'Info About AI Labs (formed by 10Clouds), use it if you need to know more about the AI Labs.',
  //   content: readFileSync(path.join(__dirname, 'knowledge', 'info-about-ai-labs.txt'), 'utf8'),
  // },
];
