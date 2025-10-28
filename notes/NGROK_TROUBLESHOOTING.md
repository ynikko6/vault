# ngrok + PocketBase Connection Issues

## Common Issues & Solutions

### Issue 1: ngrok connects but PocketBase doesn't recognize requests

**Symptoms:**
- ngrok tunnel shows "Forwarding" but requests fail
- "Connection refused" or "Cannot reach database"
- 502/503 errors through ngrok

**Solutions:**

1. **Check PocketBase is actually running:**
   ```bash
   curl http://127.0.0.1:8090/api/health
   ```
   Should return a response. If it doesn't, PocketBase isn't running.

2. **Verify ngrok is forwarding to the correct port:**
   ```bash
   npx ngrok http 8090
   ```
   Make sure it says "Forwarding" to `http://localhost:8090`

3. **Check the ngrok status page:**
   - Visit `http://127.0.0.1:4040` while ngrok is running
   - You'll see all requests passing through ngrok
   - Check if requests are being received

### Issue 2: CORS or "Origin not allowed" errors

**Symptoms:**
- Network requests blocked by browser
- Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**

Add your ngrok URL to PocketBase CORS settings:

1. Open PocketBase admin UI: `http://127.0.0.1:8090`
2. Go to **Settings → CORS**
3. Add your ngrok URL: `https://elvis-campanulate-britt.ngrok-free.dev`
4. Save and restart PocketBase

### Issue 3: ngrok URL is unreachable

**Symptoms:**
- "Failed to fetch" or "net::ERR_NAME_NOT_RESOLVED"
- ngrok tunnel shows but requests timeout

**Solutions:**

1. **Restart ngrok:**
   ```bash
   npx ngrok http 8090
   ```
   This generates a new URL - update your `.env` file

2. **Check your internet connection:**
   - ngrok needs internet to work
   - Try pinging a website to confirm connectivity

3. **Check firewall:**
   - Your firewall might be blocking ngrok
   - Allow ngrok through your firewall settings

### Issue 4: Database file not found / data missing

**Symptoms:**
- PocketBase runs locally but through ngrok it says database is missing
- Collections don't exist

**Solution:**

Make sure you're running PocketBase from the correct directory:

```bash
cd ~/pocketbase
./pocketbase serve
```

The `pb_data` folder (database) must be in the same directory as the PocketBase binary.

### Issue 5: ngrok URL keeps changing

**Symptoms:**
- Every time you restart ngrok, you get a different URL
- Netlify deployment fails because URL changed

**Solution:**

Use the same ngrok URL with the **static domain** feature:
- Upgrade to ngrok Pro ($5/month)
- Or manually update `.env` each time you restart ngrok

For now, use the free tier and update `.env` after restarting.

## Step-by-Step Verification

Run these checks in order:

1. **Is PocketBase running?**
   ```bash
   curl http://127.0.0.1:8090/api/health
   ```
   Expected: JSON response (not "Connection refused")

2. **Is ngrok running?**
   ```bash
   npx ngrok http 8090
   ```
   Expected: See "Forwarding" message with https URL

3. **Can you reach ngrok URL locally?**
   ```bash
   curl https://YOUR-NGROK-URL.ngrok-free.dev/api/health
   ```
   Replace with your actual URL. Expected: Same JSON response

4. **Is your `.env` file updated?**
   Check `.env` has the correct ngrok URL:
   ```
   VITE_POCKETBASE_URL=https://YOUR-NGROK-URL.ngrok-free.dev
   ```

5. **Did you rebuild/redeploy?**
   After updating `.env`, rebuild locally and redeploy to Netlify

## Debug Mode

If nothing works, enable verbose logging:

```bash
# Run ngrok with debug output
npx ngrok http 8090 --log=stdout --log-level=debug
```

This shows every request passing through ngrok, helping identify where it fails.

## Quick Checklist

- [ ] PocketBase running locally (`./pocketbase serve`)
- [ ] ngrok tunnel active (`npx ngrok http 8090`)
- [ ] `.env` file has correct ngrok URL
- [ ] Netlify redeployed after changing `.env`
- [ ] PocketBase CORS includes ngrok URL
- [ ] Browser cache cleared
- [ ] Testing on actual Netlify site (not localhost)

If still not working, check the ngrok status dashboard at `http://127.0.0.1:4040` to see what requests are actually being received.
