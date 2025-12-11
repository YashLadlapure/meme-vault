# CI/CD Setup Guide - Meme Vault

## Overview

This project is now equipped with a comprehensive CI/CD pipeline using **GitHub Actions** - completely **free** with no additional costs.

## What is CI/CD?

**CI (Continuous Integration):** Automatically runs tests and checks when you push code
**CD (Continuous Deployment):** Automatically deploys your application when tests pass

## Workflows Implemented

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:** Every push to `main` branch and pull requests

**What it does:**
- ✅ Installs dependencies
- ✅ Checks code with linter (if configured)
- ✅ Builds the frontend
- ✅ Runs tests (if available)
- ✅ Verifies build artifacts
- ✅ Performs security audits
- ✅ Tests on Node.js 18.x and 20.x

**Features:**
- Uses dependency caching for faster builds
- Runs in parallel for efficiency
- Automatic code quality checks

### 2. Deployment Pipeline (`.github/workflows/deploy.yml`)

**Triggers:** Every push to `main` branch

**What it does:**
- ✅ Builds the application
- ✅ Archives build artifacts
- ✅ Verifies deployment readiness
- ✅ Stores artifacts for 5 days

**Features:**
- Pre-deployment validation checks
- Build artifact preservation
- Informative deployment logs

## How to Monitor Your Workflows

### View Workflow Status

1. Go to your repository
2. Click **Actions** tab at the top
3. View all workflow runs
4. Click on any workflow to see detailed logs

### Workflow Icons
- ✅ **Green checkmark** = Success
- ❌ **Red X** = Failed
- ⏳ **Yellow dot** = In progress

## Cost

**FREE!**
- GitHub Actions includes 2,000 free minutes per month
- This project uses minimal minutes per build (~2-3 minutes)
- You can build 600+ times per month for free
- No credit card required

## Customization

### Add Tests

Create a test script in `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

The CI pipeline will automatically run tests.

### Add Linting

Install ESLint and create a lint script:
```bash
npm install --save-dev eslint
```

Add to `package.json`:
```json
{
  "scripts": {
    "lint": "eslint src/"
  }
}
```

### Customize Triggers

Edit `.github/workflows/ci.yml` to trigger on different events:
```yaml
on:
  push:
    branches: [ main, develop ]  # Add more branches
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight
```

## Environment Variables

If your workflow needs environment variables:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add your variables
4. Reference in workflow: `${{ secrets.YOUR_SECRET_NAME }}`

## Troubleshooting

### Workflow Failed

1. Click **Actions** tab
2. Click the failed workflow
3. Check the logs
4. Common issues:
   - Missing dependencies: Run `npm install` locally
   - Build errors: Check `npm run build` locally
   - Node version: Ensure Node.js 18+ installed locally

### Workflow Not Triggering

- Check branch name (should be `main`)
- Ensure workflow file is in `.github/workflows/` folder
- Syntax errors in YAML? Use YAML validator online

## Integration with Vercel

Your deployment workflow prepares builds, and Vercel automatically deploys when you push to main:

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Vercel watches for main branch pushes
4. Automatic deployment on successful build

## Next Steps

1. ✅ Monitor first workflow run: Check **Actions** tab
2. ✅ Review logs: Click on any workflow to see details
3. ✅ Add tests: Implement unit tests for better quality
4. ✅ Enable branch protection: Require CI to pass before merging
5. ✅ Add more checks: Code coverage, performance tests, etc.

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

## Questions?

Check the workflow logs or GitHub's documentation for more help!

---

**Happy continuous building! 🚀**
