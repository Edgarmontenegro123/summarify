# Forgot Password + Logout Confirmation — Spec

## 1. Objetivo
Dar a los usuarios de Summarify V3 una forma de recuperar el acceso si
olvidan su contraseña, y evitar cierres de sesión accidentales por un
click de más en el botón de logout.

## 2. Alcance

**Incluye:**
- Link "¿Olvidaste tu contraseña?" en LoginPage, debajo del campo de
  contraseña.
- Pantalla `/forgot-password` (pública) para pedir el email de
  recuperación vía `supabase.auth.resetPasswordForEmail()`.
- Pantalla `/reset-password` (protegida) para escribir la nueva
  contraseña vía `supabase.auth.updateUser({ password })`.
- Modal de confirmación (shadcn `AlertDialog`) antes de cerrar sesión
  desde el botón de logout en `Header.tsx`.
- Migración completa de `LoginPage` y `RegisterPage` a i18n
  (`useLanguage()`/`src/lib/i18n.ts`), además de las pantallas nuevas.
- `translateAuthError()` pasa a ser bilingüe (recibe el idioma actual).

**No incluye (por ahora):**
- Timer/cooldown visual para reintentos de "olvidé mi contraseña"
  (Supabase ya aplica rate-limit del lado del servidor; si el mensaje es
  dinámico —p. ej. incluye segundos—, no se traduce carácter por
  carácter, se muestra el texto de Supabase tal cual, igual que hoy pasa
  con errores desconocidos en `authErrors.ts`).
- Mensaje especial para "link de recuperación vencido/inválido". Si pasa,
  `/reset-password` no tiene sesión activa y `ProtectedRoute` redirige a
  `/login` normalmente — mismo comportamiento que cualquier ruta
  protegida sin sesión.
- Extraer el modal de logout a un componente aparte — se implementa
  inline en `Header.tsx` porque es el único lugar que lo usa (evitar
  abstracción prematura).
- Medidor de fortaleza de contraseña — se mantiene la misma regla que
  `RegisterPage` (mínimo 6 caracteres, límite de Supabase).

## 3. Modelo de datos
No aplica — esta feature no persiste datos en tablas de Supabase, solo
usa Supabase Auth (`resetPasswordForEmail`, `updateUser`). No hay
migraciones nuevas.

## 4. Componentes / pantallas UI

- **`src/pages/ForgotPasswordPage.tsx`** (nueva) — reusa `AuthLayout` +
  `Card`, un solo campo de email, botón submit, estado de éxito tipo
  "Revisá tu correo" (mismo patrón que `RegisterPage`'s
  `confirmationSent`), link "Volver a iniciar sesión".
- **`src/pages/ResetPasswordPage.tsx`** (nueva) — reusa `AuthLayout` +
  `Card`, campos "Nueva contraseña" + "Confirmar contraseña" (mismo
  patrón que `RegisterPage`: valida 6+ caracteres y que coincidan antes
  de llamar a Supabase), estado de éxito con botón para ir a `/`.
- **`src/components/ui/alert-dialog.tsx`** (nueva, instalada vía
  `npx shadcn@latest add alert-dialog`) — primitive de Radix para el
  modal de logout.
- **`src/components/Header.tsx`** (modificado) — el botón de logout deja
  de llamar `signOut` directo; abre un `AlertDialog` inline con
  Cancelar/Confirmar.
- **`src/pages/LoginPage.tsx`** (modificado) — agrega el link "¿Olvidaste
  tu contraseña?" bajo el campo de password, migra strings a i18n.
- **`src/pages/RegisterPage.tsx`** (modificado) — migra strings a i18n,
  sin cambios de comportamiento.

Reglas de diseño ya conocidas (pill buttons, rounded-2xl cards, sin
colores/radios hardcodeados, se prueba en claro/oscuro): se respetan tal
cual, no hay piezas nuevas de diseño que inventar.

## 5. Rutas
- `/forgot-password` — grupo `PublicOnlyRoute` (si ya hay sesión,
  redirige a `/`, igual que `/login` y `/register`).
- `/reset-password` — grupo `ProtectedRoute` (requiere la sesión de
  recuperación que Supabase establece automáticamente al volver del
  link del email).
- `LoginPage` gana un `<Link to="/forgot-password">`.

## 6. Datos y lógica

- **`src/lib/authErrors.ts`** — `translateAuthError(message, language)`
  pasa a tomar un segundo parámetro `'es' | 'en'`; el diccionario
  `KNOWN_ERRORS` pasa de `Record<string, string>` a
  `Record<string, Record<'es' | 'en', string>>`. Se agregan entradas para
  los mensajes esperables de `updateUser` (p. ej. *"New password should
  be different from the old password."*). Los call-sites existentes
  (`signIn`, `signUp`) pasan a pedir el idioma actual vía `useLanguage()`
  dentro de `AuthContext` — sin cambio de comportamiento visible ahí
  porque hoy la UI de Login/Register ya se ve toda en español por
  default.
- **`src/contexts/AuthContext.tsx`** — agrega `resetPasswordForEmail(email)`
  y `updatePassword(newPassword)` al `AuthContextValue`, mismo patrón
  `AuthResult` que `signIn`/`signUp`. Internamente usa
  `useLanguage()` (el provider ya está anidado dentro de
  `LanguageProvider` en `main.tsx`) para traducir errores.
- **`src/lib/i18n.ts`** — agrega namespaces `login.*`, `register.*`,
  `forgotPassword.*`, `resetPassword.*`, `logout.*` a la interfaz
  `Translations` y a ambos diccionarios (`es`/`en`).

## 7. Variables de entorno nuevas
Ninguna. `redirectTo` se arma en runtime con
`window.location.origin + '/reset-password'`, no hace falta configurarlo
en `.env`. (Sí hay que confirmar en el dashboard de Supabase que
`<origin>/reset-password` esté en la lista de Redirect URLs permitidas —
paso de configuración, no de código.)

## 8. Casos de error a manejar
- Supabase mal configurado / sin conexión → mismo mensaje ya traducido
  ("Failed to fetch") que usan `signIn`/`signUp` hoy.
- Contraseña nueva igual a la anterior → mensaje traducido específico.
- Contraseñas no coinciden / muy cortas → validación cliente antes de
  llamar a Supabase, igual que `RegisterPage`.
- Sin sesión de recuperación activa en `/reset-password` → cubierto por
  el `ProtectedRoute` existente (redirect a `/login`), sin mensaje
  especial (ver sección 2).
- RLS → no aplica, no hay tabla de usuario involucrada.

## 9. Criterios de aceptación
- [ ] Funciona en modo claro y oscuro
- [ ] Funciona en mobile (375px) y desktop
- [ ] `npm run build` pasa sin errores de TypeScript
- [ ] Flujo probado contra Supabase real: pedir reset, recibir el email,
      volver por el link, cambiar la contraseña, loguearse con la nueva
- [ ] Modal de logout: Cancelar no cierra sesión, Confirmar sí
- [ ] Sin colores/radios hardcodeados fuera de las variables CSS globales
- [ ] Toggle de idioma cambia correctamente Login, Register,
      ForgotPassword, ResetPassword y el modal de logout
- [ ] `translateAuthError` sigue funcionando igual para los flujos
      existentes de `signIn`/`signUp`

## 10. Fuera de alcance / para después
- Cooldown visual para reintentos de recuperación de contraseña
- Mensaje custom de "link vencido" en `/reset-password`
- Componente reutilizable de modal de confirmación genérico (se hace
  específico para logout, inline)
- Medidor de fortaleza de contraseña
