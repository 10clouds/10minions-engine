import path from 'path';
import { initCLISystems } from '../src/CLI/setupCLISystems';
import { getEditorManager } from '../src/managers/EditorManager';
import { MinionTask } from '../src/minionTasks/MinionTask';
import { mutateRunTask } from '../src/tasks/mutators/mutateRunTask';
import { applyMinionTask } from '../src/minionTasks/mutators/applyMinionTask';

const INTRO = `
This example creates a minion task and runs it.
`;

(async function () {
  console.log(INTRO);

  console.log('Initiating ...');
  initCLISystems();

  console.log('Creating task ...');

  const task = await MinionTask.create({
    userQuery: 'Add comments to this code',
    document: await getEditorManager().openTextDocument(getEditorManager().createUri(path.join(__filename))),
    selection: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
    selectedText: '',
    minionIndex: 0,
    onChanged: async () => {
      console.log('Progress: ' + (task.progress * 100).toFixed(0) + '%');
    },
  });

  console.log('Running task ...');
  await mutateRunTask(task);
  console.log(task.logContent);

  console.log('Applying task ...');
  await applyMinionTask(task);

  console.log('Done');
})();
