# AGENTS.md

Instructions for coding agents working in this repository. Read this before changing plugin code or publishing a release. This file is public: never add secrets, tokens, profile files, or machine-specific absolute paths.

## TL;DR

- This repository **is** the installable DSH plugin package: `dsh-prompt`.
- Target runtime: **DeepSeek Harness 0.2.1-rc.2**; `engines.dsh` is `>=0.2.1-rc.2 <0.3.0`.
- Plain JavaScript, **no build step, no runtime dependencies**.
- Edit the plugin here, then install/verify through the `plugin_manager` tool. Never hand-edit the DSH profile's `package.json` or `cordis.patch.yml`.
- Run `npm run check` before claiming success.
- Inspect live DSH APIs before coding; do not guess slot names, props, or install commands.
- Keep `client.js` dependency-free, localized, and accessible.
- Never commit `.dsh`, `node_modules`, logs, `.env`/`.npmrc`, packed artifacts, or personal filesystem paths.
- Before starting, check `git status` and the current branch. Do not develop on `main`/`master`, do not pull remote code, and pause/report on uncommitted changes. Use `feature/`, `fix/`, or `refactor/` branches from a clean base.
- Do not `commit`, `push`, `merge`, `rebase`, `reset --hard`, `clean`, force-push, or delete branches without explicit user authorization. Report the branch and status at the end.

## 1. What this plugin is

Scene Prompt Flow adds a searchable prompt-template library to the DSH Web GUI:

- A `sidebar.panellist` bookmark entry opens a full library panel in `main`.
- A compact bookmark button in `conversation.input.left` opens a picker in `conversation.input.overlay`.
- Templates insert at the composer caret through `InputActions.captureInsertion()` / `insertText()`.
- With no conversation open, choosing a template starts a conversation with the draft prepared.
- User templates/categories live in browser `localStorage`; the Host half applies the selected scene System Prompt through an Agent-scoped prompt section and restores it from the Session command log.

Public repository: `https://github.com/qifenglun1/dsh-prompt` (also declared in `package.json` and `README.md`).

## 2. Repository map

| Path | Role |
| --- | --- |
| `package.json` | Package metadata, bundle declaration, `exports`, `dsh.client` inject list, `engines.dsh`. |
| `index.js` | Host half: registers the internal scene-selection command and an Agent-scoped prompt section; restores the last selection from the Session command log. |
| `client.js` | Entire browser half: slots, UI, composer insertion, storage, locale dictionaries, styles, the 55-row `PRESET_SCENES` catalog, the one-card `META_SCENES` generator, and generated-scene JSON import. |
| `cordis.patch.yml` | Bundle patch inserting the `prompt-library` row for `dsh-prompt`. |
| `locale/en.json`, `locale/zh.json` | Plugin Manager display title/description. |
| `icon.svg` | Plugin icon (original artwork; keep it valid SVG, under 256 KiB). |
| `README.md`, `README.zh.md` | User-facing docs. Keep install/usage/config in sync in both languages. |
| `LICENSE` | MIT license. |
| `.gitignore` | Excludes local profile state, dependencies, credentials, packed artifacts. |

The repository root is the package root. Do not move the plugin into a subdirectory: GitHub installers need `package.json`, `cordis.patch.yml`, `index.js`, and `client.js` at the repository root.

## 3. 项目开发规范（Development workflow and Git rules）

以下规则适用于本仓库的所有开发工作。TL;DR 和发布检查清单概括了其中最关键的要求。

### 一、开发前检查

- 开发前检查 Git 状态和当前分支。
- 阅读 README.md、AGENTS.md 和相关业务代码。
- 确认实际的主分支或集成分支。
- 发现未提交修改时暂停并报告。
- 不擅自清理、覆盖或提交已有修改。
- 不擅自拉取远程代码。

### 二、分支规则

- 新功能：feature/xxx
- Bug 修复：fix/xxx
- 代码重构：refactor/xxx
- 分支名称使用小写英文和连字符。
- 不直接在 main/master 上开发。
- 创建分支前确认基线及工作区状态。

### 三、开发规则

- 优先复用已有架构和代码。
- 不修改与当前任务无关的模块。
- 复杂任务先提出开发方案。
- 不随意升级依赖或修改数据库结构。
- 不泄漏密钥、凭据及敏感数据。

### 四、测试与审核

- 运行适用的测试和构建。
- 检查 git diff 和 git diff --check。
- 报告修改文件、验证结果及风险。

### 五、Git 安全边界

- 可以在干净工作区创建任务分支。
- 未经授权，不执行 commit、push、
  merge、rebase、reset --hard、clean
  或删除分支。
- 不强制推送。
- 不覆盖已有工作。
- 每次结束时报告当前分支和状态。

## 4. Hard constraints

- **Follow Section 3** for pre-flight checks, branch naming, test/review reporting, and Git safety. No Git write operation without explicit authorization.
- **Do not** edit `$DSH_PROFILE_DIR/package.json`, `cordis.patch.yml`, or `cordis.yml` by hand. Use `plugin_manager`.
- **Do not** run `pnpm` in the DSH profile directory or create packages under `$DSH_HOME`.
- **Do not** import Harness client packages (including `@deepseek-ai/dsh-client-ui-primitives`). The client half only does `require('react')`; everything else comes from the loader and host slots.
- **Do not** use JSX, TypeScript, bundlers, or `import` statements in `client.js`. It is a plain-JavaScript `window.__ModuleLoader__.load({ id, factory(require) { ... } })` module.
- **Do not** manipulate the composer DOM, query another plugin's DOM, or append UI to `document.body`. Use `inputActions` for insertion and slot components for UI.
- **Do not** add network calls, analytics, telemetry, credential access, or API keys. The plugin is local-only.
- **Do not** append unknown session event types. This plugin needs no session events.
- **Do not** create preview HTML, mock shells, screenshot scripts, or design variants as a substitute for the installed plugin. Install it and verify it.
- **Do not** put personal absolute paths in committed files. Use `pwd`/the repository root in commands and `<placeholder>` values in docs.
- **Do not** change `package.json` `name`, `cordis.patch.yml` `name`, and the loader `id` independently. They must match.

## 5. Development commands

```bash
npm run check        # node --check index.js && node --check client.js
npm test             # node --test test/scene-system-prompts.test.js
npm pack --dry-run   # verify the published file list
```

There is no build step. `npm test` runs the preset/meta catalog, generated-scene parser/import, scene-prompt storage, payload, recovery, and Host-section tests; keep the `test` script documented.

If npm's cache is not writable in this environment, use an isolated cache:

```bash
npm_config_cache="$(mktemp -d)" npm pack --dry-run
```

Expected packed files: `package.json`, `cordis.patch.yml`, `index.js`, `client.js`, `locale/en.json`, `locale/zh.json`, `icon.svg`, `README.md`, `README.zh.md`, `LICENSE`.

## 6. Install and verify loop

The plugin is a **persistent profile bundle**, not a runtime/dynamic Cordis package.

1. Make changes in this repository.
2. Run `npm run check`.
3. If `package.json` or `cordis.patch.yml` changed, install with the `plugin_manager` tool:
   - `action: install_bundle`
   - `target`: the absolute path to this repository root (`pwd`), not a hard-coded machine path.
4. Read the installation result. `application: applied` and empty `warnings` mean the change is live. Do not infer success from logs or process lists.
5. Confirm live client registrations with `cordis_inspect_query` (Client `Slots.listSubTree`), not `list_plugins`.
6. For client-only changes, refresh the Web GUI. HMR may not reload a plain linked client module without a dev server. If the manifest or patch changed, reinstall and restart if needed.
7. Exercise the actual capability (sidebar panel, composer picker, insertion) or report exactly what could not be verified.

The current development profile links this repository as `dsh-prompt`. That is a persistent **linked development install**: it survives restarts while this directory exists. For a clean install test, use a disposable profile as described in `README.md`; do not disturb the user's main profile data.

User-facing installation is documented in `README.md`:

- Desktop/Web: **Plugins → Add plugin → Install a third-party plugin**, then the GitHub address or `github:<owner>/<repo>`.
- CLI: `dsh plugin --profile <profile> add <spec>` (or `remove`), as documented in the README. The Desktop app's Plugins page is the supported UI path; do not invent install commands.
- Updating a non-official bundle: uninstall, then reinstall.

## 7. Architecture and extension points

### Entry points

- `package.json`:
  - `"main": "index.js"` and `"exports": { ".": "./index.js", "./client": "./client.js", ... }`
  - `"dsh.bundle.patch": "./cordis.patch.yml"`
  - `"dsh.client": { "platform": "web", "immediately": true, "inject": [...] }`
  - `"engines.dsh": ">=0.2.1-rc.2 <0.3.0"`
- `client.js` loader id must remain `dsh-prompt`.
- `cordis.patch.yml` inserts row id `prompt-library` with module name `dsh-prompt`.

### Slots used

| Slot | Registration | Purpose |
| --- | --- | --- |
| `sidebar.panellist` | `id: 'prompt-library'`, `order: 20` | Sidebar bookmark entry. Label is a locale thunk. |
| `main` | `key: 'prompt-library'` | Full library panel. |
| `conversation.input.left` | `id: 'prompt-library'`, `order: 20` | Composer bookmark trigger. |
| `conversation.input.overlay` | `id: 'prompt-library'`, `order: 20` | Picker/modal and pending insertion bridge. |

Use `ctx.slots.inject(...)` inside `ctx.effect(...)` and return its disposer. Do not register at module top level.

### Composer picker behavior

- Active conversation: `dsh-pl-pop` is an absolute popover above the composer card.
- Blank/new conversation: `useSession((snapshot) => snapshot.blank === true)` switches to a centered modal with `dsh-pl-pop-backdrop`, `aria-modal`, a backdrop click target, a Tab focus trap, and a fixed-position flash.
- Preserve both layouts. Do not collapse them into one without checking the blank-session hero composer.
- Search is focused on open; ArrowUp/ArrowDown move, Enter inserts, Escape closes, outside pointerdown closes.
- Insertion is undoable through the composer's normal history. On failure, show the localized error and retry only when appropriate.
- Cross-panel insertion from the library uses a module-level pending store with `PENDING_TTL = 8000`; a retry is attempted once, then a failure flash. Test the sidebar-insert → conversation-switch timing if you touch this.

### Data model and storage

- `dsh.prompt-library.templates.v1` — user templates (`id`, `title`, `body`, `category`, `updatedAt`).
- `dsh.prompt-library.categories.v1` — categories that exist independently of templates. If missing, categories from saved templates are migrated in.
- `dsh.prompt-library.scene-order.v1` — custom scene order set from the left library Reorder dialog.
- `dsh.prompt-library.card-order.v1` — custom card order per scene set from the same dialog.
- Built-in work presets are the 55 rows in `PRESET_SCENES` in `client.js`: 10 categories; `workplace` has 10 subscenes, `legal` has 5, and the other 8 have five each. They use Simplified-Chinese starter prompts/descriptions/System Prompts and an execution mode. `META_SCENES` adds one generator card in the `meta` category. Preset System Prompts are read-only and applied per subscene card.
- Built-in category ids: `workplace`, `media`, `polish`, `study`, `ppt`, `code`, `job`, `analysis`, `life`, `legal`, `meta`. Existing user categories win over built-in label matching so their data and scene prompts are preserved; new names matching a built-in label still map to the built-in category to avoid duplicate chips.
- Custom scenes can be created, renamed, deleted, and given a scene-level System Prompt; built-in categories are read-only. Scene and card order can be changed only in the left library Reorder dialog (drag, visible move buttons, or Alt+Arrow on handles); the dialog also has an atomic Restore defaults action and a Cancel action that restores the order snapshot from dialog open. The blank-session scene dock reflects the saved order but has no drag or sort controls. Generated-scene JSON uses `parseGeneratedScene` + `importGeneratedScene`; the user pastes the model JSON, confirms a structured preview, and the three storage keys are written atomically without overwriting existing scenes.
- Version the storage keys if the schema changes, and migrate existing data. Never silently drop user templates/categories.

### UI conventions

- All visible copy goes through the `prompt-library` locale namespace: `ctx.locale.register(NS, { en, zh })`, `locale: NS` on slot registrations, and `t(...)` in components.
- Keep EN/ZH runtime dictionaries at exact key parity and keep `locale/en.json` / `locale/zh.json` metadata in sync.
- Use `--dsw-alias-*` theme tokens for UI colors. Literal colors are acceptable for the icon/artwork and the modal scrim/fallback box shadows, not for ordinary UI.
- Prefix CSS classes with `dsh-pl-`. Keep styles in the component-owned `<style>` strings (`PAGE_CSS`, `PICKER_CSS`); do not add a global stylesheet or `document.body` children.
- Preserve accessibility: dialog roles, `aria-label`/`aria-labelledby`, Escape handling, focus trap/restore, 44px-ish hit targets where practical, and visible focus rings.
- Follow the existing style: 2-space indent, single quotes, no statement semicolons, trailing commas in multiline literals.
- Do not use `useMemo`/`useCallback` to hide a stale locale; let slot rendering and `t` re-render correctly.
- Keep the client module dependency-free. If a new capability seems to need a package, first check whether a Host service/slot already provides it via inspection.

## 8. DSH plugin rules to follow

Before designing a non-trivial extension, use the `cordis-plugin-development` skill and its references:

- `references/practices.md` — extension-point choice, contexts, state, performance, UI rules.
- `references/user-actions.md` — if adding a template-management agent tool: implement one Host service method, call it from both UI and tool.
- `references/host-plugin.md` — bundle manifest, locale metadata, icon, installation.
- `references/verification.md` — what can and cannot be verified without browser control.

Discover the live API with `cordis_inspect_list` / `cordis_inspect_query`:

- `Service` for exact Host/Client service methods.
- `Event` for event modes.
- `Config.listConfigs` with `name` then `entry` for package docs and `packageDir`.
- Client `Slots.listSubTree` for slot registration options, owner props, standard props, and occupants.
- `Theme.listTokens` for theme token names.

The DSH skill files live inside `app.asar`. Read them with the file-read tool. Shell commands, glob/grep, Node, and pnpm cannot open `app.asar` paths in this environment.

If extending beyond this UI plugin:

- Prefer the weakest extension point. Do not listen to `system-prompt/assemble` to add tools/text; use `ctx.systemPrompt.section()` and `agent.inject()`.
- Use `ctx.tools.guard()` for order-independent denials; `ctx.tools.restrict()` to hide tools from one agent.
- Register per-agent behavior on `agent.ctx` and keep the disposer in the plugin's own effect.
- Do not append a new session event `type`; derive from existing events or use a storage service.
- Put tunable values in the plugin `Config` if a Host row gains one; the user's patch layer survives upgrades.

## 9. Verification and release checklist

Definition of done for a change:

- [ ] Started from the intended task branch based on the agreed base; pre-existing uncommitted changes were reported, not cleaned or overwritten.
- [ ] `git status` and `git branch --show-current` checked at start and end; `git diff --check` passes; changed files, verification results, and risks are reported.
- [ ] `npm run check` passes.
- [ ] If the manifest/patch changed: `plugin_manager install_bundle` returns `application: applied` with no relevant warnings.
- [ ] Live slots are confirmed with `cordis_inspect_query` (`sidebar.panellist`, `main`, `conversation.input.left`, `conversation.input.overlay`).
- [ ] The affected UI path is exercised (sidebar, picker, insertion, category flow) or the verification limit is reported.
- [ ] `README.md` and `README.zh.md` updated for user-facing behavior, install, or compatibility changes.
- [ ] `npm pack --dry-run` contains the expected files.
- [ ] No secrets, personal paths, `.dsh` content, `node_modules`, logs, or packed artifacts are staged.
- [ ] If a new DSH version was tested, update `engines.dsh` and the compatibility text only after verification.
- [ ] No `commit`, `push`, `merge`, `rebase`, `reset --hard`, `clean`, force-push, or branch deletion without explicit authorization.

Release steps:

1. Update the version in `package.json` when behavior or compatibility changes.
2. Update both READMEs and any install URL text.
3. Run `npm run check`, `npm pack --dry-run`, and `git diff --check`.
4. Commit and push only after explicit authorization; otherwise leave the changes for the user to review, commit, and push.
5. Do not publish a `.tgz`; users install from the Git repository or the plugin manager.

## 10. Current known limitations

- Custom scenes can be created, renamed, deleted, and given a scene-level System Prompt; built-in categories are read-only.
- Template/category data is scoped to the browser Web origin; another origin/profile/cleared storage is separate.
- `npm test` covers the preset/meta catalog, generated-scene parser/import, and scene System Prompt plumbing; live slot/UI checks are still required for installed behavior.
- Browser visual verification may be unavailable in a headless agent environment. Do not claim visual success from slot registration alone; report the limit.
- The local development install is a link to this repository. Moving/deleting the repository breaks that profile link; reinstall through the plugin manager if that happens.
