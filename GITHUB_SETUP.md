# GitHub Setup Guide for WAIOne Project

This guide will help you push your WAIOne project to GitHub.

## Prerequisites

- Git installed on your system
- GitHub account
- GitHub CLI (`gh`) installed (optional, but recommended)

## Step-by-Step Instructions

### Option 1: Using GitHub CLI (Recommended - Easiest)

#### 1. Install GitHub CLI (if not already installed)
```bash
# Windows (using winget)
winget install --id GitHub.cli

# Or download from: https://cli.github.com/
```

#### 2. Authenticate with GitHub
```bash
gh auth login
```
Follow the prompts to authenticate.

#### 3. Create Repository and Push
```bash
# Navigate to project root
cd C:\AIJive\waione

# Create repository on GitHub and push
gh repo create waione --public --source=. --remote=origin --push
```

### Option 2: Using GitHub Web Interface (Manual)

#### 1. Create Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Repository name: `waione` (or your preferred name)
4. Description: "Shared database mobile apps - HealthyWAI and DispatchWAI"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **Create repository**

#### 2. Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Navigate to project root
cd C:\AIJive\waione

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/waione.git

# Rename default branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Option 3: Using SSH (If you have SSH keys set up)

```bash
# Add remote using SSH
git remote add origin git@github.com:YOUR_USERNAME/waione.git

# Push to GitHub
git push -u origin main
```

## Initial Commit

If you haven't committed yet, run:

```bash
# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: WAIOne project with HealthyWAI app and backend API

- Backend API with Express, PostgreSQL, Sequelize
- HealthyWAI Expo mobile app
- Authentication with JWT and OAuth support
- Database migrations and models
- API client with error handling and logging
- Password visibility toggle in login screen
- Test user management scripts"

# Push to GitHub
git push -u origin main
```

## Files Included in Repository

The following files and folders will be pushed to GitHub:

### Backend
- ✅ All source code in `backend/src/`
- ✅ Database migrations
- ✅ Package configuration
- ✅ Utility scripts (list-users.js, create-test-user.js, reset-test-user-password.js)
- ✅ Configuration files

### HealthyWAI App
- ✅ All source code in `healthywai/src/`
- ✅ App configuration
- ✅ Package configuration

### Other Apps
- ✅ DispatchWAI app
- ✅ WAIGIT app
- ✅ Shared API client

### Root Files
- ✅ README.md
- ✅ docker-compose.yml
- ✅ .gitignore

## Files Excluded (via .gitignore)

- ❌ `node_modules/` - Dependencies (install with `npm install`)
- ❌ `.env` files - Environment variables (create locally)
- ❌ `.expo/` - Expo build files
- ❌ Log files
- ❌ IDE configuration files

## After Pushing to GitHub

### 1. Set Up Environment Variables

**Backend (.env file):**
```bash
cd backend
# Create .env file with your configuration
# See backend/.env.example if available, or use the template from README.md
```

**Mobile Apps:**
- Update `healthywai/app.json` with your API URL
- Update `dispatchwai/app.json` if needed

### 2. Clone on Another Machine

```bash
git clone https://github.com/YOUR_USERNAME/waione.git
cd waione
```

### 3. Set Up Development Environment

```bash
# Install backend dependencies
cd backend
npm install

# Install HealthyWAI dependencies
cd ../healthywai
npm install

# Install other app dependencies as needed
```

## Repository Structure on GitHub

Your repository will have this structure:

```
waione/
├── backend/              # Backend API
├── healthywai/          # HealthyWAI mobile app
├── dispatchwai/         # DispatchWAI mobile app
├── waigit/              # WAIGIT app
├── shared/              # Shared components
├── README.md
├── docker-compose.yml
└── .gitignore
```

## Next Steps

1. ✅ Push code to GitHub (follow steps above)
2. ⬜ Add repository description and topics on GitHub
3. ⬜ Set up GitHub Actions for CI/CD (optional)
4. ⬜ Add collaborators (optional)
5. ⬜ Create issues for future enhancements
6. ⬜ Set up branch protection rules (for production)

## Troubleshooting

### Authentication Issues

If you get authentication errors:

```bash
# Use GitHub CLI to authenticate
gh auth login

# Or use personal access token
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/waione.git
```

### Large Files

If you have large files that shouldn't be in git:

```bash
# Remove from git (but keep locally)
git rm --cached large-file.ext

# Add to .gitignore
echo "large-file.ext" >> .gitignore

# Commit the change
git commit -m "Remove large file from repository"
```

### Push Rejected

If push is rejected:

```bash
# Pull remote changes first
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```
