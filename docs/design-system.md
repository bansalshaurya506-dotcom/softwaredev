# SnapPlan — Design System and Learning Experience

SnapPlan is **more than a homework checklist**. The interface creates a learning loop: identify a priority, focus on it, complete it, reflect, and make a better estimate next time.

## References and inspiration

- **Coolors** (https://coolors.co): palette generation and color accessibility. Our three palettes are authored for SnapPlan, not copied wholesale from another brand.
- **shadcn/ui** (https://ui.shadcn.com/docs/components): reusable card, command menu, progress, dialog, and sidebar design patterns. The new command palette is an original dependency-free implementation inspired by these interaction patterns; this does not claim an official shadcn component is installed.
- **SkillsMP** (https://skillsmp.com): its directory of repeatable skills inspired a structured "plan → practice → reflect" workflow. We did **not** install or execute third-party SKILL.md content.

## Features in this revision

1. **Study Compass:** Change the suggested mission between "Deadline first," "Quick win," and "Deep work." Each mode has an explicit explanation. The default ranking uses the existing deadline/priority algorithm.
2. **Focus handoff:** "Start a focus session" opens Focus mode with the recommended task preselected.
3. **Reflection Lab:** Students enter actual minutes spent on a completed assignment. SnapPlan compares their estimate to the recorded time, and displays average absolute deviation across recorded tasks.
4. **Command menu:** Press Cmd+K or Ctrl+K, or select the visible search control. Quickly navigate to scanning, planning, resources, focus, and settings.
5. **Personalized themes:** Aurora, Ocean, and Sunset, with chosen colors saved in the browser.
6. **Visual storytelling:** The current animated SnapPlan logo and existing app features remain intact.

## Custom palettes

| Theme | Background | Primary (white text) | Supporting hues |
| --- | --- | --- | --- |
| Aurora | `#F6F5FC` | `#4E46C9` | `#B8A9FF`, `#A7F3D0` |
| Ocean | `#F3F9FA` | `#086878` | `#38C9BE`, `#D6F4F4` |
| Sunset | `#FFF8F1` | `#A74920` | `#F7B267`, `#FFE8C9` |

Primary-on-white contrast ratios calculated with the WCAG relative-luminance formula are approximately 6.9:1 (Aurora), 6.4:1 (Ocean), and 5.8:1 (Sunset). **This is not a claim that the entire app has passed an accessibility audit.** Test all states and color combinations, keyboard accessibility, mobile layout, and reduced-motion preferences before final submission.

## What makes it relevant to the TSA prompt

The key educational outcome is *building time-management and self-monitoring skills*, not simply storing assignments:

- Students choose a strategy and learn why the app recommends a task.
- Students convert broad work into feasible, bounded focus blocks.
- Students compare their estimated and real task durations instead of only checking "done."
- The workflow provides practice and feedback while still allowing manual control.

## Manual QA checklist

- Open the dashboard with the sample tasks.
- Switch all three Study Compass strategies and confirm the recommended task changes appropriately.
- Start a focus session and confirm the chosen assignment appears in Focus mode.
- Mark a task complete, record a real duration in Reflection Lab, and reload to confirm persistence.
- Open the command palette via Cmd/Ctrl+K and by mouse; select an action and press Escape to close.
- Select Ocean and Sunset in Settings and confirm the theme persists after reload.
- Check small-screen layout and keyboard focus.
- Verify assignment scanning, scheduling, video links, and the animated logo still work.

The site remains a **local-storage MVP**. AI photo extraction and live YouTube recommendations require separate API keys and are not simulated as working live services.
