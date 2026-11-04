# Snappy ✦ — Learn with movement

**Snappy** is a new visual learning experience built on the original SnapPlan codebase. The landing page and learning studio have been rebuilt; the original **SnapPlan planner is preserved at `/planner`** so existing browser data and planner features are not deleted.

## Start Snappy in GitHub Codespaces

```bash
cd /workspaces/softwaredev
git pull origin main
npm install
npm run dev
```

Open **Ports → 3000 → Open in Browser**. If you already have a dev server running, stop it with Ctrl+C and restart.

Visit:
- `/` — the redesigned Snappy website
- `/planner` — original SnapPlan, including assignments, scanning, study planning and focus mode
- `/logo-demo` — original SnapPlan animated logo, retained for the project history

## Interactive learning features

- **Clickable learning diagrams** for cell biology, the solar system and forces. These work offline after the site loads.
- **Hand tracking**: choose Start camera in Live Studio. Browser camera permission is required, and MediaPipe's Hand Landmarker model must download successfully. Point your index finger at a discovery point and bring your thumb and index finger together (pinch) to select it. Mouse/touch is always supported.
- **Snap/clap detection**: choose Listen for snaps to let the microphone detect sharp sounds. This is a **heuristic**, not a trained snap classifier, and background sounds can trigger false positives. The action advances the selected concept.
- **Voice commands**: choose Voice command and try `next`, `explain`, `biology`, `space` or `physics`. Supported browsers may use remote speech services; this feature is not available in every browser.
- **Read aloud**: the assistant panel can read lesson explanations using browser speech synthesis.
- **Learning journey**: local progress tracks which concepts were opened. It measures exploration, not understanding or test performance.
- **Optional AI explanations**: use a question or explicitly submit a camera frame. Requires `OPENAI_API_KEY` server-side; it is not included or exposed to the browser. Without it, curated learning explanations still work.

## Data and permissions

All camera and microphone features are off by default and require a user action. MediaPipe hand landmark inference is performed on the device after the model/WASM is fetched; MediaPipe may collect usage metrics under its policies. The app does not record or upload raw webcam video. A **single frame** is sent for AI analysis only when the user deliberately presses **Explain what the camera sees**. Speech recognition may be implemented through a browser vendor's network service. Do not submit personal or sensitive material.

The microphone transient detector only processes audio locally. Audio is not stored.

For AI, create `.env.local` (not committed) containing:

```env
OPENAI_API_KEY=your_server_side_key
```

Then restart the dev server. Without the key, the endpoint returns a clear unavailable status, rather than pretending that AI is working.

## Design inspiration

- [Coolors](https://coolors.co) for the mint / indigo / midnight palette
- [shadcn/ui](https://ui.shadcn.com/docs/components) for component composition and clean interactions (our UI is custom React/CSS; we did not silently install the shadcn CLI)
- [SkillsMP](https://skillsmp.com) for the idea of repeatable discover → explain → reflect learning workflows. **No third-party skills or Claude-specific scripts were executed.**

The repository includes `AGENTS.md` and `.agents/skills/snappy-experience/SKILL.md` as **Codex-compatible instructions**, rather than Claude-oriented project hooks.

See `docs/snappy-design.md` for design decisions, behavior and test scenarios.

## Validate before sharing

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Then manually verify the camera, microphone, AI optional setup and responsive layout in a browser. API keys, webcam permissions and network downloads cannot be tested from a code review alone.

## Stack

Next.js 16, TypeScript, React 19, Tailwind CSS 4, custom animated CSS/SVG, Lucide icons, MediaPipe Hand Landmarker, optional OpenAI API.
