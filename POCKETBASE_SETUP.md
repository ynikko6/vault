# PocketBase Integration Setup Guide

This guide will help you set up PocketBase for the Vault application.

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install`)

## Step 1: Download PocketBase

1. Visit [PocketBase Downloads](https://pocketbase.io/docs/)
2. Download the appropriate binary for your OS:
   - macOS: `pocketbase_[version]_darwin_amd64.zip` or `pocketbase_[version]_darwin_arm64.zip` (Apple Silicon)
   - Linux: `pocketbase_[version]_linux_amd64.zip`
   - Windows: `pocketbase_[version]_windows_amd64.zip`

3. Extract the downloaded file
4. Move the `pocketbase` binary to your project root directory

## Step 2: Start PocketBase

Open a terminal in your project root and run:

```bash
./pocketbase serve
```

PocketBase will start on `http://127.0.0.1:8090`

**Important:** Keep this terminal running. You'll need PocketBase running for the application to work.

## Step 3: Create Admin Account

1. Open your browser and navigate to `http://127.0.0.1:8090/_/`
2. Create an admin account (email + password)
3. You'll be redirected to the PocketBase Admin UI

## Step 4: Create Collections

**Important:** Create collections in this order because some collections reference others!

### 4.1 Create "folders" Collection FIRST

You need to create folders first because the files collection will reference it.

1. Click "Collections" → "New collection" → "Base collection"
2. Name: `folders`
3. Add these fields first (skip parentId for now):

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| name | Text | Yes | - |
| userId | Relation | Yes | Collection: users, Single |
| favorite | Bool | No | Default: false |

4. Set API Rules:
   - List: `userId = @request.auth.id`
   - View: `userId = @request.auth.id`
   - Create: `@request.auth.id != "" && userId = @request.auth.id`
   - Update: `userId = @request.auth.id`
   - Delete: `userId = @request.auth.id`

**Note:** After saving the folders collection, you can now add the `parentId` relation field:
- Click on the folders collection → Fields → Add field
- Name: `parentId`
- Type: Relation
- Collection: folders (it will now appear in the dropdown!)
- Single relation
- Not required

### 4.2 Create "files" Collection

Now that folders exists, you can create files and reference it.

1. Click "New collection" → "Base collection"
2. Name: `files`
3. Add the following fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| name | Text | Yes | - |
| size | Number | Yes | - |
| type | Text | Yes | - |
| file | File | Yes | Max files: 1 |
| userId | Relation | Yes | Collection: users, Single |
| folderId | Relation | No | Collection: folders, Single |
| favorite | Bool | No | Default: false |
| createdAt | Text | No | - |
| openedAt | Text | No | - |
| nameModifiedAt | Text | No | - |
| archiveOfFolderId | Text | No | - |
| archiveEntries | JSON | No | - |

4. Set API Rules:
   - List: `userId = @request.auth.id`
   - View: `userId = @request.auth.id`
   - Create: `@request.auth.id != "" && userId = @request.auth.id`
   - Update: `userId = @request.auth.id`
   - Delete: `userId = @request.auth.id`

### 4.3 Create "trash" Collection

1. Name: `trash`
2. Add fields:

| Field Name | Type | Required |
|------------|------|----------|
| itemId | Text | Yes |
| itemType | Text | Yes |
| userId | Relation | Yes (to users) |
| deletedAt | Text | Yes |
| originalData | JSON | Yes |

3. Same API rules as above

### 4.4 Create "colleagues" Collection

1. Name: `colleagues`
2. Add fields:

| Field Name | Type | Required |
|------------|------|----------|
| userId | Relation | Yes (to users) |
| email | Email | Yes |
| name | Text | No |
| status | Text | Yes |

3. Same API rules

### 4.5 Create "shares" Collection

1. Name: `shares`
2. Add fields:

| Field Name | Type | Required |
|------------|------|----------|
| itemId | Text | Yes |
| itemType | Text | Yes |
| ownerId | Relation | Yes (to users) |
| sharedWithEmail | Email | Yes |

3. API Rules:
   - List: `ownerId = @request.auth.id`
   - View: `ownerId = @request.auth.id`
   - Create: `@request.auth.id != "" && ownerId = @request.auth.id`
   - Update: `ownerId = @request.auth.id`
   - Delete: `ownerId = @request.auth.id`

### 4.6 Create "workspace_invites" Collection

1. Name: `workspace_invites`
2. Add fields:

| Field Name | Type | Required |
|------------|------|----------|
| userId | Relation | Yes (to users) |
| email | Email | Yes |
| role | Text | Yes |

3. Same API rules as files

## Step 5: Configure Users Collection

The `users` collection is created by default. Update its API rules:

1. Go to Collections → users → API Rules
2. Set:
   - List: `@request.auth.id != ""`
   - View: `@request.auth.id != ""`
   - Create: Leave empty (anyone can sign up)
   - Update: `@request.auth.id = id`
   - Delete: `@request.auth.id = id`

## Step 6: Start Your Application

In a new terminal (keep PocketBase running):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Running the Application

### Development Mode

You need TWO terminals running:

**Terminal 1 - PocketBase:**
```bash
./pocketbase serve
```

**Terminal 2 - React App:**
```bash
npm run dev
```

### Testing

1. Open `http://localhost:5173`
2. Click "Sign up" to create a new account
3. Log in with your credentials
4. You should now see the Vault dashboard

## Data Migration (Optional)

If you have existing data in localStorage, you'll need to manually migrate it to PocketBase:

1. Export data from browser localStorage
2. Use the PocketBase Admin UI or API to import data
3. Match the data structure to the schema defined above

## Troubleshooting

### "Failed to fetch" errors
- Ensure PocketBase is running on port 8090
- Check the browser console for CORS errors
- Verify the PocketBase URL in `src/lib/pocketbase.ts` is correct

### Authentication errors
- Ensure you've created the collections with proper API rules
- Check that users collection allows anyone to create (for signup)
- Verify email/password meet requirements (min 8 chars for password)

### File upload errors
- Check the `files` collection has a `file` field of type File
- Ensure max file size is set appropriately
- Verify API rules allow authenticated users to create files

## Database Location

PocketBase stores data in the `pb_data` directory in your project root. This includes:
- `data.db` - SQLite database with all your data
- `storage` - Uploaded files
- `logs.db` - System logs

## Backup

To backup your data:
1. Stop PocketBase
2. Copy the entire `pb_data` directory
3. Restart PocketBase

## Production Deployment

For production:
1. Use environment variables for the PocketBase URL
2. Deploy PocketBase on a server (e.g., DigitalOcean, AWS, etc.)
3. Update `src/lib/pocketbase.ts` with your production URL
4. Enable HTTPS for PocketBase
5. Configure proper CORS settings

## Additional Resources

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [PocketBase API Reference](https://pocketbase.io/docs/api-records/)
- [JavaScript SDK Guide](https://github.com/pocketbase/js-sdk)
