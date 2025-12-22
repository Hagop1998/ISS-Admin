# Fix Mixed Content Error

## Problem
Your site is on HTTPS (`iss-admin.vercel.app`) but trying to call HTTP API (`http://138.68.88.206:9001`). Browsers block this for security.

**Error:** `(blocked:mixed-content)`

## Solution: Use Vercel Proxy

I've created a `vercel.json` file that will proxy all `/api/*` requests to your backend.

### Step 1: Update Your Code

I've already updated `authService.js` to use the proxy path. Now you need to:

1. **Commit and push the changes:**
   ```bash
   git add vercel.json src/services/authService.js
   git commit -m "Fix mixed content error - use Vercel proxy"
   git push origin main
   ```

2. **Remove the environment variable** (or set it to empty):
   - Go to Vercel → Settings → Environment Variables
   - Delete or leave `REACT_APP_API_BASE_URL` empty
   - The app will now use `/api` path which gets proxied

### Step 2: How It Works

- Your app calls: `https://iss-admin.vercel.app/api/auth/login`
- Vercel proxy rewrites it to: `http://138.68.88.206:9001/api/auth/login`
- No mixed content error! ✅

### Step 3: Update All Services

You need to update all your service files to use the proxy path in production. The pattern is:

**Before:**
```javascript
const url = process.env.NODE_ENV === 'development' 
  ? `${API_BASE_PATH}/auth/login`
  : `${API_BASE_URL}/auth/login`;
```

**After:**
```javascript
const url = process.env.NODE_ENV === 'development' 
  ? `${API_BASE_PATH}/auth/login`
  : API_BASE_URL 
    ? `${API_BASE_URL}/auth/login`
    : `${API_BASE_PATH}/auth/login`; // Use proxy in production
```

---

## Alternative: Use HTTPS for Your API

If your backend supports HTTPS:
1. Update `vercel.json` to use `https://` instead of `http://`
2. Or set `REACT_APP_API_BASE_URL` to your HTTPS API URL

---

## Quick Fix Steps:

1. ✅ `vercel.json` is created (I did this)
2. ✅ `authService.js` is updated (I did this)
3. **You need to:**
   - Update other service files (userService, deviceService, etc.) with the same pattern
   - Or I can do it for you - just say "update all services"
   - Commit and push
   - Vercel will auto-deploy

---

## Need Help?

Tell me if you want me to update all service files automatically!

