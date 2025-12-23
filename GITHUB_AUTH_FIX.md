# Fix GitHub Authentication Error

## Problem
```
! [remote failure]  main -> main (remote failed to report status)
error: failed to push some refs to 'https://github.com/Hagop1998/ISS-Admin.git'
```

## Solution: Use Personal Access Token

GitHub no longer accepts passwords for HTTPS pushes. You need a **Personal Access Token (PAT)**.

### Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `ISS-Admin Push`
4. Select expiration (30 days, 90 days, or no expiration)
5. Check the **`repo`** scope (full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)

### Step 2: Push Using the Token

When you run:
```bash
git push github main
```

It will prompt for credentials:
- **Username**: Your GitHub username (`Hagop1998`)
- **Password**: Paste your **Personal Access Token** (NOT your GitHub password)

### Step 3: Save Credentials (Optional)

To avoid entering the token every time, you can cache it:

**macOS:**
```bash
git config --global credential.helper osxkeychain
```

**Linux:**
```bash
git config --global credential.helper store
```

After the first push with the token, it will be saved.

---

## Alternative: Use SSH (More Secure)

If you prefer SSH:

### Step 1: Check if you have SSH keys
```bash
ls -al ~/.ssh
```

### Step 2: Generate SSH key (if you don't have one)
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### Step 3: Add SSH key to GitHub
1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. Go to: https://github.com/settings/keys
3. Click **"New SSH key"**
4. Paste your public key
5. Click **"Add SSH key"**

### Step 4: Change GitHub remote to SSH
```bash
git remote set-url github git@github.com:Hagop1998/ISS-Admin.git
```

### Step 5: Test SSH connection
```bash
ssh -T git@github.com
```

### Step 6: Push
```bash
git push github main
```

---

## Quick Fix: Try Pushing Again

After creating your Personal Access Token, just run:

```bash
git push github main
```

Enter your GitHub username and the token when prompted.

---

## Verify It Worked

After successful push, check GitHub:
https://github.com/Hagop1998/ISS-Admin

You should see all your files there!

