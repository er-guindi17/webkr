import { verifyKey } from "../libs/keys.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.status(405).json({ valid: false, message: "Método no permitido" });
    return;
  }

  const key = (req.body && req.body.key || "").toString().trim();
  if (!key) {
    res.status(200).json({ valid: false, message: "Introduce una clave" });
    return;
  }

  const result = verifyKey(key);
  if (!result.valid) {
    console.warn("verify-key fallida", { ip: req.headers["x-forwarded-for"] });
  }
  res.status(200).json(result);
}
