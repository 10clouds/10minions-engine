import { removeIndent } from '../string/stringUtils';

export function normalizeIndent(slice: string[]) {
  if (slice.length === 0) {
    return slice;
  }

  const sliceNoIndent = removeIndent(slice);

  //Normalized form has the first line not copied in full
  sliceNoIndent[0] = sliceNoIndent[0].trimStart();

  return sliceNoIndent;
}
