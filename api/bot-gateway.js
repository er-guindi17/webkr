import { verifyKey } from "../libs/keys.js";
import { runBots, botsAllowed } from "../libs/botEngine.js";

const MAX_BOTS = parseInt(process.env.KR_MAX_BOTS || "50", 10);

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return {};
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Método no permitido" });
    return;
  }

  const { key, pin, count, base } = readBody(req);

  // 1) La puerta de clave se comprueba SIEMPRE en el servidor.
  if (!verifyKey((key || "").toString().trim()).valid) {
    res.status(401).json({ ok: false, message: "Clave inválida o caducada" });
    return;
  }

  // 2) El motor solo corre con la atestación del operador activada.
  if (!botsAllowed()) {
    res.status(200).json({
      ok: false,
      reason: "bots_disabled",
      message:
        "El motor de bots está desactivado. Solo debe activarse (KR_ALLOW_BOTS=true) " +
        "para partidas que tú controlas o con permiso del dueño del quiz.",
    });
    return;
  }

  const n = parseInt(count, 10);
  if (!pin || isNaN(n) || n <= 0) {
    res.status(400).json({ ok: false, message: "PIN o número de bots inválido" });
    return;
  }
  if (n > MAX_BOTS) {
    res.status(400).json({ ok: false, message: `Máximo ${MAX_BOTS} bots por petición` });
    return;
  }

  console.warn("bot-gateway", {
    ip: req.headers["x-forwarded-for"],
    pin,
    count: n,
  });

  const result = await runBots({ pin: pin.toString(), count: n, base: base || "SuperIdol" });
  res.status(200).json(result);
}
