# Vercel Environment Variables - What You Need

## Current Status

With the proxy setup, you **DON'T need** `REACT_APP_API_BASE_URL` in Vercel anymore!

## What You Should Have in Vercel

### Option 1: No Variables Needed (Recommended) ✅
Since we're using the Vercel proxy (`vercel.json`), you don't need any environment variables!

**What to do:**
1. Go to Vercel → Settings → Environment Variables
2. **Delete** `REACT_APP_API_BASE_URL` if it exists
3. That's it! The proxy handles everything.

---

### Option 2: If You Want to Keep Variables (Optional)

If you want to keep the option to override the API URL, you can keep:
- `REACT_APP_API_BASE_URL` = (leave empty or delete)
- `REACT_APP_API_BASE_PATH` = `/api` (optional, defaults to `/api`)

But this is **not necessary** since the code now always uses `/api` path.

---

## How to Check What You Have

1. Go to Vercel Dashboard
2. Click on your project: **iss-admin**
3. Go to **Settings** → **Environment Variables**
4. See what's listed there

---

## What Should Be There?

**Ideally:** Nothing (empty list)

**Or if you have:**
- `REACT_APP_API_BASE_URL` → **Delete it** (not needed with proxy)
- `REACT_APP_API_BASE_PATH` → Can keep it or delete (defaults to `/api`)

---

## Summary

**Question:** Do I have variables in CI/CD in Vercel?

**Answer:** 
- Vercel doesn't have "CI/CD variables" - it has "Environment Variables"
- You **don't need** any variables now (proxy handles it)
- If you added `REACT_APP_API_BASE_URL` earlier, **delete it**

---

## Quick Check

Go to: **Vercel → Your Project → Settings → Environment Variables**

If you see `REACT_APP_API_BASE_URL`, delete it. You don't need it anymore!

