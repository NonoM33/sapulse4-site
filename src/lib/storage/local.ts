import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { sanitizeFilename, type StorageDriver, type UploadInput, type UploadResult } from "./types";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export class LocalStorageDriver implements StorageDriver {
  readonly name = "local";

  async upload(input: UploadInput): Promise<UploadResult> {
    const folder = input.folder ?? "";
    const safeName = sanitizeFilename(input.filename);
    const uniquePrefix = randomUUID().slice(0, 8);
    const storageKey = path.posix.join(folder, `${uniquePrefix}-${safeName}`).replace(/^\/+/, "");
    const absolutePath = path.join(UPLOAD_ROOT, storageKey);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, input.buffer);

    return {
      storageKey,
      url: `/uploads/${storageKey}`,
      driver: this.name,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const absolutePath = path.join(UPLOAD_ROOT, storageKey);
    await fs.rm(absolutePath, { force: true });
  }
}
