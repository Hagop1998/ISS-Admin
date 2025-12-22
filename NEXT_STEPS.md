# Next Steps - GitLab CI/CD Pipeline Setup

## Step 1: Commit and Push Pipeline Files

Run these commands in your terminal:

```bash
# Add the new pipeline files
git add .gitlab-ci.yml CI_CD_SETUP.md .gitignore

# Commit the changes
git commit -m "Add GitLab CI/CD pipeline configuration"

# Push to GitLab
git push origin main
```

## Step 2: Verify Pipeline Runs

1. Go to your GitLab project
2. Navigate to **CI/CD → Pipelines**
3. You should see a new pipeline running automatically
4. Click on it to see the build progress

## Step 3: Configure Deployment (When Ready)

### Option A: Deploy to a Server via SSH

1. **Generate SSH Key Pair** (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "gitlab-ci@yourdomain.com"
   ```

2. **Add Public Key to Server**:
   ```bash
   ssh-copy-id user@your-server-ip
   ```

3. **Add GitLab CI/CD Variables**:
   - Go to: **Settings → CI/CD → Variables**
   - Add these variables:
     - `SSH_PRIVATE_KEY` (Type: Variable, Value: Your private SSH key)
     - `DEPLOY_SERVER` (Type: Variable, Value: Your server IP/hostname)
     - `DEPLOY_USER` (Type: Variable, Value: SSH username)

4. **Update `.gitlab-ci.yml`** deployment scripts (lines 70-90) with your server details

### Option B: Deploy to AWS S3 + CloudFront

1. **Create S3 Bucket** for your admin app
2. **Add GitLab CI/CD Variables**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_DEFAULT_REGION`
   - `S3_BUCKET_NAME`
   - `CLOUDFRONT_DISTRIBUTION_ID` (optional)

3. **Update `.gitlab-ci.yml`** deployment scripts

### Option C: Deploy to Docker Registry

1. **Set up Docker Registry** (Docker Hub, GitLab Container Registry, etc.)
2. **Add GitLab CI/CD Variables**:
   - `DOCKER_REGISTRY`
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`

3. **Create Dockerfile** (if not exists)
4. **Update `.gitlab-ci.yml`** deployment scripts

## Step 4: Test the Pipeline

1. **Make a small change** to trigger the pipeline:
   ```bash
   # Make a small change
   echo "# Test" >> README.md
   git add README.md
   git commit -m "Test pipeline"
   git push origin main
   ```

2. **Watch the pipeline** in GitLab CI/CD → Pipelines

3. **Check build artifacts** are created successfully

## Step 5: Test Deployment (When Configured)

1. Go to **CI/CD → Pipelines**
2. Find a successful pipeline
3. Click the **play button (▶️)** next to `deploy:staging` or `deploy:production`
4. Verify deployment succeeds

## Current Pipeline Status

✅ **Build Stage**: Ready to run
✅ **Test Stage**: Ready to run  
✅ **Lint Stage**: Ready to run
⏳ **Deploy Stages**: Need configuration (see Step 3)

## Quick Commands Reference

```bash
# Check pipeline status
git status

# View recent commits
git log --oneline -5

# Check GitLab remote
git remote -v

# View pipeline in browser (after pushing)
# Go to: https://gitlab.com/your-username/iss-admin/-/pipelines
```

## Troubleshooting

### Pipeline Not Running?
- Check if `.gitlab-ci.yml` is in the root directory
- Verify you pushed to `main`, `master`, or `develop` branch
- Check GitLab project settings → CI/CD → General pipelines

### Build Fails?
- Check Node.js version compatibility
- Verify `package.json` has all dependencies
- Review build logs in GitLab

### Deployment Fails?
- Verify all required variables are set
- Check server/cloud credentials
- Review deployment logs for specific errors

## Need Help?

- Review `CI_CD_SETUP.md` for detailed configuration
- Check GitLab CI/CD documentation
- Review pipeline logs for specific errors

