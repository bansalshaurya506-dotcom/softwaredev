"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, Brain, Check, ChevronRight, CircleHelp, Clock3, Fingerprint,
  GraduationCap, Hand, Headphones, Lightbulb, Menu, Mic2, MousePointer2, Orbit, Play, RotateCcw, ScanEye,
  Send, Sparkles, Volume2, WandSparkles, Zap,
} from "lucide-react"
import SnappyInputs from "@/components/snappy-inputs"
import { LESSONS, findLesson, type Lesson } from "@/lib/snappy-lessons"

type Screen = "home" | "studio" | "library" | "progress"
type Pointer = { x: number; y: number; visible: boolean }
const TOTAL_CONCEPTS = LESSONS.reduce((sum, lesson) => sum + lesson.concepts.length, 0)

function SnappyLogo({ compact = false }: { compact?: boolean }) {
  return <div className={"sn-brand " + (compact ? "sn-brand-compact" : "")}>
    <span className="sn-brand-icon">
      <svg viewBox="0 0 48 48" role="img" aria-label="Snappy emblem">
        <path d="M17 28V15a3 3 0 0 1 6 0v8-13a3 3 0 0 1 6 0v15-10a3 3 0 0 1 6 0v13l-1 7a9 9 0 0 1-9 8h-1a9 9 0 0 1-7-4l-7-10a3 3 0 0 1 5-4l4 5" fill="none" stroke="#10232c" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M39 6l1.5-3m-1.5 12 3 1m-8-12-2-3" stroke="#10232c" strokeWidth="2.7" strokeLinecap="round"/>
      </svg>
    </span>
    {!compact && <span>snappy<span className="sn-brand-dot">.</span></span>}
  </div>
}

function LessonArt({ lesson }: { lesson: Lesson }) {
  if (lesson.id === "cell") return (
    <svg viewBox="0 0 600 360" className="sn-lesson-art" aria-hidden="true">
      <defs>
        <radialGradient id="sn-cell-body"><stop stopColor="#2FCB9E" stopOpacity=".3"/><stop offset="1" stopColor="#0F9E91" stopOpacity=".09"/></radialGradient>
        <linearGradient id="sn-mito" x1="0" x2="1"><stop stopColor="#77EDCC"/><stop offset="1" stopColor="#21C8B5"/></linearGradient>
      </defs>
      <ellipse cx="300" cy="180" rx="218" ry="142" fill="url(#sn-cell-body)" stroke="#64E5C4" strokeWidth="3" className="sn-cell-outline"/>
      <ellipse cx="300" cy="180" rx="205" ry="130" fill="none" stroke="#6BDAE3" strokeOpacity=".2" strokeWidth="2" strokeDasharray="7 12"/>
      <g className="sn-breathe">
        <circle cx="300" cy="151" r="69" fill="#8B82ED" fillOpacity=".16" stroke="#A9A0F8" strokeWidth="3"/>
        <circle cx="300" cy="151" r="47" fill="#AA9DFF" fillOpacity=".16" stroke="#C5BAFF" strokeWidth="2"/>
        <circle cx="311" cy="153" r="16" fill="#E5D7FF" fillOpacity=".64"/>
      </g>
      <g transform="translate(178 235) rotate(-16)" className="sn-drift-a">
        <rect x="-38" y="-20" width="76" height="40" rx="20" fill="url(#sn-mito)" fillOpacity=".35" stroke="#9AF8D5" strokeWidth="2.7"/>
        <path d="M-28 0q10-26 18 0t20 0t19 0" fill="none" stroke="#BBFFDF" strokeWidth="3"/>
      </g>
      <g transform="translate(407 221) rotate(31)" className="sn-drift-b">
        <rect x="-26" y="-15" width="52" height="30" rx="15" fill="#6FF2D5" fillOpacity=".24" stroke="#83EECF" strokeWidth="2"/>
        <path d="M-18 0q9-18 17 0t17 0" fill="none" stroke="#B9FFE8" strokeWidth="2.2"/>
      </g>
      <path d="M221 94q-12-11-26-8m158 152q24 7 34-12" stroke="#BAF7E8" strokeWidth="4" strokeLinecap="round" opacity=".65" fill="none"/>
      {[[138,173],[244,270],[395,105],[464,169],[355,74],[251,103]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%2?5:3} fill="#A4F6DA" opacity=".65" className="sn-speckle"/>)}
    </svg>
  )
  if (lesson.id === "space") return (
    <svg viewBox="0 0 600 360" className="sn-lesson-art" aria-hidden="true">
      <defs><radialGradient id="sn-sun"><stop stopColor="#FFF8D7"/><stop offset=".6" stopColor="#FFCB6D"/><stop offset="1" stopColor="#F48B75"/></radialGradient><linearGradient id="sn-earth" x1="0" x2="1"><stop stopColor="#57CBE6"/><stop offset="1" stopColor="#566DDA"/></linearGradient></defs>
      <ellipse cx="290" cy="181" rx="224" ry="115" transform="rotate(-12 290 181)" fill="none" stroke="#A9C2FF" strokeOpacity=".38" strokeDasharray="5 12" strokeWidth="2"/>
      <ellipse cx="290" cy="181" rx="159" ry="78" transform="rotate(-12 290 181)" fill="none" stroke="#A9C2FF" strokeOpacity=".17" strokeWidth="2"/>
      <circle cx="156" cy="172" r="60" fill="url(#sn-sun)" className="sn-breathe" style={{filter:"drop-shadow(0 0 28px #ffb96065)"}}/>
      <circle cx="366" cy="198" r="36" fill="url(#sn-earth)" className="sn-drift-a"/>
      <path d="M352 172q18 6 12 23t19 16q-8 14-24 12q-24-23-19-38z" fill="#85E7C6" opacity=".9"/>
      <circle cx="474" cy="140" r="19" fill="#C9CEE4" className="sn-drift-b"/>
      <path d="M463 128a10 10 0 1 1 18 10" fill="#A3AFD6" opacity=".6"/>
      {[[92,83],[276,61],[501,90],[527,253],[231,257],[460,289],[349,87]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%3===0?2.5:1.5} fill="#EAF4FF" opacity=".7" className="sn-speckle"/>)}
    </svg>
  )
  return (
    <svg viewBox="0 0 600 360" className="sn-lesson-art" aria-hidden="true">
      <defs><linearGradient id="sn-block" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFC779"/><stop offset="1" stopColor="#FF9679"/></linearGradient></defs>
      <path d="M80 276H530" stroke="#A9B3D2" strokeWidth="5" strokeLinecap="round"/>
      <g className="sn-breathe"><rect x="245" y="167" width="113" height="106" rx="16" fill="url(#sn-block)" fillOpacity=".8" stroke="#FFE6BF" strokeWidth="3"/><path d="M270 185h60" stroke="#FFEDD0" strokeWidth="4" strokeLinecap="round" opacity=".7"/></g>
      <path d="M301 158V91" stroke="#98E5FF" strokeWidth="6" strokeLinecap="round" className="sn-force-line"/><path d="M286 112l15-24 15 24" stroke="#98E5FF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M301 279V335" stroke="#FFCE8B" strokeWidth="6" strokeLinecap="round" className="sn-force-line"/><path d="M286 313l15 24 15-24" stroke="#FFCE8B" strokeWidth="6" strokeLinejoin="round" fill="none"/>
      <path d="M233 221H137" stroke="#95F0CF" strokeWidth="6" strokeLinecap="round" className="sn-force-line"/><path d="M157 206l-24 15 24 15" stroke="#95F0CF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="301" cy="91" r="7" fill="#BAF2FF"/><circle cx="301" cy="335" r="7" fill="#FFE6C0"/><circle cx="137" cy="221" r="7" fill="#BCFFE3"/>
    </svg>
  )
}

function InteractiveStage({ lesson, current, hovered, pointer, onSelect, compact = false }: {
  lesson: Lesson; current: string; hovered: string | null; pointer?: Pointer; onSelect: (id: string) => void; compact?: boolean
}) {
  return <div className={"sn-stage " + (compact ? "sn-stage-compact" : "")} style={{"--sn-topic":lesson.accent} as React.CSSProperties}>
    <span className="sn-stage-grid" aria-hidden="true"/>
    <div className="sn-stage-top"><span className="sn-stage-badge"><span className="sn-live-dot"/> INTERACTIVE MODEL</span><span className="sn-stage-level">{lesson.category} / 01</span></div>
    <LessonArt lesson={lesson}/>
    {lesson.concepts.map((concept,index) => <button
      type="button" key={concept.id} aria-label={"Explain " + concept.label} title={concept.label}
      onClick={() => onSelect(concept.id)}
      className={"sn-hotspot " + (concept.id === current ? "sn-hotspot-selected " : "") + (concept.id === hovered ? "sn-hotspot-hover " : "")}
      style={{left:concept.x+"%",top:concept.y+"%", "--sn-delay": (index*.2)+"s"} as React.CSSProperties}>
      <span className="sn-hotspot-ring"/><span className="sn-hotspot-core"/><span className="sn-hotspot-label">{concept.label}</span>
    </button>)}
    {pointer?.visible && <span className="sn-hand-cursor" style={{left:(pointer.x*100)+"%",top:(pointer.y*100)+"%"}} aria-hidden="true"><MousePointer2 size={22}/><span>YOU</span></span>}
    <div className="sn-stage-bottom"><span><Hand size={14}/> Tap, point or pinch</span><span>{lesson.concepts.length} discovery points <Sparkles size={14}/></span></div>
  </div>
}

function LessonCard({ lesson, onClick, progress }: { lesson: Lesson; onClick: () => void; progress: number }) {
  return <button type="button" className="sn-lesson-card" onClick={onClick} style={{"--sn-topic":lesson.accent} as React.CSSProperties}>
    <div className="sn-card-art"><LessonArt lesson={lesson}/><div className="sn-card-orb"/></div>
    <div className="sn-card-info"><span className="sn-card-category">{lesson.category}</span><h3>{lesson.title}</h3><p>{lesson.tagline}</p>
      <div className="sn-card-footer"><span><Clock3 size={14}/> {lesson.duration}</span><span>{progress ? progress+"/"+lesson.concepts.length+" explored" : "Start exploring"}</span><span className="sn-card-arrow"><ArrowRight size={17}/></span></div>
    </div>
  </button>
}

export default function SnappyApp() {
  const [screen, setScreen] = useState<Screen>("home")
  const [lessonId, setLessonId] = useState("cell")
  const [chosenId, setChosenId] = useState("nucleus")
  const [hoveredId, setHoveredId] = useState<string|null>(null)
  const [pointer, setPointer] = useState<Pointer>({x:0,y:0,visible:false})
  const pointerRef = useRef<Pointer>({x:0,y:0,visible:false})
  const [explored, setExplored] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [question, setQuestion] = useState("")
  const [explanation, setExplanation] = useState("")
  const [aiError, setAiError] = useState("")
  const [busy, setBusy] = useState(false)
  const [voiceNote, setVoiceNote] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [speakEnabled, setSpeakEnabled] = useState(false)
  const lesson = findLesson(lessonId)
  const chosen = lesson.concepts.find((concept)=>concept.id===chosenId) || lesson.concepts[0]
  const progress = Math.round((explored.length/TOTAL_CONCEPTS)*100)
  const exploredFor = useCallback((id:string)=>explored.filter((item)=>item.startsWith(id+":")).length,[explored])

  useEffect(()=>{
    queueMicrotask(() => {
      try {
        const value = localStorage.getItem("snappy-learning-progress")
        if (value) {
          const parsed:unknown = JSON.parse(value)
          if (Array.isArray(parsed)) setExplored(parsed.filter((v):v is string=>typeof v==="string"))
        }
      } catch { /* local storage may be unavailable */ }
      setLoaded(true)
    })
  },[])
  useEffect(()=>{ if(loaded) try {localStorage.setItem("snappy-learning-progress",JSON.stringify(explored))} catch {/* no storage */} },[explored,loaded])

  const selectConcept = useCallback((id:string)=>{
    setChosenId(id); setHoveredId(id); setExplanation(""); setAiError("")
    const key=lesson.id+":"+id
    setExplored((old)=>old.includes(key)?old:[...old,key])
  },[lesson.id])
  const chooseLesson = (id:string)=>{
    const next=findLesson(id);setLessonId(next.id);setChosenId(next.concepts[0].id);setHoveredId(null);setExplanation("");setAiError("");setPointer({x:0,y:0,visible:false});pointerRef.current={x:0,y:0,visible:false}
    setScreen("studio");setMenuOpen(false)
  }
  const go=(target:Screen)=>{setScreen(target);setMenuOpen(false);setAiError("")}
  const nextConcept=useCallback(()=>{
    const index=lesson.concepts.findIndex((concept)=>concept.id===chosenId)
    selectConcept(lesson.concepts[(index+1)%lesson.concepts.length].id)
  },[lesson,chosenId,selectConcept])
  const handlePoint=useCallback((x:number,y:number,visible:boolean)=>{
    pointerRef.current={x,y,visible};setPointer({x,y,visible})
    if(!visible){setHoveredId(null);return}
    const nearest=[...lesson.concepts].sort((a,b)=>Math.hypot(a.x/100-x,a.y/100-y)-Math.hypot(b.x/100-x,b.y/100-y))[0]
    setHoveredId(nearest && Math.hypot(nearest.x/100-x,nearest.y/100-y)<.16 ?nearest.id:null)
  },[lesson])
  const handlePinch=useCallback(()=>{
    const point=pointerRef.current
    const nearest=[...lesson.concepts].sort((a,b)=>Math.hypot(a.x/100-point.x,a.y/100-point.y)-Math.hypot(b.x/100-point.x,b.y/100-point.y))[0]
    if(point.visible && nearest && Math.hypot(nearest.x/100-point.x,nearest.y/100-point.y)<.19)selectConcept(nearest.id)
  },[lesson,selectConcept])
  const handleVoice=useCallback((command:string)=>{
    const value=command.toLowerCase()
    setVoiceNote(command)
    if(value.includes("next") || value.includes("snap")){nextConcept();return}
    if(value.includes("cell") || value.includes("biology")){chooseLesson("cell");return}
    if(value.includes("space") || value.includes("solar")){chooseLesson("space");return}
    if(value.includes("force") || value.includes("physics")){chooseLesson("forces");return}
    if(value.includes("explain")){setExplanation(chosen.detail);selectConcept(chosen.id);return}
    setVoiceNote('Try saying "next", "explain", "biology", "space", or "physics".')
  },[chosen,nextConcept,selectConcept])
  const explainWithAI=async (prompt:string,image?:string)=>{
    if(!prompt.trim() && !image)return
    setBusy(true);setExplanation("");setAiError("")
    try{
      const response=await fetch("/api/explain",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:prompt||"Explain the most important object in this image.",image,lesson:lesson.title,concept:chosen.label})})
      const result:{answer?:string;error?:string}=await response.json()
      if(!response.ok)throw new Error(result.error||"AI explanation is unavailable.")
      setExplanation(result.answer||"No explanation returned.")
      setQuestion("")
    }catch(error){setAiError(error instanceof Error?error.message:"Could not connect to the explanation service.")}
    finally{setBusy(false)}
  }
  const readAloud=()=>{
    if(!("speechSynthesis" in window))return
    window.speechSynthesis.cancel()
    const utterance=new SpeechSynthesisUtterance(explanation||chosen.detail)
    utterance.rate=.95;utterance.lang="en-US"
    window.speechSynthesis.speak(utterance)
    setSpeakEnabled(true)
  }
  const showFeatureCards=[
    { icon:MousePointer2, title:"POINT", subtitle:"Discover with a gesture", text:"Track your index finger to move the on-screen cursor across a live model."},
    { icon:Fingerprint, title:"PINCH", subtitle:"Select what you see", text:"Bring your index finger and thumb together to open an explanation."},
    { icon:Volume2, title:"SNAP", subtitle:"Move the lesson forward", text:"A sharp snap or clap can advance to the next learning point."},
    { icon:Mic2, title:"SAY IT", subtitle:"Learn out loud", text:"Use supported voice commands to explore topics and hear explanations."},
  ]
  const navItems:{id:Screen;label:string}[]=[{id:"home",label:"Discover"},{id:"studio",label:"Live studio"},{id:"library",label:"Explore topics"},{id:"progress",label:"My journey"}]
  const currentLessonMap = useMemo(()=>Object.fromEntries(LESSONS.map((entry)=>[entry.id,exploredFor(entry.id)])),[exploredFor])

  return <div className="sn-app">
    <div className="sn-page-glow" aria-hidden="true"/>
    <header className="sn-topbar">
      <div className="sn-topbar-inner">
        <button type="button" className="sn-logo-button" onClick={()=>go("home")} aria-label="Snappy home"><SnappyLogo/></button>
        <nav className={"sn-nav " + (menuOpen?"sn-nav-open":"")} aria-label="Main navigation">{navItems.map((item)=><button type="button" key={item.id} onClick={()=>go(item.id)} className={screen===item.id?"sn-nav-active":""}>{item.label}</button>)}</nav>
        <div className="sn-topbar-actions"><span className="sn-beta-pill"><span className="sn-live-dot"/> BETA / 01</span><Link href="/planner" className="sn-legacy-link">Open SnapPlan <ArrowRight size={14}/></Link><button type="button" className="sn-mobile-menu" onClick={()=>setMenuOpen((old)=>!old)} aria-label="Toggle navigation"><Menu size={21}/></button></div>
      </div>
    </header>

    <main>
      {screen==="home"&&<>
        <section className="sn-hero sn-reveal">
          <div className="sn-hero-content">
            <span className="sn-hero-kicker"><Sparkles size={15}/> THE NEW WAY TO LEARN IS HERE <span className="sn-kicker-line"/></span>
            <h1>Learning is better<br/>when you <em>move.</em></h1>
            <p className="sn-hero-description">Meet Snappy. Point at a concept. Pinch to discover. Snap to explore. Ask questions out loud. Turn every study session into an experience you can actually interact with.</p>
            <div className="sn-hero-buttons"><button type="button" onClick={()=>go("studio")} className="sn-btn-primary"><span><Play size={17} fill="currentColor"/></span> Enter live studio <ArrowRight size={18}/></button><button type="button" onClick={()=>go("library")} className="sn-btn-outline">Browse lessons <ArrowDownRight size={17}/></button></div>
            <div className="sn-hero-trust"><span className="sn-trust-dots"><i/><i/><i/></span><span>Built for curious minds, not passive scrolling</span></div>
          </div>
          <div className="sn-hero-visual">
            <div className="sn-hero-aura"/><div className="sn-hero-orbit sn-hero-orbit-one"/><div className="sn-hero-orbit sn-hero-orbit-two"/>
            <div className="sn-hero-star sn-hero-star-one">✦</div><div className="sn-hero-star sn-hero-star-two">✧</div>
            <div className="sn-hero-floating sn-float-top"><span className="sn-mini-icon"><Hand size={16}/></span><span>Gesture tracking<br/><strong>Ready to explore</strong></span><span className="sn-online-indicator"/></div>
            <div className="sn-hero-demo-card">
              <div className="sn-hero-demo-top"><span><i/> LIVE LEARNING PREVIEW</span><span>01 / 03</span></div>
              <InteractiveStage lesson={LESSONS[0]} current={chosenId} hovered={null} onSelect={(id)=>{selectConcept(id);go("studio")}} compact/>
              <div className="sn-hero-demo-bottom"><span className="sn-mini-wave"><i/><i/><i/><i/><i/></span><span>Where should we explore?</span><span className="sn-hero-cursor"><MousePointer2 size={19}/></span></div>
            </div>
            <div className="sn-hero-floating sn-float-bottom"><span className="sn-mini-spark"><Sparkles size={17}/></span><span><strong>Learning, unlocked.</strong><small>Tap a glowing discovery point.</small></span></div>
          </div>
        </section>
        <section className="sn-quick-stats sn-reveal"><div><span className="sn-stat-number">04</span><span>Ways to interact</span></div><div><span className="sn-stat-number">03</span><span>Learning worlds</span></div><div><span className="sn-stat-number">09</span><span>Discoverable concepts</span></div><div><span className="sn-stat-icon"><ScanEye size={22}/></span><span>Made for exploration</span></div></section>
        <section className="sn-section sn-section-modes">
          <div className="sn-section-head"><div><span className="sn-eyebrow"><Zap size={15}/> HANDS-ON BY DESIGN</span><h2>Don&apos;t just watch.<br/><span>Get involved.</span></h2></div><p>Four simple ways to turn a lesson into something memorable. Pick the interaction that works for you.</p></div>
          <div className="sn-feature-grid">{showFeatureCards.map((feature,index)=>{const Icon=feature.icon;return <button key={feature.title} type="button" onClick={()=>go("studio")} className="sn-feature-card" style={{"--sn-delay":(index*.13)+"s"} as React.CSSProperties}><span className="sn-feature-number">0{index+1}</span><span className="sn-feature-icon"><Icon size={29} strokeWidth={1.6}/></span><h3>{feature.title}</h3><strong>{feature.subtitle}</strong><p>{feature.text}</p><ArrowRight size={19} className="sn-feature-arrow"/></button>})}</div>
        </section>
        <section className="sn-section sn-section-worlds"><div className="sn-section-head"><div><span className="sn-eyebrow"><Orbit size={15}/> INTERACTIVE LEARNING WORLDS</span><h2>Pick your curiosity.</h2></div><button type="button" onClick={()=>go("library")} className="sn-inline-link">All lessons <ArrowRight size={17}/></button></div>
          <div className="sn-lesson-grid">{LESSONS.map((item)=><LessonCard key={item.id} lesson={item} onClick={()=>chooseLesson(item.id)} progress={currentLessonMap[item.id]||0}/>)}</div>
        </section>
        <section className="sn-bottom-cta"><div className="sn-cta-aura"/><div className="sn-cta-symbol"><SnappyLogo compact/></div><span className="sn-eyebrow">YOUR FIRST DISCOVERY IS ONE CLICK AWAY</span><h2>Ready for your<br/><em>aha moment?</em></h2><p>Try a lesson with your mouse first. Turn on your camera when you&apos;re ready.</p><button type="button" className="sn-btn-primary" onClick={()=>go("studio")}>Launch the studio <ArrowRight size={18}/></button></section>
      </>}

      {screen==="studio"&&<div className="sn-workspace sn-reveal">
        <div className="sn-workspace-top"><div><button type="button" className="sn-back-link" onClick={()=>go("library")}><ArrowLeft size={15}/> ALL WORLDS</button><span className="sn-eyebrow"><span className="sn-live-dot"/> INTERACTIVE LEARNING STUDIO</span><h1>Make learning <em>click.</em></h1><p>Explore with your mouse or touch. Enable your camera to point and pinch.</p></div><div className="sn-workspace-progress"><span className="sn-progress-ring" style={{"--sn-progress":progress+"%"} as React.CSSProperties}>{progress}%</span><span>YOUR DISCOVERY<br/>PROGRESS</span></div></div>
        <div className="sn-topic-tabs">{LESSONS.map((item)=><button key={item.id} type="button" onClick={()=>chooseLesson(item.id)} className={lesson.id===item.id?"sn-topic-active":""}><span className="sn-topic-dot" style={{background:item.accent}}/>{item.category} <ChevronRight size={15}/></button>)}</div>
        <div className="sn-studio-grid">
          <div className="sn-studio-main">
            <div className="sn-stage-heading"><span><ScanEye size={18}/> {lesson.title}</span><span>{lesson.level} • {lesson.duration}</span></div>
            <InteractiveStage lesson={lesson} current={chosen.id} hovered={hoveredId} pointer={pointer} onSelect={selectConcept}/>
            <div className="sn-lesson-nav"><div><span className="sn-eyebrow">DISCOVERY POINTS</span><p>Tap a hotspot or point and pinch to select it.</p></div><div className="sn-concept-pills">{lesson.concepts.map((concept,index)=><button type="button" key={concept.id} onClick={()=>selectConcept(concept.id)} className={chosen.id===concept.id?"sn-concept-active":""}><span>{String(index+1).padStart(2,"0")}</span>{concept.label}</button>)}</div></div>
            <div className="sn-inputs-container"><SnappyInputs onPoint={handlePoint} onPinch={handlePinch} onSnap={nextConcept} onVoice={handleVoice} onCapture={(image)=>void explainWithAI("Identify what is visible in this image and explain one useful concept for a student.",image)}/></div>
          </div>
          <aside className="sn-assistant-panel">
            <div className="sn-assistant-header"><span className="sn-assistant-avatar"><Sparkles size={23}/></span><div><strong>Ask Snappy</strong><span>Your learning companion</span></div><span className="sn-assistant-status">● READY</span></div>
            <div className="sn-assistant-body"><span className="sn-eyebrow">YOU&apos;RE EXPLORING</span><h2>{chosen.label}</h2><span className="sn-assistant-summary">{chosen.summary}</span><p>{explanation||chosen.detail}</p>
              {aiError && <div className="sn-ai-error" role="alert">{aiError}</div>}
              {voiceNote && <div className="sn-assistant-command"><Mic2 size={14}/> {voiceNote}</div>}
              <div className="sn-think-card"><span><Lightbulb size={17}/> THINK ABOUT IT</span><p>{chosen.question}</p></div>
              <div className="sn-assistant-actions"><button type="button" onClick={readAloud}><Headphones size={15}/>{speakEnabled?"Read again":"Read aloud"}</button><button type="button" onClick={nextConcept}>Next discovery <ArrowRight size={15}/></button></div>
            </div>
            <form className="sn-chat-form" onSubmit={(event)=>{event.preventDefault();void explainWithAI(question)}}><label htmlFor="sn-ask" className="sn-eyebrow"><Brain size={14}/> ASK A FOLLOW-UP</label><div className="sn-chat-input"><input id="sn-ask" value={question} onChange={(event)=>setQuestion(event.target.value)} placeholder="Why does that happen?" maxLength={300}/><button type="submit" aria-label="Ask AI" disabled={busy||!question.trim()}><Send size={17}/></button></div><small>Custom AI answers require OPENAI_API_KEY. The interactive lessons work without it.</small></form>
          </aside>
        </div>
        <div className="sn-workspace-footer"><span><CircleHelp size={16}/> Tip: Voice commands work in supported browsers. Try “next” or “explain”.</span><button type="button" onClick={()=>{setChosenId(lesson.concepts[0].id);setHoveredId(null);setExplanation("")}}><RotateCcw size={14}/> Reset lesson</button></div>
      </div>}

      {screen==="library"&&<section className="sn-library-page sn-reveal"><span className="sn-eyebrow"><BookOpen size={15}/> THE LEARNING LIBRARY</span><h1>Explore something <em>new.</em></h1><p>Each world is designed to turn abstract ideas into concepts you can point at, select, and understand.</p><div className="sn-lesson-grid sn-library-grid">{LESSONS.map((item)=><LessonCard key={item.id} lesson={item} onClick={()=>chooseLesson(item.id)} progress={currentLessonMap[item.id]||0}/>)}</div><div className="sn-library-note"><WandSparkles size={21}/><div><strong>Built for how people actually learn.</strong><p>Start with visual interaction. Follow up by asking questions, explaining back, and revisiting the concepts you missed.</p></div><button type="button" onClick={()=>go("studio")}>Open studio <ArrowRight size={15}/></button></div></section>}

      {screen==="progress"&&<section className="sn-progress-page sn-reveal"><span className="sn-eyebrow"><GraduationCap size={16}/> YOUR LEARNING JOURNEY</span><h1>Every discovery <em>counts.</em></h1><p>Track which concepts you&apos;ve opened. Your progress is saved in this browser.</p><div className="sn-progress-summary"><div className="sn-huge-progress">{progress}<span>%</span></div><div><strong>{explored.length} / {TOTAL_CONCEPTS} concepts explored</strong><p>Progress reflects concepts selected, not mastery or test scores.</p><div className="sn-progress-bar"><span style={{width:progress+"%"}}/></div></div></div><div className="sn-progress-list">{LESSONS.map((item)=><button type="button" key={item.id} onClick={()=>chooseLesson(item.id)}><span className="sn-progress-icon" style={{background:item.accent}}><Check size={18}/></span><span className="sn-progress-text"><strong>{item.title}</strong><small>{exploredFor(item.id)} of {item.concepts.length} explored</small></span><span className="sn-progress-mini"><span style={{width:(exploredFor(item.id)/item.concepts.length*100)+"%"}}/></span><ArrowRight size={17}/></button>)}</div><button type="button" className="sn-reset-progress" onClick={()=>{if(window.confirm("Reset your Snappy discovery progress on this browser?"))setExplored([])}}>Reset discovery progress</button></section>}
    </main>
    <footer className="sn-footer"><div><SnappyLogo/><span>Make learning stick.</span></div><p>Snappy is the next chapter after SnapPlan. <Link href="/planner">Original planner</Link> remains available.</p><span>DESIGNED TO DISCOVER © 2026</span></footer>
  </div>
}
