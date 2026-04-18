import { randomUUID } from "crypto";
import path from "path";
import { sanitizeFilename, type StorageDriver, type UploadInput, type UploadResult } from "./types";

interface HetznerConfig {
  host: string;
  username: string;
  password: string;
  basePath: string;
  publicUrlBase: string;
}

function getConfig(): HetznerConfig {
  const host = process.env.HETZNER_STORAGEBOX_HOST;
  const username = process.env.HETZNER_STORAGEBOX_USER;
  const password = process.env.HETZNER_STORAGEBOX_PASSWORD;
  const basePath = process.env.HETZNER_STORAGEBOX_PATH ?? "/bkpulse/uploads";
  const publicUrlBase = process.env.HETZNER_STORAGEBOX_PUBLIC_URL;

  if (!host || !username || !password || !publicUrlBase) {
    throw new Error(
      "Hetzner Storage Box non configuré. Variables requises: HETZNER_STORAGEBOX_HOST, HETZNER_STORAGEBOX_USER, HETZNER_STORAGEBOX_PASSWORD, HETZNER_STORAGEBOX_PUBLIC_URL"
    );
  }

  return { host, username, password, basePath, publicUrlBase };
}

async function webdavRequest(
  config: HetznerConfig,
  method: string,
  remotePath: string,
  body?: Buffer,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  const url = `https://${config.host}${remotePath}`;
  const authHeader = "Basic " + Buffer.from(`${config.username}:${config.password}`).toString("base64");
  const headers: Record<string, string> = { Authorization: authHeader, ...(extraHeaders ?? {}) };

  return fetch(url, {
    method,
    headers,
    body: body as BodyInit | undefined,
  });
}

async function ensureFolder(config: HetznerConfig, folder: string): Promise<void> {
  const parts = folder.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current += `/${part}`;
    const response = await webdavRequest(config, "MKCOL", current);
    if (!response.ok && response.status !== 405 && response.status !== 301) {
      throw new Error(`Impossible de créer le dossier ${current} (${response.status})`);
    }
  }
}

export class HetznerStorageBoxDriver implements StorageDriver {
  readonly name = "hetzner";

  async upload(input: UploadInput): Promise<UploadResult> {
    const config = getConfig();
    const folder = input.folder ?? "";
    const safeName = sanitizeFilename(input.filename);
    const uniquePrefix = randomUUID().slice(0, 8);
    const storageKey = path.posix.join(folder, `${uniquePrefix}-${safeName}`).replace(/^\/+/, "");
    const remotePath = path.posix.join(config.basePath, storageKey);

    await ensureFolder(config, path.posix.dirname(remotePath));

    const response = await webdavRequest(config, "PUT", remotePath, input.buffer, {
      "Content-Type": input.mimeType,
      "Content-Length": String(input.buffer.length),
    });

    if (!response.ok && response.status !== 201 && response.status !== 204) {
      throw new Error(`Upload Storage Box échoué (${response.status})`);
    }

    const publicUrl = `${config.publicUrlBase.replace(/\/$/, "")}/${storageKey.replace(/^\/+/, "")}`;

    return {
      storageKey,
      url: publicUrl,
      driver: this.name,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const config = getConfig();
    const remotePath = path.posix.join(config.basePath, storageKey);
    await webdavRequest(config, "DELETE", remotePath);
  }
}
