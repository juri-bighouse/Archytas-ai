import { Cpu, Users, FileText, Zap } from "lucide-react"
import type { ReactNode } from "react"

const features = [
  {
    icon: Cpu,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
]

export function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <main className="flex min-h-screen font-sans">
      {/* Left panel — visible only on large screens */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 bg-surface border-r border-surface-border px-16 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 [color:var(--bg-base)]" />
          </div>
          <span className="text-base font-semibold tracking-tight text-copy-primary">
            Archytas AI
          </span>
        </div>

        {/* Headline + body */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-copy-primary leading-[1.1] tracking-tight mb-6">
            Design systems at the speed of thought.
          </h1>
          <p className="text-copy-secondary text-base leading-relaxed mb-14 max-w-sm">
            Describe your architecture in plain English. Archytas AI maps it to a
            shared canvas your whole team can refine in real time.
          </p>

          {/* Feature list */}
          <ul className="space-y-7">
            {features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl border border-surface-border-subtle bg-elevated flex items-center justify-center shrink-0">
                  <feature.icon className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="text-copy-primary font-medium text-sm leading-snug">
                    {feature.title}
                  </p>
                  <p className="text-copy-secondary text-sm mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-copy-faint text-sm">© 2026 Archytas AI. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 lg:w-1/2 items-center justify-center px-6 py-12 bg-base">
        {children}
      </div>
    </main>
  )
}
