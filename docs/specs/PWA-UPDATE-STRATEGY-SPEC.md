# Estrategia de actualización del PWA — Spec

## 1. Objetivo
Evitar que una actualización del service worker recargue la app sin
avisar y borre trabajo en curso (texto pegado, resumen generado sin
guardar). El usuario decide cuándo aplicar la actualización, no el SW.

## 2. Alcance

**Incluye:**
- Cambiar `registerType` de `'autoUpdate'` a `'prompt'` en
  `vite.config.ts`.
- Hook `usePwaUpdate` (`src/hooks/usePwaUpdate.ts`) que envuelve
  `useRegisterSW` de `virtual:pwa-register/react` y expone un estado
  simple (`needRefresh`, `updateApp()`, `dismiss()`).
- Componente `UpdateBanner` (`src/components/UpdateBanner.tsx`), mismo
  patrón visual y de ubicación que `OfflineBanner`: se renderiza en
  `App.tsx` junto a `<OfflineBanner />`, visible en cualquier ruta.
- Botón "Recargar" que aplica la actualización, y botón "Después" que
  descarta el aviso sin recargar (reaparece en la próxima visita/reload
  si la versión pendiente sigue sin aplicarse).
- Chequeo periódico de actualizaciones cada 60 minutos mientras la
  pestaña sigue abierta (patrón recomendado por la documentación de
  `vite-plugin-pwa` para service workers de larga vida), vía
  `setInterval` sobre `registration.update()` en el callback
  `onRegisteredSW` de `useRegisterSW`.

**No incluye (por ahora):**
- Confirmación extra tipo "¿estás seguro?" al hacer clic en "Recargar" —
  ese clic ya es la decisión informada del usuario, agregar un segundo
  diálogo sería fricción redundante.
- Persistir el estado de "descartado" en `localStorage` — el dismiss dura
  solo la sesión de pestaña actual (que es corta, dado que un summary sin
  guardar tampoco sobrevive un cierre de pestaña).
- Notificación tipo Toast (Sonner) — se descartó a favor del banner de
  ancho completo, igual que `OfflineBanner`, sin dependencias nuevas.
- Ícono/badge en el `Header` indicando "hay una actualización" — el
  banner ya cumple ese rol.

## 3. Modelo de datos
No aplica — no hay Supabase involucrado, es puro estado de cliente
(service worker + React state).

## 4. Componentes / pantallas UI

- **`src/components/UpdateBanner.tsx`** (nuevo) — banner de ancho
  completo, mismo estilo que `OfflineBanner` (fondo tenue, ícono +
  texto centrado), pero con dos botones a la derecha en vez de solo
  texto:
  ```tsx
  <div className="flex flex-wrap items-center justify-center gap-2 bg-primary/10 px-4 py-2 text-center text-sm text-primary">
    <RefreshCw className="h-4 w-4 shrink-0" />
    <span>{t('update.available')}</span>
    <div className="flex gap-2">
      <Button size="xs" variant="ghost" onClick={dismiss}>
        {t('update.later')}
      </Button>
      <Button size="xs" variant="secondary" onClick={updateApp}>
        {t('update.reload')}
      </Button>
    </div>
  </div>
  ```
  Usa `Button` de `ui/button.tsx` ya existente (pill, variantes ya
  definidas) — no hace falta instalar nada nuevo de shadcn.
- No renderiza nada (`return null`) cuando `needRefresh` es `false` o el
  usuario ya lo descartó en esta sesión — mismo patrón que
  `OfflineBanner` (`if (isOnline) return null`).
- Se prueba en claro/oscuro y en mobile (375px) — como es una fila
  `flex-wrap`, los dos botones bajan de línea en mobile sin romper el
  layout si el texto no entra en una sola fila.

## 5. Rutas
No aplica — se renderiza en `App.tsx` fuera del árbol de `<Routes>`,
igual que `OfflineBanner`, así que aparece en cualquier ruta (pública o
protegida) sin tocar rutas individuales.

## 6. Datos y lógica

- **`src/hooks/usePwaUpdate.ts`** (nuevo) — envuelve `useRegisterSW` de
  `virtual:pwa-register/react`:
  ```ts
  import {useRegisterSW} from 'virtual:pwa-register/react'
  import {useEffect} from 'react'

  export function usePwaUpdate() {
    const {
      needRefresh: [needRefresh, setNeedRefresh],
      updateServiceWorker,
    } = useRegisterSW({
      onRegisteredSW(_url, registration) {
        if (!registration) return
        setInterval(() => registration.update(), 60 * 60 * 1000)
      },
    })

    const updateApp = () => updateServiceWorker(true)
    const dismiss = () => setNeedRefresh(false)

    return { needRefresh, updateApp, dismiss }
  }
  ```
  Sigue la separación `hooks/` (estado de React) vs `lib/` (nada acá,
  todo el estado viene de la librería) que ya usa `useOnlineStatus.ts`.
- **`vite.config.ts`** — dos cambios en el bloque `VitePWA({...})`:
  - `registerType: 'prompt'` (antes `'autoUpdate'`).
  - `injectRegister: null` — con `useRegisterSW` manejando el registro
    desde React, el script de auto-registro que inyecta
    `vite-plugin-pwa` por defecto queda redundante y registraría el SW
    dos veces.
- **`src/vite-env.d.ts`** — agrega la referencia de tipos para que
  TypeScript resuelva `virtual:pwa-register/react`:
  ```ts
  /// <reference types="vite-plugin-pwa/react" />
  ```
- **`src/lib/i18n.ts`** — nuevas keys `update.available`, `update.later`,
  `update.reload` en `es`/`en`.
- **`src/App.tsx`** — agrega `<UpdateBanner />` junto a
  `<OfflineBanner />`, antes de `<Routes>`.

## 7. Variables de entorno nuevas
Ninguna.

## 8. Casos de error a manejar
- Sin conexión mientras se intenta aplicar la actualización (clic en
  "Recargar" offline): `updateServiceWorker` puede fallar silenciosamente
  si no hay red para bajar los assets nuevos — no hace falta un mensaje
  de error especial, el navegador seguirá sirviendo la versión cacheada
  actual y el banner sigue disponible para reintentar cuando vuelva la
  conexión.
- Falla de registro del propio service worker (browsers sin soporte,
  contextos no seguros): `useRegisterSW` no expone error visible por
  defecto — el `onRegisterError` callback queda disponible pero no se
  cablea a UI en esta iteración (degrada a "sin banner", no rompe nada).
- No aplica RLS/Supabase, no hay estado vacío que mostrar.

## 9. Criterios de aceptación
- [ ] `npm run build` pasa sin errores de TypeScript (incluida la
      referencia nueva a `vite-plugin-pwa/react`)
- [ ] Después de un build + deploy, editar un archivo y volver a buildear
      dispara `needRefresh: true` en una pestaña con la versión vieja
      abierta (probado con `npm run preview` + un segundo build)
- [ ] "Recargar" aplica la versión nueva y el banner desaparece
- [ ] "Después" oculta el banner sin recargar, y el usuario puede seguir
      escribiendo/generando resúmenes sin interrupciones
- [ ] Funciona en modo claro y oscuro
- [ ] Funciona en mobile (375px) y desktop, sin overlap con
      `OfflineBanner` si ambos están visibles a la vez
- [ ] Sin colores/radios hardcodeados fuera de las variables CSS globales
- [ ] Copy bilingüe (es/en) vía `i18n.ts`, consistente con
      `OfflineBanner`

## 10. Fuera de alcance / para después
- Confirmación adicional antes de recargar
- Persistir el dismiss entre sesiones/pestañas
- Toast (Sonner) como alternativa visual
- Badge de actualización en el Header
- Manejo de UI para `onRegisterError`
