# Kahoot Raider — Web (port para Vercel)

Port web de la app Electron **Kahoot Raider** de `er.guindilla`. La interfaz, el
control de acceso por clave y el panel corran **al 100% en la web**; el motor de
bots queda **apagado por defecto** y solo se activa con una atestación explícita
del operador (ver más abajo).

---

## Qué está 100% funcional en la web

- Landing / panel con el mismo look que el original (degradado morado, caja de clave, panel PIN / nº / nombre base).
- **Gate de clave validado en el servidor** (ya no se puede saltar editando el JS del navegador, como sí pasaba en el `renderer.js` original).
- Emisión y caducidad de claves (`keys.json` en Base64, formato `DD/MM/AAAA`).
- API serverless lista para desplegar en Vercel.

## Estructura

```
public/            # estáticos que sirve Vercel
  index.html
  styles.css
  app.js
api/
  verify-key.js    # POST { key } -> { valid, message? }
  bot-gateway.js   # POST { key, pin, count, base } -> resultado
libs/
  keys.js          # carga/verificación/codificación de claves
  botEngine.js     # motor de bots (APAGADO salvo KR_ALLOW_BOTS=true)
scripts/
  new-key.mjs      # añade una clave nueva a keys.json
keys.json          # tabla de claves (Base64)
vercel.json        # config de functions
```

## Desplegar en Vercel

1. Instala la CLI y loguéate: `npm i -g vercel && vercel login`
2. Sube el proyecto:
   ```bash
   vercel            # preview
   vercel --prod     # producción
   ```
   O conecta el repo en [vercel.com/new](https://vercel.com/new) (framework: Other, build: ninguno, output: `public`).
3. Regenera tu clave antes de compartirla (la de fábrica es solo de ejemplo):
   ```bash
   node scripts/new-key.mjs "MI-CLAVE" "31/12/2026"
   ```

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable        | Por defecto | Descripción |
|-----------------|-------------|-------------|
| `KR_MAX_BOTS`   | `50`        | Máximo de bots por petición. |
| `KR_ALLOW_BOTS` | *no puesto* | **Interruptor de uso.** Solo `true` si vas a lanzar bots sobre partidas que **tú controlas** o con **permiso del dueño del quiz**. Sin esta variable, el gateway responde `bots_disabled` y NO se lanza nada. |

> No hay forma técnica de comprobar la propiedad de un PIN de Kahoot, así que la
> responsabilidad del uso recae en quien activa `KR_ALLOW_BOTS`. Lanzar bots sobre
> partidas ajenas interfiere con otras personas y con los Términos de Servicio de
> Kahoot.

## Límite técnico importante (serverless)

El motor original abre **conexiones WebSocket de larga duración** con cada bot.
Las **Serverless Functions de Vercel tienen timeout** (10 s en Hobby, hasta 300 s
en Pro con `maxDuration`) y **no sostienen WebSockets indefinidos**: en cuanto la
función termina, los bots se desconectan.

Esto significa que el botón "Iniciar" **no mantiene bots vivos en Vercel de forma
fiable**. Para un motor persistente necesitas un backend que aguante conexiones
largas: **Render / Fly.io / Railway / un VPS con Node**, y apuntar `bot-gateway`
a ese servicio. El shell web (clave + panel + UI) sí funciona completo en Vercel.

## Nota de seguridad

`keys.json` viaja con el despliegue: quien inspeccione el bundle del servidor
puede leer las claves. Para producción real, mueve la validación a un secreto en
el entorno (HMAC/firma) en lugar de una tabla plana en el repo.
