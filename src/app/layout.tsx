import type { Metadata } from "next"
import "./globals.css"
import "./glass.css"
import "./snapplan-logo.css"
import "./design-system.css"
import "./snappy.css"

export const metadata: Metadata = {
  title: "Snappy | Learn with movement",
  description: "A visual learning studio that lets you explore science with gestures, camera hand tracking, voice commands, and interactive diagrams. Formerly SnapPlan.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
