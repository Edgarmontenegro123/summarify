# Summarify 📄✨

Sube un PDF o pega texto largo, generá un resumen (breve o detallado) con un
motor extractivo 100% local, escuchalo en voz alta, y guardalo en tu
historial personal — con cuenta propia y datos protegidos por usuario.

**📦 Repositorio:** [github.com/Edgarmontenegro123/summarify](https://github.com/Edgarmontenegro123/summarify)

Diseño minimalista inspirado en apple.com, con un backend real sobre
Supabase (autenticación, base de datos e historial de resúmenes por
usuario) y una interfaz bilingüe (español/inglés).

## Estado actual

**Funcionando en producción.**

- ✅ Login / Registro (email + password), rutas protegidas
- ✅ Historial de resúmenes por usuario (Postgres + Row Level Security)
- ✅ Interfaz bilingüe (ES/EN) y modo claro/oscuro, ambos persistidos
- ✅ Desplegado en Vercel, conectado a un proyecto de Supabase real
- ⏳ Pendiente: buscar/paginar más allá de los últimos 5 documentos

## Stack

- **React 19 + TypeScript + Vite** + Tailwind CSS v4
- **shadcn/ui** (`components.json`, estilo Radix + Nova) para los componentes de UI
- **Supabase** (`@supabase/supabase-js`) — Auth (login/registro con email+password) y base de datos (historial de resúmenes con RLS)
- **react-router-dom** — rutas `/login`, `/register`, `/` y `/history` (las últimas dos, protegidas)
- **Extracción de PDF:** pdfjs-dist (100% en el navegador)
- **Resúmenes:** motor propio de resumen extractivo en TypeScript — determinista, 100% local, sin IA ni API externa, sin costo por request
- **Texto a voz:** Web Speech API del navegador (sigue el idioma del resumen mostrado)
- **Internacionalización:** diccionario propio en `src/lib/i18n.ts` (ES/EN) vía `LanguageContext`

## Configuración

Requisito: Node.js 18 o superior y un proyecto en [supabase.com](https://supabase.com).

```bash
npm install
cp .env.example .env.local
# completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local
# (ver la sección "Supabase Setup" más abajo para saber dónde conseguirlas)
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## Supabase Setup

El proyecto necesita dos variables de entorno para conectarse a Supabase.
Así se consiguen:

1. **Crea (o abre) un proyecto en Supabase.** Andá a
   [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
   (si ya tenés uno para Summarify, usá ese).
2. **Buscá las credenciales del proyecto.** Dentro del proyecto, andá a
   **Project Settings → API**. Ahí vas a ver:
   - **Project URL** → esto va en `VITE_SUPABASE_URL`.
   - **Project API keys → `anon` `public`** → esto va en
     `VITE_SUPABASE_ANON_KEY`.
3. **Completá `.env.local`** (no `.env.example`, ese es solo la plantilla)
   con esos dos valores:
   ```bash
   VITE_SUPABASE_URL=https://tu-proyecto-real.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. **Reiniciá `npm run dev`** — Vite solo lee las variables `VITE_*` al
   arrancar, así que hace falta reiniciar el servidor después de editar
   `.env.local`.
5. **Creá la tabla `documents`.** Abrí **SQL Editor → New query** en el
   dashboard de Supabase, pegá el contenido de
   [`supabase/migrations/0001_create_documents_table.sql`](supabase/migrations/0001_create_documents_table.sql)
   (y después [`0002_add_summary_language.sql`](supabase/migrations/0002_add_summary_language.sql))
   y ejecutalos en orden. Esto crea la tabla del historial de resúmenes con
   Row Level Security ya configurado (cada usuario solo puede ver/editar sus
   propios documentos).

### Probar el registro localmente sin esperar el email de confirmación

Por defecto Supabase pide confirmar el correo antes de dejar iniciar sesión
(la app ya maneja ese caso — ver `RegisterPage.tsx` — pero requiere revisar
el email). Para desarrollo local es más rápido desactivarlo temporalmente:
**Authentication → Sign In / Providers → Email → apagar "Confirm email"**.
Así el registro deja sesión activa al instante. Podés volver a activarlo
para producción.

### ⚠️ Importante sobre las keys

- La **`anon` key es pública por diseño**: viaja al navegador del usuario y
  está pensada para eso. La seguridad real de los datos la da **Row Level
  Security (RLS)** en las tablas de Postgres, no el secreto de esta key.
- **Nunca** uses ni expongas la **`service_role` key** en este proyecto — esa
  key se salta RLS por completo y solo debe vivir en un backend de
  confianza (Edge Functions, un servidor propio), jamás en código de
  frontend ni en un repo.
- `.env` y `.env.local` están en `.gitignore`. Si en algún momento un commit
  llega a incluir una key real, hay que rotarla desde el dashboard de
  Supabase (Project Settings → API → "Reset").

## Deploy

Desplegado en [Vercel](https://vercel.com), framework detectado
automáticamente (Vite). `vercel.json` define un rewrite catch-all
(`/(.*)` → `/index.html`) para que las rutas de `react-router-dom` (por
ejemplo, recargar la página estando en `/login`) no devuelvan 404 en un
hosting estático.

Para desplegar tu propia copia:

1. **Conectá el repo a Vercel.** [vercel.com/new](https://vercel.com/new) →
   importá `Edgarmontenegro123/summarify` desde GitHub. Vercel detecta
   Vite solo (build command `npm run build`, output `dist`).
2. **Configurá las env vars** en el proyecto de Vercel — **Settings →
   Environment Variables** — con las mismas dos variables que en local
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), marcando Production,
   Preview y Development. Sin esto el build compila igual, pero la app
   muestra pantalla en blanco al cargar (el cliente de Supabase tira el
   error de variables faltantes apenas arranca).
3. **Deploy.** Si agregaste las variables después del primer deploy, hace
   falta un redeploy — Vite las inyecta en build time, no en runtime.

Alternativa por CLI, si preferís no pasar por la UI:
```bash
npm install -g vercel
vercel link          # asocia la carpeta a un proyecto de Vercel
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

## Estructura del proyecto

```
summarify/
├── src/
│   ├── components/
│   │   ├── ui/            # Button, Card, Textarea, Input, Label (shadcn/ui real, vía CLI)
│   │   ├── Header.tsx      # Correo del usuario, historial, cerrar sesión, idioma y tema
│   │   ├── ThemeToggle.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── UploadZone.tsx
│   │   ├── SummaryPanel.tsx
│   │   ├── AuthLayout.tsx      # Layout compartido de /login y /register
│   │   ├── ProtectedRoute.tsx  # Redirige a /login si no hay sesión
│   │   └── PublicOnlyRoute.tsx # Redirige a / si ya hay sesión
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Sesión de Supabase (signIn/signUp/signOut)
│   │   ├── LanguageContext.tsx # Idioma de la interfaz (ES/EN), persistido
│   │   └── ThemeContext.tsx   # Modo claro/oscuro, fuente única de verdad (ver abajo)
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── SummarizePage.tsx  # La app de resúmenes (ruta protegida "/")
│   │   └── HistoryPage.tsx    # Últimos 5 resúmenes guardados (ruta protegida "/history")
│   ├── hooks/
│   │   ├── useSpeech.ts    # Web Speech API, sigue el idioma del resumen mostrado
│   │   └── useDocuments.ts # Guardar / traer el historial de resúmenes
│   ├── lib/
│   │   ├── summarize.ts    # Motor de resumen extractivo + heurística de detección de idioma
│   │   ├── pdf.ts          # Extracción de texto de PDFs
│   │   ├── supabase.ts     # Cliente de Supabase (lee las env vars VITE_SUPABASE_*)
│   │   ├── authErrors.ts   # Traduce mensajes de error de Supabase Auth
│   │   ├── documents.ts    # Queries a la tabla "documents" (save/fetch)
│   │   ├── i18n.ts         # Diccionario de traducciones ES/EN
│   │   └── utils.ts
│   ├── App.tsx              # Definición de rutas
│   └── main.tsx             # BrowserRouter + ThemeProvider + LanguageProvider + AuthProvider
├── supabase/
│   └── migrations/
│       ├── 0001_create_documents_table.sql  # Tabla documents + RLS
│       └── 0002_add_summary_language.sql    # Columna summary_language
├── components.json         # Config de shadcn/ui
├── vercel.json             # Rewrite catch-all para SPA routing
├── .env.example             # Plantilla de variables de entorno (Supabase)
└── package.json
```

### Cómo funciona el `ThemeProvider`

El modo claro/oscuro vive en `src/contexts/ThemeContext.tsx`, con el mismo
patrón que `LanguageContext` y `AuthContext`: un único `ThemeProvider`
montado en la raíz (`main.tsx`) guarda el estado `theme` (`'light' |
'dark'`), lo persiste en `localStorage` y alterna la clase `dark` en
`<html>` (la estrategia de dark mode de Tailwind) cada vez que cambia. El
valor inicial respeta lo guardado en `localStorage` o, si no hay nada
guardado, la preferencia del sistema operativo (`prefers-color-scheme`).

Cualquier componente accede al tema actual y a la función para alternarlo
con el hook `useTheme()`, que simplemente lee el contexto — ya no hay que
preocuparse por leer `localStorage` ni tocar el DOM a mano en cada pantalla
nueva que se agregue.

> Las specs de features nuevas no se escriben a mano: usá el skill
> `spec-creator` (instalado en `~/.claude/skills/`, disponible en
> cualquier proyecto) para generarlas de forma conversacional.

## Roadmap (próximos pasos)

1. ~~**Auth con Supabase** — registro/login (email+password), sesión persistente, rutas protegidas.~~ ✅ Hecho y verificado end-to-end contra un proyecto real.
2. ~~**Base de datos** — tabla de resúmenes por usuario con Row Level Security.~~ ✅ Hecho y verificado (insert/select reales, RLS confirmado bloqueando acceso anónimo).
3. ~~**Historial** — pantalla para ver y volver a cargar resúmenes pasados.~~ ✅ Hecho (últimos 5; falta buscar/paginar más).
4. ~~**Deploy en producción** — desplegado en Vercel, conectado al Supabase real.~~ ✅ Hecho.
5. ~~**Interfaz bilingüe** — toggle de idioma ES/EN para la UI, independiente del idioma del resumen guardado.~~ ✅ Hecho.
6. ~~**Modo claro/oscuro centralizado** — `ThemeProvider` único en vez de estado duplicado por pantalla.~~ ✅ Hecho.
7. Buscar/paginar el historial más allá de los últimos 5 documentos.

## Notas

- El motor de resumen sigue siendo determinista y 100% local — Supabase solo se usa para autenticación y persistencia, no para generar resúmenes.
- `.env` y `.env.local` están en `.gitignore`; nunca subas tus credenciales de Supabase al repositorio. Usa `.env.example` como plantilla.
- El diseño (paleta iOS-blue, tipografía system-stack, botones `rounded-full`, cards `rounded-2xl`, modo claro/oscuro) está inspirado en apple.com — ver `src/index.css`.
