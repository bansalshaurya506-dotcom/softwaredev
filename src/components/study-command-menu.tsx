"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, BookOpen, CalendarDays, Camera, Check, Command, Focus, Plus, Search, Settings2, X } from "lucide-react"

export type CommandAction = {
  id: string
  label: string
  description: string
  keywords?: string
  run: () => void
  icon: "plus" | "camera" | "calendar" | "focus" | "book" | "settings"
}

const icons = {
  plus: Plus, camera: Camera, calendar: CalendarDays, focus: Focus, book: BookOpen, settings: Settings2,
}

export function StudyCommandMenu({ actions }: { actions: CommandAction[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const filtered = useMemo(() => actions.filter((action) =>
    (action.label + " " + action.description + " " + (action.keywords || "")).toLowerCase().includes(query.toLowerCase().trim())
  ), [actions, query])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setQuery("")
        setActive(0)
        setOpen((previous) => !previous)
      }
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  const choose = (action: CommandAction) => {
    setOpen(false)
    action.run()
  }

  return <>
    <button type="button" className="sp-command-trigger" onClick={() => { setQuery(""); setActive(0); setOpen(true) }} aria-haspopup="dialog" aria-label="Open quick actions">
      <Search size={16}/><span className="hidden sm:inline">Search or jump to...</span>
      <span className="sm:hidden">Quick actions</span>
      <kbd><Command size={10}/> K</kbd>
    </button>
    {open && <div className="sp-command-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <section role="dialog" aria-modal="true" aria-label="SnapPlan quick actions" className="sp-command-dialog">
        <div className="sp-command-search"><Search size={20} className="text-slate-400"/>
          <input ref={inputRef} placeholder="Try “scan”, “focus”, “plan”..." aria-label="Find an action"
            value={query}
            onChange={(event) => {setQuery(event.target.value);setActive(0)}}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {event.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1))}
              if (event.key === "ArrowUp") {event.preventDefault(); setActive((a) => Math.max(a - 1, 0))}
              if (event.key === "Enter" && filtered.length) {event.preventDefault(); choose(filtered[Math.min(Math.max(0,active),filtered.length-1)])}
            }}/>
          <button type="button" className="sp-command-close" aria-label="Close quick actions" onClick={() => setOpen(false)}><X size={17}/></button>
        </div>
        <div className="sp-command-results" role="listbox" aria-label="Actions">
          <div className="sp-command-heading">QUICK ACTIONS</div>
          {filtered.length ? filtered.map((action, index) => {
            const Icon = icons[action.icon]
            return <button type="button" key={action.id} role="option" aria-selected={active === index}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(action)} className={"sp-command-item " + (active === index ? "sp-command-item-active" : "")}>
              <span className="sp-command-icon"><Icon size={18}/></span><span className="flex-1 text-left"><strong>{action.label}</strong><small>{action.description}</small></span>
              {active === index ? <Check size={15} className="text-indigo-600"/> : <ArrowRight size={15} className="text-slate-300"/>}
            </button>
          }) : <p className="p-7 text-center text-sm text-slate-500">No matching actions. Try “schedule” or “assignment”.</p>}
        </div>
        <div className="sp-command-footer">Use <kbd>↑</kbd> <kbd>↓</kbd> to move, <kbd>↵</kbd> to open, <kbd>Esc</kbd> to close.</div>
      </section>
    </div>}
  </>
}
