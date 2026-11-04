"use client"

import { useState } from "react"
import Image from "next/image"

type SnapPlanGlassLogoProps = {
  className?: string
  background?: string
  tileSize?: number
  loop?: boolean
  speed?: number
}

/** Accessible glass-style reveal of SnapPlan's original calendar checkmark mark. */
export function SnapPlanGlassLogo({ className = "", background = "#f4f5fa", tileSize = 260, loop = false, speed = 1 }: SnapPlanGlassLogoProps) {
  const [round, setRound] = useState(0)
  const dimension = Math.min(tileSize * .64, 165)
  return (
    <div
      role="img"
      aria-label="Animated SnapPlan calendar and checkmark logo"
      className={"snapplan-glass relative isolate cursor-pointer overflow-hidden select-none " + className}
      style={{ backgroundColor: background, animationDuration: (3 / Math.max(.25, speed)) + "s" }}
      onClick={() => setRound((old) => old + 1)}
      title="Click to replay"
    >
      <div key={round} className={"absolute inset-0 grid place-items-center " + (loop ? "snapplan-glass-loop" : "")}>
        <div className="snapplan-glass-tile absolute rounded-[27%] border border-white/60 shadow-[0_25px_70px_#595be72b,inset_1px_3px_12px_#ffffffdd,inset_-5px_-10px_25px_#7e82f13d] backdrop-blur-lg" style={{ width: dimension, height: dimension, background: "linear-gradient(140deg,rgba(255,255,255,.8),rgba(153,166,255,.2))" }}/>
        <div className="snapplan-glass-mark relative z-10">
          <Image src="/snapplan-mark.svg" width={138} height={138} alt="" priority />
        </div>
        <div className="snapplan-glass-flare pointer-events-none absolute h-28 w-32 -rotate-45 bg-white/70 blur-xl" />
      </div>
    </div>
  )
}
export default SnapPlanGlassLogo
