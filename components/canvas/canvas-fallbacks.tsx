"use client"

import type { ReactNode } from "react"
import { Loader2, Unplug } from "lucide-react"
import type { FallbackProps } from "react-error-boundary"
import { Button } from "@/components/ui/button"

/** Shared centered frame for the canvas loading and error states. */
function CanvasFrame({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        {children}
      </div>
    </div>
  )
}

/** Loading state shown while the Liveblocks room connects. */
export function CanvasLoading() {
  return (
    <CanvasFrame>
      <Loader2 className="h-7 w-7 animate-spin text-brand" />
      <p className="text-sm text-copy-muted">Connecting to the canvas…</p>
    </CanvasFrame>
  )
}

/**
 * Error fallback shown when the Liveblocks room fails to connect — for
 * example on an authentication failure or a lost network connection.
 * `resetErrorBoundary` retries the connection from scratch.
 */
export function CanvasError({ resetErrorBoundary }: FallbackProps) {
  return (
    <CanvasFrame>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-border bg-elevated">
        <Unplug className="h-5 w-5 text-state-error" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-base font-medium text-copy-primary">
          Couldn&apos;t connect to the canvas
        </h1>
        <p className="text-sm leading-relaxed text-copy-muted">
          The collaborative canvas for this project failed to load. Check your
          connection and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        Retry
      </Button>
    </CanvasFrame>
  )
}
