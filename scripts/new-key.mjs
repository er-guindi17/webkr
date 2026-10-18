// Añade una clave nueva (Base64) a keys.json.
//   node scripts/new-key.mjs "MI-CLAVE" "31/12/2026"
// Regenera la que viene de fábrica antes de desplegar en serio.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { encodeKeyEntry } from "../libs/keys.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keysFile = path.join(__dirname, "..", "keys.json");

const [key, expires] = process.argv.slice(2);
if (!key || !expires) {
  console.error('Uso: node scripts/new-key.mjs "MI-CLAVE" "DD/MM/AAAA"');
  process.exit(1);
}

const b = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(expires);
if (!b) {
  console.error("La caducidad debe ser DD/MM/AAAA");
  process.exit(1);
}

const list = fs.existsSync(keysFile) ? JSON.parse(fs.readFileSync(keysFile, "utf-8")) : [];
list.push(encodeKeyEntry(key, expires));
fs.writeFileSync(keysFile, JSON.stringify(list, null, 2));
console.log(`Clave añadida. Entras con: ${key}  (caduca ${expires})`);
