# Vigilancia Tecnológica CEET — Radar y Mapa de Trayectoria | Electrónica 2026-2036

![Version](https://img.shields.io/badge/version-1.1.0-39A900?style=flat-square)
![SENA](https://img.shields.io/badge/SENA-CEET-00324D?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwindcss)
![Tests](https://img.shields.io/badge/tests-259%20passing-brightgreen?style=flat-square)

Aplicación web interactiva para la vigilancia científico-tecnológica y prospectiva del área de Electrónica del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) — SENA, Bogotá D.C. Integra dos herramientas complementarias: el **Radar Tecnológico** (madurez y adopción de 25 tecnologías en un horizonte 2026-2036) y el **Mapa de Trayectoria Tecnológica** (evolución de capacidades del área en el tiempo, por direccionador estratégico).

Grupo de Investigación, Innovación y Producción Académica — **GICS**

---

## Arquitectura

Este proyecto sigue la línea arquitectónica definida en el **Blueprint v5** (`docs/architectural-blueprint-v5.md`), que establece la plataforma como un **producto de visualización reusable** (no solo una página institucional).

**Fases implementadas:**

| Fase | Estado | Descripción |
|------|--------|-------------|
| **Quick Wins** | ✅ | Extracción de constantes, modelo de datos enriquecido, listeners optimizados |
| **A1 — Schema** | ✅ | Modelo polimórfico (`src/core/`), JSON schema v5, adaptador backward-compat |
| **A2 — Headless** | ✅ | Store Zustand por instancia, hooks (`useRadar*`), Provider composable |
| **A3 — XLSX Pipeline** | ✅ | `tools/ingest-xlsx/` — parser, transformer, CLI para Excel → JSON |
| **A4 — Tema/i18n/Embed** | ✅ | CSS variables, `messages/es.json`, helper i18n, ruta `/embed` |
| **A5 — Accesibilidad** | ✅ | ARIA roles, navegación por teclado, `prefers-reduced-motion` |
| **A6 — Contract Testing** | ✅ | Ejemplo `examples/minimal-consumer/`, infraestructura para api-extractor |
| **A7 — Mapa de Trayectoria** | 🟡 avance | Motor genérico + adaptador Electrónica (capa L1) + modal con export PDF. Capas L2-L4 pendientes del informe fuente GOR — ver sección siguiente. |

**Principios rectores:**
- Separación entre modelo de dominio (`src/core/`) y presentación
- Geometría SVG 100% pura y testeable (`src/core/geometry.ts`)
- Motor de trayectoria **data-agnóstico** (`src/lib/trajectory/`): cero dependencias al dominio Electrónica
- Componentes preparados para composición (`RadarProvider`, `TrajectoryProvider`, hooks)
- Pipeline de datos XLSX → JSON operativo
- Multi-instancia por diseño (store independiente por Provider)
- Backward compatibility: todos los componentes existentes funcionan sin cambios

Consulta `docs/architectural-blueprint-v5.md` para el plan completo de fases.

---

## Radar Tecnológico

### Contenido

- **25 tecnologías** organizadas en **5 direccionadores del desarrollo (D1-D5)**
- **4 anillos de adopción**: ADOPTAR, PROBAR, EVALUAR, MONITOREAR
- **Indicador de madurez** basado en niveles TRL (1-9)
- **Tabla de nomenclaturas** completa con códigos L01-L25

### Direccionadores

| ID  | Direccionador                                                                 | Tecnologías |
| --- | ------------------------------------------------------------------------------ | ----------- |
| D1  | Inteligencia distribuida y automatización industrial avanzada                  | 5           |
| D2  | Microelectrónica, semiconductores y diseño electrónico avanzado                | 5           |
| D3  | Electrónica de potencia, energía y electrificación sostenible                  | 5           |
| D4  | Electrónica aplicada a sectores estratégicos: salud, aeroespacial y movilidad  | 5           |
| D5  | Electrónica de consumo masivo, hogar inteligente y medios digitales            | 5           |

### Características

- **Visualización interactiva SVG** con zoom, pan y selección de tecnologías
- **Gestos táctiles**: navegación intuitiva mediante gestos (pan y pinch-to-zoom)
- **Filtros dinámicos** por direccionador y fase de adopción
- **Exportación**: PNG (3× resolución) y PDF (A4 landscape)
- **Diseño responsivo**: interfaz adaptada a móvil, tablet y escritorio
- **Interfaz institucional**: paleta SENA, logos CEET y GICS, modo claro

---

## Mapa de Trayectoria Tecnológica

El Mapa de Trayectoria es la segunda herramienta de la plataforma. Responde la pregunta que el Radar no responde: **¿cómo evolucionan las capacidades del área a lo largo del tiempo para alcanzar la visión tecnológica 2036?**

> **Estado actual: avance.** Solo la capa L1 (Tecnologías) tiene contenido real, derivado del Radar Tecnológico existente. Las capas L2-L4 aún no tienen datos porque el informe fuente de vigilancia científico-tecnológica del área de Electrónica no ha sido entregado. No se muestra ningún dato, cronograma ni proyección estimada en su lugar — el componente renderiza su estado vacío nativo para esas capas. Ver el comentario `PENDING:` en `src/lib/trajectory-data.electronica.ts` para el criterio de completitud.

### Qué visualiza

Un grid swimlane × tiempo con **4 capas (filas)** y **5 horizontes (columnas)**:

| Capas (swimlanes) | Descripción |
|-------------------|-------------|
| **L1 — Tecnologías** | Las 25 tecnologías del radar, posicionadas en su horizonte de adopción (derivado del campo `horizon` de radar-data). Badge de TRL por nodo. |
| **L2 — Infraestructura** | Ambientes, laboratorios y equipos a desarrollar o adquirir. Pendiente del informe fuente. |
| **L3 — Talento & I+D+i** | Capacitación docente, certificaciones y proyectos SENNOVA/semilleros. Pendiente del informe fuente. |
| **L4 — Alianzas** | Aliados estratégicos con tipo de relación. Pendiente del informe fuente. |

| Horizontes (columnas) | Rango |
|-----------------------|-------|
| Ya / Ahora | Capacidades operativas hoy |
| 0–12 meses | Prioridad P1 — acciones inmediatas |
| 1–3 años | Desarrollo a mediano plazo |
| 3–5 años | Consolidación estratégica |
| 5–10 años | Visión prospectiva 2036 |

**Selector por direccionador**: tabs D1–D5 permiten ver la hoja de ruta de cada área estratégica de forma independiente.

**Modal con export PDF**: captura del DOM con `html-to-image` + `jsPDF`, A4 landscape, 3× resolución, disponible desde el botón de exportación dentro del modal.

### Motor genérico (data-agnóstico)

El motor de trayectoria vive completamente aislado del dominio Electrónica y es reutilizable en cualquier proyecto — es el mismo motor, sin modificaciones, que usa la plataforma hermana de Telecomunicaciones:

```
src/lib/trajectory/         ◆ Motor lógico — cero dependencias al dominio
  types.ts                  # TrajectoryItem, TrajectoryConfig, TrajectoryDataset, HorizonBucket…
  layout.ts                 # agrupadores puros: byDriver / byLayer / byHorizon (testeables)
  config.ts                 # helpers de configuración + validación del contrato
  arch.test.ts              # test arquitectónico: verifica que el motor no importe dominio
  index.ts                  # API pública del motor

src/components/trajectory/  ◆ Motor UI — genérico, recibe config+dataset por props
  TrajectoryMap.tsx          # Grid + selector de driver + leyenda (API pública UI)
  TrajectoryLane.tsx         # Una fila/swimlane (capa)
  TrajectoryNode.tsx         # Celda/nodo (colorFor/labelFor inyectados por config)
  TrajectoryLegend.tsx       # Leyenda derivada del config
  TrajectoryDetail.tsx       # Panel de detalle de nodo
  TrajectoryProvider.tsx     # Context para inyección de config
```

**Regla de desacoplamiento** (verificada por `arch.test.ts`): `src/lib/trajectory/` y `src/components/trajectory/` no pueden importar `radar-data.ts` ni `trajectory-data.electronica.ts`. Borrar el adaptador de dominio no rompe el motor.

```
radar-data.ts ──► trajectory-data.electronica.ts ──► <TrajectoryMap config dataset />
   (dominio)              (adaptador)                       (motor genérico)
```

### Dataset Electrónica (adaptador de dominio)

`src/lib/trajectory-data.electronica.ts` es el adaptador que consume los datos institucionales y los conforma al contrato del motor:

- **5 direccionadores** (D1–D5), derivados de `SECTORS` del radar para coherencia visual
- **25 ítems en total**: 25 tecnologías (L1), una por cada entrada de `TECHNOLOGIES`. Sin ítems en L2/L3/L4.
- **Principio anti-fabricación**: ningún dato se inventa; L2-L4 quedan vacías hasta que exista un informe fuente del que transcribir contenido, con la misma disciplina de citas (`// JUICIO:` / `Fundamento:`) que usa el adaptador de Telecomunicaciones para su contenido del GOR
- **Fuente única de verdad**: las tecnologías se referencian desde radar-data, no se duplican; el horizonte se deriva con `normalizeHorizon()`

---

## Paleta Institucional SENA

| Color        | Hex       | Uso                        |
| ------------ | --------- | -------------------------- |
| Verde SENA   | `#39A900` | Primario / Header / Footer |
| Azul SENA    | `#00324D` | Títulos / Bordes           |
| Gris Claro   | `#F2F2F2` | Fondos secundarios         |
| Gris Oscuro  | `#333333` | Texto general              |
| Amarillo     | `#FDC300` | Alertas / TRL bajo         |
| Cian         | `#50E5F9` | Acentos                    |

---

## Stack Tecnológico

| Dependencia | Versión | Rol |
|-------------|---------|-----|
| **Next.js** | 16+ | Framework principal — App Router, Turbopack |
| **React** | 19.2 | UI con Server Components |
| **TypeScript** | 5.7 | Tipado estricto — todos los módulos |
| **Tailwind CSS** | 4.2 | Estilos — configuración CSS-based (`@theme`), paleta SENA |
| **shadcn/ui** | Radix UI + CVA | Sistema de componentes accesible |
| **Zustand** | 5.0 | Store por instancia (radar headless) |
| **Zod** | 3.24 | Validación de schema del radar (v5) |
| **next-intl** | 4.11 | i18n — strings de UI en `messages/es.json` |
| **jsPDF** | 4.2 | Exportación PDF (radar y mapa de trayectoria) |
| **html-to-image** | 1.11 | Captura DOM → PNG para export PDF del mapa |
| **Lucide React** | 0.575 | Iconografía |
| **tw-animate-css** | 1.2 | Animaciones para componentes Radix |
| **Storybook** | 10.3 | Documentación y desarrollo aislado de componentes |
| **Vitest** | 3.0 | Tests unitarios y de componente |
| **Playwright** | 1.59 | Tests E2E |
| **ExcelJS** | 4.4 | Parser del pipeline XLSX → JSON (`tools/ingest-xlsx/`) |
| **tsx** | 4.19 | Runner CLI para el pipeline de datos |

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MAlexVR/vigilancia-electronica.git
cd vigilancia-electronica

# Instalar dependencias
npm install

# Desarrollo (webpack)
npm run dev

# Desarrollo con Turbopack
npm run dev:turbo

# Build de producción
npm run build
npm start
```

---

## Testing

### Tests Unitarios y de Componente (Vitest)

```bash
# Ejecutar todos los tests
npm run test

# Con UI interactiva
npm run test:ui

# Con cobertura
npx vitest run --coverage
```

El suite cubre **259 tests** distribuidos en dos grandes módulos:

**Módulo Radar (core):**
- `src/core/geometry.test.ts` — Geometría SVG pura
- `src/core/validation.test.ts` — Validación Zod del schema
- `src/core/filters.test.ts` — Filtros de ítems
- `src/core/maturity/index.test.ts` — Escalas TRL/NPS
- `src/core/store.test.ts` — Zustand store por instancia
- `src/core/export.test.ts` — Pipeline de exportación (PNG/PDF/SVG)

**Módulo Mapa de Trayectoria:**
- `src/lib/trajectory/layout.test.ts` — Agrupadores puros (byDriver, byLayer, byHorizon)
- `src/lib/trajectory/config.test.ts` — Validación del contrato de configuración
- `src/lib/trajectory/arch.test.ts` — Test arquitectónico: verifica el desacoplamiento del motor
- `src/lib/trajectory-data.electronica.test.ts` — Dataset Electrónica: L1 poblada, L2-L4 vacías (anti-fabricación), marcador `PENDING:` presente
- `src/lib/trajectory-data.electronica.render.test.tsx` — Render con datos reales del componente genérico
- `src/components/trajectory/TrajectoryNode.test.tsx` — Nodo individual
- `src/components/trajectory/TrajectoryMap.test.tsx` — Mapa completo con config/dataset real
- `src/components/molecules/TrajectoryModal.test.tsx` — Modal de integración
- `src/components/organisms/Header.test.tsx` — Punto de entrada del Mapa de Trayectoria en el encabezado

Los tests de componentes de trayectoria están **co-located** junto a sus implementaciones. Cada componente documentado en Storybook tiene su historia (`.stories.tsx`) co-located también.

### Tests E2E (Playwright)

```bash
npm run test:e2e
```

Tests en `e2e/radar.spec.ts`:
- Carga de página principal
- Interactividad de puntos del radar
- Navegación por teclado
- Zoom con rueda del mouse
- Modo embed

### CI/CD (GitHub Actions)

Workflow en `.github/workflows/ci.yml`:
- **Lint & TypeCheck**: ESLint + `tsc --noEmit`
- **Test**: Vitest (259 tests)
- **E2E**: Playwright
- **Build**: Next.js production build

---

## Storybook

Storybook documenta y permite desarrollar componentes de forma aislada.

```bash
# Iniciar Storybook (http://localhost:6006)
npm run storybook

# Construir versión estática
npm run build-storybook
# → storybook-static/
```

### Componentes documentados

| Categoría | Componentes |
|-----------|-------------|
| **Organisms (Radar)** | `RadarChart`, `TechDetail`, `RadarLegend`, `Header`, `Footer` |
| **Trajectory** | `TrajectoryMap`, `TrajectoryNode`, `TrajectoryLegend`, `TrajectoryDetail` |
| **UI (shadcn/ui)** | `Button`, `Dialog`, `Badge`, `Card`, `Tabs` |

Las historias se encuentran en archivos `.stories.tsx` junto a cada componente. Storybook está configurado con:

- **Framework**: `@storybook/nextjs-vite` (compatibilidad con Next.js 16 + Vite)
- **Addons**: Essentials, A11y, Docs, Vitest, Chromatic
- **Estilos**: Tailwind CSS v4 cargado vía `globals.css` en `.storybook/preview.ts`
- **TypeScript**: todas las historias escritas en TypeScript con tipado estricto

---

## Pipeline de Datos (XLSX → JSON)

```bash
# Construir el dataset desde Excel
npm run data:build

# Validar el JSON generado
npm run data:validate
```

El pipeline en `tools/ingest-xlsx/` transforma el archivo Excel institucional al schema JSON v5 del radar. Utiliza ExcelJS como parser y tsx como runner CLI.

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── embed/
│   │   └── page.tsx              # Vista embed para iframes
│   ├── globals.css               # Theme CSS + variables del radar
│   ├── layout.tsx                # Root layout (Work Sans, metadata)
│   └── page.tsx                  # Página principal
├── components/
│   ├── molecules/                # AboutModal, HelpModal, TrajectoryModal
│   ├── organisms/                # Header, Footer, RadarChart, TechDetail,
│   │                             #   NomenclatureTable, RadarLegend
│   ├── radar/                    # RadarProvider
│   ├── trajectory/               # Motor UI genérico (TrajectoryMap, Lane,
│   │                             #   Node, Legend, Detail, Provider)
│   ├── templates/                # RadarTemplate (orquestador principal)
│   └── ui/                       # shadcn/ui (Button, Badge, Dialog, Tabs…)
├── core/                         # Módulo de dominio polimórfico v5
│   ├── types.ts                  # RadarSchema, RadarItem, RadarRing, MaturityScale…
│   ├── errors.ts                 # RadarSchemaError
│   ├── geometry.ts               # Funciones puras: polarToXY, getItemPosition
│   ├── export.ts                 # downloadElementAsPDF, svgToCanvas, exportPNG, exportSVG
│   ├── store.tsx                 # Zustand store por instancia
│   ├── hooks.ts                  # Hooks consumidores: useRadar*, useRadarFilters…
│   └── index.ts                  # API pública estable
├── lib/
│   ├── utils.ts                  # cn() helper
│   ├── i18n.ts                   # Helper i18n minimal
│   ├── radar-data.ts             # Adaptador backward-compat (carga JSON v5)
│   ├── trajectory-data.electronica.ts # Dataset CEET — adaptador de dominio Electrónica
│   └── trajectory/               # Motor lógico genérico (data-agnóstico)
│       ├── types.ts              # TrajectoryItem, TrajectoryConfig, Dataset…
│       ├── layout.ts             # Agrupadores puros: byDriver/byLayer/byHorizon
│       ├── config.ts             # Helpers + validación del contrato
│       ├── arch.test.ts          # Test arquitectónico de desacoplamiento
│       └── index.ts              # API pública del motor
└── types/
    └── radar.ts                  # Interfaces legacy (@deprecated)
public/
├── data/
│   └── ceet-electronica.json     # Schema v5 — fuente de verdad del radar
└── assets/logos/                 # Logos institucionales
tools/
└── ingest-xlsx/                  # Pipeline Excel → JSON
    ├── src/
    │   ├── parser.ts             # Parser ExcelJS
    │   ├── transformer.ts        # Transformador a RadarSchema
    │   └── index.ts              # CLI
    └── README.md
examples/
└── minimal-consumer/             # Ejemplo de consumo externo
    ├── README.md
    └── package.json
messages/
└── es.json                       # Strings de UI en español
```

---

## Changelog

### v1.1.0 — Mapa de Trayectoria Tecnológica, en avance (2026)

- **Motor de trayectoria portado**: `src/lib/trajectory/` y `src/components/trajectory/`, idénticos a los de la plataforma hermana de Telecomunicaciones, sin cambios en el contrato del motor.
- **Adaptador de dominio Electrónica**: `src/lib/trajectory-data.electronica.ts` — capa L1 (Tecnologías) poblada desde las 25 tecnologías reales del radar; capas L2-L4 (Infraestructura, Talento e I+D+i, Alianzas) sin ítems, en espera del informe fuente del área. Sin banner ni texto de relleno: el motor renderiza su estado vacío nativo para esas capas. Marcador `PENDING:` en el código documenta qué hacer cuando el informe llegue.
- **Modal con export PDF**: `TrajectoryModal.tsx` — integra el motor con el dataset de Electrónica; export vía `downloadElementAsPDF` (html-to-image + jsPDF, A4 landscape, 3× resolución) desde `src/core/export.ts`.
- **Punto de entrada en el encabezado**: botón "Mapa de Trayectoria Tecnológica" en el Header (desktop y móvil), igual que en Telecomunicaciones. Se retira el placeholder anterior (`TrajectoryMapCard.tsx`).
- **Ayuda**: nueva sección educativa sobre el Mapa de Trayectoria en `HelpModal.tsx`.
- **Suite de tests ampliada**: 259 tests — motor lógico, motor UI, dataset de Electrónica (incluye prueba explícita de que L2-L4 no fabrican datos), modal e integración con el Header.

### v1.0.0 — Versión inicial (2026)

- Radar SVG interactivo con 25 tecnologías
- Zoom, pan, filtros y exportación PNG/PDF

---

## Autores

**Ing. Óscar Andrés Pulido Casallas** — Instructor — Área de Electrónica
**Ing. Diana Cristina Limas Ramirez** — Instructora — Área de Electrónica

### Coautor

**Ing. Mauricio Alexander Vargas Rodríguez, MSc., MBA Esp. PM.**
Instructor G14 — Centro de Electricidad, Electrónica y Telecomunicaciones
SENA, Bogotá D.C. — Colombia

Grupo de Investigación, Innovación y Producción Académica — GICS

## Fuente

Elaboración propia basada en ejercicio de Vigilancia Científico-Tecnológica CEET-GICS (2026).
Metodología tipo Gartner Technology Radar para el Radar; metodología TRM (Industry Canada) + T-Plan (Cambridge) + ATRA (MIT, de Weck) para el Mapa de Trayectoria.

## Licencia

Uso institucional interno — SENA, Centro de Electricidad, Electrónica y Telecomunicaciones.
No autorizada la redistribución fuera del marco institucional sin autorización expresa de los autores.

---

© 2026 SENA — Servicio Nacional de Aprendizaje
