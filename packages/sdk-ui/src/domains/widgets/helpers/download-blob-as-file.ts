const DEFAULT_FILENAME = 'file';

/**
 * Triggers a browser file download from a Blob.
 *
 * @param blob - Blob to download
 * @param filename - Suggested file name
 */
export function downloadBlobAsFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  try {
    document.body.appendChild(link);
    link.click();
  } finally {
    URL.revokeObjectURL(url);
    link.remove();
  }
}

/**
 * Normalizes a file name by removing invalid characters and keeping the extension.
 *
 * @param rawFileName - Raw file name
 * @returns Normalized file name
 */
export function normalizeFileName(rawFileName: string): string {
  const lastDotIndex = rawFileName.lastIndexOf('.');
  const namePart = lastDotIndex === -1 ? rawFileName : rawFileName.substring(0, lastDotIndex);
  const extensionPart = lastDotIndex === -1 ? '' : rawFileName.substring(lastDotIndex);
  const normalizedName = namePart.replace(/[^a-zA-Z0-9]/g, '');
  return `${normalizedName || DEFAULT_FILENAME}${extensionPart}`;
}
