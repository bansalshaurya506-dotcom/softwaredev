"use client"

import { useState } from "react"
import { RotateCcw } from "lucide-react"

type AnimatedSnapPlanLogoProps = {
  compact?: boolean
  className?: string
}

export function AnimatedSnapPlanLogo({ compact = false, className = "" }: AnimatedSnapPlanLogoProps) {
  const [replay, setReplay] = useState(0)

  return (
    <div className={"snapplan-cinematic " + (compact ? "snapplan-cinematic-compact " : "") + className}>
      <div key={replay} className="snapplan-cinematic-scene" role="img" aria-label="Animated SnapPlan logo: a glass calendar and checkmark assemble with glowing scan corners and the SnapPlan name">
        <span className="snapplan-cinematic-halo" aria-hidden="true" />
        <span className="snapplan-cinematic-orbit" aria-hidden="true" />
        <span className="snapplan-cinematic-orbit snapplan-cinematic-orbit-alt" aria-hidden="true" />
        <span className="snapplan-cinematic-shard snapplan-cinematic-shard-1" aria-hidden="true" />
        <span className="snapplan-cinematic-shard snapplan-cinematic-shard-2" aria-hidden="true" />
        <span className="snapplan-cinematic-shard snapplan-cinematic-shard-3" aria-hidden="true" />
        <div className="snapplan-cinematic-symbol">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="snapplan-glass-body" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8fbeff" stopOpacity=".7"/>
                <stop offset="50%" stopColor="#4d6ee0" stopOpacity=".29"/>
                <stop offset="100%" stopColor="#a25cff" stopOpacity=".58"/>
              </linearGradient>
              <linearGradient id="snapplan-glass-rim" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#d6f8ff"/>
                <stop offset="48%" stopColor="#3ae2ff"/>
                <stop offset="100%" stopColor="#9e69ff"/>
              </linearGradient>
              <linearGradient id="snapplan-check-gradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#3feecf"/>
                <stop offset="100%" stopColor="#81ffd8"/>
              </linearGradient>
              <filter id="snapplan-neon-glow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g className="snapplan-cinematic-calendar">
              <rect x="38" y="45" width="124" height="125" rx="22" fill="url(#snapplan-glass-body)" stroke="url(#snapplan-glass-rim)" strokeWidth="4"/>
              <path d="M40 84H160" stroke="#b4d9ff" strokeOpacity=".95" strokeWidth="3"/>
              <path d="M70 35V57 M130 35V57" stroke="#d5eeff" strokeWidth="12" strokeLinecap="round"/>
              <path d="M70 35V57 M130 35V57" stroke="#679fff" strokeWidth="5" strokeLinecap="round"/>
              <rect x="58" y="102" width="21" height="21" rx="5" fill="#c2d9ff" opacity=".45"/>
              <rect x="88" y="102" width="21" height="21" rx="5" fill="#c2d9ff" opacity=".25"/>
              <rect x="58" y="133" width="21" height="21" rx="5" fill="#c2d9ff" opacity=".26"/>
            </g>
            <path className="snapplan-cinematic-check" d="M89 132L111 151L151 110" fill="none" stroke="url(#snapplan-check-gradient)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" filter="url(#snapplan-neon-glow)"/>
            <g className="snapplan-cinematic-corners" fill="none" stroke="#79e7ff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter="url(#snapplan-neon-glow)">
              <path d="M23 57V25Q23 19 29 19H59"/>
              <path d="M141 19H171Q177 19 177 25V57"/>
              <path d="M23 143V175Q23 181 29 181H59"/>
              <path d="M141 181H171Q177 181 177 175V143"/>
            </g>
          </svg>
          <span className="snapplan-cinematic-glint" aria-hidden="true"/>
        </div>
        <div className="snapplan-cinematic-wordmark" aria-hidden="true">
          <span>Snap</span><span>Plan</span>
        </div>
        <div className="snapplan-cinematic-tagline" aria-hidden="true">Scan. Organize. Focus. Learn.</div>
      </div>
      <button type="button" className="snapplan-cinematic-replay" onClick={() => setReplay((value) => value + 1)}>
        <RotateCcw size={13} aria-hidden="true" /> Replay logo
      </button>
    </div>
  )
}
