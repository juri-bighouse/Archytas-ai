"use client"

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"
import { ErrorBoundary } from "react-error-boundary"
import { Canvas } from "./canvas"
import { CanvasError, CanvasLoading } from "./canvas-fallbacks"

interface CanvasRoomProps {
  /** Liveblocks room ID for the project — always equal to the project ID. */
  readonly roomId: string
}

/**
 * Client entry point for the collaborative canvas.
 *
 * Connects to the Liveblocks room for the active project, authenticating
 * through `/api/liveblocks-auth`, then renders the React Flow canvas once
 * Storage is ready. `ClientSideSuspense` covers the connection wait, and the
 * `ErrorBoundary` catches connection failures (auth errors, lost network,
 * revoked access).
 */
export function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <ErrorBoundary FallbackComponent={CanvasError}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <Canvas />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
