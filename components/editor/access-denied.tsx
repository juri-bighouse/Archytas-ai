import Link from "next/link"
import { Lock } from "lucide-react"

export function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-elevated">
        <Lock className="h-6 w-6 text-copy-muted" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-copy-primary">
          You don&apos;t have access to this project
        </h1>
        <p className="text-sm text-copy-muted">
          Ask the owner to invite you, or open one of your projects.
        </p>
      </div>
      <Link
        href="/editor"
        className="text-sm text-brand underline-offset-4 hover:underline"
      >
        Back to projects
      </Link>
    </div>
  )
}
