export const extractFileNameFromPath = function (filepath: string) {
  return filepath.substring(filepath.lastIndexOf('/') + 1).split('.')[0];
};

export const extractExtensionNameFromPath = function (filepath: string) {
  return filepath.substring(filepath.lastIndexOf('/') + 1).split('.')[1];
};
