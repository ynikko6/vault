import PocketBase from 'pocketbase';

// Initialize PocketBase client
export const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'
);

// Enable auto cancellation for pending requests
pb.autoCancellation(false);

// Types for PocketBase collections
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created: string;
  updated: string;
}

export interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  file: string; // file field name in PocketBase
  folderId?: string;
  userId: string;
  favorite: boolean;
  selected: boolean;
  createdAt: string;
  openedAt?: string;
  nameModifiedAt?: string;
  archiveOfFolderId?: string;
  archiveEntries?: string; // JSON string
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  userId: string;
  selected: boolean;
  favorite: boolean;
  created: string;
  updated: string;
}

export interface Trash {
  id: string;
  itemId: string;
  itemType: 'file' | 'folder';
  userId: string;
  deletedAt: string;
  originalData: string; // JSON string
}

export interface Colleague {
  id: string;
  userId: string;
  email: string;
  name?: string;
  status: 'Friend' | 'Requested';
  created: string;
}

export interface Share {
  id: string;
  itemId: string;
  itemType: 'file' | 'folder';
  ownerId: string;
  sharedWithEmail: string;
  created: string;
}

export interface WorkspaceInvite {
  id: string;
  userId: string;
  email: string;
  role: 'Member' | 'Viewer';
  created: string;
}
