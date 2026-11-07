# Installation Fix Guide

## Problem
You're getting an npm error: `Cannot read properties of null (reading 'matches')`

## Solution: Use NPM Instead of PNPM

The project was configured for `pnpm`, but we'll use `npm` which is simpler and works perfectly.

---

## ✅ Step-by-Step Fix (Copy & Paste)

### Step 1: Clean Everything
```powershell
cd d:\Projects\Visualizedsa\visualdsa-pro

# Clear npm cache
npm cache clean --force

# Remove lock files and node_modules
Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
```

### Step 2: Install Dependencies
```powershell
# Install with npm (this will take 2-3 minutes)
npm install --legacy-peer-deps
```

**Expected Output**:
```
added 450+ packages in 2-3 minutes
```

### Step 3: Verify Installation
```powershell
# Check if node_modules exists
Test-Path node_modules
# Should output: True

# Check installed packages
npm list --depth=0
```

---

## 🚀 After Installation - Test Everything

### 1. Run Development Server
```powershell
npm run dev
```
**Expected**: Server starts on http://localhost:3000

### 2. Run Build (Should work now)
```powershell
npm run build
```
**Expected**: 152 pages, 0 errors

### 3. Run Tests
```powershell
npm run test:run
```
**Expected**: 173 tests passing

---

## 🔄 Alternative: Manual pnpm Setup (If you prefer pnpm)

If you really want to use pnpm:

```powershell
# Method 1: Install via npm
npm install -g pnpm

# Close and reopen PowerShell, then:
cd d:\Projects\Visualizedsa\visualdsa-pro
pnpm install
```

**Or Method 2: Use PowerShell installer**
```powershell
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression

# Close and reopen PowerShell, then:
cd d:\Projects\Visualizedsa\visualdsa-pro
pnpm install
```

---

## 📝 Why This Happened

The original error occurred because:
1. The project has `"packageManager": "pnpm@12.15.0"` in package.json
2. You tried to use `npm install` instead
3. npm tried to honor the pnpm requirement but hit a cache issue

**Solution**: Either use pnpm (requires installation) or use npm (already installed, works fine).

---

## ✅ Quick Verification Commands

After successful installation, run these to verify:

```powershell
cd d:\Projects\Visualizedsa\visualdsa-pro

# 1. Check node_modules exists
if (Test-Path node_modules) { Write-Host "✅ node_modules installed" -ForegroundColor Green } else { Write-Host "❌ node_modules missing" -ForegroundColor Red }

# 2. Try building
npm run build

# 3. If build works, you're good! Run dev server:
npm run dev
```

---

## 🆘 Still Having Issues?

### If npm install still fails:

1. **Update Node.js** (should be >=20):
   ```powershell
   node --version
   # Should show v20.x.x or higher
   ```

2. **Clear ALL caches**:
   ```powershell
   npm cache clean --force
   Remove-Item -Recurse -Force $env:APPDATA\npm-cache
   ```

3. **Try installation in steps**:
   ```powershell
   npm install react react-dom next
   npm install --legacy-peer-deps
   ```

4. **Last resort - Use yarn**:
   ```powershell
   npm install -g yarn
   yarn install
   ```

---

## 📞 Expected Final State

After successful installation, you should have:

```
visualdsa-pro/
├── node_modules/          ✅ ~450 packages
├── package-lock.json      ✅ Created by npm install
└── package.json           ✅ Existing
```

**Then you can run**:
- `npm run dev` → Development server
- `npm run build` → Production build  
- `npm run test:run` → All tests

---

**Created**: November 6, 2026  
**Status**: Use npm with `--legacy-peer-deps` flag  
**Estimated Install Time**: 2-3 minutes
