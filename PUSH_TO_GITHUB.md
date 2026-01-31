# Quick Guide: Push WAIOne to GitHub

## ✅ Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Fastest)

```powershell
# Install GitHub CLI if needed
winget install --id GitHub.cli

# Authenticate
gh auth login

# Create repository and push
gh repo create waione --public --source=. --remote=origin --push
```

### Option B: Using GitHub Website

1. Go to https://github.com/new
2. Repository name: `waione`
3. Description: "Shared database mobile apps - HealthyWAI and DispatchWAI"
4. Choose Public or Private
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

## ✅ Step 2: Connect and Push

After creating the repository on GitHub, run:

```powershell
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/waione.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## ✅ Step 3: Verify

Visit: `https://github.com/YOUR_USERNAME/waione`

You should see all your files!

## 📝 What's Included

- ✅ Backend API (Express, PostgreSQL, Sequelize)
- ✅ HealthyWAI mobile app
- ✅ DispatchWAI mobile app
- ✅ WAIGIT app
- ✅ Shared API client
- ✅ Database migrations
- ✅ All source code and configurations

## ⚠️ What's NOT Included (via .gitignore)

- ❌ `node_modules/` (run `npm install` after cloning)
- ❌ `.env` files (create locally)
- ❌ `.expo/` build files
- ❌ Log files

## 🔐 After Pushing

1. **Create `.env` file in `backend/`** with your database credentials
2. **Update API URLs** in mobile app `app.json` files
3. **Install dependencies**: `npm install` in each folder

## 🚀 Next Steps

- Add repository description and topics
- Set up GitHub Actions for CI/CD
- Add collaborators
- Create issues for enhancements
