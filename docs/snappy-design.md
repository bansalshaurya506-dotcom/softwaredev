# Snappy — product, visual system and interaction spec

## Product direction

SnapPlan was the planning prototype. **Snappy** is now the main application. Instead of organizing homework, it lets students learn through tactile, visual interaction. The original SnapPlan app still lives at `/planner`.

Snappy's differentiator is **multimodal interaction** in a single browser experience: point with a camera-tracked index finger, pinch to select a concept, make a sharp sound to advance, issue a short voice command, or use a mouse/touchscreen. A fixed, accurate concept explanation appears every time. Optional OpenAI-powered responses are clearly labeled as requiring a server key.

## Style direction

- Midnight navy `#080F20`: visual depth without black-on-black.
- Cool mint `#A2F4D0`: active controls, progress and pointer interactions.
- Ice `#EAF2FF`: reading text on dark surfaces.
- Lavender `#ABAaff`: secondary highlights and motion trails.
- Warm gold `#FFCE8B`: physics diagrams.
- Bright lime `#90FFCA`: biology hotspot marks.

Typography uses a bold editorial sans heading, compact uppercase eyebrow labels and generous whitespace. Hero art consists of animated SVG and layered gradients, not a static screenshot.

## Inspired by the supplied links

- **Coolors (https://coolors.co):** palette exploration and contrast-aware visual direction.
- **shadcn/ui (https://ui.shadcn.com/docs/components):** card composition, clear button states, dialog/interaction conventions and spacing. Here the components are custom; copying shadcn source or claiming installed components is unnecessary.
- **SkillsMP (https://skillsmp.com):** conceptual inspiration for repeatable learning workflows. We did not download or execute unknown skills. Codex instructions are in root `AGENTS.md`, with a vetted, repository-authored skill `.agents/skills/snappy-experience/SKILL.md`.

## Demonstrable behaviors

| Input | User action | Result | Caveat |
| --- | --- | --- | --- |
| Mouse/touch | Select a glowing hotspot | Show a specific, vetted explanation | Always available |
| Webcam + hand model | Point index finger toward hotspot | On-screen pointer tracks the index tip | Requires permission, model download, browser support |
| Webcam + hand model | Pinch thumb and index finger near hotspot | Select the hovered concept | Gestures are approximate and sensitive to light/occlusion |
| Microphone | Make a sharp sound | Advance to next concept | RMS/peak transient heuristic; may register claps or ambient noise |
| Speech recognition | Say next, explain, biology, space, or physics | Navigate the lesson or open a local explanation | Limited browser support; some services transmit audio |
| Speech synthesis | Click Read aloud | Read current explanation | Browser support needed |
| Explicit frame capture | Click Explain what camera sees | Send one JPEG to the server AI route | Requires OPENAI_API_KEY and network access |
| Manual AI question | Enter a follow-up | OpenAI chat completions response | Requires OPENAI_API_KEY; the app must not fake a response |
| Progress | Open a concept | Save exploration history to localStorage | Not evidence of mastery |

## Demo and acceptance checklist

1. Compare the visually distinct new homepage at `/` with the preserved original planner at `/planner`.
2. Open each topic and select all three visible hotspots.
3. Verify local reading explanations are accurate and reflective questions appear.
4. Use the Next discovery action and verify state transition.
5. Allow camera and test hand cursor; point near a hotspot then pinch.
6. Deny camera and verify mouse/touch fallback.
7. Enable sound detection and check user notification that false positives are possible.
8. Test voice commands in Chrome and unsupported browser fallback.
9. Confirm that pressing AI capture without a configured key returns a clear error and does not pretend success.
10. Check mobile layout, motion-reduction settings, keyboard navigation and browser console.

## Privacy

MediaPipe runs landmark detection locally after downloading model/WASM assets (and may send usage metrics per its notice). Audio transients run locally. Neither camera nor sound detection turns on until clicked. Speech recognition in some browsers may rely on remote services. A camera frame is sent to OpenAI only on explicit request through `/api/explain`.

The app does **not** persist camera frames or microphone audio. It stores selected concept IDs in localStorage.
