import { HetznerStorageBoxDriver } from "./hetzner";
import { LocalStorageDriver } from "./local";
import type { StorageDriver } from "./types";

let cachedDriver: StorageDriver | null = null;

export function getStorageDriver(): StorageDriver {
  if (cachedDriver) {
    return cachedDriver;
  }
  const driverName = (process.env.STORAGE_DRIVER ?? "local").toLowerCase();
  if (driverName === "hetzner") {
    cachedDriver = new HetznerStorageBoxDriver();
  } else {
    cachedDriver = new LocalStorageDriver();
  }
  return cachedDriver;
}

export type { StorageDriver, UploadInput, UploadResult } from "./types";
export { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES } from "./types";
