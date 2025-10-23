# PocketBase + Netlify Setup Guide

This guide explains how to run PocketBase on your laptop and expose it to your Netlify-hosted frontend using ngrok.

## Prerequisites

- PocketBase binary (download from https://pocketbase.io)
- ngrok account (free tier at https://ngrok.com)
- Your Netlify site deployed

## Step 1: Download PocketBase

1. Go to https://pocketbase.io and download the binary for your OS (macOS, Windows, or Linux)
2. Extract the archive to a folder on your laptop (e.g., `~/pocketbase`)

## Step 2: Start PocketBase Locally

1. Open a terminal and navigate to your PocketBase folder:
   ```bash
   cd ~/pocketbase
   ```

2. Run PocketBase:
   ```bash
   ./pocketbase serve
   ```

3. You should see output like:
   ```
   Server started at http://127.0.0.1:8090
   ```

4. Open http://127.0.0.1:8090 in your browser to access the PocketBase admin UI
5. **Keep this terminal open** - PocketBase must be running for your app to work

## Step 3: Setup ngrok Authentication

1. Create a free account at https://ngrok.com
2. Get your auth token from the ngrok dashboard
3. Run ngrok setup in your project:
   ```bash
   npx ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
   (Replace `YOUR_AUTH_TOKEN` with your token from the ngrok dashboard)

## Step 4: Expose PocketBase with ngrok

1. Open a **new terminal** in your project root (keep the PocketBase terminal open)
2. Run ngrok to expose your local PocketBase:
   ```bash
   npx ngrok http 8090
   ```

3. ngrok will output something like:
   ```
   Forwarding     https://1234-56-789-101-112.ngrok.io -> http://localhost:8090
   ```

4. Copy the `https://` URL (your ngrok tunnel address)
5. **Keep this terminal open too** - the tunnel must stay active

## Step 5: Update Your .env File

1. Open `.env.example` in your project root
2. Update the production URL with your ngrok tunnel:
   ```
   # PocketBase Configuration
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   
   # For production with ngrok tunnel (replace with your ngrok URL)
   VITE_POCKETBASE_URL=https://your-ngrok-url.ngrok-free.dev
   ```

3. Create a `.env` file with your active ngrok URL:
   ```
   VITE_POCKETBASE_URL=https://your-ngrok-url.ngrok-free.dev
   ```

4. Your frontend code will automatically use this URL:
   ```typescript
   // src/lib/pocketbase.ts
   export const pb = new PocketBase(
     import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'
   );
   ```

5. Rebuild and deploy to Netlify

## Step 6: Test Your Setup

1. Visit your Netlify site
2. Try logging in or performing a PocketBase operation
3. Check browser DevTools → Network tab to confirm requests go to your ngrok URL

## Important Notes

⚠️ **Your laptop must stay online and running both terminals** for the app to work

- Terminal 1: PocketBase server
- Terminal 2: ngrok tunnel

If you close either, your Netlify site won't be able to reach PocketBase.

## Troubleshooting

**ngrok URL changes each time I restart?**
- Yes, ngrok generates a new URL each restart. Update your environment variables accordingly.
- To keep the same URL, upgrade to a paid ngrok plan.

**CORS errors?**
- PocketBase has CORS enabled by default. If you get CORS errors:
  1. Check the ngrok URL is correct
  2. Restart PocketBase and ngrok
  3. Clear browser cache and try again

**Connection refused?**
- Make sure PocketBase is running (`./pocketbase serve`)
- Make sure ngrok tunnel is active
- Verify the ngrok URL matches what's in your environment variables

## Next Steps (For Production)

When you're ready for a persistent backend:
- Deploy PocketBase to a VPS (DigitalOcean, AWS, Hetzner, etc.)
- Use a domain name and SSL certificate
- Keep your data backed up regularly

For now, this setup lets you develop and test locally while hosting your frontend on Netlify!
