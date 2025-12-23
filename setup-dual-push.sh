#!/bin/bash

# Script to configure Git to push to both GitHub and GitLab automatically

echo "🔧 Setting up dual remote push configuration..."

# Get current remote URL
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$CURRENT_REMOTE" ]; then
    echo "❌ No 'origin' remote found. Please check your git configuration."
    exit 1
fi

echo "Current remote (origin): $CURRENT_REMOTE"
echo ""

# Ask for GitHub URL
echo "Please provide your GitHub repository URL:"
echo "Example: https://github.com/your-username/ISS-Admin.git"
read -p "GitHub URL: " GITHUB_URL

if [ -z "$GITHUB_URL" ]; then
    echo "❌ GitHub URL is required!"
    exit 1
fi

# Rename origin to gitlab for clarity
echo ""
echo "Renaming 'origin' to 'gitlab'..."
git remote rename origin gitlab
echo "✅ Renamed origin to gitlab"

# Add GitHub remote
echo ""
echo "Adding GitHub remote..."
git remote add github "$GITHUB_URL"
echo "✅ Added GitHub remote"

# Set up origin to push to both
echo ""
echo "Configuring 'origin' to push to both GitLab and GitHub..."
git remote add origin "$CURRENT_REMOTE"
git remote set-url --add --push origin "$CURRENT_REMOTE"
git remote set-url --add --push origin "$GITHUB_URL"
echo "✅ Configured origin to push to both remotes"

# Verify configuration
echo ""
echo "📋 Current remote configuration:"
git remote -v

echo ""
echo "✅ Setup complete!"
echo ""
echo "Now you can use:"
echo "  git push origin main    → Pushes to BOTH GitLab and GitHub"
echo "  git push gitlab main    → Pushes to GitLab only"
echo "  git push github main    → Pushes to GitHub only"
echo ""

