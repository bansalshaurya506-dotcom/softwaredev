import Image from "next/image"
export function SnapPlanBrand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5" aria-label="SnapPlan">
    <Image src="/snapplan-mark.svg" alt="" width={42} height={42} />
    {!compact && <span className="text-xl font-extrabold tracking-tight text-slate-900">Snap<span className="text-indigo-500">Plan</span></span>}
  </div>
}
