# Claude Code mods by Code & Chaos

Mods for [Claude Code](https://code.claude.com): small plugins that change how it looks and what it can do. Each one is
a single hooks module you can read in a few minutes.

| Mod | What it does | Where it works |
|---|---|---|
| [`night-sky`](plugins/night-sky) | A moving night sky behind the desktop app: the Milky Way breathing, glowing stars, Orion, four shooting stars, dark hills. Frosted glass panels; your messages in frosted rose on the right, Claude's in frosted night blue. | Desktop app (Code tab) |
| [`altshot`](plugins/altshot) | Hands each [altshot](https://github.com/code-and-chaos-ai/altshot) screenshot (Left Alt + Right Alt, secrets blacked out first) to the session you last typed in, as a draft. Needs the altshot watcher running. | Windows |

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install night-sky --marketplace code-and-chaos-ai/claude-code-mods
```

From a shell:

```
claude plugin install night-sky --marketplace code-and-chaos-ai/claude-code-mods
```

Answer `y` to add the marketplace, then pick a scope (user scope puts it in every session). Swap `night-sky` for
`altshot` to install that one.

In the desktop app, where `/plugin` doesn't run: click **+** next to the prompt box, then **Plugins**, **Add
marketplace** with `code-and-chaos-ai/claude-code-mods`, then **Add plugin**.

## night-sky

- **What moves:** the sky turns a few degrees over a couple of minutes, stars twinkle, the bright ones breathe, the
  Milky Way slowly brightens and dims, the Orion Nebula pulses, and four shooting stars cross on their own clocks.
- **Frosted glass:** the app's side panels and cards frost over the scene. Your own messages are drawn as frosted rose
  bubbles that hug the right side and grow with your words; Claude's replies sit in frosted night-blue bubbles.
- **If nothing moves:** Windows' *Settings → Accessibility → Visual effects → Animation effects* must be on. The app
  reads it when it starts, so quit the app fully (☰ menu → File → Exit) and open it again after changing it.
- **Layout:** the scene is drawn for a wide window. The chat column covers the middle, so Orion stands in the
  right-hand strip; on a narrow window parts of the sky are cropped.
- **Your message bubbles:** this mod draws your messages itself, so a very long message isn't folded behind the app's
  "Show more".
- **Lessons, if you write your own scene:** the desktop app silently drops a scene's whole animation block when its
  CSS holds a rule it doesn't take; `transform-box` and `@media (max-aspect-ratio: …)` both did it here. Avoid blur
  filters (each frame redraws them); use radial gradients for soft shapes. Keep the SVG under 131,072 characters.

## altshot

The Claude Code half of [altshot](https://github.com/code-and-chaos-ai/altshot). Install and run the watcher from that
repository first, then set `ALTSHOT_STATE` at the top of `plugins/altshot/hooks/register.tsx` to your altshot `state`
folder. Each message you type marks your session as the last one; a shot then lands in that session's prompt box as a
draft, with a note of how many secrets were blacked out (never what they were). Nothing is sent until you send it.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
