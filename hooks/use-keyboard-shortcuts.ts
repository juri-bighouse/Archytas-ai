"use client"

import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"

/** Duration (ms) of the smooth zoom transition triggered by a shortcut. */
const ZOOM_DURATION = 200

interface UseKeyboardShortcutsOptions {
  /** The React Flow instance — drives the zoom shortcuts. */
  reactFlow: ReactFlowInstance
  /** Handler invoked for the undo shortcut. */
  onUndo: () => void
  /** Handler invoked for the redo shortcuts. */
  onRedo: () => void
}

/**
 * Returns true when a keyboard event originates from an editable field — an
 * input, a textarea, or any `contenteditable` element. Shortcuts are skipped
 * for these so typing (node and edge label editing) is never hijacked.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA"
}

/**
 * Binds canvas keyboard shortcuts to `window`:
 *
 * - `+` / `=` — zoom in
 * - `-` — zoom out
 * - `Cmd/Ctrl + Z` — undo
 * - `Cmd/Ctrl + Shift + Z` / `Cmd/Ctrl + Y` — redo
 *
 * Shortcuts are ignored while the user is typing in an editable field.
 */
export function useKeyboardShortcuts({
  reactFlow,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return

      // History shortcuts require Cmd (macOS) or Ctrl (Windows/Linux).
      if (event.metaKey || event.ctrlKey) {
        const key = event.key.toLowerCase()
        if (key === "z") {
          event.preventDefault()
          if (event.shiftKey) {
            onRedo()
          } else {
            onUndo()
          }
        } else if (key === "y") {
          event.preventDefault()
          onRedo()
        }
        return
      }

      // Zoom shortcuts are plain key presses (no modifier).
      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        void reactFlow.zoomIn({ duration: ZOOM_DURATION })
        return
      }

      if (event.key === "-") {
        event.preventDefault()
        void reactFlow.zoomOut({ duration: ZOOM_DURATION })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [reactFlow, onUndo, onRedo])
}
