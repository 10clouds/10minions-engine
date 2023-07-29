import '../initEnv';

import { readFileSync } from 'fs';
import path from 'path';
import {
  AnalyticsManager,
  setAnalyticsManager,
} from '../managers/AnalyticsManager';
import { NoCacheOpenAICacheManager } from '../managers/NoCacheOpenAICacheManager';
import { setEditorManager } from '../managers/EditorManager';
import { setLogProvider } from '../managers/LogProvider';
import { setOriginalContentProvider } from '../managers/OriginalContentProvider';
import { setOpenAIApiKey } from '../gpt/openai';
import { CLIEditorManager } from './CLIEditorManager';
import { setOpenAICacheManager } from '../managers/OpenAICacheManager';
import { ConsumingOpenAICacheManager } from '../managers/ConsumingOpenAICacheManager';

export function initCLISystems() {
  const baseDir = path.resolve(path.resolve(__dirname), "..", "..");
  
  setOpenAIApiKey(process.env.OPENAI_API_KEY!);

  setOpenAICacheManager(undefined);

  if (process.env.NO_OPENAI_CACHE === 'true') {
    setOpenAICacheManager(new NoCacheOpenAICacheManager());
  } else {
    setOpenAICacheManager(new ConsumingOpenAICacheManager(
      JSON.parse(
        readFileSync(path.resolve(baseDir, 'serviceAccount.json'), 'utf8'),
      ),
    ));
  }

  const analyticsManager = new AnalyticsManager(
    'CLIInstallationID',
    'CLIVsCodeStub',
  );
  analyticsManager.setSendDiagnosticsData(true);

  setAnalyticsManager(analyticsManager);
}

const reportChange = (uri: string) => {
  // TODO
};

export function setupCLISystemsForTest() {
  setLogProvider(undefined);
  setOriginalContentProvider(undefined);
  setEditorManager(undefined);

  setLogProvider({
    reportChange,
  });

  setOriginalContentProvider({
    reportChange,
  });

  setEditorManager(new CLIEditorManager());
}
