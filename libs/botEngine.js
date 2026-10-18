// Motor de bots — SE ACTIVA SOLO CON ATESTACIÓN EXPLÍCITA DEL OPERADOR.
//
// KR_ALLOW_BOTS es una señal del operador (tú) de que el PIN al que se apunta
// es una partida que TÚ controlas (host/creador del quiz) o para la que tienes
// permiso. No hay forma técnica de verificar la propiedad de un PIN de Kahoot,
// así que esta librería se apoya en esa atestación y en el uso responsable.
//
// Si KR_ALLOW_BOTS no es "true", el motor NO se ejecuta y devuelve un error.

import Kahoot from "kahoot.js-updated-fixed";

const JOIN_DELAY_MS = 200;

export function botsAllowed() {
  return process.env.KR_ALLOW_BOTS === "true";
}

export async function runBots({ pin, count, base = "SuperIdol" }) {
  if (!botsAllowed()) {
    return {
      ok: false,
      reason: "bots_disabled",
      message:
        "El motor de bots está desactivado. Actívalo solo para partidas que tú controlas o con permiso del dueño del quiz (KR_ALLOW_BOTS=true).",
    };
  }

  const results = [];
  for (let i = 1; i <= count; i++) {
    const name = `${base}_${i}`;
    const client = new Kahoot();
    try {
      await client.join(pin, name);
      results.push({ name, status: "joined" });
    } catch (err) {
      results.push({ name, status: "error", error: err.message });
    }
    await new Promise((r) => setTimeout(r, JOIN_DELAY_MS));
  }
  return { ok: true, results };
}
