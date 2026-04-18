export interface UploadInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder?: string;
}

export interface UploadResult {
  storageKey: string;
  url: string;
  driver: string;
}

export interface StorageDriver {
  readonly name: string;
  upload(input: UploadInput): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
}

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function sanitizeFilename(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  const name = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
  const ext = dotIndex > 0 ? filename.slice(dotIndex).toLowerCase() : "";
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const base = normalized.length > 0 ? normalized : "file";
  return `${base}${ext}`;
}
