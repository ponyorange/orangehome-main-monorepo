<!--
Sync Impact Report
- Version change: (unfilled template) → 1.0.0
- Modified principles: N/A (initial adoption)
- Added sections: Core Principles (5); Monorepo & Package Boundaries; Engineering Standards;
  Development Workflow & Quality Gates; Governance
- Removed sections: None (template placeholders replaced)
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ Constitution Check gates aligned
  - .specify/templates/spec-template.md — ✅ Optional web_builder / architecture notes
  - .specify/templates/tasks-template.md — ✅ Path conventions for apps/web_builder
  - .specify/templates/commands/*.md — N/A (directory not present)
- Follow-up TODOs: None
-->

# Orange Editor (@orangehome/web_builder) Constitution

## Core Principles

### I. Extension & Slot First

New editor surfaces (panels, canvas chrome, toolbars, feature contributions) MUST register
through the extension model (`IExtension`) and `SlotRegistry`, not by ad-hoc mounting into
arbitrary DOM inside core. Core (`OrangeEditor`, loaders, event bus) stays orchestration-only;
feature code lives under `src/extensions/` (or is wired explicitly from `core/editor.ts` only
when promoting a default extension). Rationale: preserves composability, load order, and a single
mechanism for third-party or optional features.

### II. Schema as Source of Truth

The editable document MUST be represented by `ISchema` and related types in `src/types/base`.
Mutations MUST go through established paths (`schemaOperator`, dedicated Zustand stores, or
services documented for that flow)—not scattered direct object rewrites. UI MUST render from
schema via `SchemaRenderer` and related components unless a spec explicitly exempts a prototype
path. Rationale: predictable undo/redo, serialization, and runtime preview alignment.

### III. Dependency Injection Boundaries

Cross-cutting services MUST be registered with Inversify (`src/core/container`, editor
`Container` in `OrangeEditor`) and consumed via constructor injection or documented facades.
New globals or hidden singletons for shareable editor services are FORBIDDEN unless justified
in plan Complexity Tracking. Rationale: testability, explicit lifecycle, and extension parity.

### IV. Layered State

Editor document state, selection, clipboard, theme, and preview concerns MUST use the existing
store modules under `src/core/store/` (or a new store colocated with a clear name and single
responsibility). UI components MUST NOT duplicate authoritative state that belongs in those
stores. Data fetching hooks belong under `src/data/modules/`; HTTP MUST use `src/data/api/`
(`request`, `get`, `post`, etc.) with `VITE_BFF_API_URL` for base URL. Rationale: avoids
desynced UI, centralizes auth/error handling (e.g. 401 → `auth:unauthorized`).

### V. Library Package & Consumer Contract

`@orangehome/web_builder` MUST keep a stable public surface via `package.json` `exports` and
`src/index.ts`. Breaking changes to exported types or entrypoints require a MAJOR version bump
per semantic versioning (or Rush package version policy). Internal app-only code (`main.tsx`,
Vite-only entry) MUST NOT be implied as supported API unless exported. Rationale: sibling apps
in the Rush monorepo (`web_platform`, etc.) depend on predictable imports.

## Monorepo & Package Boundaries

This package lives under `apps/web_builder` in the Orangehome Rush monorepo (`rush.json`,
pnpm). Developers MUST use Rush commands (`rushx`, `rush build -t @orangehome/web_builder`) per
`README.md`. Cross-app changes (BFF, admin, platform) MUST be scoped in their packages; only
shared contracts (types, API paths) should be duplicated deliberately and documented in the
feature plan.

## Engineering Standards

- **Runtime**: Node `>=18` per `package.json` / Rush `nodeSupportedVersionRange`.
- **Stack**: React 18, TypeScript 5, Inversify, Zustand, Semi Design, Vite (dev/preview SPA),
  Modern.js module build for library output—new dependencies MUST match this stack or be
  justified in plan Complexity Tracking.
- **Quality gates before merge**: `rushx type-check` and `rushx lint` MUST pass for touched
  code; `rushx test` MUST pass when tests exist for the change or when the feature spec
  mandates tests.
- **Configuration**: No hard-coded production API hosts in new code; use
  `import.meta.env.VITE_BFF_API_URL` or shared config patterns already in `src/data/api/client.ts`.

## Development Workflow & Quality Gates

Feature work using Spec Kit MUST keep artifacts under `specs/[###-feature-name]/` and align
`plan.md` with this constitution’s Constitution Check. Pull requests MUST state schema,
extension, or public API impact when applicable. Reviews MUST verify slot/extension placement,
schema mutation path, and API/env handling for data features.

## Governance

This constitution supersedes ad-hoc conventions when they conflict. Amendments require: (1) an
update to `.specify/memory/constitution.md` with version bump and Sync Impact Report; (2)
propagation to dependent templates (`plan-template`, `spec-template`, `tasks-template`, etc.) when
gates or paths change; (3) a short note in the PR description. **Versioning**: MAJOR = removal
or incompatible redefinition of a principle; MINOR = new principle or materially expanded
guidance; PATCH = wording or clarification only. **Compliance**: Spec/plan authors and reviewers
MUST confirm Constitution Check items before Phase 0 research and after Phase 1 design. Runtime
how-to remains in `README.md` and feature `quickstart.md` when present.

**Version**: 1.0.0 | **Ratified**: 2026-03-27 | **Last Amended**: 2026-03-27
