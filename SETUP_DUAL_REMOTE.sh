#!/bin/bash

# Script to set up dual remote (GitHub + GitLab)
# Run this script after creating your GitHub repository

echo "Setting up dual remote for GitHub and GitLab..."

# Step 1: Rename origin to gitlab (optional, for clarity)
read -p "Do you want to rename 'origin' to 'gitlab'? (y/n): " rename_origin
if [ "$rename_origin" = "y" ]; then
    git remote rename origin gitlab
    echo "✅ Renamed origin to gitlab"
else
    echo "ℹ️  Keeping origin as is"
fi

# Step 2: Get GitHub repository URL
echo ""
echo "Please provide your GitHub repository URL:"
echo "Example: https://github.com/your-username/ISS-Admin.git"
read -p "GitHub URL: " github_url

if [ -z "$github_url" ]; then
    echo "❌ GitHub URL is required!"
    exit 1
fi

# Step 3: Add GitHub remote
git remote add github "$github_url"
echo "✅ Added GitHub remote"

# Step 4: Verify remotes
echo ""
echo "Current remotes:"
git remote -v

# Step 5: Test push (optional)
echo ""
read -p "Do you want to push to both remotes now? (y/n): " push_now
if [ "$push_now" = "y" ]; then
    current_branch=$(git branch --show-current)
    echo "Pushing to GitLab..."
    git push gitlab "$current_branch" || git push origin "$current_branch"
    echo "Pushing to GitHub..."
    git push github "$current_branch"
    echo "✅ Pushed to both remotes!"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To push to both remotes in the future, use:"
echo "  git push gitlab main && git push github main"
echo ""
echo "Or set up an alias:"
echo "  git config --global alias.pushall '!git push gitlab && git push github'"
echo "  Then use: git pushall main"

