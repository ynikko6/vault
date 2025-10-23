import React, { createContext, useContext, useEffect, useState } from "react"
import { pb } from "@/lib/pocketbase"
import { useAuth } from "@/contexts/AuthContext"

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

export type PocketBaseStore = {
  files: ManagedFile[]
  folders: Folder[]
  trash: ManagedFile[]
  colleagues: Colleague[]
  shares: ShareEntry[]
  workspaceInvites: WorkspaceInvite[]
  isLoading: boolean
  setFiles: React.Dispatch<React.SetStateAction<ManagedFile[]>>
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>
  setTrash: React.Dispatch<React.SetStateAction<ManagedFile[]>>
  setColleagues: React.Dispatch<React.SetStateAction<Colleague[]>>
  setShares: React.Dispatch<React.SetStateAction<ShareEntry[]>>
  setWorkspaceInvites: React.Dispatch<React.SetStateAction<WorkspaceInvite[]>>
  refreshData: () => Promise<void>
  uploadFile: (file: File, folderId?: string) => Promise<void>
  createFolder: (name: string, parentId?: string | null) => Promise<void>
  renameFile: (id: string, name: string) => Promise<void>
  toggleFileFavorite: (id: string, value: boolean) => Promise<void>
  deleteFile: (id: string) => Promise<void>
  moveFile: (id: string, folderId: string | null) => Promise<void>
  renameFolder: (id: string, name: string) => Promise<void>
  toggleFolderFavorite: (id: string, value: boolean) => Promise<void>
  moveFolder: (id: string, parentId: string | null) => Promise<void>
  deleteFolderCascade: (id: string) => Promise<void>
  // Trash functionality
  moveFileToTrash: (id: string) => Promise<void>
  moveFolderToTrash: (id: string) => Promise<void>
  restoreFromTrash: (itemId: string) => Promise<void>
  deleteFromTrashPermanently: (itemId: string) => Promise<void>
  // New: colleagues/shares/invites persistence
  addColleagueFriend: (email: string, name?: string) => Promise<void>
  removeColleague: (email: string) => Promise<void>
  createShares: (entries: ShareEntry[]) => Promise<void>
  inviteToWorkspace: (email: string, role?: "Member" | "Viewer") => Promise<void>
  removeWorkspaceInvite: (email: string) => Promise<void>
  // New: compression persistence
  compressFolderToZip: (id: string) => Promise<void>
}

const PocketBaseContext = createContext<PocketBaseStore | null>(null)

export function PocketBaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [files, setFiles] = useState<ManagedFile[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [trash, setTrash] = useState<ManagedFile[]>([])
  const [colleagues, setColleagues] = useState<Colleague[]>([])
  const [shares, setShares] = useState<ShareEntry[]>([])
  const [workspaceInvites, setWorkspaceInvites] = useState<WorkspaceInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = async () => {
    if (!user) {
      setFiles([])
      setFolders([])
      setTrash([])
      setColleagues([])
      setShares([])
      setWorkspaceInvites([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // Fetch folders
      const foldersResult = await pb.collection('folders').getFullList({
        filter: `userId = "${user.id}"`,
      })

      const fetchedFolders: Folder[] = foldersResult.map((f: any) => ({
        id: f.id,
        name: f.name,
        parentId: f.parentId || null,
        selected: false,
        favorite: f.favorite || false,
      }))

      setFolders(fetchedFolders)

      // Fetch files
      const filesResult = await pb.collection('files').getFullList({
        filter: `userId = "${user.id}"`,
      })

      const fetchedFiles: ManagedFile[] = filesResult.map((f: any) => {
        const uploadedName: string | undefined = f.file || f.field
        return {
          id: f.id,
          name: f.name,
          size: f.size || 0,
          type: f.type || '',
          url: uploadedName ? pb.files.getUrl(f, uploadedName) : '',
          lastModified: new Date(f.updated).getTime(),
          folderId: f.folderId || null,
          selected: false,
          favorite: f.favorite || false,
          createdAt: new Date(f.created).getTime(),
          openedAt: f.openedAt ? new Date(f.openedAt).getTime() : null,
          nameModifiedAt: f.nameModifiedAt ? new Date(f.nameModifiedAt).getTime() : null,
          archiveOfFolderId: f.archiveOfFolderId || null,
          archiveEntries: f.archiveEntries ? (typeof f.archiveEntries === 'string' ? JSON.parse(f.archiveEntries) : f.archiveEntries) : undefined,
        }
      })

      setFiles(fetchedFiles)

      // Fetch colleagues
      const colleaguesResult = await pb.collection('colleagues').getFullList({
        filter: `userId = "${user.id}"`,
      })

      const fetchedColleagues: Colleague[] = colleaguesResult.map((c: any) => ({
        email: c.email,
        name: c.name || undefined,
        status: c.status,
      }))

      setColleagues(fetchedColleagues)

      // Fetch shares
      const sharesResult = await pb.collection('shares').getFullList({
        filter: `ownerId = "${user.id}"`,
      })

      const fetchedShares: ShareEntry[] = sharesResult.map((s: any) => ({
        itemId: s.itemId,
        itemType: s.itemType,
        sharedWithEmail: s.sharedWithEmail,
      }))

      setShares(fetchedShares)

      // Fetch workspace invites
      const invitesResult = await pb.collection('workspace_invites').getFullList({
        filter: `userId = "${user.id}"`,
      })

      const fetchedInvites: WorkspaceInvite[] = invitesResult.map((i: any) => ({
        email: i.email,
        role: i.role,
      }))

      setWorkspaceInvites(fetchedInvites)

      // Fetch trash
      const trashResult = await pb.collection('trash').getFullList({
        filter: `userId = "${user.id}"`,
      })

      // Deduplicate by itemId and keep the latest deletedAt, parse originalData robustly
      const latestByItem = new Map<string, any>()
      for (const t of trashResult) {
        const prev = latestByItem.get(t.itemId)
        if (!prev || new Date(t.deletedAt).getTime() > new Date(prev.deletedAt).getTime()) {
          latestByItem.set(t.itemId, t)
        }
      }

      const fetchedTrash: ManagedFile[] = Array.from(latestByItem.values()).map((t: any) => {
        const raw = t.originalData
        const originalData = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (t.itemType === 'file') {
          return {
            ...originalData,
            id: t.itemId,
          }
        }
        // Map trashed folder into a ManagedFile-like object for Trash UI
        return {
          id: t.itemId,
          name: originalData.name,
          size: 0,
          type: 'folder',
          url: '',
          lastModified: new Date(t.deletedAt).getTime(),
          folderId: null,
          selected: false,
          favorite: originalData.favorite || false,
          createdAt: new Date(t.deletedAt).getTime(),
          openedAt: null,
          nameModifiedAt: null,
          archiveOfFolderId: null,
          archiveEntries: [],
        }
      })

      setTrash(fetchedTrash)
    } catch (error) {
      console.error('Error fetching data from PocketBase:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const uploadFile = async (file: File, folderId?: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const formData = new FormData()
      // Important: include filename in the file part
      formData.append('file', file, file.name)
      // Fallback for misnamed schema field ("field")
      formData.append('field', file, file.name)
      formData.append('name', file.name)
      formData.append('size', String(file.size))
      formData.append('type', file.type || '')
      formData.append('userId', user.id)
      if (folderId) {
        formData.append('folderId', folderId)
      }
      formData.append('favorite', 'false')
      formData.append('createdAt', new Date().toISOString())

      await pb.collection('files').create(formData)
      await refreshData()
    } catch (error) {
      console.error('Error uploading file:', error)
      // PocketBase ClientResponseError has data payload with field errors
      const anyErr = error as any
      if (anyErr?.data) console.error('PocketBase error data:', anyErr.data)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
      }
      throw error
    }
  }

  const createFolder = async (name: string, parentId?: string | null) => {
    if (!user) throw new Error('User not authenticated')
    const data: any = { name, userId: user.id, favorite: false }
    if (parentId) data.parentId = parentId
    await pb.collection('folders').create(data)
    await refreshData()
  }

  const renameFile = async (id: string, name: string) => {
    await pb.collection('files').update(id, { name, nameModifiedAt: new Date().toISOString() })
    await refreshData()
  }

  const toggleFileFavorite = async (id: string, value: boolean) => {
    await pb.collection('files').update(id, { favorite: value })
    await refreshData()
  }

  const deleteFile = async (id: string) => {
    await pb.collection('files').delete(id)
    await refreshData()
  }

  const moveFile = async (id: string, folderId: string | null) => {
    await pb.collection('files').update(id, { folderId: folderId || undefined })
    await refreshData()
  }

  const renameFolder = async (id: string, name: string) => {
    await pb.collection('folders').update(id, { name })
    await refreshData()
  }

  const toggleFolderFavorite = async (id: string, value: boolean) => {
    await pb.collection('folders').update(id, { favorite: value })
    await refreshData()
  }

  const moveFolder = async (id: string, parentId: string | null) => {
    await pb.collection('folders').update(id, { parentId: parentId || undefined })
    await refreshData()
  }

  const deleteFolderCascade = async (id: string) => {
    // Fetch all folders & files under this folder and move to trash
    const subFiles = files.filter((f) => f.folderId === id)
    const subFolders = folders.filter((f) => f.parentId === id)

    // Delete files first
    for (const file of subFiles) {
      await pb.collection('files').delete(file.id)
    }

    // Recursively delete subfolders
    for (const folder of subFolders) {
      await deleteFolderCascade(folder.id)
    }

    // Finally delete the folder itself
    await pb.collection('folders').delete(id)
    await refreshData()
  }

  // Colleagues
  const addColleagueFriend = async (email: string, name?: string) => {
    if (!user) throw new Error('User not authenticated')
    await pb.collection('colleagues').create({ userId: user.id, email, name, status: 'Friend' })
    await refreshData()
  }

  const removeColleague = async (email: string) => {
    const list = await pb.collection('colleagues').getFullList({ filter: `userId = "${user?.id}" && email = "${email}"` })
    if (list[0]) await pb.collection('colleagues').delete(list[0].id)
    await refreshData()
  }

  // Shares
  const createShares = async (entries: ShareEntry[]) => {
    if (!user) throw new Error('User not authenticated')
    for (const entry of entries) {
      await pb.collection('shares').create({
        itemId: entry.itemId,
        itemType: entry.itemType,
        ownerId: user.id,
        sharedWithEmail: entry.sharedWithEmail,
      })
    }
    await refreshData()
  }

  // Workspace invites
  const inviteToWorkspace = async (email: string, role: "Member" | "Viewer" = "Member") => {
    if (!user) throw new Error('User not authenticated')
    await pb.collection('workspace_invites').create({ userId: user.id, email, role })
    await refreshData()
  }

  const removeWorkspaceInvite = async (email: string) => {
    const list = await pb.collection('workspace_invites').getFullList({ filter: `userId = "${user?.id}" && email = "${email}"` })
    if (list[0]) await pb.collection('workspace_invites').delete(list[0].id)
    await refreshData()
  }

  // Trash functionality
  const moveFileToTrash = async (id: string) => {
    if (!user) throw new Error('User not authenticated')
    
    // Get the file data first
    const file = files.find(f => f.id === id)
    if (!file) throw new Error('File not found')

    // Create trash entry
    await pb.collection('trash').create({
      itemId: id,
      itemType: 'file',
      userId: user.id,
      deletedAt: new Date().toISOString(),
      originalData: {
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url,
        lastModified: file.lastModified,
        folderId: file.folderId,
        selected: false,
        favorite: file.favorite,
        createdAt: file.createdAt,
        openedAt: file.openedAt,
        nameModifiedAt: file.nameModifiedAt,
        archiveOfFolderId: file.archiveOfFolderId,
        archiveEntries: file.archiveEntries,
      }
    })

    // Delete the file from the files collection
    await pb.collection('files').delete(id)
    await refreshData()
  }

  const moveFolderToTrash = async (id: string) => {
    if (!user) throw new Error('User not authenticated')
    
    // Get the folder data first
    const folder = folders.find(f => f.id === id)
    if (!folder) throw new Error('Folder not found')

    // Create trash entry for the folder
    await pb.collection('trash').create({
      itemId: id,
      itemType: 'folder',
      userId: user.id,
      deletedAt: new Date().toISOString(),
      originalData: {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        selected: false,
        favorite: folder.favorite,
      }
    })

    // Move all files in this folder to trash
    const filesInFolder = files.filter(f => f.folderId === id)
    for (const file of filesInFolder) {
      await moveFileToTrash(file.id)
    }

    // Recursively move all subfolders to trash
    const subFolders = folders.filter(f => f.parentId === id)
    for (const subFolder of subFolders) {
      await moveFolderToTrash(subFolder.id)
    }

    // Delete the folder from the folders collection
    await pb.collection('folders').delete(id)
    await refreshData()
  }

  const restoreFromTrash = async (itemId: string) => {
    if (!user) throw new Error('User not authenticated')
    
    // Find the trash entry
    const trashEntries = await pb.collection('trash').getFullList({
      filter: `userId = "${user.id}" && itemId = "${itemId}"`
    })
    
    if (trashEntries.length === 0) throw new Error('Item not found in trash')
    
    const trashEntry = trashEntries[0]
    const originalDataRaw = trashEntry.originalData
    const originalData = typeof originalDataRaw === 'string' ? JSON.parse(originalDataRaw) : originalDataRaw
    
    if (trashEntry.itemType === 'file') {
      // For files, we need to recreate the file record (the actual file data is still in PocketBase storage)
      await pb.collection('files').create({
        id: originalData.id,
        name: originalData.name,
        size: originalData.size,
        type: originalData.type,
        userId: user.id,
        folderId: originalData.folderId || undefined,
        favorite: originalData.favorite || false,
        createdAt: new Date(originalData.createdAt).toISOString(),
        openedAt: originalData.openedAt ? new Date(originalData.openedAt).toISOString() : undefined,
        nameModifiedAt: originalData.nameModifiedAt ? new Date(originalData.nameModifiedAt).toISOString() : undefined,
        archiveOfFolderId: originalData.archiveOfFolderId || undefined,
        archiveEntries: originalData.archiveEntries ?? undefined,
      })
    } else if (trashEntry.itemType === 'folder') {
      // Restore folder
      await pb.collection('folders').create({
        id: originalData.id,
        name: originalData.name,
        parentId: originalData.parentId || undefined,
        userId: user.id,
        favorite: originalData.favorite || false,
      })
    }
    
    // Remove from trash
    await pb.collection('trash').delete(trashEntry.id)
    await refreshData()
  }

  const deleteFromTrashPermanently = async (itemId: string) => {
    if (!user) throw new Error('User not authenticated')
    
    // Find and delete the trash entry
    const trashEntries = await pb.collection('trash').getFullList({
      filter: `userId = "${user.id}" && itemId = "${itemId}"`
    })
    
    if (trashEntries.length === 0) throw new Error('Item not found in trash')
    
    const trashEntry = trashEntries[0]
    await pb.collection('trash').delete(trashEntry.id)
    await refreshData()
  }

  // Persist: compress a folder to ZIP and create a file record
  const compressFolderToZip = async (id: string) => {
    if (!user) throw new Error('User not authenticated')
    const root = folders.find((x) => x.id === id)
    if (!root) throw new Error('Folder not found')

    // Collect descendant folder ids from the root
    const getDescendantFolderIds = (rootId: string): Set<string> => {
      const result = new Set<string>()
      const stack: string[] = [rootId]
      while (stack.length) {
        const cur = stack.pop()!
        const children = folders.filter((f) => f.parentId === cur)
        for (const child of children) {
          result.add(child.id)
          stack.push(child.id)
        }
      }
      return result
    }

    const descIds = getDescendantFolderIds(root.id)
    const items = files.filter((f) => f.folderId && descIds.has(f.folderId))

    // Build relative path segments from root to each file's folder
    const entriesMeta = items.map((f) => {
      const segs: string[] = []
      let cur = f.folderId
      while (cur && cur !== root.id) {
        const ff = folders.find((x) => x.id === cur)
        if (!ff) break
        segs.push(ff.name)
        cur = ff.parentId
      }
      segs.reverse()
      return { fileId: f.id, path: segs }
    })

    // Minimal ZIP builder (store method, no compression)
    const crcTable = (() => {
      const table = new Uint32Array(256)
      for (let n = 0; n < 256; n++) {
        let c = n
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
        table[n] = c >>> 0
      }
      return table
    })()
    const crc32 = (buf: Uint8Array) => {
      let c = 0xFFFFFFFF
      for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
      return (c ^ 0xFFFFFFFF) >>> 0
    }
    const toDosTimeDate = (ms: number) => {
      const d = new Date(ms)
      const time = ((d.getHours() & 0x1F) << 11) | ((d.getMinutes() & 0x3F) << 5) | ((Math.floor(d.getSeconds() / 2) & 0x1F))
      const date = (((d.getFullYear() - 1980) & 0x7F) << 9) | (((d.getMonth() + 1) & 0x0F) << 5) | ((d.getDate() & 0x1F))
      return { time, date }
    }
    const enc = new TextEncoder()
    const u16 = (n: number) => new Uint8Array([n & 0xFF, (n >> 8) & 0xFF])
    const u32 = (n: number) => new Uint8Array([n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF])
    const sig = (n: number) => u32(n >>> 0)

    type ZipEntry = { name: string; data: Uint8Array; modMs: number }
    const entries: ZipEntry[] = []

    // Fetch data for each entry
    for (const e of entriesMeta) {
      const orig = files.find((x) => x.id === e.fileId)
      if (!orig) continue
      const res = await fetch(orig.url)
      const b = await res.blob()
      const ab = await b.arrayBuffer()
      const data = new Uint8Array(ab)
      const name = [...(e.path || []), orig.name].join("/")
      entries.push({ name, data, modMs: orig.lastModified || Date.now() })
    }

    const fileParts: Uint8Array[] = []
    const centralParts: Uint8Array[] = []
    let offset = 0
    const locals: { nameBytes: Uint8Array; crc: number; size: number; time: number; date: number; offset: number }[] = []

    const concat = (arrs: (Uint8Array | Uint8Array[])[]): Uint8Array => {
      const flat: Uint8Array[] = []
      for (const a of arrs) {
        if (Array.isArray(a)) flat.push(...a as Uint8Array[])
        else flat.push(a)
      }
      const total = flat.reduce((n, a) => n + a.length, 0)
      const out = new Uint8Array(total)
      let pos = 0
      for (const a of flat) { out.set(a, pos); pos += a.length }
      return out
    }

    for (const ent of entries) {
      const nameBytes = enc.encode(ent.name)
      const size = ent.data.length
      const crc = crc32(ent.data)
      const { time, date } = toDosTimeDate(ent.modMs)
      const localHeader = [
        sig(0x04034B50),
        u16(20),
        u16(0),
        u16(0),
        u16(time), u16(date),
        u32(crc), u32(size), u32(size),
        u16(nameBytes.length), u16(0),
        nameBytes,
      ]
      const local = concat(localHeader)
      fileParts.push(local)
      fileParts.push(ent.data)
      locals.push({ nameBytes, crc, size, time, date, offset })
      offset += local.length + size
    }

    for (const l of locals) {
      const centralHeader = [
        sig(0x02014B50),
        u16(0x0314),
        u16(20),
        u16(0),
        u16(0),
        u16(l.time), u16(l.date),
        u32(l.crc), u32(l.size), u32(l.size),
        u16(l.nameBytes.length), u16(0), u16(0),
        u16(0), u16(0),
        u32(0),
        u32(l.offset),
        l.nameBytes,
      ]
      centralParts.push(concat(centralHeader))
    }

    const central = concat(centralParts)
    const endRecord = concat([
      sig(0x06054B50),
      u16(0), u16(0),
      u16(locals.length), u16(locals.length),
      u32(central.length),
      u32(offset),
      u16(0),
    ])

    const zipBytes = concat([concat(fileParts), central, endRecord])
    const zipBlob = new Blob([zipBytes as BlobPart], { type: 'application/zip' })

    // Prepare metadata
    const nowIso = new Date().toISOString()
    const name = `${root.name}.zip`
    const formData = new FormData()
    formData.append('file', zipBlob, name)
    formData.append('field', zipBlob, name) // fallback
    formData.append('name', name)
    formData.append('size', String(zipBlob.size))
    formData.append('type', 'application/zip')
    formData.append('userId', user.id)
    if (root.parentId) formData.append('folderId', root.parentId)
    formData.append('favorite', 'false')
    formData.append('createdAt', nowIso)
    formData.append('archiveOfFolderId', root.id)
    formData.append('archiveEntries', JSON.stringify(entriesMeta))

    await pb.collection('files').create(formData)
    await refreshData()
  }
  useEffect(() => {
    refreshData()
  }, [user])

  return (
    <PocketBaseContext.Provider
      value={{
        files,
        folders,
        trash,
        colleagues,
        shares,
        workspaceInvites,
        isLoading,
        setFiles,
        setFolders,
        setTrash,
        setColleagues,
        setShares,
        setWorkspaceInvites,
        refreshData,
        uploadFile,
        createFolder,
        renameFile,
        toggleFileFavorite,
        deleteFile,
        moveFile,
        renameFolder,
        toggleFolderFavorite,
        moveFolder,
        deleteFolderCascade,
        moveFileToTrash,
        moveFolderToTrash,
        restoreFromTrash,
        deleteFromTrashPermanently,
        addColleagueFriend,
        removeColleague,
        createShares,
        inviteToWorkspace,
        removeWorkspaceInvite,
        compressFolderToZip,
      }}
    >
      {children}
    </PocketBaseContext.Provider>
  )
}

export function usePocketBase() {
  const ctx = useContext(PocketBaseContext)
  if (!ctx) throw new Error("usePocketBase must be used within PocketBaseProvider")
  return ctx
}
