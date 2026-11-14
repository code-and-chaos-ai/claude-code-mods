import type { Register } from 'claude-code'

// altshot for Claude Code (optional). The altshot watcher works on its own; this mod only hands its shots to the
// Claude Code session you last typed in:
//   - every prompt you type marks this session as the target (writes <state>/last.json = { session, at }); prompts
//     a plugin submits never do
//   - a shot offered to this session (<state>/pending/<session>.json) goes into your prompt box as a draft, never
//     sent, with the watcher's note of what it blacked out ("2 secrets hidden under black boxes"), never what
//
// SET THIS to the watcher's state folder (altshot.config.json "state_dir"; by default the "state" folder next to
// altshot.pyw). An absolute path, with doubled backslashes on Windows.
const ALTSHOT_STATE = 'C:\\path\\to\\altshot\\state'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    let seen = 0
    $.clock.every(700, async () => {
      const file = `${ALTSHOT_STATE}\\pending\\${await $.session.id()}.json`
      if (!(await $.fs.exists(file).catch(() => false))) return
      let shot: { path?: string; at?: number; note?: string; withheld?: string } = {}
      try { shot = JSON.parse(await $.fs.read(file)) } catch { return }
      if (!shot.path || !shot.at || shot.at <= seen) return
      seen = shot.at
      await $.fs.write(file, '{}')
      const note = shot.note ? `(${shot.note}) ` : ''
      try {
        await $.prompt.fill({ text: `@${shot.path} ${note}`, mode: 'append' })
        $.ui.toast(shot.withheld ? '📸 withheld: the secret check failed' : note ? `📸 in the box, ${shot.note}` : '📸 your screen is in the box')
      } catch {
        // no prompt box to fill (e.g. a non-interactive session): leave it; the shot is saved on disk anyway
      }
    })
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    const r = await next(e)
    // your own typing (your Enter, or your phone through Remote Control). Not `e.wait`: since Claude Code 2.1.32x it
    // only flags a prompt queued to wait its turn
    if (!e.isMeta && (e.origin.kind === 'composer' || e.origin.kind === 'bridge')) {      const session = await $.session.id()
      await $.fs.write(`${ALTSHOT_STATE}\\last.json`, JSON.stringify({ session, at: await $.clock.now() })).catch(() => undefined)
    }
    return r
  })
}
