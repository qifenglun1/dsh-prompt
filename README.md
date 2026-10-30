# Scene Prompt Flow for DeepSeek Harness

English | [中文](README.zh.md)

Scene Prompt Flow is a DeepSeek Harness Web plugin that keeps reusable prompt templates one click away. It adds a searchable template library to the sidebar, a compact picker to the message composer, and a scene prompt flow above the composer in a blank new conversation. It ships with 55 work preset subscenes across 10 categories plus a one-card Prompt Flow Generator meta scene. Each work subscene has its own concise Simplified-Chinese System Prompt. Choosing a template inserts it at the caret, or starts a new conversation with the template already in the draft when no conversation is open.

Repository: <https://github.com/qifenglun1/dsh-prompt>

## Features

- **Sidebar library** — a bookmark entry in the left sidebar opens a full library panel.
- **Composer picker** — a small bookmark button in the composer tool row opens a compact, searchable picker without leaving the conversation.
- **Scene prompt flow** — in a blank new conversation, 10 work category capsules sit above the composer. No category is selected initially, so no prompt cards are shown. Choosing a category reveals its five subscene cards in a single row without a scrollbar; categories with more than five cards add a horizontal scrollbar and a blurred peek of the next card at the right edge so it is clear that more cards exist. On narrow screens the five cards shrink rather than wrapping. Clicking the selected capsule again clears it and hides the cards. Choosing a subscene card applies that subscene's System Prompt and inserts its starter prompt at the caret. The Prompt Flow Generator is shown as a dedicated strip at the top of the left library.
- **Per-subscene System Prompt** — each of the 55 work presets carries a fixed, dedicated System Prompt. Custom scenes can also add their own extra instructions. Selecting a work category alone adds no extra instructions; selecting a subscene card applies its prompt; deselecting the category clears it.
- **Insert at the caret** — templates are inserted into the current draft; a selection is replaced. The edit is undoable through the composer's normal undo history.
- **No-conversation fallback** — with no conversation open, choosing a template starts a new conversation and puts the template in the draft.
- **Template management** — create, edit, delete, duplicate, copy, search, and filter templates by scene.
- **Scenes** — 10 work categories (职场写作, 自媒体创作, 文字润色, 学习辅导, PPT 制作, 编程助手, 求职助手, 资料分析, 生活规划, 律师工作流) plus the 提示流生成器 meta category are read-only. Create a custom scene before it has templates; the empty scene offers **New template in this scene**. Use **Manage scenes** to rename or delete custom scenes. Deleting a scene moves its templates to **No scene**. Custom scenes can also configure a System Prompt.
- **55 work presets + 1 generator** — five work subscenes per category, each with a dedicated System Prompt and an execution mode, plus a single generator entry in the 提示流生成器 meta category. Preset content is Simplified Chinese and read-only; **Save as mine** creates an editable copy of the starter prompt.
- **Generated-scene import** — the generator first lists the scene, System Prompt, and cards in the conversation and includes a copyable JSON block. Paste that JSON into the library, preview it, and confirm to append a custom scene. The normalized JSON can be copied again; enable the update option to replace an existing custom scene. No file is created.
- **English and Simplified Chinese UI** — the interface follows the DSH language setting.
- **No configuration required** — no API key, token, password, account, or external service.

## Requirements

- DeepSeek Harness **0.2.1-rc.2** or newer, with the Web or Desktop UI.
- A DSH profile in which bundles can be installed (the default Desktop profile is fine).
- Network access to GitHub when installing from this repository.

The plugin is a **bundle**, not a standalone web page. Install it through DSH's plugin manager; do not try to open `client.js` directly.

The repository root is the installable package root. It contains `package.json`, `cordis.patch.yml`, `index.js`, and `client.js`; there is no monorepo subdirectory and no build step.

## Install from GitHub

### Desktop / Web (recommended)

1. In DSH, open **Plugins**.
2. Choose **Add plugin** → **Install a third-party plugin**.
3. Paste the repository address:

   ```text
   https://github.com/qifenglun1/dsh-prompt
   ```

4. Review the trust notice and confirm the installation. DSH reads `package.json` and installs the bundle.
5. If the `prompt-library` row remains off, enable it in **Plugins**.
6. If the sidebar bookmark does not appear, refresh the Web GUI once.

### CLI

`dsh plugin --profile <name> add ...` forwards the install to pnpm in that profile. Use the profile you actually run (`web`, `desktop`, or a custom profile):

```bash
dsh plugin --profile web add github:qifenglun1/dsh-prompt
```

The equivalent GitHub URL form is accepted by pnpm-based installs:

```bash
dsh plugin --profile web add https://github.com/qifenglun1/dsh-prompt
```

A git install fetches sources, not a prebuilt artifact. This package is plain JavaScript with no `prepare`/`build` script, so pnpm does not need to run an install-time build and users are not asked to allow one.

Do not edit the profile's `package.json` or `cordis.patch.yml` by hand; the plugin manager owns those files.

### Local checkout (development)

Install the absolute path to this repository as a linked bundle:

```bash
dsh plugin --profile dev add /absolute/path/to/dsh-prompt
```

The plugin manager links the checkout into the profile, so edits to `client.js` are picked up after a page refresh. Replace `dev` with a disposable profile name; do not mix development links into a profile you rely on.

### Update and uninstall

DSH upgrades non-official plugins by uninstalling and reinstalling them. Uninstall the bundle in **Plugins**, then install the new repository version. With the CLI:

```bash
dsh plugin --profile web remove dsh-plugin-prompt
dsh plugin --profile web add github:qifenglun1/dsh-prompt
```

Removing the bundle removes the sidebar entry and composer picker. Templates already saved in the browser are not deleted by uninstalling; clear the keys below if you want to remove them.

## Configuration

The plugin has **no Config schema** and no required settings. There is no API key, token, password, endpoint, or model selection to configure.

| Setting | Where |
| --- | --- |
| Templates | Managed in the library panel or the template editor. |
| Scenes | Created with **New scene** or by typing a new scene in the template editor; custom scenes can be renamed or deleted with **Manage scenes**. |
| Scene prompt flow | Shown above the composer in a blank new session; 10 work category capsules select or clear a category. Workplace Writing has 10 cards; Legal Workflow and the other 8 categories have 5. The Prompt Flow Generator is a dedicated strip at the top of the left library. Card order is saved with each template. |
| Scene System Prompt | Work preset prompts and the generator prompt are fixed in the catalog. Custom scenes can add optional extra instructions with **Manage scenes** → **System Prompt**. Selecting a category alone, leaving a custom prompt empty, or not choosing a category adds none. |
| Language | Follows the DSH language setting (`English` or `简体中文`). |
| Built-in templates | 55 work presets plus 1 generator; **Save as mine** creates an editable copy of the starter prompt. |
| Generated scenes | Use **Import generated scene** in the library, paste the generator JSON, preview, and confirm. |

### Browser storage

Templates, scenes, and scene System Prompts are stored in the Harness Web origin's `localStorage`:

- `dsh.prompt-library.templates.v1` — user templates.
- `dsh.prompt-library.categories.v1` — scene names that exist independently of templates. When this key is missing, scene names already used by saved templates are migrated into it.
- `dsh.prompt-library.scene-prompts.v1` — custom scene System Prompts.
- `dsh.prompt-library.scene-selection.v1` — the last scene selected per Session; a UI hint only.

`localStorage` is scoped to the Web origin. A different origin, browser profile, or cleared browser storage has separate data. The plugin does not write templates to the session log, does not send data to a server, and does not read credentials. Applying a scene System Prompt uses an internal Session command, so the selected scene prompt is also recorded in that Session's command log for restore; it does not create a model message. When you send a message, its text reaches your configured model through DSH as usual.

## Usage

### Sidebar library

1. Click the bookmark entry in the left sidebar.
2. Search by title, text, or scene, or choose a scene chip.
3. Choose **Insert** to put the template into the current draft, **Copy** to copy it, or **Save as mine** to duplicate a built-in template.
4. Use **New scene** to create a scene before it has templates; use **Manage scenes** to rename or delete custom scenes.
5. Use the back arrow in the panel header to return to the conversation.

### Composer picker

1. Click the bookmark button in the composer's left tool row.
2. In a new, empty conversation the picker opens as a centered dialog, so the search field is always visible; in an active conversation it opens above the composer.
3. Search for a template. Use the arrow keys to move and Enter to insert, or click a row.
4. The template is inserted at the caret (or replaces the current selection).

### Scene prompt flow (blank new session)

1. Start a new, empty conversation. Above the composer, 10 work category capsules appear in one horizontal row; no category is selected and no cards are shown initially.
2. Choose a category capsule to reveal its five subscene cards. Click the selected capsule again to clear the category and hide its cards; selecting a category alone adds no extra instructions. Clicking a subscene card applies its dedicated System Prompt and inserts its starter prompt. Custom templates whose category matches the built-in category label join that category. The generator has a separate entry in the left library.
3. The subscene System Prompt is added as extra instructions and stays active for the session. Sending the first message hides the scene selector; start a new blank conversation to choose another category and subscene. Refresh/resume restores the last category; the Host restores the last applied subscene prompt from the Session command log.
4. Click a card to insert its full prompt at the caret. Inserting does not send the message; you can edit before sending.
5. Use the composer picker or the sidebar template library to search and manage prompts. If there are no prompts, create one in the library.

### Generate a new scene

1. Open the left sidebar library and use the **Prompt Flow Generator** strip at the top. Click **Use generator**. With a conversation open, the generator System Prompt is applied and a starter prompt is inserted; with no conversation, the entry asks you to open one first.
2. Fill in your industry, role, daily tasks, and expected output, then send. The model first returns a readable list of the scene name, System Prompt, and cards, followed by a copyable JSON block. It does not create files.
3. Copy the JSON, open the sidebar library, and choose **导入生成场景**.
4. Paste the JSON, choose **解析并预览**, review the list, then choose **确认导入**. The dialog can copy the normalized JSON at any time.
5. The plugin appends a custom scene, its scene-level System Prompt, and 1–6 user prompt cards, or updates an existing custom scene when **Update an existing custom scene with this name** is checked. Choose the new scene in a blank conversation to use it. The dialog stays open after import so the JSON can be copied; edit it and import again with the update option to replace the scene prompt and cards.

The expected JSON is:

```json
{
  "version": 1,
  "scene": {
    "name": "Scene name",
    "systemPrompt": "Scene-level System Prompt",
    "templates": [
      { "title": "Card title", "body": "User prompt" }
    ]
  }
}
```

The current client-only plugin cannot read the model's reply automatically, so the JSON must be copied into the import dialog. After confirmation, the parser and the three storage writes are automatic. No file is created at any point. Generated scenes reuse the custom-scene model: one scene-level System Prompt plus 1–6 cards; no per-card System Prompt or scene/card description is stored. A new name is rejected if it collides with an existing scene; an existing custom scene is replaced only when the update option is checked. Invalid JSON and built-in name collisions are always rejected.

## Preset catalog

The 55 work preset subscenes are fixed in the plugin and use Simplified Chinese content for Mainland users. Their titles, starter prompts, descriptions, System Prompts, and execution modes live in the `PRESET_SCENES` table in `client.js`; the one-card generator lives in `META_SCENES`. Preset System Prompts are read-only and are appended after the Harness system prompt; they never replace it.

| Category | Subscenes |
| --- | --- |
| 职场写作 | 通知公告、工作汇报、请示报告、讲话稿、工作方案、工作日报、工作周报、工作月报、年终总结、工作复盘 |
| 自媒体创作 | 小红书笔记、抖音短视频脚本、微信公众号文章、视频号文案、社交平台标题 |
| 文字润色 | 语言润色、文本改写、扩写与缩写、风格转换、错别字与语病检查 |
| 学习辅导 | 知识点讲解、题目解析、学习计划、考试复习、互动问答 |
| PPT 制作 | PPT 大纲、工作汇报 PPT、教学演示 PPT、产品介绍 PPT、演讲稿与讲解备注 |
| 编程助手 | 代码生成、Bug 排查、代码解释、代码优化、代码审查 |
| 求职助手 | 简历优化、岗位分析、求职信写作、面试模拟、面试问题准备 |
| 资料分析 | 长文总结、资料整理、关键信息提取、多方案对比、研究分析 |
| 生活规划 | 旅行行程规划、个人目标计划、购买决策、时间管理、生活问题分析 |
| 律师工作流 | 接案咨询、法律检索、证据梳理、诉讼策略、合同审查 |
| 提示流生成器（元场景） | 生成场景提示流（1 张） |

The stored execution mode is reflected in each subscene's System Prompt, not shown as a card badge:

- Handle the supplied content directly, asking only when essential information is missing.
- Ask for the next necessary detail when needed, then produce the result without a fixed number of steps.
- Adapt to the user's replies, keep context, and end naturally when the task is complete.

The modes are prompt conventions, not a separate workflow engine.

### Example

Create a reusable review prompt:

1. Open the sidebar library.
2. Choose **New template**.
3. Set the title to `Review a pull request`, the scene to `Code review`, and the body to:

   ```text
   Review this change for correctness, edge cases, performance, security,
   and maintainability. List issues by severity, then give concrete fixes.

   ```

4. Save. The template appears under **My templates**.
5. In any conversation, click the composer bookmark, choose the template, and it is inserted at the caret.

### Empty scenes

A newly created scene is selected immediately. Until it has templates, the panel shows **No prompts in this scene yet** and **New template in this scene**. That button opens the editor with the scene prefilled.

Scenes can be created, renamed, and deleted with **Manage scenes**. Built-in scenes are read-only. Deleting a custom scene moves its templates to **No scene**.

### Scene System Prompts

1. The 55 work presets and the generator meta card already have fixed System Prompts; they are not editable in the manager. To add instructions to a **custom** scene, open **Manage scenes**, choose **System Prompt** on that custom scene, and edit the text.
2. Custom-scene text is added as **extra instructions**; it does not replace the existing System Prompt. Leave it empty to add none. Preset card prompts are also appended, never substituted for the Harness system prompt.
3. Selecting a custom scene applies its prompt; selecting a preset category alone adds none, and selecting a preset subscene applies that subscene's dedicated prompt. Before a category is chosen, none are added. The selection is per blank-session start and remains for the rest of that Session.
4. Custom scene prompts are stored locally. The applied prompt (custom or preset) is recorded in the Session command log through an internal `/prompt-library-scene` UI bridge; the command is not an agent tool and creates no model message. It may appear in command discovery.

## Compatibility

- Built and verified with **DeepSeek Harness 0.2.1-rc.2**.
- The package declares `engines.dsh: ">=0.2.1-rc.2 <0.3.0"`. Installation and profile startup refuse a bundle outside that range.
- The client half uses the public slot entries `sidebar.panellist`, `main`, `conversation.input.left`, `conversation.input.overlay`, and `conversation.input.dock`, plus the composer's `InputActions.captureInsertion()` / `insertText()`.
- If a future DSH release changes those slots, the plugin may need an update. Please include the DSH version in bug reports.

## Privacy and security

- No analytics, telemetry, or network calls of its own.
- No credential, API key, token, cookie, or account access.
- No host filesystem access; the Host half only registers an Agent-scoped prompt section and reads the Session command log.
- Only templates, scene names, scene System Prompts, and the per-Session scene selection UI hint are stored in this browser origin's `localStorage`. The selected scene prompt is also recorded in that Session's command log for restore.
- Built-in prompt text ships with the plugin and is not user data.
- Installing any third-party bundle executes its code inside DSH. Read the source before installing, and pin a commit with `github:qifenglun1/dsh-prompt#<sha>` if you need a fixed revision.

## Project layout

| File | Purpose |
| --- | --- |
| `package.json` | Package metadata, bundle declaration, client entry, `dsh.client` inject list. |
| `index.js` | Host half: applies the selected scene System Prompt through an Agent-scoped prompt section and restores it from the session command log; degrades to a no-op when those services are unavailable. |
| `client.js` | Browser half: sidebar entry, library panel, composer picker, insertion, storage, locale dictionaries, the `PRESET_SCENES` catalog (10 categories, 55 work subscenes), the `META_SCENES` generator, and generated-scene JSON import. |
| `cordis.patch.yml` | Bundle patch inserting the `prompt-library` row. |
| `locale/en.json`, `locale/zh.json` | Plugin Manager title and description. |
| `icon.svg` | Plugin icon. |
| `README.md`, `README.zh.md` | Documentation. |
| `LICENSE` | MIT license. |

## Development checks

```bash
npm run check
npm test
npm pack --dry-run
```

`npm run check` runs `node --check` on `index.js` and `client.js` and requires Node.js only. `npm test` runs the preset/meta catalog, generated-scene parser/import, scene System Prompt storage, payload, recovery, and Host section tests. `npm pack --dry-run` prints the exact files npm would publish; confirm that `package.json`, `cordis.patch.yml`, `index.js`, `client.js`, the locale files, the icon, both READMEs, and `LICENSE` are present.

There are no runtime dependencies and no build step. The browser module uses the loader's baseline React and the host-provided client packages listed in `dsh.client.inject`.

## Troubleshooting

- **The sidebar icon is missing** — refresh the Web GUI; confirm the Scene Prompt Flow bundle is enabled in **Plugins**; check the browser console for a client module load error.
- **Installation fails** — make sure the GitHub repository root contains `package.json` with `dsh.bundle.patch`; do not point the installer at a subdirectory. Check that the running DSH version satisfies `engines.dsh`. If GitHub is unreachable, use the plugin manager's mirror or another installation source.
- **Templates disappeared** — templates live in this browser origin's `localStorage`. Check that you are using the same GUI origin and browser profile, and that site data was not cleared.
- **A template does not insert** — the composer may be submitting or adjudicating at that moment. Try again after the send finishes.

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2026 qifenglun1.

The plugin icon and built-in prompt text are original to this project.
