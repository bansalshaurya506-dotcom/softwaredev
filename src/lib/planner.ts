export type Priority = "High" | "Medium" | "Low"

export interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  priority: Priority
  estimatedMinutes: number
  topic: string
  completed: boolean
  actualMinutes?: number
}

export interface StudyBlock {
  assignmentId: string
  title: string
  course: string
  from: string
  to: string
  minutes: number
  kind: "work" | "break"
}
const pad = (n: number) => String(n).padStart(2, "0")
export function dateKey(offset = 0) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-")
}
export function daysUntil(date: string) {
  const today = new Date(dateKey() + "T12:00:00").getTime()
  const target = new Date(date + "T12:00:00").getTime()
  return Math.round((target - today) / 86400000)
}
export function dueLabel(date: string) {
  if (!date) return "No due date"
  const days = daysUntil(date)
  if (!Number.isFinite(days)) return "Date not set"
  if (days < 0) return "Overdue"
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  return new Date(date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
export function prioritySort(a: Assignment, b: Assignment) {
  const daysA = a.dueDate ? daysUntil(a.dueDate) : 999
  const daysB = b.dueDate ? daysUntil(b.dueDate) : 999
  const weightedA = daysA * 2 + ({ High: 0, Medium: 3, Low: 6 }[a.priority])
  const weightedB = daysB * 2 + ({ High: 0, Medium: 3, Low: 6 }[b.priority])
  return weightedA - weightedB
}
export function minutesLabel(total: number) {
  const h = Math.floor(total / 60)
  const m = total % 60
  return h ? (m ? h + "h " + m + "m" : h + "h") : m + "m"
}
export function sampleAssignments(): Assignment[] {
  return [
    { id: "demo-1", title: "Chain rule practice worksheet", course: "AP Calculus", dueDate: dateKey(1), priority: "High", estimatedMinutes: 50, topic: "Chain rule derivatives", completed: false },
    { id: "demo-2", title: "Rhetorical analysis paragraph", course: "AP Language", dueDate: dateKey(2), priority: "High", estimatedMinutes: 45, topic: "Rhetorical analysis and commentary", completed: false },
    { id: "demo-3", title: "Population ecology review", course: "AP Environmental Science", dueDate: dateKey(3), priority: "Medium", estimatedMinutes: 35, topic: "Population ecology growth curves", completed: false },
    { id: "demo-4", title: "Review project milestone", course: "TSA Software Development", dueDate: dateKey(5), priority: "Medium", estimatedMinutes: 30, topic: "Project planning", completed: false },
    { id: "demo-5", title: "Spanish vocabulary flashcards", course: "Spanish", dueDate: dateKey(0), priority: "Low", estimatedMinutes: 20, topic: "Spanish vocabulary", completed: true, actualMinutes: 17 },
  ]
}
const clock = (total: number) => {
  const value = total % 1440
  return pad(Math.floor(value / 60)) + ":" + pad(value % 60)
}
export function generateStudyPlan(tasks: Assignment[], startTime: string, availableMinutes: number) {
  const pending = tasks.filter((t) => !t.completed).sort(prioritySort)
  const minutes = Math.max(0, Math.min(720, availableMinutes))
  const parts = startTime.split(":").map(Number)
  let cursor = (parts[0] || 0) * 60 + (parts[1] || 0)
  let remaining = minutes
  let workMinutes = 0
  let workSessions = 0
  const blocks: StudyBlock[] = []
  for (const task of pending) {
    let taskLeft = Math.max(1, task.estimatedMinutes)
    while (taskLeft > 0 && remaining > 0) {
      if (workSessions > 0 && workSessions % 2 === 0 && remaining > 10) {
        const length = Math.min(10, remaining)
        blocks.push({ assignmentId: "", title: "Reset & recharge", course: "Break", from: clock(cursor), to: clock(cursor + length), minutes: length, kind: "break" })
        cursor += length
        remaining -= length
      }
      const length = Math.min(taskLeft, 40, remaining)
      if (length <= 0) break
      blocks.push({ assignmentId: task.id, title: task.title, course: task.course, from: clock(cursor), to: clock(cursor + length), minutes: length, kind: "work" })
      cursor += length
      remaining -= length
      taskLeft -= length
      workMinutes += length
      workSessions++
    }
  }
  const totalWork = pending.reduce((sum, t) => sum + Math.max(1, t.estimatedMinutes), 0)
  return { blocks, workMinutes, totalWork, overflowMinutes: Math.max(0, totalWork - workMinutes) }
}
