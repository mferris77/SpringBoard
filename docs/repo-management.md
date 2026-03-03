# Repo Management — KanDo Monorepo

Overview
- This repository uses an npm workspaces monorepo for JavaScript (Electron + plugins) and a parallel `python/` directory for Python packages.
- JavaScript workspaces live under `apps/` and `packages/`. Electron-specific code and packaging live in `apps/core`.

Key concepts
- Root `package.json` manages workspaces and workspace orchestration (install, test across workspaces).
- Keep Electron and packaging-related devDependencies inside `apps/core/package.json`.
- Frontend-only code (Vite, Vue) can be a separate package (e.g., `KanDo/` converted to frontend package).
- Plugins should follow the `packages/plugins/<plugin-name>` layout and export a convention-based API (e.g., `activate(core)`).

Running locally
- Bootstrap dependencies from the repo root:

```bash
npm install
```

- Run the core Electron app from the repo root:

```bash
npm --workspace=@kando/core run start
```

- Run frontend dev server (if using the frontend package):

```bash
npm --workspace=@kando/core-frontend run dev
```

Adding a new JS plugin
1. Create directory `packages/plugins/<your-plugin>`.
2. Add `package.json` with `name` and `version` and a `main` entry.
3. Export an `activate(core)` function to integrate with core.
4. Add tests and `npm test` support if needed.

Adding a new Python package
1. Create `python/<pkg>` with a `pyproject.toml`.
2. Add the package to `requirements.txt` for CI or install editable locally during development.

CI notes
- CI installs root `npm` workspaces and runs `npm test --workspaces`.
- CI installs Python deps from `requirements.txt` and will install the Python example package in editable mode if present.

Packaging and releases
- Keep packaging configuration inside `apps/core` (e.g., `electron-builder` config). Build commands should be executed from `apps/core` or via root workspace scripts that call into the package.

Conventions
- Use semantic versioning for public packages.
- Keep core APIs stable; use feature flags for experimental plugin APIs.
- Prefer shared utilities in `packages/utils` if multiple plugins or apps require them.

Support
- If you want, I can add a workspace-level script to run Electron build, or add `pnpm` support for faster installs.
