"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowRight, BookOpen, CalendarDays, Camera, Check, CheckCircle2, ChevronDown,
  ChevronRight, Clock3, ExternalLink, FileText, Filter, Focus, GraduationCap,
  LayoutDashboard, Lightbulb, Menu, MoreHorizontal, Pencil, Play,
  Plus, Search, Settings2, Sparkles, Target, Timer, Trash2, UploadCloud,
  WandSparkles, X, AlertTriangle, RotateCcw, Save, Bell
} from "lucide-react"
import { SnapPlanBrand } from "@/components/branding/snapplan-brand"
import { AnimatedSnapPlanLogo } from "@/components/branding/animated-snapplan-logo"
import {
  type Assignment, type Priority, type StudyBlock, dateKey, daysUntil, dueLabel,
  generateStudyPlan, minutesLabel, prioritySort, sampleAssignments
} from "@/lib/planner"

type Page = "Dashboard" | "Assignments" | "Scan assignment" | "Study planner" | "Resources" | "Focus mode" | "Settings"
type AssignmentDraft = Omit<Assignment, "id" | "completed">
type Video = { id: string; title: string; channel: string; url: string }
const STORAGE_KEY = "snapplan-v1-assignments"
const DEFAULT_COURSES = ["AP Calculus", "AP Language", "AP Environmental Science", "TSA Software Development", "Spanish"]
const NAV: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Assignments", icon: FileText },
  { label: "Scan assignment", icon: Camera },
  { label: "Study planner", icon: CalendarDays },
  { label: "Resources", icon: BookOpen },
  { label: "Focus mode", icon: Focus },
  { label: "Settings", icon: Settings2 },
]
const emptyDraft = (): AssignmentDraft => ({
  title: "", course: "AP Calculus", topic: "", dueDate: dateKey(1),
  priority: "Medium", estimatedMinutes: 30,
})
const todayWords = () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
function Badge({ children, tint = "violet" }: { children: React.ReactNode; tint?: "violet" | "red" | "amber" | "green" | "slate" }) {
  const colors = {
    violet: "bg-indigo-50 text-indigo-700",
    red: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
  }
  return <span className={"inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold " + colors[tint]}>{children}</span>
}
function EmptyState({ title, description, icon: Icon, action }: { title: string; description: string; icon: typeof Camera; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
    <div className="mb-3 rounded-2xl bg-white p-3 text-indigo-500 shadow-sm"><Icon size={25}/></div>
    <h3 className="font-bold text-slate-800">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
}
function StatCard({ label, value, sub, icon: Icon, tint = "indigo" }: { label: string; value: string; sub: string; icon: typeof Camera; tint?: "indigo" | "amber" | "emerald" | "sky" }) {
  const palette = { indigo: "bg-indigo-50 text-indigo-600", amber: "bg-amber-50 text-amber-600", emerald: "bg-emerald-50 text-emerald-600", sky: "bg-sky-50 text-sky-600" }
  return <div className="surface-card p-5">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className={"rounded-xl p-2.5 " + palette[tint]}><Icon size={19}/></div>
    </div>
    <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
    <div className="mt-1 text-xs text-slate-400">{sub}</div>
  </div>
}
function AssignmentRow({ task, onToggle, onEdit, onDelete }: { task: Assignment; onToggle: (id: string) => void; onEdit: (task: Assignment) => void; onDelete: (id: string) => void }) {
  const days = task.dueDate ? daysUntil(task.dueDate) : 999
  return <div className="group flex items-start gap-3 border-b border-slate-100 py-4 last:border-0">
    <button type="button" onClick={() => onToggle(task.id)} aria-label={task.completed ? "Mark incomplete" : "Mark complete"} className={"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 " + (task.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-indigo-500")}>{task.completed && <Check size={13} strokeWidth={3}/>}</button>
    <div className="min-w-0 flex-1">
      <div className={"font-semibold " + (task.completed ? "text-slate-400 line-through" : "text-slate-800")}>{task.title}</div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400"><span>{task.course}</span><span>•</span><Clock3 size={12}/><span>{minutesLabel(task.estimatedMinutes)}</span></div>
    </div>
    <div className="flex flex-wrap items-center justify-end gap-2">
      {!task.completed && <Badge tint={days < 0 ? "red" : days <= 1 ? "amber" : "slate"}>{dueLabel(task.dueDate)}</Badge>}
      <button type="button" onClick={() => onEdit(task)} title="Edit assignment" aria-label={"Edit " + task.title} className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><Pencil size={15}/></button>
      <button type="button" onClick={() => onDelete(task.id)} title="Delete assignment" aria-label={"Delete " + task.title} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15}/></button>
    </div>
  </div>
}
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-8 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-extrabold">{title}</h2><button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close"><X size={20}/></button></div>
      {children}
    </section>
  </div>
}

export default function SnapPlanApp() {
  const [page, setPage] = useState<Page>("Dashboard")
  const [tasks, setTasks] = useState<Assignment[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AssignmentDraft>(emptyDraft)
  const [filterCourse, setFilterCourse] = useState("All classes")
  const [filterStatus, setFilterStatus] = useState("All")
  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [startTime, setStartTime] = useState("16:00")
  const [availableMinutes, setAvailableMinutes] = useState(120)
  const [planMade, setPlanMade] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [scanName, setScanName] = useState("")
  const [scanning, setScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState("")
  const [scanDraft, setScanDraft] = useState<AssignmentDraft>(() => ({ ...emptyDraft(), dueDate: "" }))
  const [resourceTopic, setResourceTopic] = useState("Chain rule derivatives")
  const [videoItems, setVideoItems] = useState<Video[]>([])
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoMessage, setVideoMessage] = useState("")
  const [focusSeconds, setFocusSeconds] = useState(25 * 60)
  const [focusRunning, setFocusRunning] = useState(false)
  const [focusTask, setFocusTask] = useState("")
  const uploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY)
      if (existing) {
        const parsed: unknown = JSON.parse(existing)
        setTasks(Array.isArray(parsed) ? parsed as Assignment[] : sampleAssignments())
      } else setTasks(sampleAssignments())
    } catch { setTasks(sampleAssignments()) }
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) }, [tasks, loaded])
  useEffect(() => {
    if (!focusRunning) return
    const timer = window.setInterval(() => setFocusSeconds((seconds) => {
      if (seconds <= 1) { setFocusRunning(false); return 0 }
      return seconds - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [focusRunning])
  const pending = useMemo(() => tasks.filter((t) => !t.completed).sort(prioritySort), [tasks])
  const completed = tasks.filter((t) => t.completed).length
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0
  const urgent = pending.filter((t) => t.dueDate && daysUntil(t.dueDate) <= 1)
  const minutesRemaining = pending.reduce((sum, t) => sum + t.estimatedMinutes, 0)
  const courseOptions = useMemo(() => Array.from(new Set([...DEFAULT_COURSES, ...tasks.map((t) => t.course).filter(Boolean)])), [tasks])
  const plan = useMemo(() => generateStudyPlan(tasks, startTime, availableMinutes), [tasks, startTime, availableMinutes])
  const list = tasks.filter((task) =>
    (filterCourse === "All classes" || task.course === filterCourse) &&
    (filterStatus === "All" || (filterStatus === "Complete" ? task.completed : !task.completed)) &&
    (task.title + " " + task.course + " " + task.topic).toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => Number(a.completed) - Number(b.completed) || prioritySort(a, b))

  const navigate = (next: Page) => { setPage(next); setMenuOpen(false) }
  const openNew = () => { setDraft(emptyDraft()); setEditingId(null); setShowModal(true) }
  const openEdit = (task: Assignment) => {
    setDraft({ title: task.title, course: task.course, topic: task.topic, dueDate: task.dueDate, priority: task.priority, estimatedMinutes: task.estimatedMinutes })
    setEditingId(task.id)
    setShowModal(true)
  }
  const saveDraft = (incoming: AssignmentDraft, existingId: string | null = null) => {
    if (!incoming.title.trim()) return
    const normalized = { ...incoming, title: incoming.title.trim(), course: incoming.course.trim() || "General", estimatedMinutes: Math.max(5, Math.min(480, Number(incoming.estimatedMinutes) || 30)) }
    if (existingId) setTasks((previous) => previous.map((task) => task.id === existingId ? { ...task, ...normalized } : task))
    else setTasks((previous) => [{ id: crypto.randomUUID(), completed: false, ...normalized }, ...previous])
    setShowModal(false)
    setEditingId(null)
    navigate("Assignments")
  }
  const toggleTask = (id: string) => setTasks((previous) => previous.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
  const deleteTask = (id: string) => setTasks((previous) => previous.filter((task) => task.id !== id))
  const updateScanField = <K extends keyof AssignmentDraft>(field: K, value: AssignmentDraft[K]) => setScanDraft((previous) => ({ ...previous, [field]: value }))
  const updateDraftField = <K extends keyof AssignmentDraft>(field: K, value: AssignmentDraft[K]) => setDraft((previous) => ({ ...previous, [field]: value }))

  const onUpload = (file: File | undefined) => {
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4_000_000) {
      setScanMessage("Please upload a JPG, PNG, or WebP under 4 MB.")
      return
    }
    if (uploadPreview) URL.revokeObjectURL(uploadPreview)
    setUploadPreview(URL.createObjectURL(file))
    setScanName(file.name)
    setScanMessage("Photo ready. Choose Analyze image to try AI extraction, or fill in the fields manually.")
    setScanDraft({ ...emptyDraft(), dueDate: "", title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") })
  }
  const scanImage = async () => {
    const file = uploadRef.current?.files?.[0]
    if (!file) { setScanMessage("Choose an image first."); return }
    setScanning(true)
    setScanMessage("")
    try {
      const form = new FormData()
      form.append("file", file)
      const result = await fetch("/api/scan", { method: "POST", body: form })
      const json = await result.json()
      if (!result.ok) throw new Error(json.error || "Scanning could not be completed.")
      setScanDraft({ title: json.title || scanDraft.title, course: json.course || scanDraft.course, topic: json.topic || "", dueDate: json.dueDate || "", priority: json.priority || "Medium", estimatedMinutes: json.estimatedMinutes || 30 })
      setScanMessage("Draft extracted. Review and correct every detail before saving.")
    } catch (error) {
      setScanMessage(error instanceof Error ? error.message : "Scan unavailable. Please enter the details manually.")
    } finally { setScanning(false) }
  }
  const lookupVideos = useCallback(async (topic: string) => {
    if (!topic.trim()) { setVideoMessage("Enter a topic first."); return }
    setVideoLoading(true)
    setVideoItems([])
    setVideoMessage("")
    try {
      const result = await fetch("/api/videos?topic=" + encodeURIComponent(topic))
      const json = await result.json()
      if (!result.ok) throw new Error(json.error || "Video lookup failed.")
      setVideoItems(json.videos || [])
      if (!json.configured) setVideoMessage("Live YouTube recommendations aren't configured yet. Use the YouTube search link below.")
      else if (!json.videos?.length) setVideoMessage("No matching videos were returned. Try a broader topic.")
    } catch (error) {
      setVideoMessage(error instanceof Error ? error.message : "Could not load videos.")
    } finally { setVideoLoading(false) }
  }, [])
  const beginResourceSearch = (topic: string) => { setResourceTopic(topic); navigate("Resources"); void lookupVideos(topic) }

  const fieldForm = (value: AssignmentDraft, setField: <K extends keyof AssignmentDraft>(field: K, val: AssignmentDraft[K]) => void) => <div className="grid gap-4 sm:grid-cols-2">
    <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Assignment title *</span><input required className="input-field" value={value.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Chain rule worksheet"/></label>
    <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Class</span><input className="input-field" list="course-suggestions" value={value.course} onChange={(e) => setField("course", e.target.value)}/><datalist id="course-suggestions">{courseOptions.map((course) => <option key={course} value={course}/>)}</datalist></label>
    <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Due date</span><input className="input-field" type="date" value={value.dueDate} onChange={(e) => setField("dueDate", e.target.value)}/></label>
    <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Priority</span><select className="input-field" value={value.priority} onChange={(e) => setField("priority", e.target.value as Priority)}><option>High</option><option>Medium</option><option>Low</option></select></label>
    <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Estimated minutes</span><input className="input-field" type="number" min="5" max="480" value={value.estimatedMinutes} onChange={(e) => setField("estimatedMinutes", Number(e.target.value))}/></label>
    <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Learning topic (for video help)</span><input className="input-field" value={value.topic} onChange={(e) => setField("topic", e.target.value)} placeholder="e.g. Differentiation with chain rule"/></label>
  </div>

  if (!loaded) return <div className="flex min-h-screen items-center justify-center text-indigo-600"><span className="font-bold">Loading SnapPlan...</span></div>

  return <div className="flex min-h-screen bg-[#f5f7fc]">
    {menuOpen && <button aria-label="Close navigation" type="button" className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setMenuOpen(false)}/>}
    <aside className={"fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-slate-100 bg-white px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-screen " + (menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
      <div className="mb-9 flex items-center justify-between px-3"><SnapPlanBrand/><button aria-label="Close menu" type="button" className="lg:hidden" onClick={() => setMenuOpen(false)}><X size={19}/></button></div>
      <div className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</div>
      <nav aria-label="Main navigation" className="space-y-1">
        {NAV.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => navigate(label)} className={"flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] font-semibold transition " + (page === label ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
          <Icon size={19} strokeWidth={page === label ? 2.5 : 1.8}/><span className="flex-1">{label}</span>{page === label && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"/>}
        </button>)}
      </nav>
      <div className="mt-auto rounded-2xl bg-gradient-to-br from-[#f1efff] to-[#e9f3ff] p-4">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"><Lightbulb size={19}/></div>
        <div className="text-sm font-bold text-slate-800">Small steps, big wins.</div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">Build a study habit one focused session at a time.</p>
        <button type="button" onClick={() => navigate("Study planner")} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-600">Plan my day <ArrowRight size={13}/></button>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-slate-100 px-2 pt-5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">S</div><div className="min-w-0"><div className="text-xs font-bold text-slate-800">Student workspace</div><div className="text-[11px] text-slate-400">Local demo mode</div></div><MoreHorizontal className="ml-auto text-slate-400" size={18}/></div>
    </aside>

    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-slate-100 bg-white/95 px-5 backdrop-blur sm:px-9">
        <div className="flex items-center gap-4"><button type="button" className="rounded-lg p-1 text-slate-500 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={23}/></button><div className="text-sm text-slate-400"><span className="hidden sm:inline">Workspace</span><ChevronRight className="mx-1 hidden sm:inline" size={13}/><span className="font-semibold text-slate-800">{page}</span></div></div>
        <div className="flex items-center gap-3"><Badge tint="violet"><Sparkles size={12} className="mr-1"/> Demo workspace</Badge><Link href="/logo-demo" title="View animated logo" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><Sparkles size={18}/></Link><button type="button" aria-label="Go to assignments" title="Your tasks" onClick={() => navigate("Assignments")} className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100"><Bell size={19}/>{urgent.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500"/>}</button></div>
      </header>
      <main className="mx-auto max-w-[1250px] px-5 py-8 sm:px-9 sm:py-10">
        {page === "Dashboard" && <div className="reveal">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-500">{todayWords()}</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Let&apos;s make today count <span aria-hidden="true">✦</span></h1><p className="mt-2 text-sm text-slate-500">Your schoolwork, organized into one calm place.</p></div><button type="button" onClick={openNew} className="btn-primary inline-flex items-center gap-2"><Plus size={17}/> New assignment</button></div>
          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="To do" value={String(pending.length)} sub="Assignments remaining" icon={FileText}/>
            <StatCard label="Due very soon" value={String(urgent.length)} sub="Today, tomorrow or overdue" icon={CalendarDays} tint="amber"/>
            <StatCard label="Study workload" value={minutesLabel(minutesRemaining)} sub="Estimated time remaining" icon={Clock3} tint="sky"/>
            <StatCard label="Completed" value={progress + "%"} sub={completed + " of " + tasks.length + " assignments"} icon={CheckCircle2} tint="emerald"/>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
            <section className="surface-card p-5 sm:p-6"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-slate-800">Your priorities</h2><p className="mt-1 text-xs text-slate-400">Sorted by urgency and importance</p></div><button type="button" onClick={() => navigate("Assignments")} className="flex items-center gap-1 text-xs font-bold text-indigo-600">View all <ArrowRight size={14}/></button></div>
              {pending.length ? pending.slice(0,5).map((task) => <AssignmentRow key={task.id} task={task} onToggle={toggleTask} onEdit={openEdit} onDelete={deleteTask}/>) : <EmptyState title="All caught up!" description="Your assignments are complete. Add another when you're ready." icon={CheckCircle2} action={<button className="btn-soft" onClick={openNew}>Add assignment</button>}/>}
            </section>
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#080f2b] via-[#141b49] to-[#28135b] p-5 text-white shadow-lg shadow-indigo-200/50 sm:p-6">
                <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl"/>
                <AnimatedSnapPlanLogo compact className="relative z-10" />
                <div className="relative z-10 mt-3 text-xl font-extrabold">Turn chaos into clarity.</div><p className="relative z-10 mt-2 text-sm leading-relaxed text-indigo-100">Upload a photo of your homework and turn it into an organized task.</p>
                <button type="button" onClick={() => navigate("Scan assignment")} className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-50"><Camera size={17}/> Scan assignment <ArrowRight size={16}/></button>
              </div>
              <div className="surface-card p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="font-extrabold">Weekly progress</h2><Badge tint="green">{progress}%</Badge></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all" style={{ width: progress + "%" }}/></div><p className="mt-3 text-xs text-slate-500">You&apos;ve finished <strong>{completed}</strong> of <strong>{tasks.length}</strong> assignments. Keep building momentum!</p></div>
            </div>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">{[
            { title: "Plan your day", sub: "Build a realistic study schedule", icon: CalendarDays, target: "Study planner" as Page },
            { title: "Study smarter", sub: "Find videos for your current topics", icon: BookOpen, target: "Resources" as Page },
            { title: "Find your focus", sub: "Start a distraction-free work session", icon: Focus, target: "Focus mode" as Page },
          ].map(({title,sub,icon:Icon,target})=><button type="button" key={title} onClick={() => navigate(target)} className="surface-card flex items-center gap-3 p-5 text-left transition hover:border-indigo-200 hover:shadow-md"><div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Icon size={21}/></div><div className="flex-1"><div className="font-bold">{title}</div><p className="mt-1 text-xs text-slate-400">{sub}</p></div><ArrowRight size={17} className="text-slate-400"/></button>)}</div>
        </div>}

        {page === "Assignments" && <div className="reveal">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-extrabold">Assignments</h1><p className="mt-2 text-sm text-slate-500">One organized view of everything on your plate.</p></div><button type="button" onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={17}/> Add assignment</button></div>
          <div className="surface-card overflow-hidden p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap gap-3"><div className="relative min-w-[210px] flex-1"><Search size={18} className="absolute left-3 top-3 text-slate-400"/><input className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assignments..."/></div><div className="flex items-center gap-2 text-slate-400"><Filter size={16}/><select aria-label="Filter by class" className="input-field max-w-[185px]" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}><option>All classes</option>{courseOptions.map(c=><option key={c}>{c}</option>)}</select></div><select aria-label="Filter by status" className="input-field max-w-[135px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option>All</option><option>Incomplete</option><option>Complete</option></select></div>
            <div className="mb-3 text-sm font-semibold text-slate-500">Showing {list.length} of {tasks.length} assignments</div>
            {list.length ? list.map((task)=><AssignmentRow key={task.id} task={task} onToggle={toggleTask} onEdit={openEdit} onDelete={deleteTask}/>) : <EmptyState title="No assignments found" description="Try changing your filters, or add something new." icon={FileText} action={<button className="btn-soft" onClick={openNew}>Add assignment</button>}/>}
          </div>
        </div>}

        {page === "Scan assignment" && <div className="reveal">
          <div className="mb-7"><Badge tint="violet"><Sparkles className="mr-1" size={12}/> Photo-to-task workflow</Badge><h1 className="mt-3 text-3xl font-extrabold">Scan an assignment</h1><p className="mt-2 text-sm text-slate-500">Capture your worksheet, notes, or rubric, then review the details before saving.</p></div>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="surface-card p-6"><h2 className="text-lg font-extrabold">1. Upload your photo</h2><p className="mt-1 text-xs text-slate-400">JPG, PNG, or WebP • up to 4 MB. Avoid uploading names, grades, or personal details.</p>
              <input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" id="scan-upload" onChange={(e) => onUpload(e.target.files?.[0])}/>
              <label htmlFor="scan-upload" className="mt-5 flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-5 text-center hover:bg-indigo-50">
                {uploadPreview ? <><img src={uploadPreview} alt="Uploaded assignment preview" className="max-h-[240px] w-full object-contain"/><span className="mt-3 text-xs font-semibold text-indigo-600">{scanName} • click to change</span></> : <><div className="rounded-2xl bg-white p-4 text-indigo-600 shadow-sm"><UploadCloud size={31}/></div><div className="mt-4 font-bold">Click to upload an assignment</div><div className="mt-2 text-sm text-slate-400">Worksheets, rubrics, notes, or whiteboards</div></>}
              </label>
              <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={!uploadPreview || scanning} className="btn-primary flex items-center gap-2" onClick={() => void scanImage()}><WandSparkles size={17}/>{scanning ? "Analyzing..." : "Analyze image with AI"}</button><button type="button" className="btn-soft" onClick={() => { setScanDraft({ ...emptyDraft(), dueDate: "" }); setScanMessage("Enter the assignment information manually and save when ready.") }}>Enter manually</button></div>
              {scanMessage && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{scanMessage}</p>}
              <div className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle size={18} className="shrink-0"/><p>AI extraction needs a server API key. Without it, manual entry still works. Never trust a guessed due date—double-check everything.</p></div>
            </section>
            <section className="surface-card p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold">2. Review &amp; save</h2><p className="mt-1 text-xs text-slate-400">You control what gets saved, even when AI is enabled.</p></div><Badge tint="green">Editable</Badge></div>
              <form onSubmit={(e) => { e.preventDefault(); if (!scanDraft.title.trim()) { setScanMessage("Enter a title before saving."); return } saveDraft(scanDraft); setUploadPreview(null); setScanMessage("") }}>
                {fieldForm(scanDraft, updateScanField)}
                <button type="submit" className="btn-primary mt-6 flex w-full items-center justify-center gap-2"><Save size={17}/> Save to my assignments</button>
              </form>
            </section>
          </div>
        </div>}

        {page === "Study planner" && <div className="reveal">
          <div className="mb-7"><Badge tint="violet"><Sparkles className="mr-1" size={12}/> Smart scheduling</Badge><h1 className="mt-3 text-3xl font-extrabold">Make time for what matters.</h1><p className="mt-2 text-sm text-slate-500">Build a study plan that respects your actual available time.</p></div>
          <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
            <section className="surface-card p-6"><h2 className="text-lg font-extrabold">Your availability</h2><p className="mt-1 text-sm text-slate-500">Tell SnapPlan when you can study.</p>
              <label className="mt-6 block text-sm font-semibold">Starting at<input type="time" className="input-field mt-2" value={startTime} onChange={(e) => { setStartTime(e.target.value); setPlanMade(false) }}/></label>
              <label className="mt-5 block text-sm font-semibold">Available study time</label><div className="mt-3 grid grid-cols-3 gap-2">{[60,90,120,180,240,300].map((minutes)=><button type="button" onClick={() => { setAvailableMinutes(minutes); setPlanMade(false) }} key={minutes} className={"rounded-xl border px-3 py-3 text-sm font-bold " + (availableMinutes === minutes ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>{minutesLabel(minutes)}</button>)}</div>
              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><div className="flex justify-between"><span>Unfinished work</span><strong>{minutesLabel(minutesRemaining)}</strong></div><div className="mt-2 flex justify-between"><span>Your availability</span><strong>{minutesLabel(availableMinutes)}</strong></div></div>
              <button type="button" className="btn-primary mt-6 flex w-full items-center justify-center gap-2" onClick={() => setPlanMade(true)}><CalendarDays size={18}/> Generate my study plan</button>
            </section>
            <section className="surface-card p-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold">Today&apos;s schedule</h2>{planMade && <Badge tint="violet">{plan.blocks.length} blocks</Badge>}</div>
              {!planMade ? <EmptyState title="Your plan is one click away" description="Pick a time and generate a schedule based on your real assignments." icon={CalendarDays}/> :
                !plan.blocks.length ? <EmptyState title="No study blocks needed" description="Add an unfinished assignment to make a plan." icon={CheckCircle2}/> :
                <div className="space-y-3">{plan.blocks.map((block,index)=><div key={block.assignmentId + "-" + index} className={"flex gap-4 rounded-2xl p-4 " + (block.kind === "break" ? "bg-emerald-50/70" : "bg-indigo-50/60")}>
                  <div className="w-24 shrink-0 text-xs font-bold text-slate-500">{block.from}–{block.to}</div><div className="flex-1"><div className="text-sm font-bold text-slate-800">{block.title}</div><div className="mt-1 text-xs text-slate-500">{block.course} • {minutesLabel(block.minutes)}</div></div><span className={"h-2 w-2 rounded-full " + (block.kind === "break" ? "bg-emerald-500" : "bg-indigo-500")}/></div>)}</div>
              }
              {planMade && <><div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">Scheduled study</span><strong>{minutesLabel(plan.workMinutes)}</strong></div>{plan.overflowMinutes > 0 && <div className="mt-3 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle size={18} className="mt-0.5 shrink-0"/><div><strong>{minutesLabel(plan.overflowMinutes)} left unscheduled.</strong><p className="mt-1">You need more time or fewer tasks. Nothing has been hidden from your workload.</p></div></div>}{plan.blocks.length > 0 && <p className="mt-4 text-xs leading-relaxed text-slate-500"><Lightbulb size={14} className="mr-1 inline text-indigo-500"/>Tasks are ordered by deadline and priority, split into manageable blocks, and include breaks when time permits.</p>}</>}
            </section>
          </div>
        </div>}

        {page === "Resources" && <div className="reveal">
          <div className="mb-7"><Badge tint="violet"><GraduationCap className="mr-1" size={12}/> Study support</Badge><h1 className="mt-3 text-3xl font-extrabold">Learn what you need, faster.</h1><p className="mt-2 text-sm text-slate-500">Search educational videos that match the topics in your assignments.</p></div>
          <section className="surface-card p-6"><form onSubmit={(e) => { e.preventDefault(); void lookupVideos(resourceTopic) }} className="flex flex-wrap gap-3"><div className="relative min-w-[230px] flex-1"><Search size={19} className="absolute left-3 top-3 text-slate-400"/><input aria-label="Study topic" className="input-field pl-10" placeholder="e.g. Chain rule derivatives" value={resourceTopic} onChange={(e) => setResourceTopic(e.target.value)}/></div><button type="submit" className="btn-primary flex items-center gap-2" disabled={videoLoading}><Search size={16}/>{videoLoading ? "Finding..." : "Find videos"}</button></form>
            <div className="mt-5 flex flex-wrap gap-2"><span className="self-center text-xs font-semibold text-slate-400">From your work:</span>{pending.filter((t)=>t.topic).slice(0,4).map((task)=><button key={task.id} type="button" className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100" onClick={() => { setResourceTopic(task.topic); void lookupVideos(task.topic) }}>{task.topic}</button>)}</div>
            {videoMessage && <p role="status" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{videoMessage}</p>}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">{videoItems.map((video)=><a href={video.url} key={video.id} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/30"><div className="rounded-xl bg-red-50 p-3 text-red-600"><Play size={21}/></div><div className="flex-1"><div className="text-sm font-bold text-slate-800">{video.title}</div><p className="mt-2 text-xs text-slate-500">{video.channel} • YouTube</p></div><ExternalLink size={15} className="text-slate-400"/></a>)}</div>
            {!videoItems.length && !videoLoading && !videoMessage && <EmptyState title="Your next lesson is here" description="Enter a topic or select one from your assignments to discover relevant videos." icon={BookOpen}/>}
            <a href={"https://www.youtube.com/results?search_query=" + encodeURIComponent(resourceTopic + " tutorial")} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline">Search YouTube for this topic <ExternalLink size={14}/></a>
            <p className="mt-4 text-xs text-slate-400">Video results come from YouTube when configured. Search matches are not endorsements or verified lesson quality.</p>
          </section>
        </div>}

        {page === "Focus mode" && <div className="reveal">
          <div className="mb-7"><Badge tint="violet"><Timer className="mr-1" size={12}/> Deep work</Badge><h1 className="mt-3 text-3xl font-extrabold">Make room for focus.</h1><p className="mt-2 text-sm text-slate-500">A little uninterrupted time goes a long way.</p></div>
          <div className="mx-auto max-w-2xl surface-card p-7 text-center sm:p-10"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Focus size={27}/></div><h2 className="text-xl font-bold">Focus session</h2><p className="mt-1 text-sm text-slate-400">Choose your task and hit start.</p>
            <label className="mx-auto mt-6 block max-w-sm text-left text-xs font-semibold text-slate-500">Working on<select className="input-field mt-2" value={focusTask} onChange={(e) => setFocusTask(e.target.value)}><option value="">General study session</option>{pending.map((task)=><option key={task.id} value={task.id}>{task.title}</option>)}</select></label>
            <div role="timer" className="my-8 text-6xl font-black tabular-nums tracking-tight text-slate-900 sm:text-7xl">{String(Math.floor(focusSeconds / 60)).padStart(2,"0")}:{String(focusSeconds % 60).padStart(2,"0")}</div>
            <div className="mb-6 flex flex-wrap justify-center gap-2">{[15,25,45].map((minutes)=><button type="button" disabled={focusRunning} key={minutes} onClick={() => setFocusSeconds(minutes*60)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600">{minutes} min</button>)}</div>
            <div className="flex items-center justify-center gap-3"><button type="button" onClick={() => { if (focusSeconds === 0) setFocusSeconds(25*60); setFocusRunning((v)=>!v) }} className="btn-primary flex min-w-[140px] items-center justify-center gap-2"><Play size={17}/>{focusRunning ? "Pause" : "Start focus"}</button><button type="button" aria-label="Reset timer" onClick={() => { setFocusRunning(false); setFocusSeconds(25*60) }} className="btn-soft flex items-center gap-2"><RotateCcw size={16}/> Reset</button></div>
            <p className="mt-8 text-xs text-slate-400">You&apos;re practicing the skill of managing your attention—not racing the clock.</p>
          </div>
        </div>}

        {page === "Settings" && <div className="reveal">
          <div className="mb-7"><h1 className="text-3xl font-extrabold">Workspace settings</h1><p className="mt-2 text-sm text-slate-500">Manage your demo data and understand how SnapPlan handles it.</p></div>
          <section className="surface-card max-w-2xl p-6"><h2 className="text-lg font-bold">Your local workspace</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">This first build stores tasks in your current browser&apos;s local storage. It does not sync between devices or provide user accounts yet. Don&apos;t upload sensitive information in the demo.</p>
            <div className="mt-5 flex flex-wrap gap-3"><button type="button" className="btn-soft" onClick={() => { setTasks(sampleAssignments()); setPlanMade(false) }}>Restore sample assignments</button><button type="button" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100" onClick={() => { if (window.confirm("Delete all saved assignments from this browser?")) setTasks([]) }}>Delete my local assignments</button></div>
          </section>
          <section className="surface-card mt-5 max-w-2xl p-6"><h2 className="text-lg font-bold">What&apos;s live?</h2><div className="mt-4 space-y-3 text-sm text-slate-600">{[
            ["Assignments and organization", "Working in-browser"],
            ["Scheduling and focus timer", "Working in-browser"],
            ["Animated SnapPlan logo", "Available at /logo-demo"],
            ["Photo-to-assignment AI", "Needs OPENAI_API_KEY"],
            ["Live educational video matches", "Needs YOUTUBE_API_KEY"],
            ["Account sign-in and cloud sync", "Planned for next milestone"]
          ].map(([feature,status])=><div key={feature} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"><span>{feature}</span><Badge tint={status.startsWith("Working") || status.startsWith("Available") ? "green" : "amber"}>{status}</Badge></div>)}</div></section>
          <Link href="/logo-demo" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600">Watch the animated logo <ArrowRight size={16}/></Link>
        </div>}
      </main>
      <footer className="mx-auto flex max-w-[1250px] flex-wrap justify-between gap-2 px-5 pb-8 text-xs text-slate-400 sm:px-9"><span>SnapPlan • Scan. Organize. Focus. Learn.</span><span>TSA Software Development • MVP demo</span></footer>
    </div>
    {showModal && <Modal title={editingId ? "Edit assignment" : "Add assignment"} onClose={() => setShowModal(false)}>
      <form onSubmit={(event) => { event.preventDefault(); saveDraft(draft, editingId) }}>{fieldForm(draft, updateDraftField)}<div className="mt-6 flex justify-end gap-3"><button type="button" className="btn-soft" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-primary flex items-center gap-2"><Check size={16}/>{editingId ? "Save changes" : "Add assignment"}</button></div></form>
    </Modal>}
  </div>
}
