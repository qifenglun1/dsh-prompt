import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import {
  apply,
  decodeScenePayload,
  encodeScenePayload,
  scanSceneSelection,
} from '../index.js'

const clientSource = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8')

function loadClient(initialStorage = {}) {
  const storage = new Map(Object.entries(initialStorage))
  const window = {
    __DSH_PROMPT_LIBRARY_TEST__: true,
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null
      },
      setItem(key, value) {
        storage.set(key, String(value))
      },
      removeItem(key) {
        storage.delete(key)
      },
    },
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000000' },
    __ModuleLoader__: {
      load(definition) {
        const react = {
          createElement() {},
          Fragment: Symbol('Fragment'),
          useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
          useEffect() {},
          useRef: (value) => ({ current: value }),
          useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
        }
        const require = (name) => {
          if (name === 'react') return react
          throw new Error(`unexpected client require: ${name}`)
        }
        window.__loaded = definition.factory(require)
      },
    },
  }
  const context = vm.createContext({ window, console })
  vm.runInContext(clientSource, context, { filename: 'client.js' })
  assert.ok(window.__loaded && window.__loaded.__test, 'client test exports load')
  return { testApi: window.__loaded.__test, storage, window }
}

test('scene System Prompt storage normalizes keys, trims edges, and preserves newlines', () => {
  const { testApi } = loadClient()
  const result = testApi.setUserScenePrompt('user:Alpha', '  line one\nline two  ')
  assert.equal(result.ok, true)
  assert.deepEqual({ ...testApi.getScenePromptsSnapshot() }, { 'user:alpha': 'line one\nline two' })
  assert.equal(testApi.scenePromptFor('user:ALPHA', (key) => testApi.EN[key] ?? key), 'line one\nline two')
  assert.equal(testApi.scenePromptFor('builtin:workplace', (key) => testApi.EN[key] ?? key), '')
  assert.equal(testApi.scenePromptFor('user:', () => ''), '')
  assert.equal(testApi.scenePromptKey('builtin:workplace'), 'builtin:workplace')
  assert.equal(testApi.scenePromptKey('builtin:report'), '')
  assert.equal(testApi.scenePromptKey('builtin:unknown'), '')
  assert.equal(testApi.scenePromptKey('user:  Alpha  '), 'user:alpha')

  assert.equal(testApi.setUserScenePrompt('builtin:workplace', 'nope').code, 'invalid')
  assert.equal(
    testApi.setUserScenePrompt('user:Alpha', 'x'.repeat(testApi.SCENE_PROMPT_MAX + 1)).code,
    'too-long',
  )
  testApi.setUserScenePrompt('user:Alpha', '')
  assert.deepEqual({ ...testApi.getScenePromptsSnapshot() }, {})
})

test('scene selection follows rename, clear, and scene deletion', () => {
  const { testApi } = loadClient()
  assert.equal(testApi.getSceneSelection('s1'), '')
  assert.equal(testApi.setSceneSelection('s1', 'user:Alpha'), true)
  assert.equal(testApi.getSceneSelection('s1'), 'user:Alpha')
  assert.equal(testApi.getSceneSelectionSnapshot().s1, 'user:Alpha')

  testApi.renameSceneSelection('user:Alpha', 'user:Beta')
  assert.equal(testApi.getSceneSelection('s1'), 'user:Beta')
  testApi.removeSceneSelectionByKey('user:Beta')
  assert.equal(testApi.getSceneSelection('s1'), '')

  testApi.setSceneSelection('s1', 'user:Alpha')
  testApi.setSceneSelection('s1', 'all')
  assert.equal(testApi.getSceneSelection('s1'), '')
  testApi.setSceneSelection('s1', 'user:Alpha')
  testApi.removeSceneSelectionByKey('user:Alpha')
  assert.equal(testApi.getSceneSelection('s1'), '')
})

test('scene System Prompt dictionaries keep EN/ZH key parity', () => {
  const { testApi } = loadClient()
  const enKeys = Object.keys(testApi.EN).sort()
  const zhKeys = Object.keys(testApi.ZH).sort()
  assert.deepEqual(enKeys, zhKeys)
  for (const key of [
    'category.workplace',
    'category.media',
    'category.polish',
    'category.study',
    'category.ppt',
    'category.code',
    'category.job',
    'category.analysis',
    'category.life',
    'category.legal',
    'category.meta',
  ]) {
    assert.equal(typeof testApi.EN[key], 'string')
    assert.equal(typeof testApi.ZH[key], 'string')
    assert.ok(testApi.EN[key].length > 0)
    assert.ok(testApi.ZH[key].length > 0)
  }
})

test('preset catalog has 10 categories, 55 unique subscenes, and dedicated prompts', () => {
  const { testApi } = loadClient()
  const presets = testApi.PRESET_SCENES
  assert.equal(presets.length, 55)
  assert.equal(new Set(presets.map((preset) => preset.id)).size, 55)
  assert.equal(new Set(presets.map((preset) => preset.title)).size, 55)
  assert.equal(new Set(presets.map((preset) => preset.systemPrompt)).size, 55)
  assert.equal([...new Set(presets.map((preset) => preset.category))].join('|'), testApi.BUILTIN_CATEGORY_IDS.slice(0, -1).join('|'))
  assert.equal(new Set(presets.map((preset) => preset.category)).size, 10)

  const counts = {}
  const modes = new Set(['one-shot', 'guided', 'interactive'])
  for (const preset of presets) {
    counts[preset.category] = (counts[preset.category] || 0) + 1
    assert.ok(preset.title.trim().length > 0)
    assert.ok(preset.description.trim().length > 0)
    assert.ok(preset.body.trim().length > 0)
    assert.ok(preset.systemPrompt.trim().length >= 80)
    assert.ok(preset.systemPrompt.trim().length <= 180)
    assert.ok(modes.has(preset.mode))
  }
  for (const id of testApi.BUILTIN_CATEGORY_IDS.slice(0, -1)) assert.equal(counts[id], id === 'workplace' ? 10 : 5)

  const t = (key) => testApi.EN[key] ?? key
  const items = testApi.buildItems(t)
  const builtins = items.filter((item) => item.builtin)
  assert.equal(builtins.length, 56)
  const workBuiltins = builtins.filter((item) => item.categoryKey !== 'builtin:meta')
  assert.equal(workBuiltins.length, 55)
  const byCategory = {}
  for (const item of workBuiltins) {
    byCategory[item.categoryKey] = (byCategory[item.categoryKey] || 0) + 1
    const preset = presets.find((entry) => `builtin:${entry.id}` === item.id)
    assert.ok(preset, 'preset item has a source row')
    assert.equal(item.systemPrompt, preset.systemPrompt)
    assert.equal(item.mode, preset.mode)
    assert.equal(item.body, preset.body)
    assert.equal(item.description, preset.description)
  }
  for (const id of testApi.BUILTIN_CATEGORY_IDS.slice(0, -1)) assert.equal(byCategory[`builtin:${id}`], id === 'workplace' ? 10 : 5)
  assert.equal(builtins.filter((item) => item.categoryKey === 'builtin:meta').length, 1)
  assert.equal(testApi.sceneCardsFor(items, 'builtin:workplace').length, 10)
  assert.equal(testApi.sceneCardsFor(items, 'builtin:life').length, 5)
  assert.equal(testApi.sceneCardsFor(items, 'builtin:legal').length, 5)
  assert.equal(testApi.sceneCardsFor(items, 'builtin:meta').length, 1)
})

test('meta generator has one card, an output list, and copyable JSON instructions', () => {
  const { testApi } = loadClient()
  const meta = testApi.META_SCENES
  assert.equal(meta.length, 1)
  assert.equal(meta[0].id, 'flow-generator')
  assert.equal(meta[0].category, 'meta')
  assert.ok(meta[0].systemPrompt.includes('列表'))
  assert.ok(meta[0].systemPrompt.includes('JSON'))
  assert.ok(meta[0].systemPrompt.includes('"scene"'))
  assert.ok(meta[0].systemPrompt.includes('"templates"'))
  assert.ok(meta[0].body.length > 0)
  assert.equal(testApi.BUILTIN_CATEGORY_IDS.length, 11)
  assert.equal(testApi.BUILTIN_CATEGORY_IDS.at(-1), 'meta')
  assert.equal(testApi.scenePromptFor('builtin:meta'), '')

  const t = (key) => testApi.EN[key] ?? key
  const items = testApi.buildItems(t)
  const metaItems = items.filter((item) => item.categoryKey === 'builtin:meta')
  assert.equal(metaItems.length, 1)
  assert.equal(metaItems[0].title, meta[0].title)
  assert.equal(metaItems[0].systemPrompt, meta[0].systemPrompt)
  assert.equal(metaItems[0].mode, meta[0].mode)
  assert.equal(metaItems[0].generator, true)
})

test('generated scene parser accepts JSON, code fences, and rejects invalid packages', () => {
  const { testApi } = loadClient()
  const valid = {
    version: 1,
    scene: {
      name: '测试生成场景',
      systemPrompt: '你是一名测试助手，负责给出清晰、可执行的回答。',
      templates: [
        { title: '第一张卡片', body: '请处理第一项任务。' },
        { title: '第二张卡片', body: '请处理第二项任务。' },
      ],
    },
  }
  const raw = testApi.parseGeneratedScene(JSON.stringify(valid))
  assert.equal(raw.ok, true)
  assert.equal(raw.scene.name, '测试生成场景')
  assert.equal(raw.scene.templates.length, 2)
  assert.equal(raw.scene.templates[0].title, '第一张卡片')

  const fenced = testApi.parseGeneratedScene('```json\n' + JSON.stringify(valid) + '\n```')
  assert.equal(fenced.ok, true)
  assert.equal(testApi.parseGeneratedScene('').code, 'empty')
  assert.equal(testApi.parseGeneratedScene('not json').code, 'json')
  assert.equal(testApi.parseGeneratedScene('{}').code, 'schema')
  assert.equal(testApi.parseGeneratedScene(JSON.stringify({ ...valid, version: 2 })).code, 'version')
  assert.equal(
    testApi.parseGeneratedScene(JSON.stringify({ ...valid, scene: { ...valid.scene, name: '' } })).code,
    'name',
  )
  assert.equal(
    testApi.parseGeneratedScene(JSON.stringify({ ...valid, scene: { ...valid.scene, templates: [] } })).code,
    'templates',
  )
  assert.equal(
    testApi.parseGeneratedScene(
      JSON.stringify({ ...valid, scene: { ...valid.scene, templates: Array.from({ length: 7 }, () => ({ title: 'x', body: 'y' })) } }),
    ).code,
    'templates',
  )
  assert.equal(
    testApi.parseGeneratedScene(
      JSON.stringify({ ...valid, scene: { ...valid.scene, templates: [{ title: '', body: 'y' }] } }),
    ).code,
    'title',
  )
  assert.equal(
    testApi.parseGeneratedScene(
      JSON.stringify({ ...valid, scene: { ...valid.scene, templates: [{ title: 'x', body: '' }] } }),
    ).code,
    'body',
  )
})

test('generated scene import appends a user scene, cards, and scene System Prompt', () => {
  const { testApi, storage } = loadClient()
  const t = (key) => testApi.EN[key] ?? key
  const source = {
    version: 1,
    scene: {
      name: '测试生成场景',
      systemPrompt: '你是一名测试助手，负责给出清晰、可执行的回答。信息不足时先询问。',
      templates: [
        { title: '第一张卡片', body: '请处理第一项任务。' },
        { title: '第二张卡片', body: '请处理第二项任务。' },
      ],
    },
  }
  const result = testApi.importGeneratedScene(source.scene, t)
  assert.equal(result.ok, true)
  assert.equal(result.sceneKey, 'user:测试生成场景')
  assert.equal(testApi.scenePromptFor('user:测试生成场景'), source.scene.systemPrompt)

  const items = testApi.buildItems(t)
  const imported = items.filter((item) => item.categoryKey === 'user:测试生成场景')
  assert.equal(imported.length, 2)
  assert.equal(imported[0].title, '第一张卡片')
  assert.equal(imported[1].title, '第二张卡片')
  assert.equal(imported[0].body, '请处理第一项任务。')
  assert.ok(storage.get('dsh.prompt-library.categories.v1').includes('测试生成场景'))
  assert.ok(storage.get('dsh.prompt-library.templates.v1').includes('第一张卡片'))
  assert.ok(storage.get('dsh.prompt-library.scene-prompts.v1').includes('测试生成场景'))

  const duplicate = testApi.importGeneratedScene(source.scene, t)
  assert.equal(duplicate.ok, false)
  assert.equal(duplicate.code, 'exists')
  assert.equal(items.filter((item) => item.categoryKey === 'user:测试生成场景').length, 2)

  const updateSource = {
    ...source.scene,
    systemPrompt: '更新后的场景 System Prompt。',
    templates: [{ title: '更新后的卡片', body: '请处理更新后的任务。' }],
  }
  const updated = testApi.importGeneratedScene(updateSource, t, { update: true })
  assert.equal(updated.ok, true)
  assert.equal(updated.updated, true)
  assert.equal(updated.sceneKey, 'user:测试生成场景')
  assert.equal(testApi.scenePromptFor('user:测试生成场景'), updateSource.systemPrompt)
  const updatedItems = testApi.buildItems(t)
  const updatedCards = updatedItems.filter((item) => item.categoryKey === 'user:测试生成场景')
  assert.equal(updatedCards.length, 1)
  assert.equal(updatedCards[0].title, '更新后的卡片')
  assert.equal(updatedCards[0].body, '请处理更新后的任务。')

  const builtinDuplicate = testApi.importGeneratedScene(
    { ...source.scene, name: testApi.EN['category.workplace'] },
    t,
  )
  assert.equal(builtinDuplicate.ok, false)
  assert.equal(builtinDuplicate.code, 'duplicate')
  const builtinChineseDuplicate = testApi.importGeneratedScene(
    { ...source.scene, name: testApi.ZH['category.workplace'] },
    t,
  )
  assert.equal(builtinChineseDuplicate.ok, false)
  assert.equal(builtinChineseDuplicate.code, 'duplicate')
})

test('generated scene import rolls back all keys when storage fails', () => {
  const { testApi, storage, window } = loadClient()
  const t = (key) => testApi.EN[key] ?? key
  const before = new Map(storage.entries())
  const source = {
    version: 1,
    scene: {
      name: '失败场景',
      systemPrompt: '你是一名测试助手，负责给出清晰、可执行的回答。',
      templates: [{ title: '卡片', body: '请处理任务。' }],
    },
  }
  const originalSetItem = window.localStorage.setItem
  let calls = 0
  window.localStorage.setItem = (key, value) => {
    calls += 1
    if (calls === 2) throw new Error('quota')
    return originalSetItem(key, value)
  }
  const originalError = console.error
  console.error = () => {}
  let result
  try {
    result = testApi.importGeneratedScene(source.scene, t)
  } finally {
    console.error = originalError
    window.localStorage.setItem = originalSetItem
  }
  assert.equal(result.ok, false)
  assert.equal(result.code, 'storage')
  assert.deepEqual([...storage.entries()], [...before.entries()])
  assert.equal(testApi.buildItems(t).filter((item) => item.categoryKey === 'user:失败场景').length, 0)
})

test('scene and card order persist in the library and apply to the scene model', () => {
  const { testApi, storage } = loadClient({
    'dsh.prompt-library.categories.v1': JSON.stringify(['我的场景']),
  })
  const t = (key) => testApi.EN[key] ?? key
  const items = testApi.buildItems(t)
  const fallbackScenes = testApi.categoriesOf(items, ['我的场景'], t)
    .map((entry) => entry.key)
    .filter((key) => key !== 'builtin:meta')
  assert.equal(fallbackScenes.length, 11)
  assert.equal(fallbackScenes.at(-1), 'user:我的场景')

  assert.equal(testApi.moveSceneOrder('builtin:legal', 'builtin:workplace', fallbackScenes, 'before'), true)
  assert.equal(testApi.getSceneOrderSnapshot()[0], 'builtin:legal')
  assert.equal(testApi.getSceneOrderSnapshot().length, 11)
  assert.equal(storage.get('dsh.prompt-library.scene-order.v1').includes('builtin:legal'), true)
  assert.equal(testApi.categoriesOf(items, ['我的场景'], t).filter((entry) => entry.key !== 'builtin:meta')[0].key, 'builtin:legal')

  const workplaceIds = testApi.sceneCardsFor(items, 'builtin:workplace').map((item) => item.id)
  assert.equal(workplaceIds.length, 10)
  assert.equal(testApi.moveCardOrder('builtin:workplace', workplaceIds[9], workplaceIds[0], workplaceIds, 'before'), true)
  assert.equal(testApi.sceneCardsFor(items, 'builtin:workplace')[0].id, workplaceIds[9])
  assert.equal(storage.get('dsh.prompt-library.card-order.v1').includes(workplaceIds[9]), true)

  testApi.renameSceneOrderKey('user:我的场景', 'user:新场景')
  testApi.renameCardOrderCategory('user:我的场景', 'user:新场景')
  assert.ok(testApi.getSceneOrderSnapshot().includes('user:新场景'))
  testApi.removeSceneOrderKey('user:新场景')
  assert.equal(testApi.getSceneOrderSnapshot().includes('user:新场景'), false)
  testApi.removeCardOrderCategory('user:新场景')
  assert.equal(testApi.getCardOrderSnapshot()['user:新场景'], undefined)
})

test('order stores restore from storage and keep old state on write failure', () => {
  const sceneOrder = ['builtin:legal', 'builtin:workplace']
  const cardOrder = { 'builtin:workplace': ['builtin:official-notice', 'builtin:official-report'] }
  const { testApi, window } = loadClient({
    'dsh.prompt-library.scene-order.v1': JSON.stringify(sceneOrder),
    'dsh.prompt-library.card-order.v1': JSON.stringify(cardOrder),
  })
  assert.deepEqual(Array.from(testApi.getSceneOrderSnapshot()), sceneOrder)
  assert.deepEqual(JSON.parse(JSON.stringify(testApi.getCardOrderSnapshot())), cardOrder)

  const t = (key) => testApi.EN[key] ?? key
  const items = testApi.buildItems(t)
  const fallback = testApi.categoriesOf(items, [], t)
    .map((entry) => entry.key)
    .filter((key) => key !== 'builtin:meta')
  window.localStorage.setItem = () => {
    throw new Error('storage unavailable')
  }
  assert.equal(testApi.moveSceneOrder('builtin:workplace', 'builtin:legal', fallback, 'before'), false)
  assert.deepEqual(Array.from(testApi.getSceneOrderSnapshot()), sceneOrder)
})

test('restoring default order clears both custom order stores atomically', () => {
  const { testApi, storage, window } = loadClient()
  assert.equal(testApi.setSceneOrder(['builtin:legal', 'builtin:workplace']), true)
  assert.equal(testApi.setCardOrder({ 'builtin:workplace': ['builtin:official-notice'] }), true)
  assert.equal(testApi.resetAllOrder(), true)
  assert.equal(testApi.getSceneOrderSnapshot().length, 0)
  assert.deepEqual(JSON.parse(JSON.stringify(testApi.getCardOrderSnapshot())), {})
  assert.equal(storage.get('dsh.prompt-library.scene-order.v1'), '[]')
  assert.equal(storage.get('dsh.prompt-library.card-order.v1'), '{}')

  assert.equal(testApi.setSceneOrder(['builtin:legal']), true)
  assert.equal(testApi.setCardOrder({ 'builtin:legal': ['builtin:legal-intake'] }), true)
  window.localStorage.setItem = () => {
    throw new Error('storage unavailable')
  }
  assert.equal(testApi.resetAllOrder(), false)
  assert.deepEqual(Array.from(testApi.getSceneOrderSnapshot()), ['builtin:legal'])
  assert.deepEqual(JSON.parse(JSON.stringify(testApi.getCardOrderSnapshot())), { 'builtin:legal': ['builtin:legal-intake'] })
})

test('restoring an order snapshot supports cancel semantics', () => {
  const { testApi } = loadClient()
  assert.equal(testApi.setSceneOrder(['builtin:legal', 'builtin:workplace']), true)
  assert.equal(testApi.setCardOrder({ 'builtin:workplace': ['builtin:official-notice'] }), true)
  assert.equal(testApi.restoreAllOrder(['builtin:workplace', 'builtin:legal'], {}), true)
  assert.deepEqual(Array.from(testApi.getSceneOrderSnapshot()), ['builtin:workplace', 'builtin:legal'])
  assert.deepEqual(JSON.parse(JSON.stringify(testApi.getCardOrderSnapshot())), {})
})

test('card order entries are cleaned when templates are created, recategorized, and deleted', () => {
  const { testApi } = loadClient()
  const t = (key) => testApi.EN[key] ?? key
  testApi.setCardOrder({ 'builtin:workplace': ['missing-old-id'] })
  testApi.createTemplate({ title: '测试卡片', body: '请处理测试任务。', category: testApi.EN['category.workplace'] }, t)
  const created = testApi.buildItems(t).find((item) => item.title === '测试卡片')
  assert.ok(created)
  assert.ok(testApi.getCardOrderSnapshot()['builtin:workplace'].includes(created.id))

  testApi.updateTemplate(created.id, { category: '新分类' }, t)
  assert.equal(testApi.getCardOrderSnapshot()['builtin:workplace'].includes(created.id), false)

  testApi.deleteTemplate(created.id)
  assert.equal(testApi.buildItems(t).some((item) => item.id === created.id), false)
})

test('existing user scenes are preserved when their labels match built-in categories', () => {
  const { testApi } = loadClient({
    'dsh.prompt-library.categories.v1': JSON.stringify(['公文写作']),
    'dsh.prompt-library.templates.v1': JSON.stringify([
      { id: 'u1', title: '自定义公文', body: '请按我的规则处理。', category: '公文写作', updatedAt: 1 },
    ]),
    'dsh.prompt-library.scene-prompts.v1': JSON.stringify({ 'user:公文写作': '保留我的场景指令。' }),
  })
  const t = (key) => testApi.EN[key] ?? key
  const items = testApi.buildItems(t)
  const userItem = items.find((item) => item.id === 'u1')
  assert.ok(userItem, 'user template survives preset integration')
  assert.equal(userItem.categoryKey, 'user:公文写作')
  assert.equal(testApi.scenePromptFor('user:公文写作'), '保留我的场景指令。')
  assert.equal(items.filter((item) => item.builtin).length, 56)
})

test('scene command payload round-trips Unicode and rejects invalid payloads', () => {
  const payload = {
    v: 1,
    active: true,
    sceneKey: 'user:报告',
    prompt: '第一行\n第二行 with accents: café and emoji: 📊',
  }
  const token = encodeScenePayload(payload)
  assert.deepEqual(decodeScenePayload(token), {
    v: 1,
    active: true,
    sceneKey: payload.sceneKey,
    prompt: payload.prompt,
  })
  assert.equal(decodeScenePayload('not-base64-json'), null)
  assert.equal(decodeScenePayload(encodeScenePayload({ ...payload, v: 2 })), null)
  assert.equal(decodeScenePayload(encodeScenePayload({ ...payload, sceneKey: '' })), null)
  assert.equal(decodeScenePayload(encodeScenePayload({ ...payload, active: 'yes' })), null)
  assert.equal(decodeScenePayload(encodeScenePayload({ ...payload, prompt: 'x'.repeat(6001) })), null)
  assert.deepEqual(decodeScenePayload(encodeScenePayload({ ...payload, prompt: '   ' })), {
    v: 1,
    active: false,
    sceneKey: payload.sceneKey,
    prompt: '',
  })
})

test('scene command recovery uses the last successful command/run + command/done pair', () => {
  const first = encodeScenePayload({ v: 1, active: true, sceneKey: 'builtin:report', prompt: 'report rules' })
  const clear = encodeScenePayload({ v: 1, active: false, sceneKey: 'builtin:report', prompt: '' })
  const failed = encodeScenePayload({ v: 1, active: true, sceneKey: 'builtin:slides', prompt: 'slides rules' })

  const session = {
    snapshotEvents() {
      return [
        { type: 'user/message', data: {} },
        { type: 'command/run', data: { commandId: 'c1', name: 'prompt-library-scene', args: first } },
        { type: 'command/done', data: { commandId: 'c1', kind: 'success' } },
        { type: 'command/run', data: { commandId: 'c2', name: 'prompt-library-scene', args: clear } },
        { type: 'command/done', data: { commandId: 'c2', kind: 'success' } },
        { type: 'command/run', data: { commandId: 'c3', name: 'prompt-library-scene', args: failed } },
        { type: 'command/done', data: { commandId: 'c3', kind: 'error' } },
      ]
    },
  }
  assert.deepEqual(scanSceneSelection(session), { v: 1, active: false, sceneKey: 'builtin:report', prompt: '' })
  assert.equal(scanSceneSelection({ snapshotEvents: () => [] }), null)
  assert.equal(scanSceneSelection(null), null)
})

test('host applies an appended Agent section and recovers it from the Session log', () => {
  const sections = []
  const disposed = []
  const handlers = new Map()
  const listeners = new Map()
  let cleanup = null
  const session = {
    snapshotEvents: () => [
      {
        type: 'command/run',
        data: {
          commandId: 'c1',
          name: 'prompt-library-scene',
          args: encodeScenePayload({ v: 1, active: true, sceneKey: 'builtin:report', prompt: 'Use report rules' }),
        },
      },
      { type: 'command/done', data: { commandId: 'c1', kind: 'success' } },
    ],
  }
  const agent = {
    id: 'session-host-1',
    session,
    ctx: {
      systemPrompt: {
        section(section) {
          sections.push(section)
          const dispose = () => disposed.push(section)
          return dispose
        },
      },
    },
  }
  const hostCtx = {
    effect(fn) {
      cleanup = fn()
      return () => {}
    },
    commands: {
      register(definition) {
        handlers.set(definition.name, definition)
        return () => {}
      },
    },
    systemPrompt: {},
    on(event, listener) {
      listeners.set(event, listener)
      return () => {}
    },
    get(name) {
      return name === 'agents' ? { list: () => [agent] } : undefined
    },
  }
  apply({ inject: (_deps, callback) => callback(hostCtx) })
  assert.equal(sections.length, 1, 'existing agent recovers its scene section')
  assert.deepEqual(
    { name: sections[0].name, order: sections[0].order, text: sections[0].text, interpolate: sections[0].interpolate },
    { name: 'prompt-library.scene', order: 1000, text: 'Use report rules', interpolate: false },
  )
  assert.equal(sections[0].complete, undefined, 'append mode leaves the default prompt intact')

  const clear = handlers.get('prompt-library-scene').handler({
    agent,
    rawInput: ` ${encodeScenePayload({ v: 1, active: false, sceneKey: 'builtin:report', prompt: '' })}`,
  })
  assert.equal(clear.kind, 'success')
  assert.equal(disposed.length, 1, 'clear disposes the previous section')
  assert.equal(sections.length, 1)

  listeners.get('agent/disposed')({ agent })
  cleanup()
})
