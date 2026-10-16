# invest-tracker

App web para seguir inversiones personales: inversiones por tipo (liquidez,
cripto, acciones, ETF, ahorro, entre otros), transacciones, actualización de
precios por ticker y un dashboard con KPIs, distribución y evolución.

## Stack

- Next.js 14 (App Router) con TypeScript y React 18.
- Tailwind CSS. Gráficos con Recharts.
- Supabase: autenticación por email y contraseña, base Postgres con RLS por usuario.
- El `user_id` se guarda hasheado con HMAC-SHA256 en las inversiones.

## Desarrollo

```bash
npm install
cp .env.local.example .env.local   # completar con los datos del proyecto Supabase
npm run dev
npm run build && npm run start
npm run lint
```

Variables que usa el código: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` y `HASH_SEED`. Esta última no figura en
`.env.local.example`. `.env.local` está en `.gitignore`.

## Base de datos

En `supabase/`: `schema.sql` (esquema), `rls_migration.sql` (políticas por
usuario) y `hash_userid_migration.sql` (paso al user_id hasheado).

## Estructura

- `app/`: páginas (dashboard, inversiones, precios, ajustes, login) y server actions.
- `components/`: dashboard, inversiones, layout, precios y UI.
- `lib/`: cálculos, formatos, tema y clientes de Supabase.
- `types/`: tipos compartidos.

## Estado

Versión 0.2.0. Último commit: 2026-04-15, "Add investment filters, sort,
total invested per group, and version display". Sin actividad desde entonces.
No surge del repo dónde está desplegada.

## Repo remoto

`git@github.com:sanmolini/invest-tracker.git` (público)
