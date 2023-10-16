import AsyncLock from 'async-lock';
import { Response } from 'node-fetch';

import { CANCELED_STAGE_NAME } from '../../tasks/stageNames';
import { extractParsedLines } from './extractParsedLines';

const openAILock = new AsyncLock();

/* The processOpenAIResponseStream function processes the response from the
 * API and extracts tokens from the response stream. */
export async function processOpenAIResponseStream({
  response,
  onChunk,
  isCancelled,
  controller,
}: {
  response: Response;
  onChunk: (chunk: string) => Promise<void>;
  isCancelled: () => boolean;
  controller: AbortController;
}) {
  const stream = response?.body;
  const decoder = new TextDecoder('utf-8');
  let fullContent = '';
  let chunkBuffer = '';

  return new Promise<string>((resolve, reject) => {
    if (!stream) {
      reject('No stream');

      return;
    }

    stream.on('data', (value: AllowSharedBufferSource) => {
      try {
        if (isCancelled() || controller.signal.aborted) {
          stream.removeAllListeners();
          reject(CANCELED_STAGE_NAME);

          // return;
        }
        const chunk = decoder.decode(value);
        chunkBuffer += chunk;

        const [parsedLines, newChunkBuffer] = extractParsedLines(chunkBuffer);

        chunkBuffer = newChunkBuffer;

        for (const parsedLine of parsedLines) {
          if (parsedLine.error) {
            throw new Error(parsedLine.error.message);
          }
        }

        const tokens = parsedLines
          .map(
            (l) =>
              l.choices[0].delta.content ||
              l.choices[0].delta.function_call?.arguments ||
              '',
          )
          .filter((c) => c)
          .join('');

        openAILock.acquire('openAI', async () => {
          await onChunk(tokens);
        });

        fullContent += tokens;
      } catch (e) {
        console.error('Error processing response stream: ', e, value);
        reject(e);
      }
    });

    stream.on('end', () => {
      if (isCancelled() || controller.signal.aborted) {
        stream.removeAllListeners();
        reject(CANCELED_STAGE_NAME);

        return;
      }
      resolve(fullContent);
    });

    stream.on('error', (err) => {
      console.error('Error: ', err);
      reject(err);
    });
  });
}
