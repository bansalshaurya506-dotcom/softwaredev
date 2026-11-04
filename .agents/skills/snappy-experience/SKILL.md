---
name: snappy-experience
description: Use this skill when improving Snappy's interactive study studio, gesture-first learning flow, motion design, educational explanations, or responsive UI.
---

# Snappy experience iteration — Codex skill

This is a repository-specific, instruction-only skill. No external scripts, privileged tools or third-party marketplace content are required.

## Workflow

1. Review `AGENTS.md` and `docs/snappy-design.md`. Identify which feature the user wants to improve.
2. Inspect relevant files in `src/components/`, `src/lib/snappy-lessons.ts`, and `src/app/snappy.css`.
3. Design the interaction around a student action: **point → select → understand → ask → reflect**.
4. Maintain mouse/touch access, keyboard focus, device permission controls and an honest fallback when hardware/APIs are unsupported.
5. Use motion to communicate state: discovery highlight, selected concept, animated diagrams, progressive explanation. Honor `prefers-reduced-motion`.
6. Keep API keys on the server. Camera/mic off by default. No automatic camera frame uploads.
7. Run `npm run typecheck`, `npm run lint`, `npm run build`, then test the relevant browser interaction manually.
8. Summarize actual changes, tests run, missing verification, and any privacy/security implications.

## Quality bar

Visually distinctive Snappy design; precise hotspot-to-explanation mapping; responsive controls; meaningful error messaging; accurate concept descriptions; explicit user consent for camera/mic; legacy planner preserved at `/planner`.

Do not claim a camera or speech feature was tested unless it was observed in a real browser on a compatible device.
