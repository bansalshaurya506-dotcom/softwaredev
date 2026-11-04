"use client"

import { useMemo, useState } from "react"
import { ArrowRight, BrainCircuit, CalendarClock, CheckCircle2, Clock3, Compass, Lightbulb, Play, ScanLine, Sparkles, TimerReset, WandSparkles } from "lucide-react"
import { type Assignment, daysUntil, dueLabel, minutesLabel, prioritySort } from "@/lib/planner"

export type SnapPlanTheme = "aurora" | "ocean" | "sunset"
export const THEMES: { key: SnapPlanTheme; label: string; colors: string[]; description: string }[] = [
  { key: "aurora", label: "Aurora", colors: ["#4E46C9", "#B8A9FF", "#A7F3D0"], description: "Lavender • mint • indigo" },
  { key: "ocean", label: "Ocean", colors: ["#086878", "#38C9BE", "#D6F4F4"], description: "Deep teal • sea glass" },
  { key: "sunset", label: "Sunset", colors: ["#A74920", "#F7B267", "#FFE8C9"], description: "Terracotta • peach" },
]

type Lens = "deadline" | "quick" | "deep"
const LENSES: { key: Lens; name: string; hint: string }[] = [
  { key: "deadline", name: "Deadline first", hint: "Closest due date" },
  { key: "quick", name: "Quick win", hint: "Shortest task first" },
  { key: "deep", name: "Deep work", hint: "Longest task first" },
]

export function StudyCompass({ tasks, onFocus, onPlan, onScan, onResource }: {
  tasks: Assignment[]
  onFocus: (id: string) => void
  onPlan: () => void
  onScan: () => void
  onResource: (topic: string) => void
}) {
  const [lens, setLens] = useState<Lens>("deadline")
  const pending = useMemo(() => tasks.filter((task) => !task.completed), [tasks])
  const complete = tasks.length - pending.length
  const progress = tasks.length ? Math.round((complete / tasks.length) * 100) : 0
  const mission = useMemo(() => {
    const candidates = [...pending]
    if (lens === "quick") candidates.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes || prioritySort(a, b))
    else if (lens === "deep") candidates.sort((a, b) => b.estimatedMinutes - a.estimatedMinutes || prioritySort(a, b))
    else candidates.sort(prioritySort)
    return candidates[0]
  }, [pending, lens])
  const explanation = !mission ? "You're caught up. Add your next task to get started." :
    lens === "quick" ? "This is your shortest unfinished assignment. A quick win can make starting easier." :
    lens === "deep" ? "This is your longest unfinished assignment. Set aside a focused block for it." :
    (mission.dueDate && daysUntil(mission.dueDate) < 0) ? "This assignment is overdue, so it needs attention first." :
    (mission.dueDate && daysUntil(mission.dueDate) <= 1) ? "The deadline is approaching. Starting here protects time for your other tasks." :
    "This task is near the top because of its deadline and priority."

  return (
    <section className="sp-compass" aria-label="Study compass">
      <div className="sp-compass-background" aria-hidden="true"/>
      <div className="sp-compass-main">
        <div className="sp-compass-eyebrow"><Compass size={15}/> YOUR STUDY COMPASS <span className="sp-pulse-dot"/></div>
        <h2 className="sp-compass-heading">One clear next step.<span> More room to think.</span></h2>
        <p className="sp-compass-subtitle">SnapPlan doesn&apos;t just list your work. It explains where to begin, then helps you practice choosing what matters.</p>
        <div className="sp-lens-wrap" aria-label="Choose study strategy">
          {LENSES.map((entry) => (
            <button key={entry.key} type="button" aria-pressed={lens === entry.key}
              title={entry.hint}
              className={"sp-lens-button " + (lens === entry.key ? "sp-lens-active" : "")}
              onClick={() => setLens(entry.key)}>
              {entry.name}
            </button>
          ))}
        </div>
        {mission ? (
          <div className="sp-mission-card">
            <div className="sp-mission-label"><Sparkles size={14}/> YOUR NEXT MISSION <span className="sp-mission-due">{dueLabel(mission.dueDate)}</span></div>
            <h3 className="sp-mission-title">{mission.title}</h3>
            <div className="sp-mission-meta"><span>{mission.course}</span><span>•</span><Clock3 size={14}/><span>{minutesLabel(mission.estimatedMinutes)}</span></div>
            <div className="sp-mission-why"><Lightbulb size={17}/><p><strong>Why this task?</strong> {explanation}</p></div>
            <div className="sp-mission-actions">
              <button type="button" className="sp-action-main" onClick={() => onFocus(mission.id)}><Play size={16}/> Start a focus session <ArrowRight size={16}/></button>
              {mission.topic ? <button type="button" className="sp-action-sub" onClick={() => onResource(mission.topic)}><BrainCircuit size={17}/> Find a lesson</button> : <button type="button" className="sp-action-sub" onClick={onPlan}><CalendarClock size={17}/> Plan my day</button>}
            </div>
          </div>
        ) : (
          <div className="sp-mission-card"><h3 className="sp-mission-title">Nothing pending — nice work!</h3><p className="sp-mission-meta">You can scan a worksheet or add another assignment.</p><button type="button" className="sp-action-main mt-4" onClick={onScan}><ScanLine size={16}/> Scan an assignment</button></div>
        )}
      </div>
      <div className="sp-compass-side">
        <div className="sp-ring-shell">
          <svg viewBox="0 0 160 160" role="img" aria-label={progress + " percent of assignments complete"} className="sp-progress-ring">
            <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(255,255,255,.11)" strokeWidth="12"/>
            <circle cx="80" cy="80" r="66" fill="none" stroke="url(#spRingGradient)" strokeWidth="12" strokeLinecap="round"
              strokeDasharray="414.69" strokeDashoffset={414.69 * (1 - progress / 100)}
              transform="rotate(-90 80 80)"/>
            <defs><linearGradient id="spRingGradient"><stop stopColor="#56E0D1"/><stop offset="1" stopColor="#A9B7FF"/></linearGradient></defs>
            <text x="80" y="81" fill="#FFFFFF" fontSize="36" fontWeight="800" textAnchor="middle">{progress}%</text>
            <text x="80" y="101" fill="#C9D2F7" fontSize="11" textAnchor="middle">complete</text>
          </svg>
        </div>
        <div className="sp-side-score"><strong>{complete} of {tasks.length}</strong><span>assignments finished</span></div>
        <div className="sp-side-divider"/>
        <div className="sp-side-tip"><WandSparkles size={17}/><span>Learning skill: prioritization</span></div>
        <button type="button" onClick={onPlan} className="sp-side-link">Build my full schedule <ArrowRight size={15}/></button>
      </div>
    </section>
  )
}

export function ReflectionLab({ tasks, onRecord }: {
  tasks: Assignment[]
  onRecord: (id: string, actualMinutes: number) => void
}) {
  const finished = useMemo(() => tasks.filter((task) => task.completed), [tasks])
  const [selectedId, setSelectedId] = useState("")
  const selected = finished.find((task) => task.id === selectedId) || finished[0]
  const [minutes, setMinutes] = useState("")
  const [feedback, setFeedback] = useState("")
  const recorded = finished.filter((task) => typeof task.actualMinutes === "number" && task.actualMinutes > 0)
  const averageDifference = recorded.length ? Math.round(recorded.reduce((sum, task) => sum + Math.abs((task.actualMinutes || 0) - task.estimatedMinutes), 0) / recorded.length) : 0
  const save = () => {
    const value = Number(minutes)
    if (!selected || !Number.isFinite(value) || value < 1 || value > 480 || !Number.isInteger(value)) {
      setFeedback("Enter a whole number from 1 to 480 minutes.")
      return
    }
    onRecord(selected.id, value)
    setFeedback("Reflection saved! Your future estimates can use this comparison.")
  }
  return (
    <section className="surface-card sp-reflections p-5 sm:p-6" aria-labelledby="sp-reflection-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><span className="sp-section-kicker"><TimerReset size={14}/> THE LEARNING LOOP</span><h2 id="sp-reflection-heading" className="mt-2 text-xl font-extrabold">Learn your own pace.</h2><p className="mt-1 max-w-xl text-sm text-slate-500">After completing a task, record how long it actually took. Comparing your estimate with reality builds better planning skills.</p></div>
        <div className="sp-accuracy-pill"><CheckCircle2 size={16}/> {recorded.length} reflection{recorded.length === 1 ? "" : "s"} saved</div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <div className="sp-reflection-form">
          {selected ? <>
            <label className="block text-sm font-semibold text-slate-700">Completed assignment
              <select className="input-field mt-2" value={selected.id} onChange={(event) => { const nextId = event.target.value; const nextTask = finished.find((task) => task.id === nextId); setSelectedId(nextId); setMinutes(nextTask?.actualMinutes ? String(nextTask.actualMinutes) : ""); setFeedback("") }}>{finished.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select>
            </label>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="min-w-32 flex-1 text-sm font-semibold text-slate-700">Actual time (minutes)
                <input type="number" min={1} max={480} step={1} value={minutes} onChange={(event) => { setMinutes(event.target.value); setFeedback("") }} placeholder="e.g. 35" className="input-field mt-2"/>
              </label>
              <button type="button" onClick={save} className="btn-primary">Save reflection</button>
            </div>
            {feedback && <p role="status" className="mt-2 text-xs text-slate-600">{feedback}</p>}
          </> : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Finish an assignment first, then return here to reflect on your time estimate.</p>}
        </div>
        <div className="sp-reflection-visual">
          {selected && selected.actualMinutes ? <>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Planned vs actual</div>
            <div className="mt-4 space-y-4">
              {[
                { label: "Estimated", minutes: selected.estimatedMinutes, cls: "sp-compare-estimated" },
                { label: "Actual", minutes: selected.actualMinutes, cls: "sp-compare-actual" },
              ].map((item) => <div key={item.label}>
                <div className="flex justify-between text-xs font-semibold text-slate-600"><span>{item.label}</span><span>{minutesLabel(item.minutes)}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className={"h-full rounded-full " + item.cls} style={{width: Math.round((item.minutes / Math.max(1, selected.estimatedMinutes, selected.actualMinutes || 0)) * 100) + "%"}}/></div>
              </div>)}
            </div>
            <p className="mt-4 text-xs text-slate-500">Across {recorded.length} recorded task{recorded.length === 1 ? "" : "s"}, your estimates differ by about {averageDifference} minute{averageDifference === 1 ? "" : "s"} on average.</p>
          </> : <><div className="sp-empty-chart"><WandSparkles size={25}/></div><p className="mt-3 text-center text-xs text-slate-500">Your first reflection will turn into a visual comparison.</p></>}
        </div>
      </div>
    </section>
  )
}

export function ThemePicker({ value, onChange }: { value: SnapPlanTheme; onChange: (theme: SnapPlanTheme) => void }) {
  return (
    <section className="surface-card mt-5 max-w-2xl p-6" aria-labelledby="sp-theme-heading">
      <span className="sp-section-kicker"><Sparkles size={14}/> YOUR SPACE</span>
      <h2 id="sp-theme-heading" className="mt-2 text-lg font-bold">Choose your study atmosphere</h2>
      <p className="mt-2 text-sm text-slate-500">A personal workspace should feel like yours. The theme is saved in this browser.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Color theme">
        {THEMES.map((theme) => <button type="button" role="radio" aria-checked={value === theme.key} key={theme.key}
          onClick={() => onChange(theme.key)}
          className={"sp-theme-option " + (value === theme.key ? "sp-theme-option-active" : "")}>
          <span className="flex gap-1.5">{theme.colors.map((color) => <span key={color} className="sp-swatch" style={{backgroundColor:color}}/>)}</span>
          <strong className="mt-3 block text-sm">{theme.label}</strong>
          <span className="mt-1 block text-xs text-slate-500">{theme.description}</span>
          {value === theme.key && <span className="sp-theme-selected">Selected</span>}
        </button>)}
      </div>
    </section>
  )
}
