# Pipeline Troubleshooting Guide

## Common Issues and Fixes

### Issue 1: `npm ci` fails
**Error**: `npm ERR! cipm can only install packages when your package.json and package-lock.json are in sync`

**Fix**: Changed to `npm install` in the pipeline. If you still see this:
- Make sure `package-lock.json` is committed to git
- Run `npm install` locally and commit the updated `package-lock.json`

### Issue 2: Build fails with environment variable errors
**Error**: `REACT_APP_*` variables not found

**Fix**: Add environment variables in GitLab:
1. Go to **Settings → CI/CD → Variables**
2. Add variables like:
   - `REACT_APP_API_BASE_URL`
   - `REACT_APP_API_BASE_PATH`
   - Any other `REACT_APP_*` variables you need

### Issue 3: Build fails with "Cannot find module"
**Error**: Module not found errors

**Fix**: 
- Make sure all dependencies are in `package.json`
- Run `npm install` locally and commit `package-lock.json`
- Check if you're using any private packages that need authentication

### Issue 4: Tests fail
**Error**: Test failures

**Fix**: 
- Tests are set to `allow_failure: true` in lint stage
- Check test output in GitLab pipeline logs
- Fix failing tests or update test configuration

### Issue 5: Out of memory errors
**Error**: `JavaScript heap out of memory`

**Fix**: Add memory limit to build script:
```yaml
script:
  - NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Issue 6: Build succeeds but artifacts not created
**Error**: No build artifacts

**Fix**: 
- Check if `build/` directory exists after build
- Verify `artifacts.paths` in `.gitlab-ci.yml`
- Check build logs for any warnings

## Debugging Steps

1. **Check Pipeline Logs**:
   - Go to **CI/CD → Pipelines**
   - Click on the failed pipeline
   - Click on the failed job
   - Review the error messages

2. **Test Locally**:
   ```bash
   # Test the build locally
   npm install --legacy-peer-deps
   npm run build
   
   # If it works locally, the issue is in the pipeline configuration
   ```

3. **Check GitLab Runner**:
   - Verify GitLab Runner is available
   - Check runner tags match your jobs (if using tags)

4. **Verify Files are Committed**:
   ```bash
   git status
   git add .
   git commit -m "Fix pipeline"
   git push
   ```

## Quick Fixes

### If build keeps failing, try this minimal pipeline:

```yaml
build:
  stage: build
  image: node:18
  script:
    - npm install --legacy-peer-deps
    - CI=false npm run build
  artifacts:
    paths:
      - build/
```

### If you need to skip tests temporarily:

Add this to your `.gitlab-ci.yml`:
```yaml
test:
  script:
    - echo "Skipping tests for now"
  when: manual
  allow_failure: true
```

## Getting Help

1. **Check GitLab Documentation**: https://docs.gitlab.com/ee/ci/
2. **Review Pipeline Logs**: Look for specific error messages
3. **Test Locally First**: If it works locally, it should work in CI
4. **Share Error Messages**: Copy the exact error from GitLab pipeline logs

## Environment Variables Checklist

Make sure these are set in GitLab (Settings → CI/CD → Variables) if your app needs them:

- [ ] `REACT_APP_API_BASE_URL`
- [ ] `REACT_APP_API_BASE_PATH`
- [ ] Any other `REACT_APP_*` variables
- [ ] Deployment credentials (if deploying)

