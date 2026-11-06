# AstroBookings Client

Cliente web en **Angular 22** para la API AstroBookings (`../activity-bookings-express`).
Diseño minimalista, sin librerías de UI.

## Puesta en marcha

```bash
# 1. Backend (en ../activity-bookings-express) en http://localhost:3000
#    Define JWT_SECRET para que las sesiones sobrevivan a reinicios del backend
JWT_SECRET=dev-secret npm run dev

# 2. Cliente (en esta carpeta) en http://localhost:4200
npm install
npm start
```

La URL de la API se define en `src/app/core/api.ts` (`API_URL`, por defecto `http://localhost:3000`).

Usuario de ejemplo: `m@f.c` / `1234aB`. Es el organizador de todas las actividades del seed,
así que para reservar hay que **registrar otro usuario**.

## Funcionalidades

| Pantalla | Ruta | API |
|---|---|---|
| Catálogo con búsqueda | `/activities` | `GET /activities?q=&_sort=date` |
| Detalle y reserva | `/activities/:id` | `GET /activities/:id`, `POST /bookings` |
| Iniciar sesión | `/login` | `POST /login` |
| Registro | `/register` | `POST /users` |
| Mis reservas | `/bookings` 🔒 | `GET /bookings` |
| Detalle de reserva | `/bookings/:id` 🔒 | `GET /bookings/:id` |

- El catálogo muestra solo actividades abiertas, confirmadas o completas con fecha futura.
- La reserva valida las plazas (entero, de 1 al máximo), muestra el total y traduce los errores de la API
  (aforo, pago rechazado, actividad cerrada, actividad propia).
- La sesión (JWT) se guarda en `localStorage` y se descarta si el token ha caducado.
  Un interceptor añade `Authorization: Bearer` y, ante un 401, cierra la sesión y redirige al login.
- Las rutas 🔒 están protegidas por un guard que vuelve a la página original tras iniciar sesión.

## Estructura

```text
src/app/
├── core/                 # API_URL, modelos, errores, etiquetas
│   └── auth/             # AuthStore (signals), interceptor, guards
├── shared/               # FieldErrors
└── features/
    ├── auth/             # login, register
    ├── activities/       # activity-list, activity-detail
    └── bookings/         # booking-list, booking-detail
```

Tecnología: componentes standalone, zoneless, signals, **Signal Forms** (`form`, `[formField]`, `[formRoot]`),
`httpResource` para lecturas y rutas con carga diferida.

## Scripts

```bash
npm start        # servidor de desarrollo
npm run build    # build de producción en dist/
npm test         # tests unitarios (Vitest)
```
