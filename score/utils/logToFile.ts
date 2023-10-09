import { format as dtFormat } from 'date-and-time';
import fs from 'fs';
import path from 'path';

const directoryPath = path.join(__dirname, 'logs');
// Added the Date object to get the current date and time and formatted it as per requirement (YYYY-MM-DD_HH-MM-SS).
const logFilename = `log_${dtFormat(new Date(), 'YYYY-MM-DD_HH-mm-ss')}.log`;

// Concatenating date_string with the filename to include the current date and time in the filename.
export const logFilePath = path.join(directoryPath, logFilename);

export function logToFile(logMessage: string) {
  // Check if logs directory exist or not
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath); // If logs directory does not exist, create it
  }

  fs[fs.existsSync(logFilePath) ? 'appendFileSync' : 'writeFileSync'](
    logFilePath,
    `${logMessage}\n`,
  );
}
