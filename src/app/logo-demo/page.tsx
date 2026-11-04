"use client"

import { AnimatedSnapPlanLogo } from "@/components/branding/animated-snapplan-logo"
import Link from "next/link"

export default function LogoDemoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_10%,#292265_0%,#0d1635_42%,#060c20_90%)] px-6 py-10 text-white">
      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/[.025] px-5 py-8 shadow-[0_24px_100px_#0007] sm:px-10">
        <AnimatedSnapPlanLogo />
      </div>
      <p className="mt-8 text-center text-sm text-indigo-200/80">A real animation in your SnapPlan website — not a static image.</p>
      <Link href="/" className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50">Back to dashboard</Link>
    </main>
  )
}
