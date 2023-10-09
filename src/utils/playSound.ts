import { exec } from 'child_process';
import { PathLike } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);
/* AIX PLAY COMMAND */
const aixPlayCommand = (filePath: PathLike, volume: number) =>
  `aplay \"${filePath}\" -v ${volume}`;

/* DARWIN PLAY COMMAND */
const darwinPlayCommand = (filePath: PathLike, volume: number) =>
  `afplay \"${filePath}\" -v ${volume}`;

/* FREEBSD PLAY COMMAND */
const freebsdPlayCommand = (filePath: PathLike, volume: number) =>
  `play -v ${volume} \"${filePath}\"`;

/* LINUX PLAY COMMAND */
const linuxPlayCommand = (filePath: PathLike, volume: number) =>
  `paplay --volume=${Math.round(volume * 32768)} \"${filePath}\"`;

/* OPENBSD PLAY COMMAND */
const openbsdPlayCommand = (filePath: PathLike, volume: number) =>
  `aucat -i \"${filePath}\" -v ${volume}`;

/* SUNOS PLAY COMMAND */
const sunosPlayCommand = (filePath: PathLike, volume: number) =>
  `audioplay \"${filePath}\" -v ${volume}`;

/* WIN32 PLAY COMMAND */
const addPresentationCore = `Add-Type -AssemblyName presentationCore;`;
const createMediaPlayer = `$player = New-Object system.windows.media.mediaplayer;`;
const loadAudioFile = (filePath: PathLike) => `$player.open('${filePath}');`;
const playAudio = `$player.Play();`;
const stopAudio = `Start-Sleep 1; Start-Sleep -s $player.NaturalDuration.TimeSpan.TotalSeconds;Exit;`;

const win32PlayCommand = (filePath: PathLike, volume: number) =>
  `powershell -c ${addPresentationCore} ${createMediaPlayer} ${loadAudioFile(
    filePath,
  )} $player.Volume = ${volume}; ${playAudio} ${stopAudio}`;

async function playSound(path: string, volume = 0.5) {
  /**
   * Window: mediaplayer's volume is from 0 to 1, default is 0.5
   * Mac: afplay's volume is from 0 to 255, default is 1. However, volume > 2 usually result in distortion.
   * Therefore, it is better to limit the volume on Mac, and set a common scale of 0 to 1 for simplicity
   */
  const volumeAdjustedByOS =
    process.platform === 'darwin' ? Math.min(2, volume * 2) : volume;

  if (!process.platform) {
    throw Error('OS not detected');
  }

  let playCommand;
  const filePath = path;
  const escapedFilePath = filePath.replace(/"/g, '\\"');

  switch (process.platform) {
    case 'aix':
      playCommand = aixPlayCommand(escapedFilePath, volume);
      break;
    case 'darwin':
      playCommand = darwinPlayCommand(escapedFilePath, volumeAdjustedByOS);
      break;
    case 'freebsd':
      playCommand = freebsdPlayCommand(escapedFilePath, volume);
      break;
    case 'linux':
      playCommand = linuxPlayCommand(escapedFilePath, volume);
      break;
    case 'openbsd':
      playCommand = openbsdPlayCommand(escapedFilePath, volume);
      break;
    case 'sunos':
      playCommand = sunosPlayCommand(escapedFilePath, volume);
      break;
    case 'win32':
    default:
      playCommand = win32PlayCommand(escapedFilePath, volumeAdjustedByOS);
      break;
  }

  await execPromise(playCommand, { windowsHide: true });
}

let globalExtensionPath: string;
let globalCompletionSoundsEnabled: boolean;

export function initPlayingSounds(extensionPath: string) {
  globalExtensionPath = extensionPath;
}

export function setCompletionSoundsEnabled(enabled: boolean) {
  globalCompletionSoundsEnabled = enabled;
}

export function playNotificationSound() {
  if (globalCompletionSoundsEnabled) {
    playSound(path.join(globalExtensionPath, 'resources', 'notification.wav'));
  }
}
