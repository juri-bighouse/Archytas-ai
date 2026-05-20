"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { Check, Link as LinkIcon, Mail, Trash2, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  useWorkspaceContext,
  type WorkspaceRole,
} from "./workspace-context"

interface UserProfile {
  email: string
  displayName: string | null
  imageUrl: string | null
}

interface ListResponse {
  owner: UserProfile | null
  collaborators: UserProfile[]
}

interface InviteResponse {
  collaborator: UserProfile
}

const dialogClassName =
  "rounded-2xl bg-elevated p-6 text-copy-primary ring-1 ring-surface-border sm:max-w-xl"

interface AccessEntry {
  profile: UserProfile
  role: "owner" | "collaborator"
}

function PersonAvatar({ profile }: { profile: UserProfile }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-border bg-elevated">
      {profile.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <User className="h-4 w-4 text-copy-muted" />
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: "owner" | "collaborator" }) {
  const isOwner = role === "owner"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        isOwner
          ? "border-brand/40 bg-accent-dim text-brand"
          : "border-surface-border bg-surface/60 text-copy-muted"
      )}
    >
      {isOwner ? "Owner" : "Collaborator"}
    </span>
  )
}

function AccessRow({
  entry,
  canRemove,
  removing,
  onRemove,
}: {
  entry: AccessEntry
  canRemove: boolean
  removing: boolean
  onRemove: () => void
}) {
  const { profile, role } = entry
  const primary = profile.displayName ?? profile.email
  const secondary = profile.displayName ? profile.email : null

  return (
    <li className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface/40 px-3 py-2.5">
      <PersonAvatar profile={profile} />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-medium text-copy-primary">
            {primary}
          </span>
          {secondary && (
            <span className="truncate text-xs text-copy-muted">
              {secondary}
            </span>
          )}
        </div>
        <RoleBadge role={role} />
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label={`Remove ${profile.email}`}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-state-error transition-colors hover:bg-state-error/10 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  )
}

export function ShareDialog() {
  const workspace = useWorkspaceContext()
  if (!workspace) return null

  return (
    <ShareDialogContent
      projectId={workspace.projectId}
      projectName={workspace.projectName}
      role={workspace.role}
      open={workspace.shareDialogOpen}
      onClose={workspace.closeShareDialog}
    />
  )
}

function ShareDialogContent({
  projectId,
  role,
  open,
  onClose,
}: {
  projectId: string
  projectName: string
  role: WorkspaceRole
  open: boolean
  onClose: () => void
}) {
  const isOwner = role === "owner"
  const [owner, setOwner] = useState<UserProfile | null>(null)
  const [collaborators, setCollaborators] = useState<UserProfile[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadCollaborators = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "GET",
      })
      if (!res.ok) throw new Error(`Failed to load collaborators (${res.status})`)
      const data = (await res.json()) as ListResponse
      setOwner(data.owner)
      setCollaborators(data.collaborators)
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : "Failed to load collaborators"
      )
    } finally {
      setListLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (!open) return
    void loadCollaborators()
  }, [open, loadCollaborators])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setInviteEmail("")
      setInviteError(null)
      setRemoving(null)
      setCopied(false)
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = null
      }
    }
  }, [open])

  const projectUrl = useMemo(() => {
    if (typeof window === "undefined") return `/editor/${projectId}`
    return `${window.location.origin}/editor/${projectId}`
  }, [projectId])

  const accessEntries = useMemo<AccessEntry[]>(() => {
    const entries: AccessEntry[] = []
    if (owner) entries.push({ profile: owner, role: "owner" })
    for (const c of collaborators) entries.push({ profile: c, role: "collaborator" })
    return entries
  }, [owner, collaborators])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl)
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = inviteEmail.trim().toLowerCase()
    if (!trimmed) return
    setInviteLoading(true)
    setInviteError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(data?.error ?? `Failed to invite (${res.status})`)
      }
      const data = (await res.json()) as InviteResponse
      setCollaborators((prev) => [...prev, data.collaborator])
      setInviteEmail("")
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to invite collaborator"
      )
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRemove = async (email: string) => {
    setRemoving(email)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error(`Failed to remove (${res.status})`)
      setCollaborators((prev) => prev.filter((c) => c.email !== email))
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : "Failed to remove collaborator"
      )
    } finally {
      setRemoving(null)
    }
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(event.target.value)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className={dialogClassName}>
        <div className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-copy-primary">
              Share project
            </DialogTitle>
            <DialogDescription className="text-sm text-copy-muted">
              Invite collaborators, copy the workspace link, and manage access.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-surface-border bg-surface/40 px-4 py-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium text-copy-primary">
                Workspace link
              </span>
              <span className="truncate text-xs text-copy-muted">
                Share a direct link with teammates after you grant them access.
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="min-w-[7rem] shrink-0 justify-center gap-1.5 border border-surface-border bg-elevated/60 hover:bg-elevated"
            >
              {copied ? (
                <>
                  <Check className="text-state-success" />
                  Copied!
                </>
              ) : (
                <>
                  <LinkIcon />
                  Copy link
                </>
              )}
            </Button>
          </div>

          {isOwner && (
            <form onSubmit={handleInvite} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-full border border-surface-border bg-surface/40 py-1 pr-1 pl-3">
                <Mail className="h-4 w-4 shrink-0 text-copy-muted" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={handleEmailChange}
                  placeholder="teammate@company.com"
                  disabled={inviteLoading}
                  className="flex-1 bg-transparent text-sm text-copy-primary placeholder:text-copy-faint outline-none disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inviteEmail.trim() || inviteLoading}
                  className="min-w-[5rem] shrink-0 justify-center rounded-full"
                >
                  {inviteLoading ? "Inviting…" : "Invite"}
                </Button>
              </div>
              {inviteError && (
                <p className="px-3 text-xs text-state-error">{inviteError}</p>
              )}
            </form>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-copy-primary">
                People with access
              </span>
              <span className="text-xs text-copy-muted">
                {accessEntries.length} total
              </span>
            </div>
            {listError && (
              <p className="text-xs text-state-error">{listError}</p>
            )}
            {listLoading ? (
              <p className="rounded-xl border border-surface-border bg-surface/40 px-3 py-3 text-sm text-copy-muted">
                Loading…
              </p>
            ) : accessEntries.length === 0 ? (
              <p className="rounded-xl border border-surface-border bg-surface/40 px-3 py-3 text-center text-sm text-copy-muted">
                No one has access yet
              </p>
            ) : (
              <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {accessEntries.map((entry) => (
                  <AccessRow
                    key={`${entry.role}-${entry.profile.email}`}
                    entry={entry}
                    canRemove={isOwner && entry.role === "collaborator"}
                    removing={removing === entry.profile.email}
                    onRemove={() => void handleRemove(entry.profile.email)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
