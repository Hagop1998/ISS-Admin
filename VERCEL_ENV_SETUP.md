# Fix Vercel Environment Variables

## Problem
Your app is trying to call `/undefined/auth/login` because `REACT_APP_API_BASE_URL` is not set in Vercel.

## Solution: Add Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com
2. Click on your project: **iss-admin**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Your API URL

Add these environment variables:

#### Required Variable:
- **Name:** `REACT_APP_API_BASE_URL`
- **Value:** Your backend API URL (e.g., `http://138.68.88.206:9001` or `https://api.yourdomain.com`)
- **Environment:** Select all (Production, Preview, Development)

#### Optional Variable (if you use a proxy path):
- **Name:** `REACT_APP_API_BASE_PATH`
- **Value:** `/api` (or whatever path you use)
- **Environment:** Select all

### Step 3: Redeploy

After adding the variables:
1. Go to **Deployments** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic redeploy

---

## How to Find Your API URL

Your API URL should be:
- The backend server where your API is hosted
- Example: `http://138.68.88.206:9001` (from your previous API docs)
- Or: `https://api.yourdomain.com`

**Important:** 
- If your API uses HTTP (not HTTPS), you might need to use a proxy or enable CORS
- If your API is on a different domain, make sure CORS is enabled on your backend

---

## Quick Fix Steps:

1. **In Vercel Dashboard:**
   - Settings → Environment Variables
   - Add: `REACT_APP_API_BASE_URL` = `http://138.68.88.206:9001` (or your actual API URL)
   - Save

2. **Redeploy:**
   - Deployments → Latest → Redeploy

3. **Test:**
   - Go to your live site
   - Try logging in again

---

## CORS Issue?

If you get CORS errors after setting the URL, you need to:
1. Enable CORS on your backend server
2. Or use a proxy (Vercel has proxy support)
3. Or deploy backend and frontend on same domain

---

## Need Help?

Share your backend API URL and I'll help you configure it correctly!

