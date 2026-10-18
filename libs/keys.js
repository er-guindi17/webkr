import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEYS_FILE = path.join(__dirname, "..", "keys.json");

function loadKeys() {
  if (!fs.existsSync(KEYS_FILE)) return [];
  try {
    const raw = fs.readFileSync(KEYS_FILE, "utf-8");
    const encoded = JSON.parse(raw);
    return encoded.map((k) => ({
      key: Buffer.from(k.key, "base64").toString("utf-8"),
      expires: Buffer.from(k.expires, "base64").toString("utf-8"),
    }));
  } catch {
    return [];
  }
}

// expires se guarda como "DD/MM/AAAA" (mismo formato que la app original).
function parseExpires(str) {
  const [day, month, year] = String(str).split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day, 23, 59, 59);
}

export function verifyKey(inputKey) {
  const keys = loadKeys();
  const found = keys.find((k) => k.key === inputKey);
  if (!found) return { valid: false, message: "Clave incorrecta" };

  const expires = parseExpires(found.expires);
  if (!expires) return { valid: false, message: "Clave mal formada" };
  if (new Date() > expires) return { valid: false, message: "La clave ha caducado" };

  return { valid: true };
}

export function encodeKeyEntry(key, expires) {
  return {
    key: Buffer.from(key).toString("base64"),
    expires: Buffer.from(expires).toString("base64"),
  };
}
