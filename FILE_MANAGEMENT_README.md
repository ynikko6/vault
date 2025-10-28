# File Management System Documentation

## Overview

This is a comprehensive file management system built with React and PocketBase that provides cloud storage functionality similar to Google Drive or Dropbox. The system supports file uploads, folder organization, trash management, sharing, and collaboration features.

## Architecture

### Core Components

1. **PocketBase Store** (`src/services/pocketbase-store.tsx`) - Central state management and API layer
2. **UI Pages** (`src/pages/`) - User interface components for different views
3. **Authentication** (`src/contexts/AuthContext.tsx`) - User authentication management
4. **Database** - PocketBase backend with collections for files, folders, trash, etc.

## Data Models

### File Structure (`ManagedFile`)
```typescript
type ManagedFile = {
  id: string                    // Unique identifier
  name: string                  // Display name
  size: number                  // File size in bytes
  type: string                  // MIME type
  url: string                   // Download/access URL
  lastModified: number          // Last modification timestamp
  folderId: string | null       // Parent folder ID (null = root)
  selected: boolean             // UI selection state
  favorite: boolean             // User favorite flag
  createdAt: number            // Creation timestamp
  openedAt: number | null      // Last opened timestamp
  nameModifiedAt: number | null // Name change timestamp
  archiveOfFolderId?: string | null     // If ZIP, source folder ID
  archiveEntries?: { fileId: string; path: string[] }[] // ZIP contents
}
```

### Folder Structure (`Folder`)
```typescript
type Folder = {
  id: string                    // Unique identifier
  name: string                  // Display name
  parentId: string | null       // Parent folder ID (null = root)
  selected: boolean             // UI selection state
  favorite: boolean             // User favorite flag
}
```

### Other Data Types
- **Colleague**: User collaboration data
- **ShareEntry**: File/folder sharing information
- **WorkspaceInvite**: Workspace invitation data

## Core Functions

### 1. Data Management

#### `refreshData()`
- **Purpose**: Fetches all user data from PocketBase
- **Collections**: files, folders, trash, colleagues, shares, workspace_invites
- **Process**:
  1. Fetches folders with user filter
  2. Fetches files with user filter
  3. Processes trash entries (keeps latest deletion per item)
  4. Updates React state

### 2. File Operations

#### `uploadFile(file: File, folderId?: string)`
- **Purpose**: Uploads a new file to the system
- **Process**:
  1. Creates FormData with file and metadata
  2. Includes fallback field names for schema compatibility
  3. Sends to PocketBase files collection
  4. Refreshes data to update UI
- **Parameters**:
  - `file`: JavaScript File object
  - `folderId`: Optional parent folder ID

#### `renameFile(id: string, name: string)`
- **Purpose**: Changes file display name
- **Process**:
  1. Updates file record in PocketBase
  2. Sets nameModifiedAt timestamp
  3. Refreshes data

#### `moveFile(id: string, folderId: string | null)`
- **Purpose**: Moves file to different folder
- **Process**:
  1. Updates folderId in file record
  2. Refreshes data
- **Note**: `null` folderId moves to root

#### `toggleFileFavorite(id: string, value: boolean)`
- **Purpose**: Adds/removes file from favorites
- **Process**:
  1. Updates favorite flag in database
  2. Refreshes data

#### `deleteFile(id: string)`
- **Purpose**: Permanently deletes file
- **Process**:
  1. Removes file record from database
  2. Refreshes data
- **Warning**: This is permanent deletion, not trash

### 3. Folder Operations

#### `createFolder(name: string, parentId?: string | null)`
- **Purpose**: Creates new folder
- **Process**:
  1. Creates folder record with user ID
  2. Sets parent relationship
  3. Refreshes data

#### `renameFolder(id: string, name: string)`
- **Purpose**: Changes folder display name
- **Process**:
  1. Updates folder record in PocketBase
  2. Refreshes data

#### `moveFolder(id: string, parentId: string | null)`
- **Purpose**: Moves folder to different parent
- **Process**:
  1. Updates parentId in folder record
  2. Refreshes data
- **Note**: `null` parentId moves to root

#### `toggleFolderFavorite(id: string, value: boolean)`
- **Purpose**: Adds/removes folder from favorites
- **Process**:
  1. Updates favorite flag in database
  2. Refreshes data

#### `deleteFolderCascade(id: string)`
- **Purpose**: Permanently deletes folder and all contents
- **Process**:
  1. Recursively deletes all files in folder
  2. Recursively deletes all subfolders
  3. Deletes the folder itself
  4. Refreshes data
- **Warning**: This is permanent deletion, not trash

### 4. Trash Operations

#### `moveFileToTrash(id: string)`
- **Purpose**: Soft-deletes file to trash
- **Process**:
  1. Gets current file data
  2. Creates trash entry with original data
  3. Deletes file from files collection
  4. Refreshes data
- **Data Preservation**: Original file data stored in trash.originalData

#### `moveFolderToTrash(id: string)`
- **Purpose**: Soft-deletes folder and contents to trash
- **Process**:
  1. Gets current folder data
  2. Creates trash entry for folder
  3. Recursively moves all files in folder to trash
  4. Recursively moves all subfolders to trash
  5. Deletes folder from folders collection
  6. Refreshes data

#### `restoreFromTrash(itemId: string)`
- **Purpose**: Restores item from trash
- **Process**:
  1. Finds trash entry for item
  2. Recreates original file/folder record
  3. Deletes trash entry
  4. Refreshes data

#### `deleteFromTrashPermanently(itemId: string)`
- **Purpose**: Permanently deletes item from trash
- **Process**:
  1. Removes trash entry
  2. Refreshes data
- **Warning**: This is permanent deletion

### 5. Collaboration Features

#### `addColleagueFriend(email: string, name?: string)`
- **Purpose**: Adds user as colleague
- **Process**:
  1. Creates colleague record
  2. Sets status as "Friend"
  3. Refreshes data

#### `createShares(entries: ShareEntry[])`
- **Purpose**: Shares files/folders with colleagues
- **Process**:
  1. Creates share records for each entry
  2. Links owner, item, and recipient
  3. Refreshes data

#### `inviteToWorkspace(email: string, role: "Member" | "Viewer")`
- **Purpose**: Invites user to workspace
- **Process**:
  1. Creates workspace invite record
  2. Sets role permissions
  3. Refreshes data

### 6. Advanced Features

#### `compressFolderToZip(id: string)`
- **Purpose**: Creates ZIP archive of folder contents
- **Process**:
  1. Collects all files in folder recursively
  2. Creates ZIP file on server
  3. Stores archive metadata
  4. Refreshes data

## UI Components

### MyFiles.tsx
- **Purpose**: Main file browser interface
- **Features**:
  - Folder navigation with breadcrumbs
  - File/folder grid and list views
  - Drag & drop upload
  - Bulk selection and operations
  - File preview
  - Context menus for actions

### TrashArchive.tsx
- **Purpose**: Trash management interface
- **Features**:
  - View deleted items
  - Restore from trash
  - Permanent deletion
  - Bulk operations

### Favorites.tsx
- **Purpose**: Favorites management
- **Features**:
  - View favorited items
  - Remove from favorites
  - Quick access to important files

### SharedWithMe.tsx
- **Purpose**: Shared content viewer
- **Features**:
  - View files shared by others
  - Download shared files
  - Add shared files to personal drive

### Search.tsx
- **Purpose**: File search functionality
- **Features**:
  - Search across all files and folders
  - Filter by type, date, etc.
  - Quick access to results

## State Management

### React Context Pattern
The system uses React Context (`PocketBaseContext`) to provide global state management:

```typescript
const PocketBaseContext = createContext<PocketBaseStore | null>(null)

export function usePocketBase() {
  const context = useContext(PocketBaseContext)
  if (!context) {
    throw new Error('usePocketBase must be used within a PocketBaseProvider')
  }
  return context
}
```

### State Structure
- **files**: Array of all user files
- **folders**: Array of all user folders  
- **trash**: Array of deleted items
- **colleagues**: Array of user's colleagues
- **shares**: Array of sharing relationships
- **workspaceInvites**: Array of workspace invitations
- **isLoading**: Loading state flag

## Database Schema

### Collections
1. **files**: File metadata and content
2. **folders**: Folder structure
3. **trash**: Soft-deleted items
4. **colleagues**: User relationships
5. **shares**: Sharing permissions
6. **workspace_invites**: Workspace invitations

### Key Relationships
- Files belong to folders (folderId → folders.id)
- Folders have parent folders (parentId → folders.id)
- Trash entries reference original items (itemId)
- Shares link items to users (itemId, sharedWithEmail)

## Security Features

### Authentication
- User authentication required for all operations
- User ID filtering on all database queries
- Session-based access control

### Data Isolation
- All data filtered by authenticated user ID
- No cross-user data access
- Secure file URL generation

## Error Handling

### Client-Side
- Try-catch blocks around all async operations
- User-friendly error messages
- Graceful degradation on failures

### Server-Side
- PocketBase validation rules
- File upload size limits
- MIME type restrictions

## Performance Optimizations

### Data Loading
- Single refresh call loads all user data
- Optimistic UI updates
- Efficient state updates

### File Operations
- Batch operations where possible
- Background processing for large operations
- Progressive loading for large directories

## Usage Examples

### Basic File Upload
```typescript
const { uploadFile } = usePocketBase()

const handleFileUpload = async (file: File, folderId?: string) => {
  try {
    await uploadFile(file, folderId)
    // File automatically appears in UI after refresh
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### Folder Navigation
```typescript
const { folders } = usePocketBase()
const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

// Get current folder contents
const currentFolderFiles = files.filter(f => f.folderId === currentFolderId)
const currentFolderSubfolders = folders.filter(f => f.parentId === currentFolderId)
```

### Trash Operations
```typescript
const { moveFileToTrash, restoreFromTrash } = usePocketBase()

// Move to trash
await moveFileToTrash(fileId)

// Restore from trash  
await restoreFromTrash(fileId)
```

## Best Practices

### State Management
- Always use the provided hooks (`usePocketBase`)
- Don't modify state directly
- Use optimistic updates for better UX

### Error Handling
- Wrap async operations in try-catch
- Provide user feedback for operations
- Handle network failures gracefully

### Performance
- Minimize unnecessary re-renders
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

### Security
- Validate user permissions before operations
- Sanitize file names and paths
- Implement rate limiting for uploads

## Troubleshooting

### Common Issues
1. **Files not appearing**: Check user authentication and refresh data
2. **Upload failures**: Verify file size limits and MIME types
3. **Permission errors**: Ensure user is authenticated
4. **Slow performance**: Check network connection and file sizes

### Debug Tools
- Browser developer tools for network requests
- PocketBase admin panel for database inspection
- Console logs for error tracking

This file management system provides a robust foundation for cloud storage applications with modern React patterns and secure backend integration.