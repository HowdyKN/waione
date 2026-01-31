# Fix: GitHub CLI Not Recognized

## Common Solutions

### Solution 1: Restart Your Terminal/PowerShell

After installing GitHub CLI, you need to **restart your terminal** for PATH changes to take effect.

1. Close your current PowerShell/terminal window
2. Open a new PowerShell window
3. Try: `gh --version`

### Solution 2: Refresh Environment Variables

If restarting doesn't work, refresh PATH in current session:

```powershell
# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Test
gh --version
```

### Solution 3: Find and Use Full Path

If GitHub CLI is installed but not in PATH:

```powershell
# Find gh.exe
Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\" -Recurse -Filter "gh.exe" -ErrorAction SilentlyContinue

# Or check Program Files
Get-ChildItem "$env:ProgramFiles" -Recurse -Filter "gh.exe" -ErrorAction SilentlyContinue
```

Then use the full path, or add it to PATH manually.

### Solution 4: Reinstall GitHub CLI

```powershell
# Uninstall
winget uninstall GitHub.cli

# Reinstall
winget install --id GitHub.cli

# Restart terminal and test
gh --version
```

### Solution 5: Manual Installation

If winget installation doesn't work:

1. Download from: https://cli.github.com/
2. Run the installer
3. Restart terminal
4. Test: `gh --version`

### Solution 6: Use Git Commands Instead

If you can't get `gh` working, you can push to GitHub manually:

```powershell
# Create repository on GitHub website first, then:

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/waione.git

# Push
git branch -M main
git push -u origin main
```

## Verify Installation

After trying the solutions above:

```powershell
# Check if gh is available
gh --version

# Should output something like:
# gh version 2.x.x (xxxx-xx-xx)
```

## Alternative: Use GitHub Website

If GitHub CLI continues to cause issues, you can:

1. Go to https://github.com/new
2. Create repository named `waione`
3. **Don't** initialize with README
4. Copy the commands GitHub shows you
5. Run them in your terminal

This is just as effective and doesn't require GitHub CLI!
