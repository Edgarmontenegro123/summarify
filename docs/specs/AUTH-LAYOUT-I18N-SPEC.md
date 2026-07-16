# Selector de idioma en AuthLayout — Spec

## 1. Objetivo
Dejar que un usuario sin sesión elija español o inglés desde cualquier
pantalla de autenticación, en vez de depender de que ya haya iniciado
sesión antes para acceder al `LanguageToggle` (que hoy solo vive en el
`Header` de la app logueada).

## 2. Alcance

**Incluye:**
- Agregar `<LanguageToggle />` al header de `AuthLayout.tsx`, junto al
  `ThemeToggle` existente.
- Como `AuthLayout` es el componente compartido por las cuatro pantallas
  de auth, el toggle queda visible en `/login`, `/register`,
  `/forgot-password` y `/reset-password` por igual — sin lógica
  condicional por ruta.

**No incluye (por ahora):**
- Ningún prop nuevo en `AuthLayout` (como `showLanguageToggle`) para
  ocultarlo en alguna pantalla puntual — no hay razón de UX para que
  `/reset-password` sea distinta.
- Persistencia de idioma: ya está resuelta por `LanguageProvider`
  (`src/contexts/LanguageContext.tsx`), que envuelve toda la app en
  `main.tsx` y guarda la selección en `localStorage` bajo la key
  `summarify-language`. Navegar entre rutas no reinicia el estado —
  no hay nada que construir ahí.
- Cambios al propio `LanguageToggle.tsx` — se reutiliza tal cual está.

## 3. Modelo de datos
No aplica — no hay Supabase involucrado.

## 4. Componentes / pantallas UI

- **`src/components/AuthLayout.tsx`** (modificado) — el header pasa de:
  ```
  <header className="flex h-16 items-center justify-between px-6">
    <div>logo + "Summarify"</div>
    <ThemeToggle theme={theme} onToggle={toggleTheme} />
  </header>
  ```
  a agrupar los dos controles a la derecha en un `<div className="flex
  items-center gap-2">`, mismo patrón que ya usa `Header.tsx` en la app
  logueada:
  ```
  <div className="flex items-center gap-2">
    <LanguageToggle />
    <ThemeToggle theme={theme} onToggle={toggleTheme} />
  </div>
  ```
- No hace falta instalar nada de shadcn ni tocar `LanguageToggle.tsx` —
  ya es un componente `rounded-full` con `border-border`/`bg-muted`,
  visualmente coherente con el resto de controles pill-shaped del
  proyecto.
- Layout: mismo `justify-between` de siempre — logo a la izquierda,
  controles a la derecha. El grupo de controles pasa de un solo elemento
  a dos (`gap-2`), sin tocar el `max-w-sm` del formulario debajo, así que
  no hay riesgo de que el toggle empuje o solape los campos del form.
- Se prueba en mobile (375px): el header ya es angosto y de un solo nivel
  (`h-16`), y `Header.tsx` ya prueba el mismo par de controles juntos sin
  problema de espacio en esa misma resolución.

## 5. Rutas
No aplica — no se agregan ni modifican rutas, solo un componente
compartido que ya usan las cuatro pantallas de auth.

## 6. Datos y lógica
No aplica — `useLanguage()` y `LanguageToggle` ya existen y funcionan;
esto es puramente cablear un componente existente en un lugar nuevo.

## 7. Variables de entorno nuevas
Ninguna.

## 8. Casos de error a manejar
No aplica — no hay llamadas a red ni estados de carga nuevos.

## 9. Criterios de aceptación
- [ ] `LanguageToggle` visible y funcional en `/login`, `/register`,
      `/forgot-password` y `/reset-password`
- [ ] Cambiar el idioma en cualquiera de esas pantallas persiste al
      navegar a otra (incluida `/reset-password`, que requiere sesión de
      recuperación) y al volver a cargar la página
- [ ] No hay overlap ni desalineación con el logo o el `ThemeToggle` en
      mobile (375px) y desktop
- [ ] Funciona en modo claro y oscuro
- [ ] `npm run build` pasa sin errores de TypeScript
- [ ] El formulario de cada pantalla (inputs, botones, links) sigue
      funcionando igual que antes, sin overlap ni cambios de tabindex
      raros por el nuevo elemento en el header

## 10. Fuera de alcance / para después
- Prop para ocultar el toggle en alguna pantalla de auth puntual
- Cualquier cambio visual o de comportamiento a `LanguageToggle.tsx`
  mismo
