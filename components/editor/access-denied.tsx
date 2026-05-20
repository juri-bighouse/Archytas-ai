import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"

export function AccessDenied() {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-surface-border bg-surface/80 p-8 text-center backdrop-blur">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-border bg-elevated">
          <Lock className="h-5 w-5 text-copy-muted" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-base font-medium text-copy-primary">
            You don&apos;t have access to this project
          </h1>
          <p className="text-sm leading-relaxed text-copy-muted">
            Ask the owner to invite you, or open one of your projects.
          </p>
        </div>
        <Link
          href="/editor"
          className="inline-flex items-center gap-1.5 text-sm text-brand underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to projects
        </Link>
      </div>
    </div>
  )
}
