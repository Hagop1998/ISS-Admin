# Push to Both GitHub and GitLab

## ✅ Setup Complete!

Your repository is now configured to push to both GitHub and GitLab!

### Current Configuration

**Remotes:**
- `origin` → GitLab: `https://gitlab.com/degirmenjian.hagop1998-group/iss-admin.git`
- `github` → GitHub: `https://github.com/Hagop1998/ISS-Admin.git`

**Git Alias Created:**
- `git pushall` → Pushes to both remotes automatically

### Verify Your Setup

```bash
git remote -v
```

You should see:
```
github    https://github.com/Hagop1998/ISS-Admin.git (fetch)
github    https://github.com/Hagop1998/ISS-Admin.git (push)
origin    https://gitlab.com/degirmenjian.hagop1998-group/iss-admin.git (fetch)
origin    https://gitlab.com/degirmenjian.hagop1998-group/iss-admin.git (push)
```

## How to Push to Both

### ✅ Recommended: Use the `pushall` Alias (Easiest)

```bash
# Push current branch to both GitHub and GitLab
git pushall

# Or specify branch
git pushall main
```

This will automatically push to both `origin` (GitLab) and `github` (GitHub).

### Option 2: Push Separately

```bash
# Push to GitLab (origin)
git push origin main

# Push to GitHub
git push github main
```

### Option 3: Push Both in One Line

```bash
git push origin main && git push github main
```

---

## Recommended Setup

### Keep Remotes Separate (Easier to Manage)

```bash
# GitLab (your current remote)
git remote add gitlab https://gitlab.com/degirmenjian.hagop1998-group/iss-admin.git

# GitHub (new remote)
git remote add github https://github.com/your-username/ISS-Admin.git

# Push to both
git push gitlab main
git push github main
```

### Or Create an Alias for Easy Pushing

```bash
# Add this to your ~/.gitconfig or run:
git config --global alias.pushall '!git push gitlab && git push github'

# Now you can use:
git pushall main
```

---

## Quick Setup (Automatic Push to Both)

### Option 1: Use the Setup Script (Easiest)

I've created a script for you. Just run:

```bash
chmod +x setup-dual-push.sh
./setup-dual-push.sh
```

Follow the prompts and it will configure everything automatically!

### Option 2: Manual Setup

Run these commands (replace with your GitHub URL):

```bash
# 1. Rename origin to gitlab
git remote rename origin gitlab

# 2. Add GitHub remote
git remote add github https://github.com/YOUR_USERNAME/ISS-Admin.git

# 3. Configure origin to push to both
git remote add origin https://gitlab.com/degirmenjian.hagop1998-group/iss-admin.git
git remote set-url --add --push origin https://gitlab.com/degirmenjian.hagop1998-group/iss-admin.git
git remote set-url --add --push origin https://github.com/YOUR_USERNAME/ISS-Admin.git

# 4. Verify
git remote -v

# 5. Test push (pushes to BOTH automatically!)
git push origin main
```

---

## First Push to GitHub

Since your GitHub repository is empty, you'll need to push your code for the first time:

```bash
# Push to GitHub (first time)
git push github main

# Or use the alias to push to both
git pushall main
```

**Note:** Make sure you're authenticated with GitHub. If you get authentication errors, you may need to:
1. Use a Personal Access Token instead of password
2. Or set up SSH keys for GitHub

---

## Important Notes

1. **Both repositories will have the same code**
2. **Vercel can connect to either GitHub or GitLab** (you're using GitLab now)
3. **GitLab CI/CD pipeline** will still work (it's separate from GitHub)
4. **You can use both** for different purposes:
   - GitLab: CI/CD pipeline, team collaboration
   - GitHub: Portfolio, backup, open source

---

## Troubleshooting

### If GitHub remote already exists:
```bash
git remote remove github
git remote add github https://github.com/your-username/ISS-Admin.git
```

### If you want to rename remotes:
```bash
git remote rename origin gitlab
git remote add github https://github.com/your-username/ISS-Admin.git
```

---

## Need Help?

Share your GitHub repository URL and I'll help you set it up!

