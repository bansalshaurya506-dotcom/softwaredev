import type { Metadata } from "next"
import "./globals.css"
import "./glass.css"

export const metadata: Metadata = {
  title: "SnapPlan | Scan. Organize. Focus. Learn.",
  description: "An interactive student study planner that turns assignment chaos into a clear plan.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
