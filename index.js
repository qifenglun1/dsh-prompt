/**
 * Host half of the dsh-plugin-prompt bundle.
 *
 * The client owns the library, scene dock, and picker. This half carries the
 * per-Session scene System Prompt into the Host: the client invokes an internal
 * command, and this plugin registers an Agent-scoped prompt section. The
 * selection is recoverable from the command/run lifecycle already present in
 * the Session log; no new event type is introduced.
 */

const COMMAND_NAME = 'prompt-library-scene'
const SECTION_NAME = 'prompt-library.scene'
const SECTION_ORDER = 1000
const SCENE_PROMPT_MAX = 6000
const SCENE_KEY_MAX = 200
const PAYLOAD_VERSION = 1

/** Encode the client payload as the URL-safe token written into the command line. */
export function encodeScenePayload(payload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

/** Decode and validate a command payload from untrusted slash-command input. */
export function decodeScenePayload(raw) {
  if (typeof raw !== 'string') return null
  const token = raw.trim()
  if (token === '') return null
  let parsed
  try {
    parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
  } catch (_error) {
    return null
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  if (parsed.v !== PAYLOAD_VERSION) return null
  if (typeof parsed.active !== 'boolean') return null
  if (typeof parsed.sceneKey !== 'string') return null
  const sceneKey = parsed.sceneKey.trim()
  if (sceneKey === '' || sceneKey.length > SCENE_KEY_MAX) return null
  const prompt = typeof parsed.prompt === 'string' ? parsed.prompt.trim() : ''
  if (prompt.length > SCENE_PROMPT_MAX) return null
  const active = parsed.active && prompt !== ''
  return { v: PAYLOAD_VERSION, active, sceneKey, prompt: active ? prompt : '' }
}

/**
 * Find the last successfully executed Prompt Library scene selection in a
 * Session log. command/run carries the encoded input; command/done confirms
 * that the handler settled successfully. Failed or unfinished runs are ignored.
 */
export function scanSceneSelection(session) {
  if (session === null || session === undefined || typeof session.snapshotEvents !== 'function') return null
  let events
  try {
    events = session.snapshotEvents()
  } catch (_error) {
    return null
  }
  const runs = new Map()
  let last = null
  for (const event of events) {
    if (event === null || typeof event !== 'object' || event.data === null || typeof event.data !== 'object') continue
    if (event.type === 'command/run' && event.data.name === COMMAND_NAME) {
      if (typeof event.data.commandId === 'string') runs.set(event.data.commandId, event.data.args)
      continue
    }
    if (event.type === 'command/done' && event.data.kind === 'success') {
      const args = runs.get(event.data.commandId)
      const payload = decodeScenePayload(args)
      if (payload !== null) last = payload
    }
  }
  return last
}

/** Attach the Host half's Agent-scoped scene Section and command recovery. */
export function apply(ctx) {
  if (typeof ctx.inject !== 'function') return
  try {
    ctx.inject(['commands', 'systemPrompt'], (hostCtx) => {
      hostCtx.effect(() => {
        const commands = hostCtx.commands
        const systemPrompt = hostCtx.systemPrompt
        if (commands === undefined || systemPrompt === undefined) return () => {}
        const sections = new Map()

        const clearSection = (agentId) => {
          const dispose = sections.get(agentId)
          if (dispose === undefined) return
          sections.delete(agentId)
          try {
            dispose()
          } catch (error) {
            console.error('prompt-library: could not remove the scene system prompt', error)
          }
        }

        const applyPayload = (agent, payload) => {
          if (agent === null || agent === undefined || agent.id === undefined) {
            throw new Error('scene system prompt requires a live agent')
          }
          if (agent.ctx === undefined || agent.ctx.systemPrompt === undefined) {
            throw new Error('agent context cannot register a system prompt section')
          }
          clearSection(agent.id)
          if (payload === null || payload === undefined || payload.active !== true || payload.prompt === '') return
          const dispose = agent.ctx.systemPrompt.section({
            name: SECTION_NAME,
            order: SECTION_ORDER,
            text: payload.prompt,
            interpolate: false,
          })
          sections.set(agent.id, dispose)
        }

        const restoreAgent = (agent) => {
          try {
            const payload = scanSceneSelection(agent && agent.session)
            applyPayload(agent, payload)
          } catch (error) {
            console.error('prompt-library: could not restore the scene system prompt', error)
          }
        }

        const disposeCommand = commands.register({
          name: COMMAND_NAME,
          description: 'Set the active Prompt Library scene system prompt',
          handler: ({ agent, rawInput }) => {
            const payload = decodeScenePayload(rawInput)
            if (payload === null) {
              return { kind: 'error', text: 'Invalid Prompt Library scene payload.' }
            }
            try {
              applyPayload(agent, payload)
              return {
                kind: 'success',
                text: payload.active ? 'Scene system prompt applied.' : 'Default system prompt restored.',
              }
            } catch (error) {
              return {
                kind: 'error',
                text: error instanceof Error ? error.message : 'Could not apply the scene system prompt.',
              }
            }
          },
        })

        const offCreated = hostCtx.on('agent/created', ({ agent }) => {
          restoreAgent(agent)
        })
        const offDisposed = hostCtx.on('agent/disposed', ({ agent }) => {
          if (agent !== null && agent !== undefined && agent.id !== undefined) clearSection(agent.id)
        })

        const agents = typeof hostCtx.get === 'function' ? hostCtx.get('agents') : undefined
        if (agents !== undefined && typeof agents.list === 'function') {
          for (const agent of agents.list()) restoreAgent(agent)
        }

        return () => {
          offCreated()
          offDisposed()
          disposeCommand()
          for (const agentId of [...sections.keys()]) clearSection(agentId)
        }
      }, 'prompt-library: scene system prompts')
    })
  } catch (error) {
    console.error('prompt-library: scene system prompt services are unavailable', error)
  }
}
