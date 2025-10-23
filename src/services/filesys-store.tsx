import React, { createContext, useContext, useEffect, useState } from "react"

export type Folder = {
  id: string
  name: string
  parentId: string | null
  selected: boolean
  favorite: boolean
}

export type ManagedFile = {
  id: string
  name: string
  size: number
  type: string
  url: string
  lastModified: number
  folderId: string | null
  selected: boolean
  favorite: boolean
  createdAt: number
  openedAt: number | null
  nameModifiedAt: number | null
  archiveOfFolderId?: string | null
  archiveEntries?: { fileId: string; path: string[] }[]
}

// New: social/sharing types
export type Colleague = {
  email: string
  name?: string
  status: "Friend" | "Requested"
}

export type ShareEntry = {
  itemId: string
  itemType: "file" | "folder"
  sharedWithEmail: string
}

export type WorkspaceInvite = {
  email: string
  role: "Member" | "Viewer"
}

export type FileSystemStore = {
  files: ManagedFile[]
  folders: Folder[]
  trash: ManagedFile[]
  setFiles: React.Dispatch<React.SetStateAction<ManagedFile[]>>
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>
  setTrash: React.Dispatch<React.SetStateAction<ManagedFile[]>>
  // New: social/sharing in store
  colleagues: Colleague[]
  setColleagues: React.Dispatch<React.SetStateAction<Colleague[]>>
  shares: ShareEntry[]
  setShares: React.Dispatch<React.SetStateAction<ShareEntry[]>>
  workspaceInvites: WorkspaceInvite[]
  setWorkspaceInvites: React.Dispatch<React.SetStateAction<WorkspaceInvite[]>>
}

const FileSystemContext = createContext<FileSystemStore | null>(null)

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<ManagedFile[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [trash, setTrash] = useState<ManagedFile[]>([])
  // New: social/sharing state
  const [colleagues, setColleagues] = useState<Colleague[]>([])
  const [shares, setShares] = useState<ShareEntry[]>([])
  const [workspaceInvites, setWorkspaceInvites] = useState<WorkspaceInvite[]>([])

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const rawFolders = localStorage.getItem("filesys/folders")
      const rawFiles = localStorage.getItem("filesys/files")
      const rawTrash = localStorage.getItem("filesys/trash")
      // New persisted keys
      const rawColleagues = localStorage.getItem("filesys/colleagues")
      const rawShares = localStorage.getItem("filesys/shares")
      const rawWorkspaceInvites = localStorage.getItem("filesys/workspaceInvites")
      if (rawFolders) {
        const parsed = JSON.parse(rawFolders)
        if (Array.isArray(parsed)) setFolders(parsed as Folder[])
      }
      if (rawFiles) {
        const parsed = JSON.parse(rawFiles)
        if (Array.isArray(parsed)) setFiles(parsed as ManagedFile[])
      }
      if (rawTrash) {
        const parsed = JSON.parse(rawTrash)
        if (Array.isArray(parsed)) setTrash(parsed as ManagedFile[])
      }
      if (rawColleagues) {
        const parsed = JSON.parse(rawColleagues)
        if (Array.isArray(parsed)) setColleagues(parsed as Colleague[])
      }
      if (rawShares) {
        const parsed = JSON.parse(rawShares)
        if (Array.isArray(parsed)) setShares(parsed as ShareEntry[])
      }
      if (rawWorkspaceInvites) {
        const parsed = JSON.parse(rawWorkspaceInvites)
        if (Array.isArray(parsed)) setWorkspaceInvites(parsed as WorkspaceInvite[])
      }
    } catch (e) {
      console.warn("Failed to load persisted store", e)
    }
  }, [])

  // Persist whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("filesys/folders", JSON.stringify(folders))
    } catch (e) {
      console.warn("Failed to persist folders", e)
    }
  }, [folders])

  useEffect(() => {
    try {
      localStorage.setItem("filesys/files", JSON.stringify(files))
    } catch (e) {
      console.warn("Failed to persist files", e)
    }
  }, [files])

  useEffect(() => {
    try {
      localStorage.setItem("filesys/trash", JSON.stringify(trash))
    } catch (e) {
      console.warn("Failed to persist trash", e)
    }
  }, [trash])

  // New persists
  useEffect(() => {
    try {
      localStorage.setItem("filesys/colleagues", JSON.stringify(colleagues))
    } catch (e) {
      console.warn("Failed to persist colleagues", e)
    }
  }, [colleagues])

  useEffect(() => {
    try {
      localStorage.setItem("filesys/shares", JSON.stringify(shares))
    } catch (e) {
      console.warn("Failed to persist shares", e)
    }
  }, [shares])

  useEffect(() => {
    try {
      localStorage.setItem("filesys/workspaceInvites", JSON.stringify(workspaceInvites))
    } catch (e) {
      console.warn("Failed to persist workspaceInvites", e)
    }
  }, [workspaceInvites])

  return (
    <FileSystemContext.Provider value={{ files, folders, trash, setFiles, setFolders, setTrash, colleagues, setColleagues, shares, setShares, workspaceInvites, setWorkspaceInvites }}>
      {children}
    </FileSystemContext.Provider>
  )
}

export function useFileSystem() {
  const ctx = useContext(FileSystemContext)
  if (!ctx) throw new Error("useFileSystem must be used within FileSystemProvider")
  return ctx
}