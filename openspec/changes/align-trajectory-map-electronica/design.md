# Design: Align Trajectory Map and Radar drift with vigilancia-telecomunicaciones

## Technical Approach

Three-tier port from `E:\Repositorio\radar_tecnologico` (telecom v2.3.0): **verbatim engine**, **verbatim UI**, **new domain adapter**. Honesty for the unsourced layers comes from *absence of data*, not from new code: `TrajectoryMap.tsx:154` already renders `No hay ítems para este driver.` for any driver/lane with zero items. Shipping a dataset whose L2–L4 have zero items therefore produces the required *avance* state with **zero new components and zero engine change**.

Layering (unidirectional): `radar-data → trajectory-data.electronica → engine`.

## Architecture Decisions

| # | Decision | Choice | Alternatives rejected | Rationale |
|---|----------|--------|-----------------------|-----------|
| D1 | Empty-layer UX | Engine's native per-driver empty state only | New banner/badge/"avance" component; filler copy | Confirmed present at `TrajectoryMap.tsx:154`. No new surface to test, translate, or later remove. Product decision (locked). |
| D2 | Completion marker | `PENDING:` code comment in `trajectory-data.electronica.ts` | UI-visible pending message | Marker addresses the future developer/agent, not the end user. Mirrors the removed `TrajectoryMapCard.tsx` comment (which cited `Vigilancia_Cientifico-Tecnologica_Electronica_2026.pptx`). |
| D3 | Engine port fidelity | Verbatim, one exception (see D4) | Refactor while porting; shared package | `arch.test.ts` proves the engine imports no `@/lib/radar-data`, `@/core`, `next-intl`, or dataset JSON. Verbatim keeps 3 sibling apps convergent. |
| D4 | `arch.test.ts` adaptation | Change forbidden token `"ceet-telecom"` → `"ceet-electronica"` (+ its doc comment) | Verbatim copy | The literal guards the app's own dataset JSON; electronica's is `public/data/ceet-electronica.json`. Verbatim would leave a dead guard. **Only** non-verbatim edit in the engine/UI port. |
| D5 | Item type | Unchanged `TrajectoryItem` | Add `status: "avance"` field | Mutating a type shared by telecom + electricidad is scope creep and unnecessary under D1. |
| D6 | Entry point | Header-triggered `TrajectoryModal` | Keep inline card slot | Parity with telecom; the card is deleted, not wrapped. |
| D7 | PDF export | Ships enabled, full parity, no gating | Defer until L2–L4 exist | Product decision (locked). |

## Data Flow

    public/data/ceet-electronica.json
             │
             ▼
    src/lib/radar-data.ts  (SECTORS D1–D5, TECHNOLOGIES)
             │
             ▼
    src/lib/trajectory-data.electronica.ts
      electronicaConfig  ─── drivers/layers/horizons/colorFor/labelFor/metricBadge
      buildElectronicaTrajectory() ─── L1 items only; L2–L4 contribute nothing
             │
             ▼
    Header.tsx ──▶ TrajectoryModal.tsx ──▶ <TrajectoryMap config dataset/>
                        │                        │
                   downloadElementAsPDF     empty state per driver-lane (L2–L4)
                        (@/core)

## File Changes

| File (target repo `E:\Repositorio\vigilancia-electronica`) | Action | Description / copy source |
|---|---|---|
| `src/lib/trajectory/{types,config,layout,index}.ts` | Create | Verbatim from telecom `src/lib/trajectory/` |
| `src/lib/trajectory/{config,layout}.test.ts` | Create | Verbatim |
| `src/lib/trajectory/arch.test.ts` | Create | Verbatim **except** D4 token swap |
| `src/components/trajectory/{TrajectoryProvider,TrajectoryMap,TrajectoryLane,TrajectoryNode,TrajectoryDetail,TrajectoryLegend,index}.tsx` | Create | Verbatim from telecom `src/components/trajectory/` |
| `src/components/trajectory/*.stories.tsx`, `TrajectoryMap.test.tsx`, `TrajectoryNode.test.tsx` | Create | Verbatim |
| `src/lib/trajectory-data.electronica.ts` | Create | New adapter — see Interfaces |
| `src/lib/trajectory-data.electronica.test.ts` | Create | New, electronica-specific |
| `src/components/molecules/TrajectoryModal.tsx` | Create | From telecom `TrajectoryModal.tsx`; swap L29 import to `electronicaConfig`/`buildElectronicaTrajectory`; keep APA/DOI sources footer verbatim (methodology, domain-neutral) |
| `src/components/organisms/Header.tsx` | Modify | Add `Route` to the `lucide-react` import; `import { TrajectoryModal } from "@/components/molecules/TrajectoryModal"`; `const [showTrajectory, setShowTrajectory] = useState(false)`; desktop button between Ayuda and Acerca de (`Route size={16}`, `{t("trajectory")}`); mobile menu button (`Route size={18} className="text-white/70"` + `setMobileMenuOpen(false)`); mount `<TrajectoryModal open={showTrajectory} onOpenChange={setShowTrajectory} />` next to the other two modals. Mirrors telecom `Header.tsx` L6, L11, L19, L65-71, L104-109, L131. |
| `src/components/molecules/TrajectoryMapCard.tsx` | Delete | Superseded |
| `src/components/molecules/TrajectoryMapCard.test.tsx` | Delete | Superseded |
| `src/components/templates/RadarTemplate.tsx` (~L265) | Modify | Remove import + usage (and the now-orphan `<Separator/>` if it only divided the card) |
| `src/components/templates/MobileLayout.tsx` (~L186) | Modify | Remove import + usage (and the wrapping `<Card>` if it wrapped only the card) |
| `src/components/molecules/HelpModal.tsx` | Modify | Insert divider + "Mapa de Trayectoria Tecnológica" section after the "Fases de Adopción" section (before the content `</div>` at L149), ported from telecom `HelpModal.tsx` L150-~230: MT badge heading, 4-layer legend (L1 #1565C0 / L2 #2E7D32 / L3 #6A1B9A / L4 #00838F), "Cómo usarlo" steps, gap-color indicators. Adapt intro sentence to Electrónica + its horizon; factual, no apology, no pending banner |
| `messages/es.json` | Modify | `header.trajectory` + full `trajectory` namespace |
| `src/core/export.ts` | Modify | Add `DownloadElementAsPDFOptions` + `downloadElementAsPDF` verbatim from telecom `src/core/export.ts` (dynamic `import("html-to-image")` + jsPDF) |
| `src/core/index.ts` | Modify | L56 → `export { svgToCanvas, exportPNG, exportSVG, downloadElementAsPDF } from "./export";`; L57 → add `DownloadElementAsPDFOptions` to the type export |
| `package.json` | Modify | Add `"html-to-image": "^1.11.13"` (+ lockfile) |
| `README.md` | Modify | Restructure (below) |
| `src/components/molecules/AboutModal.tsx` | **Untouched** | **Guardrail — see below** |

### Guardrail (must propagate to `tasks.md`)

`src/components/molecules/AboutModal.tsx` is an explicit **non-goal**. It hardcodes Electrónica's authors (Pulido Casallas, Limas Ramirez, coauthor Vargas Rodríguez). No task may create, modify, or "sync" it. Its diff MUST be empty at verify.

## Interfaces / Contracts

`src/lib/trajectory-data.electronica.ts` — same two exports as `trajectory-data.telecom.ts`:

```ts
export const electronicaConfig: TrajectoryConfig = {
  drivers: SECTORS.map((s) => ({ key: s.id, label: s.label, icon: s.icon, color: s.color })),
  layers: [
    { key: "L1", label: "Tecnologías",     order: 1, color: "#1565C0" },
    { key: "L2", label: "Infraestructura", order: 2, color: "#2E7D32" },
    { key: "L3", label: "Talento & I+D+i", order: 3, color: "#6A1B9A" },
    { key: "L4", label: "Alianzas",        order: 4, color: "#00838F" },
  ],
  horizonBuckets: [ /* ahora | corto | medio1 | medio2 | largo — telecom's teal→púrpura gradient verbatim */ ],
  colorFor: (item) => item.gap ? GAP_COLORS[item.gap] : (item.layer === "L1" ? DRIVER_COLORS[item.driver] ?? NEUTRAL_COLOR : NEUTRAL_COLOR),
  labelFor: (item) => item.title,
  metricBadge: (item) => (item.metric && item.layer === "L1" ? `TRL ${item.metric.value}` : null),
};

export function buildElectronicaTrajectory(): TrajectoryDataset {
  const items: TrajectoryItem[] = [];
  for (const tech of TECHNOLOGIES) {
    items.push({
      id: `tech-${tech.code}`,
      layer: "L1",
      driver: `D${tech.sector + 1}`,
      horizon: normalizeHorizon(tech.horizon),
      title: tech.name,
      detail: tech.desc,
      metric: { label: "TRL", value: tech.trl },
      relatedIds: [],
      source: "Radar tecnológico — Electrónica CEET",
      meta: { Código: tech.code, Tipo: "tecnologia" },
    });
  }
  // L2–L4: sin ítems (ver PENDING).
  return { items };
}
```

Differences from telecom, all deliberate: no `FUENTE_GOR` constant (no GOR report exists), no `CRITICAL_LINES` / `gap` assignment on L1 (gap severity is a GOR Tabla 11 judgment, unavailable), and **no L2/L3/L4 `items.push` calls at all**.

Required marker comment (Spanish, neutral register, at the top of the file, above `buildElectronicaTrajectory`):

```ts
/**
 * PENDING: capas L2 (Infraestructura), L3 (Talento & I+D+i) y L4 (Alianzas)
 * no tienen contenido porque el informe GOR del área de Electrónica
 * (Vigilancia_Cientifico-Tecnologica_Electronica_2026.pptx) todavía no ha sido
 * entregado. El motor de trayectoria muestra su estado vacío nativo para esas
 * capas; no se debe fabricar contenido.
 *
 * Cuando el informe esté disponible: agregar los ítems L2/L3/L4 en
 * buildElectronicaTrajectory() siguiendo la convención de procedencia de
 * trajectory-data.telecom.ts — comentario "// JUICIO:" para cada juicio de
 * mapeo y "Fundamento:" para la evidencia, con source apuntando a la tabla GOR
 * correspondiente. Definir entonces la constante FUENTE_GOR y las brechas
 * (gap) de L1 a partir de la tabla de brechas.
 */
```

### i18n keys — `messages/es.json` (neutral Spanish, **no voseo**)

`header.trajectory`: `"Mapa de Trayectoria Tecnológica"`. New `trajectory` namespace with telecom's exact key set: `title`, `description`, `introTitle`, `introText`, `sourcesTitle`, `exportPDF`, `exportingPDF`, `exportError`, `close`, `emptyState`. Adapt only `description` / `introTitle` / `introText` to Electrónica (area name, 2026–2036 horizon); copy `sourcesTitle`, `exportPDF` (`"Exportar PDF"`), `exportingPDF` (`"Exportando…"`), `close` (`"Cerrar"`), `emptyState` (`"No hay ítems para este driver."`) verbatim. `exportError` MUST be de-voseado to third person: `"Error al exportar. Intente de nuevo."` (telecom's `"Intenta de nuevo."` is tuteo, acceptable but the neutral imperative is preferred and consistent). **Constraint: no `vos`, `tenés`, `podés`, `sos`, or any voseo imperative in any new string, comment, README line, or commit message.**

## Testing Strategy

Strict TDD is active for this repo (global config; `openspec/config.yaml`'s `strict_tdd: false` + "not a software codebase" context is stale and MUST NOT be trusted). Tasks MUST be ordered RED → GREEN per work unit.

| Layer | What to test | Approach |
|---|---|---|
| Unit (ported) | Engine invariants | `src/lib/trajectory/{config,layout}.test.ts` verbatim — pass unchanged, data-agnostic |
| Unit (arch) | Engine imports no domain symbol | `arch.test.ts` with the D4 token swap |
| Unit (**new**) | Adapter honesty contract | `trajectory-data.electronica.test.ts`: (a) `electronicaConfig` passes `validateTrajectoryConfig`; drivers count/keys match `SECTORS`; 4 layers L1–L4; 5 horizon buckets. (b) L1 item count `=== TECHNOLOGIES.length`, ids unique, every `horizon` a valid bucket, every `driver` in `D1..D5`. (c) `items.filter(i => i.layer !== "L1")` is **empty** — the anti-fabrication assertion. (d) source file text contains `PENDING:` and `Vigilancia_Cientifico-Tecnologica_Electronica_2026.pptx` (`fs.readFileSync` on `__filename`-relative path — same technique as the deleted `TrajectoryMapCard.test.tsx`) |
| Component (ported) | Map/Node rendering | `TrajectoryMap.test.tsx`, `TrajectoryNode.test.tsx` verbatim (fixture-driven) |
| Component (**new**, small) | Empty state for L2–L4 | Render `<TrajectoryMap config={electronicaConfig} dataset={buildElectronicaTrajectory()} />`, assert `No hay ítems para este driver.` appears for the L2/L3/L4 lanes and that L1 nodes render |
| Component | Header entry point | Assert the "Mapa de Trayectoria Tecnológica" button exists in desktop bar and mobile menu and opens the dialog |
| Regression | Card removal | Assert `TrajectoryMapCard` is absent from `RadarTemplate.tsx` / `MobileLayout.tsx` (or simply that the existing template tests still pass) |
| Build/E2E | Bundle + PDF plumbing | `npm run build` (validates the dynamic `html-to-image` import) + existing Playwright suite |

## Documentation & Repository Tracks (independent of the port)

**`README.md` restructure** — adopt telecom's section order/headings; preserve Electrónica's own content verbatim where it exists.

| Telecom section | Action for electronica |
|---|---|
| H1 title line | Rewrite to `# Vigilancia Tecnológica CEET — Radar y Mapa de Trayectoria \| Electrónica 2026-2036` |
| `## Arquitectura` | Keep electronica's, extend with the trajectory engine/adapter layering |
| `## Radar Tecnológico` + `### Contenido` / `### Direccionadores` / `### Características` | Regroup electronica's existing `## Contenido del Radar`, `### Direccionadores`, `## Características` under this parent — content preserved |
| `## Mapa de Trayectoria Tecnológica` (+ `### Qué visualiza`, `### Motor genérico`, `### Dataset (adaptador de dominio)`) | **New**; adopt structure, state factually that L1 comes from the radar and L2–L4 await the Electrónica GOR report |
| `## Paleta Institucional SENA`, `## Stack Tecnológico`, `## Instalación`, `## Testing`, `## Storybook`, `## Estructura del Proyecto`, `## Changelog` | Reorder to telecom's sequence; keep electronica's own content and version history (v2.1.0/v2.0.0/v1.0.0) + new entry |
| `## Pipeline de Datos (XLSX → JSON)` | Include only if electronica has the equivalent script; otherwise omit (do not invent) |
| `## Autor` / `## Fuente` / `## Licencia` | Keep electronica's `## Autores` + `### Coautor` + `## Fuente` **unchanged in content**; add `## Licencia` if telecom's applies |

**GitHub repo description** — non-code task, no file diff:
`gh repo edit MAlexVR/vigilancia-electronica --description "Aplicación web interactiva para la vigilancia científico-tecnológica y prospectiva del área de Electrónica del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) del SENA, Bogotá D.C."`
Do not touch the repo homepage field. Capture the previous string first for rollback.

## Threat Matrix

N/A — no routing, shell-argument construction, subprocess orchestration, executable-file classification, or process-integration boundary. The single `gh repo edit` call is a one-shot operator command with a fixed literal argument, not programmatic shell composition.

## Migration / Rollout

No data migration. Suggested slice order for `auto-chain` delivery (each independently revertable, keeping slices inside the 400-line review budget where possible):

1. **PDF plumbing** — `package.json`, `src/core/{export,index}.ts`.
2. **Engine + UI port** — `src/lib/trajectory/*`, `src/components/trajectory/*` + ported tests/stories (large but almost entirely verbatim copy; flag as `size:exception` candidate).
3. **Adapter** — `trajectory-data.electronica.ts` + its test (TDD: test first).
4. **Integration** — `TrajectoryModal.tsx`, `Header.tsx`, card + test deletion, template cleanups, `HelpModal.tsx`, `messages/es.json`.
5. **Docs/repo** — `README.md` restructure + `gh repo edit` (independent track, may run in parallel with 1–4).

Rollback: revert per slice; `npm remove html-to-image` with lockfile restore; reset the GitHub description to the captured previous string. The `trajectory-map-placeholder` delta only merges into `openspec/specs/` at archive, so an unarchived rollback leaves main specs intact.

## Open Questions

- [ ] Does electronica's `RadarTemplate.tsx` `<Separator/>` (~L264) exist solely to divide the removed card? If yes, remove it too; apply decides from the file.
- [ ] Does electronica have an XLSX→JSON pipeline script? Determines whether README gets that section (do not fabricate it).
- [ ] `openspec/config.yaml` is stale (`strict_tdd: false`, "not a software codebase"). Not fixed by this change; downstream phases MUST use the global Strict TDD setting instead. Consider a follow-up change.
