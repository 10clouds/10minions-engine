import '../initEnv';

import { ServiceAccount } from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';

import { setOpenAIApiKey } from '../gpt/utils/setOpenAiKey';
import {
  AnalyticsManager,
  setAnalyticsManager,
} from '../managers/AnalyticsManager';
import { ConsumingOpenAICacheManager } from '../managers/ConsumingOpenAICacheManager';
import { setEditorManager } from '../managers/EditorManager';
import { setLogProvider } from '../managers/LogProvider';
import { NoCacheOpenAICacheManager } from '../managers/NoCacheOpenAICacheManager';
import { setOpenAICacheManager } from '../managers/OpenAICacheManager';
import { setOriginalContentProvider } from '../managers/OriginalContentProvider';
import { CLIEditorManager } from './CLIEditorManager';

export function initCLISystems() {
  const baseDir = path.resolve(path.resolve(__dirname), '..', '..');

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  setOpenAIApiKey(process.env.OPENAI_API_KEY);

  if (process.env.NO_OPENAI_CACHE === 'true') {
    setOpenAICacheManager(new NoCacheOpenAICacheManager());
  } else {
    setOpenAICacheManager(
      new ConsumingOpenAICacheManager(
        JSON.parse(
          readFileSync(path.resolve(baseDir, 'serviceAccount.json'), 'utf8'),
        ) as ServiceAccount,
      ),
    );
  }

  const analyticsManager = new AnalyticsManager(
    'CLIInstallationID',
    'CLIVsCodeStub',
  );
  analyticsManager.setSendDiagnosticsData(true);

  setAnalyticsManager(analyticsManager);

  const reportChange = (uri: string) => {
    // TODO: add functionality to report change in logs
  };

  const reportChangeInTask = (id: string) => {
    // TODO: add functionality to report change in task
  };

  setLogProvider({
    reportChangeInTask,
  });

  setOriginalContentProvider({
    reportChange,
  });

  setEditorManager(new CLIEditorManager());
}

export function setupCLISystemsForTest() {
  setEditorManager(new CLIEditorManager());
}
