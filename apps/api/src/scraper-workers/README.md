# Scraper Workers

Reparte las subastas del día entre varias VM que corren **Chrome + Automa**. Cada VM abre
hasta 5 subastas en 5 pestañas y ésas son las que trabaja ese día; la extensión
`chromescraperextension` sigue oliendo los frames de Socket.IO y posteando a
`/auction-sale-results/ingest`. Aquí solo se reparte.

Sustituye al worker de Puppeteer (`apps/auction-monitor`), que queda pausado.

## El endpoint

Es **uno solo**, y hace de alta, de heartbeat y de reparto a la vez. Cuantos menos bloques
tenga el workflow de Automa, menos cosas que alguien pueda olvidarse de conectar.

```http
POST /api/v1/scraper/poll
X-API-Key: <AUCTION_INGEST_API_KEY>
Content-Type: application/json

{ "worker": "vm-01" }
```

```jsonc
{
  "worker": "vm-01",
  "paused": false,                       // la VM está desactivada desde la UI
  "account": { "email": "…", "password": "…" },   // la cuenta de su agente
  "saleDate": 20260824,
  "count": 5,
  "auctions": [
    { "id": "…", "url": "https://www.autobidmaster.com/en/search/…",
      "locationName": "Dallas", "locationSlug": "dallas",
      "saleDate": 20260824, "startsAt": "2026-08-24T14:00:00.000Z", "items": 412 }
  ]
}
```

`"wait": false` en el cuerpo responde al momento; por defecto retiene hasta 20 s esperando a
que aparezca trabajo, y contesta en cuanto lo hay.

## El workflow de Automa

| Bloque | Configuración |
|---|---|
| **Trigger** | On startup + intervalo (5 min está bien) |
| **HTTP Request** | `POST`, la URL de arriba, header `X-API-Key`, body `{"worker":"vm-01"}` |
| ↳ Response | Type `JSON`, **data path** `auctions`, asignar a variable |
| **Loop Data** | Sobre esa variable |
| **New Tab** | URL `{{loopData.xxx.data.url}}` |
| **Fallback** del HTTP | → *Delay* → vuelta al HTTP Request |

Lo único distinto entre máquinas es el `worker` del body: esa cadena **es** la identidad. La
fila se crea sola en el primer poll, no hay que dar de alta nada por la UI.

El bloque HTTP no documenta un timeout configurable; si 20 s dieran problemas, la salida es un
bloque *JavaScript Code* con `automaFetch`, que sí da control total.

## Por qué el poll es idempotente

El contrato es **«dame lo mío de hoy»**, no «dame cinco más». Automa se reinicia, Chrome se cae
y el workflow se relanza. Si cada llamada entregara subastas nuevas, un reinicio a media mañana
se comería el cupo de la siguiente VM y dejaría ventas sin cubrir. Una vez estampadas, el poll
devuelve siempre las mismas hasta que cambie el día.

## Cómo se garantiza que dos VM no reciben la misma

```ts
updateMany({ where: { id: { in: candidatos }, scraperWorkerId: null }, data: { scraperWorkerId } })
```

En Postgres el perdedor de la carrera no encuentra la fila (el `WHERE` se reevalúa tras el
bloqueo), así que el estampado es exclusivo. Después se **relee por `scraperWorkerId`**: esa
relectura, no el número de filas pedidas, es la que dice qué ganó de verdad.

## Ciclo de vida de un día

| Cuándo | Qué |
|---|---|
| 06:00 Houston | `AgentAssignmentService.releaseStale()` suelta agente **y** VM de lo pasado o sin items |
| Primer poll | La VM se registra y coge su cupo del día |
| Cada poll | `lastSeenAt` — el poll **es** el heartbeat |
| Cada 5 min | `sweepDeadWorkers()`: sin señal en 15 min, se sueltan sus subastas **aún no empezadas** |

Las ya empezadas se quedan donde están: reabrirlas a media venta aporta poco y descuadra el
recuento.

## Dos trampas que costaron un rato

**El refresco del calendario borra y recrea todas las filas.** `auction-calendar.service.ts`
preserva `monitor`, `scraperAgentId` y `scraperWorkerId` cruzando por
`${locationSourceId}|${startedAt.toISOString()}`. Sin lo tercero, una VM seguiría con sus cinco
pestañas abiertas mientras la API reparte esas mismas ventas a otra máquina.

**El reclamo ordena por hora ascendente**, así que descarta lo que arrancó hace más de media
hora. Si no, una VM encendida a mediodía se llevaría las ventas de la mañana — las que ya
terminaron.

## Cupo fijo: el riesgo silencioso

5 por VM **para todo el día** significa que si hay más subastas que 5 × VMs, las sobrantes no
las mira nadie. Por eso la página muestra «subastas hoy / reclamadas / capacidad» y avisa en
ámbar cuántas VM faltan. Sin ese aviso el sistema falla en silencio, que es la peor forma.

## Seguridad

La respuesta lleva **la contraseña en claro**. El único candado es `AUCTION_INGEST_API_KEY`, la
misma clave compartida que usa el ingest: quien la tenga se descarga las credenciales de todas
las cuentas. La mejora natural es una clave por worker guardada en su fila, para poder revocar
una VM sin tocar las demás.

`scraperAgentId` es `@unique`: la misma cuenta entrando desde dos IPs a la vez es justo el
patrón que hace saltar los bloqueos del portal, así que lo impide la base de datos.

## Comprobarlo

```bash
npx nx build api && node scripts/verify-scraper-workers.js   # necesita DATABASE_URL
```

Siembra sus propias subastas (prefijo `VERIFY-`) y las borra al terminar. Cubre exclusividad
bajo concurrencia, cupo, idempotencia, liberación al desactivar y recorte al bajar el cupo.
