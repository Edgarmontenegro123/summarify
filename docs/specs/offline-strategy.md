# Estrategia Offline-First — Plan técnico

> Estado: **borrador para revisión**. No se implementó nada de esto todavía —
> este documento es el análisis + la propuesta, a aprobar antes de tocar código.

## 1. Objetivo

Que un usuario que abre Summarify sin conexión pueda:
1. Cargar la app (shell completo, sin pantalla en blanco ni error de red).
2. Ver y volver a cargar (`/history` → "Recargar") los últimos resúmenes que
   ya generó, aunque Supabase no sea alcanzable.
3. Seguir generando resúmenes nuevos sobre texto pegado/subido — esto ya
   funciona offline hoy (ver sección 2), no es parte del gap.

Lo que **no** cubre este plan (ver sección 11): guardar un resumen nuevo
mientras está offline y sincronizarlo después.

## 2. Análisis del estado actual

### 2.1 Qué cachea Workbox hoy

`vite.config.ts` usa `VitePWA` con la estrategia por defecto (`generateSW`),
sin bloque `workbox: {...}` propio. Inspeccioné el `dist/sw.js` de un build
real (no solo la config) para confirmar el comportamiento efectivo:

```js
e.precacheAndRoute([
  {url:"index.html", revision:"..."},
  {url:"assets/workbox-window.prod.es5-*.js", revision:null},
  {url:"assets/pdf-*.js", revision:null},
  {url:"assets/index-*.js", revision:null},
  {url:"assets/index-*.css", revision:null},
  {url:"pwa-192x192.png", revision:"..."},
  {url:"pwa-512x512.png", revision:"..."},
  {url:"manifest.webmanifest", revision:"..."},
])
e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))
```

**Hallazgo 1 — bug concreto, no solo gap de alcance:** el `globPatterns` por
defecto de `vite-plugin-pwa` no incluye `.mjs`, así que
`assets/pdf.worker-*.mjs` (el worker de `pdfjs-dist`, ver `src/lib/pdf.ts:2`)
**no se precachea**. Hoy, si un usuario carga la app, se queda sin conexión, y
recién ahí intenta subir un PDF, la extracción de texto falla porque el
navegador no puede bajar el worker. El resto de los assets (JS/CSS/HTML/
iconos/manifest) sí están cubiertos.

**Hallazgo 2 — no hay caching de datos:** no existe ningún `runtimeCaching` /
`registerRoute` hacia el origen de Supabase. El único `registerRoute` es el
`NavigationRoute` que sirve `index.html` para rutas de navegación (necesario
para que el router de React funcione offline). Esto significa que **cero
respuestas de la API quedan disponibles offline** — ni `fetchRecentDocuments`
ni `saveDocument` (`src/lib/documents.ts`).

### 2.2 Qué pasa hoy si el usuario se queda sin conexión

- **App shell:** carga bien (gracias al precache), salvo el caso del worker
  de PDF del Hallazgo 1.
- **`useOnlineStatus` / `OfflineBanner`:** ya existen y muestran un aviso
  ("estás offline"), pero es puramente informativo — no cambia de dónde se
  leen los datos.
- **Generar un resumen nuevo:** funciona sin cambios. `generateSummary`
  (`src/lib/summarize.ts`) es 100% local/determinístico, no llama a ninguna
  API (decisión de arquitectura ya documentada en `CLAUDE.md`). Esto es
  importante: el "motor" no es el problema, el problema es **acceso a
  historial guardado**.
- **`/history` (`HistoryPage.tsx`):** `useDocuments` llama a
  `fetchRecentDocuments`, que pega directo contra Supabase REST. Sin red,
  la promesa rechaza, `hasError` queda en `true`, y se muestra
  `history.loadError`. No hay ningún fallback local.
- **"Recargar resumen" desde `/history`:** no aplica si ya falló el paso
  anterior — nunca se llega a tener el `DocumentRecord` para navegar con él.

### 2.3 Conclusión de la evaluación

**La estrategia de caché actual (Workbox, solo `precacheAndRoute` de
assets estáticos) no alcanza para el objetivo.** Cubre el "app shell"
(con el bug del worker de PDF) pero no tiene ninguna capa para los
datos (`documents`). Hace falta agregar una capa de persistencia local
específica para eso — no es algo que Workbox resuelva por sí solo con
más `globPatterns`.

## 3. Alcance

**Incluye:**
- Fix del `globPatterns` para que el worker de `pdfjs-dist` (`.mjs`) quede
  precacheado.
- Una capa de caché local (IndexedDB, ver sección 4) para los últimos 5
  documentos del usuario autenticado.
- `useDocuments` cae a esa caché local cuando `fetchRecentDocuments` falla
  por falta de red, en vez de mostrar `history.loadError`.
- `saveDocument` escribe también a la caché local al guardar con éxito, para
  que lo recién guardado esté disponible offline sin esperar un próximo
  `refresh()`.
- Aislamiento por usuario y limpieza de la caché al cerrar sesión (ver
  sección 8).

**No incluye (por ahora, ver sección 11):**
- Guardar un resumen generado offline y sincronizarlo cuando vuelva la
  conexión (cola de escritura offline).
- Cachear más de los últimos 5 documentos, o paginar historial offline.
- Runtime caching de Supabase vía Workbox (`registerRoute` contra su
  origen) — se descarta, ver sección 4.2.

## 4. Decisión de arquitectura: IndexedDB vs Cache API

### 4.1 Por qué no Cache API (ni Workbox `runtimeCaching`) para los datos

La Cache API (y el `runtimeCaching` de Workbox, que es una capa encima de
ella) guarda pares `Request`/`Response` — pensada para respuestas HTTP
completas de assets o de un endpoint GET simple. Para el caso de
`documents` no encaja bien:

- Las respuestas de Supabase van con headers de auth (`Authorization:
  Bearer <token>`) que rotan (`autoRefreshToken: true` en
  `src/lib/supabase.ts`) — cachear la respuesta HTTP cruda arriesga servir
  datos con un token viejo o fallar el match de caché por header distinto.
- `saveDocument` es un `POST`/insert — no cacheable como request idempotente.
- Necesitamos **consultar y actualizar** el dato (ej. "estos son los 5 del
  usuario X, agregá el nuevo arriba, recortá a 5"), no solo "servir la misma
  respuesta de vuelta". Cache API no da ese tipo de query estructurada.

### 4.2 Por qué IndexedDB

- Guarda objetos JS estructurados directamente — encaja 1:1 con el tipo
  `DocumentRecord` que ya existe en `src/lib/documents.ts`, sin serializar
  a forma de respuesta HTTP.
- Permite indexar por `user_id`, que es exactamente el patrón de acceso que
  ya usa `fetchRecentDocuments` (`.eq('user_id', userId)`).
- Es async y no bloquea el hilo principal, igual que la app ya trata todo
  el acceso a datos (`await` en `lib/documents.ts`).
- Encaja con la separación que ya sigue el proyecto: una función pura en
  `lib/` (sin estado de React) que `hooks/useDocuments.ts` consume, mismo
  patrón que `fetchRecentDocuments`/`saveDocument` hoy.

**Recomendación:** IndexedDB como caché de lectura para `documents`,
+ el fix de `globPatterns` en Workbox para que el asset shell (incluido el
worker de PDF) esté completo. Son dos mecanismos distintos para dos
problemas distintos (assets estáticos vs. datos de usuario) — no hace
falta elegir uno solo.

## 5. Modelo de datos (IndexedDB)

- **Nombre de la base:** `summarify-offline-cache`, versión `1`.
- **Object store:** `documents`, `keyPath: 'id'` (mismo `id` que la fila de
  Postgres, evita duplicados en `put`).
- **Índice:** `by-user`, en el campo `user_id`, no único — para poder pedir
  "todos los documentos cacheados de este usuario" sin escanear todo el
  store.
- **Valor guardado:** el mismo shape que `DocumentRecord`
  (`src/lib/documents.ts:4-13`) tal cual — no hace falta transformarlo.
- **Tamaño esperado:** como mucho 5 documentos por usuario (ligado a
  `RECENT_DOCUMENTS_LIMIT`), texto plano — nada que se acerque a los
  límites de cuota de IndexedDB.

## 6. Componentes / lógica afectada

- **`src/lib/offlineCache.ts` (nuevo)** — funciones puras, sin estado de
  React, mismo patrón que el resto de `lib/`:
  - `getCachedDocuments(userId): Promise<DocumentRecord[]>`
  - `setCachedDocuments(userId, docs: DocumentRecord[]): Promise<void>` —
    reemplaza el set completo del usuario (se llama tras un
    `fetchRecentDocuments` exitoso).
  - `upsertCachedDocument(doc: DocumentRecord): Promise<void>` — se llama
    tras un `saveDocument` exitoso.
  - `clearCachedDocuments(userId): Promise<void>` — se llama en `signOut`.
- **`src/hooks/useDocuments.ts`** — `refresh()` intenta
  `fetchRecentDocuments` primero; si falla, cae a `getCachedDocuments`. Se
  suma un flag `isFromCache` (o similar) al valor que devuelve el hook, para
  que `HistoryPage` pueda, opcionalmente, distinguir "esto es lo último que
  vimos, puede no estar 100% al día" de un error real. `saveDocument` llama
  a `upsertCachedDocument` después de guardar en Supabase.
- **`src/pages/HistoryPage.tsx`** — el estado `hasError` deja de dispararse
  cuando hay un fallback de caché válido (solo se muestra si tanto la red
  como la caché fallan/están vacías). `OfflineBanner` ya cubre el aviso
  general de "estás offline"; a definir con Edgar si hace falta algo
  adicional en esta pantalla puntual (ver sección 12).
- **`src/contexts/AuthContext.tsx`** — `signOut` llama a
  `clearCachedDocuments(user.id)` antes de limpiar la sesión (privacidad,
  ver sección 8).

## 7. Cambios en `vite.config.ts`

```ts
VitePWA({
  registerType: "prompt",
  injectRegister: null,
  workbox: {
    globPatterns: ["**/*.{js,mjs,css,html,ico,png,svg,webmanifest}"],
  },
  manifest: { /* sin cambios */ },
})
```

Solo se agrega el bloque `workbox.globPatterns` para cerrar el Hallazgo 1
(worker de `pdfjs-dist`). No se agrega `runtimeCaching` — la razón está en
la sección 4.

## 8. Privacidad y multi-usuario

Un dispositivo compartido (o el mismo Edgar probando con dos cuentas) no
debería poder leer, offline, los resúmenes de otro usuario que inició
sesión antes en el mismo navegador:

- Todo acceso de lectura a la caché se filtra por `user_id` vía el índice
  `by-user` — nunca se lee "todo el store" sin filtrar.
- `signOut` limpia explícitamente los documentos cacheados del usuario que
  se está yendo (sección 6).
- No se cachea nada mientras no hay sesión (rutas públicas no llaman a
  `useDocuments`).

## 9. Casos de error a manejar

- **IndexedDB no disponible** (modo privado en algunos navegadores, cuota
  agotada): las funciones de `offlineCache.ts` devuelven silenciosamente
  `[]`/no-op envueltas en `try/catch` — degrada al comportamiento actual
  (`hasError`), no rompe la app.
- **Caché vacía + sin red:** se mantiene el `history.loadError` actual —
  no hay nada que mostrar, es el caso ya cubierto.
- **Conflicto de versión de esquema IndexedDB:** no aplica todavía (versión
  única, `1`); si se agrega un campo a `DocumentRecord` más adelante, la
  migración se maneja en el `onupgradeneeded` de `offlineCache.ts`.
- **`upsertCachedDocument` falla después de un `saveDocument` exitoso:** no
  debe romper el flujo de guardado — el dato ya está seguro en Supabase; el
  fallo de caché local se loguea (`console.error`) y se ignora, mismo
  criterio que ya usa `useDocuments.refresh()` con `console.error(err)`.

## 10. Criterios de aceptación

- [ ] `npm run build` pasa sin errores de TypeScript.
- [ ] El worker de `pdfjs-dist` (`assets/pdf.worker-*.mjs`) aparece en el
      precache manifest de `dist/sw.js` tras el build.
- [ ] Con DevTools → Network → Offline: `/history` muestra los últimos
      documentos guardados antes de desconectar, no `history.loadError`.
- [ ] "Recargar" un documento desde `/history` en modo offline precarga
      correctamente el texto y el resumen en `SummarizePage`.
- [ ] Generar un resumen nuevo (sin guardar) sigue funcionando offline
      (ya funciona hoy, no debe romperse).
- [ ] Guardar un documento nuevo online lo deja disponible en `/history`
      inmediatamente después de perder la conexión (sin esperar un reload).
- [ ] Cerrar sesión y entrar con otra cuenta no muestra los documentos
      cacheados de la cuenta anterior en modo offline.
- [ ] Sin colores/estilos nuevos — este plan no toca UI visual más allá de,
      como mucho, un estado de `HistoryPage` ya existente.

## 11. Fuera de alcance / para después

- **Cola de escritura offline:** generar y guardar un resumen sin conexión,
  sincronizándolo a Supabase cuando vuelva la red. Requiere manejo de
  conflictos/reintentos y es un feature en sí mismo — no asumido en este
  plan.
- **Historial offline más allá de los últimos 5:** ligado al feature ya
  pendiente de buscar/paginar historial (anotado en la memoria del
  proyecto) — si ese feature se implementa, este plan de caché offline
  debería revisarse junto con él.
- **Runtime caching de Supabase vía Workbox:** descartado, no solo
  pospuesto (sección 4.1).

## 12. Decisiones a confirmar con Edgar antes de implementar

1. **¿IndexedDB con wrapper `idb` (npm, ~1.2 kB) o `indexedDB` nativo
   envuelto a mano en `offlineCache.ts`?** El proyecto tiende a evitar
   dependencias nuevas para cosas chicas (hooks como `useSpeech`/
   `useOnlineStatus` están hechos a mano), pero la API nativa de
   `indexedDB` es basada en callbacks/eventos y bastante más verbosa que
   el resto del código de `lib/`. Mi sugerencia es `idb`, pero es tu
   llamada.
2. **¿`HistoryPage` necesita algún indicador visual de "estos datos son de
   caché, pueden no estar 100% actualizados"**, o alcanza con el
   `OfflineBanner` genérico que ya existe arriba de toda la app?
3. **¿Corresponde documentar esto como spec vía el flujo `spec-creator`
   habitual** (con su checklist de RLS/diseño) antes de implementar, o este
   documento ya alcanza como base de aprobación dado que no toca Supabase/
   RLS ni UI nueva?
