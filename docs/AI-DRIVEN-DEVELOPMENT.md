# Desarrollo dirigido por IA con Claude Code

Guía para trabajar en este proyecto con Claude Code siguiendo **Spec-Driven Development**: la IA programa,
pero siempre a partir de una especificación aprobada por una persona y con pruebas que lo demuestran.

## Estructura

```text
ejercicio-final-Programacion-Inteligente/
├── CLAUDE.md                       # Memoria del proyecto: mapa, flujo, reglas, definición de "hecho"
├── .claude/
│   ├── agents/                     # Subagentes, uno por rol
│   │   ├── analyst.md              #   investiga sin tocar nada
│   │   ├── architect.md            #   contrato API, capas, ADR
│   │   ├── spec-writer.md          #   product owner: specs EARS, PRD, backlog
│   │   ├── backend-developer.md    #   Express + tests Playwright
│   │   ├── frontend-developer.md   #   Angular + tests Vitest
│   │   ├── tester.md               #   trazabilidad criterio → prueba
│   │   └── reviewer.md             #   revisión independiente antes del commit
│   ├── commands/                   # Comandos /analyze /spec /plan /implement /verify /commit /feature
│   └── skills/                     # Conocimiento reutilizable (cómo se hace aquí)
│       ├── writing-specs/          #   SKILL.md + EARS.md + spec-template.md
│       ├── planning-specs/
│       ├── coding-express-api/
│       ├── testing-api-playwright/
│       ├── coding-angular/
│       ├── testing-angular/
│       └── committing-changes/
├── docs/
│   ├── PRD.md                      # Qué y por qué (requisitos del cliente y del backend)
│   ├── ADD.md                      # Cómo: arquitectura, contrato API, decisiones (ADR)
│   ├── BACKLOG.md                  # Lista de specs y su estado
│   ├── AI-DRIVEN-DEVELOPMENT.md    # Esta guía
│   └── specs/                      # Una spec por cambio: feat-*, bug-*, chore-*
├── activity-bookings-express/
│   └── CLAUDE.md                   # Reglas del backend (importa AGENTS.md)
└── astrobookings-client/
    └── CLAUDE.md                   # Reglas del cliente Angular
```

Claude carga automáticamente el `CLAUDE.md` de la raíz y el de la carpeta en la que trabaja.
Los subagentes y las skills se descubren solos por su `description`; los comandos se invocan con `/`.

## El ciclo

| Paso | Comando | Quién | Resultado | Control humano |
|---|---|---|---|---|
| 1. Entender | `/analyze <tema>` | analyst | Hallazgos con `fichero:línea` | Decides qué especificar |
| 2. Especificar | `/spec <petición>` | spec-writer (+ architect) | `docs/specs/<slug>.spec.md` con criterios EARS | ✋ Apruebas la spec |
| 3. Planificar | `/plan <spec>` | planning-specs | Tareas + mapa criterio → prueba | ✋ Apruebas el plan |
| 4. Implementar | `/implement <spec>` | backend-developer → frontend-developer | Código + tests | — |
| 5. Verificar | `/verify <spec>` | tester + reviewer | Tabla de trazabilidad, spec `Done` | Revisas el informe |
| 6. Confirmar | `/commit` | committing-changes | Commit convencional | ✋ Apruebas el mensaje |

`/feature <petición>` encadena los pasos 2 a 6 y se detiene en cada ✋.

## Cómo se habría hecho este proyecto

Las tareas que ya están hechas quedan documentadas como specs en `docs/specs/` (estado `Done`):

```text
/analyze activity-bookings-express: autenticación JWT y errores           → hallazgos
/feature corregir la seguridad JWT del backend                            → bug-jwt-security
/feature corregir login, IDs, aforo y reglas de propiedad                 → bug-backend-fixes
/feature batería de pruebas REST que compruebe respuesta y datos guardados→ chore-api-e2e-tests
/feature cliente Angular 22: login, registro y sesión                     → feat-client-auth
/feature catálogo de lanzamientos con búsqueda y detalle                  → feat-activity-catalog
/feature reservar plazas en un lanzamiento                                → feat-booking-flow
/feature ver mis reservas                                                 → feat-my-bookings
```

Siguiente paso propuesto (spec en borrador): `feat-available-seats`. Para empezar:

```text
# 1. Lee la spec, ajústala si hace falta y cambia su estado a Approved
/plan docs/specs/feat-available-seats.spec.md
/implement docs/specs/feat-available-seats.spec.md
/verify docs/specs/feat-available-seats.spec.md
/commit
```

## Buenas prácticas

- **Una spec cada vez**, pequeña (≤ 9 criterios). Si crece, se divide.
- **Sesión limpia por spec**: `/clear` entre specs. El contexto vive en los ficheros, no en el chat.
- **Modo plan** (`Shift+Tab`) para explorar sin que Claude edite nada.
- **La spec manda**: si Claude propone algo fuera de la spec, pide que lo añada al backlog en vez de hacerlo.
- **Pruebas como contrato**: un criterio solo está hecho si hay una prueba o comprobación en navegador que lo demuestra.
- **Actualiza la memoria**: cuando corrijas a Claude en algo recurrente, añádelo al `CLAUDE.md` correspondiente.
- **Idiomas**: código, specs y commits en inglés; la interfaz y esta guía en español; Claude responde en tu idioma.

## Opcional

- `.claude/settings.json`: permisos para `npm test`, `npm run build`, `git status/diff` sin pedir confirmación
  (o ejecuta la skill `/fewer-permission-prompts`).
- Hook `PostToolUse` que ejecute `npm run typecheck` tras editar el backend.
- Integración con GitHub Issues: una issue por spec, rama y PR con el mismo `<slug>`.
