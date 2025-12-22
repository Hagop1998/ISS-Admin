# GitLab CI/CD Pipeline Setup Guide

This document explains how to set up and configure the GitLab CI/CD pipeline for the ISS Admin project.

## Pipeline Overview

The pipeline consists of 4 stages:

1. **Build** - Builds the React application
2. **Test** - Runs tests and generates coverage reports
3. **Lint** - Checks code quality (optional, allows failure)
4. **Deploy** - Deploys to staging or production environments

## Pipeline Stages

### Build Stage
- Installs dependencies using `npm ci --legacy-peer-deps`
- Builds the React application using `npm run build`
- Creates artifacts (build folder) that expire in 1 week
- Runs on: `main`, `master`, `develop` branches and merge requests

### Test Stage
- Runs test suite with coverage
- Generates coverage reports
- Runs on: `main`, `master`, `develop` branches and merge requests

### Lint Stage
- Checks for build warnings/errors
- Allows failure (won't block pipeline)
- Runs on: `main`, `master`, `develop` branches and merge requests

### Deploy Stages

#### Staging Deployment
- Deploys to staging environment
- Manual trigger required
- Runs on: `develop` branch
- URL: Configure in `.gitlab-ci.yml` (currently placeholder)

#### Production Deployment
- Deploys to production environment
- Manual trigger required
- Runs on: `main` or `master` branch
- URL: Configure in `.gitlab-ci.yml` (currently placeholder)

## Configuration Steps

### 1. Update Deployment Scripts

Edit `.gitlab-ci.yml` and update the deployment scripts in the `deploy:staging` and `deploy:production` jobs.

#### Option A: Deploy to Server via SSH/RSYNC

```yaml
deploy:production:
  # ... other config ...
  script:
    - apt-get update -qq && apt-get install -y -qq openssh-client rsync
    - mkdir -p ~/.ssh
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - ssh-keyscan -H $DEPLOY_SERVER >> ~/.ssh/known_hosts
    - rsync -avz --delete build/ $DEPLOY_USER@$DEPLOY_SERVER:/var/www/admin/
    - echo "Deployment completed!"
```

#### Option B: Deploy to Cloud Storage (AWS S3, Google Cloud Storage, etc.)

```yaml
deploy:production:
  # ... other config ...
  before_script:
    - apt-get update -qq && apt-get install -y -qq awscli
  script:
    - aws s3 sync build/ s3://your-bucket-name/admin/ --delete
    - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
    - echo "Deployment completed!"
```

#### Option C: Deploy to Docker Container

```yaml
deploy:production:
  # ... other config ...
  script:
    - docker build -t iss-admin:$CI_COMMIT_SHORT_SHA .
    - docker tag iss-admin:$CI_COMMIT_SHORT_SHA iss-admin:latest
    - docker push $DOCKER_REGISTRY/iss-admin:$CI_COMMIT_SHORT_SHA
    - docker push $DOCKER_REGISTRY/iss-admin:latest
    - echo "Docker image pushed successfully!"
```

### 2. Configure GitLab CI/CD Variables

Go to your GitLab project → Settings → CI/CD → Variables and add:

#### For SSH/RSYNC Deployment:
- `SSH_PRIVATE_KEY` - Your SSH private key (Type: Variable, Protected: Yes, Masked: No)
- `DEPLOY_SERVER` - Server IP or hostname (e.g., `192.168.1.100`)
- `DEPLOY_USER` - SSH username (e.g., `deploy`)

#### For AWS S3 Deployment:
- `AWS_ACCESS_KEY_ID` - AWS access key (Type: Variable, Protected: Yes, Masked: Yes)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (Type: Variable, Protected: Yes, Masked: Yes)
- `AWS_DEFAULT_REGION` - AWS region (e.g., `us-east-1`)

#### For Docker Deployment:
- `DOCKER_REGISTRY` - Docker registry URL
- `DOCKER_USERNAME` - Docker username
- `DOCKER_PASSWORD` - Docker password (Type: Variable, Protected: Yes, Masked: Yes)

### 3. Update Environment URLs

Update the `url` field in the deploy jobs with your actual deployment URLs:

```yaml
deploy:staging:
  environment:
    name: staging
    url: https://admin-staging.yourdomain.com  # Update this

deploy:production:
  environment:
    name: production
    url: https://admin.yourdomain.com  # Update this
```

### 4. Configure Branch Protection (Recommended)

1. Go to Settings → Repository → Protected Branches
2. Protect `main`/`master` branch
3. Set merge/push permissions as needed

## Usage

### Automatic Pipeline Triggers

The pipeline automatically runs on:
- Push to `main`, `master`, or `develop` branches
- Merge requests targeting these branches

### Manual Deployment

1. Go to CI/CD → Pipelines
2. Find the pipeline you want to deploy
3. Click the play button (▶️) next to the deploy job
4. Select the environment (staging or production)
5. Click "Run job"

### Viewing Pipeline Status

- Go to CI/CD → Pipelines to see all pipeline runs
- Click on a pipeline to see detailed job logs
- Green checkmark = Success
- Red X = Failed
- Orange play button = Manual job waiting

## Troubleshooting

### Build Fails

- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Deployment Fails

- Verify SSH keys or cloud credentials are correct
- Check server permissions and paths
- Verify environment variables are set correctly

### Tests Fail

- Review test output in job logs
- Ensure all tests pass locally before pushing
- Check test coverage thresholds

## Advanced Configuration

### Custom Docker Image

If you need a custom Docker image, create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Then update the pipeline to use Docker:

```yaml
build:
  image: docker:latest
  services:
    - docker:dind
  # ... rest of config
```

### Parallel Jobs

You can run tests in parallel:

```yaml
test:unit:
  # ... unit tests

test:integration:
  # ... integration tests
```

## Support

For issues or questions:
1. Check GitLab CI/CD documentation
2. Review pipeline logs
3. Contact your DevOps team

