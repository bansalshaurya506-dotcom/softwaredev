"use client"

import { SnapPlanGlassLogo } from "@/components/ui/liquid-glass-logo-reveal"
import { SnapPlanBrand } from "@/components/branding/snapplan-brand"
import Link from "next/link"

export default function LogoDemoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f5fa] px-6 text-slate-900">
      <SnapPlanGlassLogo className="h-[340px] w-[340px] max-w-full rounded-[36px]" background="#f4f5fa" tileSize={260} loop={false}/>
      <h1 className="-mt-1 text-5xl font-bold tracking-tight">Snap<span className="text-indigo-500">Plan</span></h1>
      <p className="mt-3 max-w-md text-center text-slate-500">Scan. Organize. Focus. Learn.</p>
      <p className="mt-7 text-xs text-slate-400">Click the logo to replay the reveal.</p>
      <div className="mt-12 rounded-2xl bg-white p-4 shadow-sm"><SnapPlanBrand /></div>
      <Link href="/" className="mt-6 text-sm font-semibold text-indigo-600 hover:underline">Go to your dashboard →</Link>
    </main>
  )
}
