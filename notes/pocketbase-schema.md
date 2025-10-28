# PocketBase Schema Documentation

This document describes the PocketBase collections schema for the Vault application.

## Collections

### 1. users (System Collection)
This is the built-in PocketBase users collection with the following fields:
- `id` (auto-generated)
- `email` (required, unique)
- `password` (required, min 8 characters)
- `name` (optional)
- `avatar` (optional, file)

**Rules:**
- List rule: `@request.auth.id != ""`
- View rule: `@request.auth.id != ""`
- Create rule: Anyone can create (for signup)
- Update rule: `@request.auth.id = id`
- Delete rule: `@request.auth.id = id`

### 2. files
Stores file metadata and actual file uploads.

**Fields:**
- `id` (auto-generated)
- `name` (text, required) - File name
- `size` (number, required) - File size in bytes
- `type` (text, required) - MIME type
- `file` (file, required) - The actual file upload
- `userId` (relation to users, required) - Owner of the file
- `folderId` (relation to folders, optional) - Parent folder
- `favorite` (bool, default: false)
- `createdAt` (text) - ISO timestamp
- `openedAt` (text, optional) - Last opened timestamp
- `nameModifiedAt` (text, optional) - Last renamed timestamp
- `archiveOfFolderId` (text, optional) - If this is an archive of a folder
- `archiveEntries` (json, optional) - Archive structure data

**Rules:**
- List rule: `userId = @request.auth.id`
- View rule: `userId = @request.auth.id`
- Create rule: `@request.auth.id != "" && userId = @request.auth.id`
- Update rule: `userId = @request.auth.id`
- Delete rule: `userId = @request.auth.id`

### 3. folders
Stores folder hierarchy.

**Fields:**
- `id` (auto-generated)
- `name` (text, required) - Folder name
- `parentId` (relation to folders, optional) - Parent folder for nested structure
- `userId` (relation to users, required) - Owner of the folder
- `favorite` (bool, default: false)

**Rules:**
- List rule: `userId = @request.auth.id`
- View rule: `userId = @request.auth.id`
- Create rule: `@request.auth.id != "" && userId = @request.auth.id`
- Update rule: `userId = @request.auth.id`
- Delete rule: `userId = @request.auth.id`

### 4. trash
Stores deleted items for recovery.

**Fields:**
- `id` (auto-generated)
- `itemId` (text, required) - ID of the deleted item
- `itemType` (text, required) - "file" or "folder"
- `userId` (relation to users, required) - Owner
- `deletedAt` (text, required) - ISO timestamp
- `originalData` (json, required) - Full original item data for restoration

**Rules:**
- List rule: `userId = @request.auth.id`
- View rule: `userId = @request.auth.id`
- Create rule: `@request.auth.id != "" && userId = @request.auth.id`
- Update rule: `userId = @request.auth.id`
- Delete rule: `userId = @request.auth.id`

### 5. colleagues
Stores friend/colleague relationships.

**Fields:**
- `id` (auto-generated)
- `userId` (relation to users, required) - Owner of the relationship
- `email` (email, required) - Colleague's email
- `name` (text, optional) - Colleague's name
- `status` (text, required) - "Friend" or "Requested"

**Rules:**
- List rule: `userId = @request.auth.id`
- View rule: `userId = @request.auth.id`
- Create rule: `@request.auth.id != "" && userId = @request.auth.id`
- Update rule: `userId = @request.auth.id`
- Delete rule: `userId = @request.auth.id`

### 6. shares
Stores file/folder sharing information.

**Fields:**
- `id` (auto-generated)
- `itemId` (text, required) - ID of shared file/folder
- `itemType` (text, required) - "file" or "folder"
- `ownerId` (relation to users, required) - User who is sharing
- `sharedWithEmail` (email, required) - Email of recipient

**Rules:**
- List rule: `ownerId = @request.auth.id`
- View rule: `ownerId = @request.auth.id`
- Create rule: `@request.auth.id != "" && ownerId = @request.auth.id`
- Update rule: `ownerId = @request.auth.id`
- Delete rule: `ownerId = @request.auth.id`

### 7. workspace_invites
Stores workspace collaboration invites.

**Fields:**
- `id` (auto-generated)
- `userId` (relation to users, required) - User sending the invite
- `email` (email, required) - Invitee's email
- `role` (text, required) - "Member" or "Viewer"

**Rules:**
- List rule: `userId = @request.auth.id`
- View rule: `userId = @request.auth.id`
- Create rule: `@request.auth.id != "" && userId = @request.auth.id`
- Update rule: `userId = @request.auth.id`
- Delete rule: `userId = @request.auth.id`

## Setup Instructions

1. Download PocketBase from https://pocketbase.io/docs/
2. Extract the binary to your project root
3. Run PocketBase: `./pocketbase serve`
4. Access the admin UI at http://127.0.0.1:8090/_/
5. Create an admin account
6. Create the collections listed above using the schema
7. Configure the API rules as specified

## Migration Script

You can use the PocketBase Admin UI to create collections, or use the JavaScript SDK to programmatically create them. See `pocketbase-setup.js` for an automated setup script.
