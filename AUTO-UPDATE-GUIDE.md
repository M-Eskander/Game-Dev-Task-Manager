# 🚀 Auto-Update System Guide

Your app now has **auto-updates**! Users will automatically get new versions without re-downloading the .exe!

## 📋 How It Works

1. **Users open the app** → It checks GitHub for new releases
2. **New version found** → Shows "Update Available" dialog
3. **User clicks "Download"** → Update downloads in background
4. **User closes app** → Update auto-installs
5. **Next launch** → New version is running! ✨

---

## 🛠️ Setup (One-Time)

### Step 1: Install Dependencies

```bash
npm install
```

This installs `electron-updater` which is now in your `package.json`.

---

## 🔄 How to Release Updates

### Every time you make changes to `index.html` or `electron.js`:

### Step 1: Update Version Number

Edit `package.json` and bump the version:

```json
"version": "1.0.2"  // Was 1.0.1, now 1.0.2
```

**Important:** Always increment the version, or auto-update won't work!

### Step 2: Commit Your Changes

```bash
git add .
git commit -m "feat: Added new feature"
git push origin main
```

### Step 3: Build the App

```bash
npm run build
```

This creates:
- `dist/Game Dev Task Manager Setup 1.0.2.exe` (installer)
- `dist/latest.yml` (update info - IMPORTANT!)

### Step 4: Create GitHub Release

Go to: https://github.com/M-Eskander/Game-Dev-Task-Manager/releases/new

1. **Tag version:** `v1.0.2` (must match package.json version with `v` prefix)
2. **Release title:** `v1.0.2` or `Version 1.0.2 - Feature Name`
3. **Description:** Write what's new:
   ```markdown
   ## What's New
   - ✨ Added AI-powered task generation
   - 🐛 Fixed deadline calculation
   - 🎨 Improved UI design
   ```

4. **Upload files:** Drag and drop these files from `dist/`:
   - ✅ `Game Dev Task Manager Setup 1.0.2.exe`
   - ✅ `latest.yml` ← **CRITICAL! Don't forget this!**
   - ✅ `Game Dev Task Manager Setup 1.0.2.exe.blockmap` (if exists)

5. Click **"Publish release"**

### Step 5: Done! 🎉

Within **3 seconds** of launching, all users' apps will:
- Check for the update
- Show "Update Available" notification
- Download and install automatically!

---

## 🔧 Alternative: Quick Publish (Advanced)

You can also use this command to build AND publish in one step:

```bash
npm run publish
```

**But first, you need a GitHub token:**

1. Go to: https://github.com/settings/tokens/new
2. Name: `Electron Builder`
3. Expiration: `No expiration`
4. Scopes: Check **`repo`** (all sub-options)
5. Click **"Generate token"**
6. Copy the token

Then set it as an environment variable:

**Windows PowerShell:**
```powershell
$env:GH_TOKEN="your_github_token_here"
npm run publish
```

**Windows CMD:**
```cmd
set GH_TOKEN=your_github_token_here
npm run publish
```

This will automatically create the GitHub release and upload files!

---

## 📝 Version Numbering Best Practices

- **Major changes:** `1.0.0` → `2.0.0` (breaking changes)
- **New features:** `1.0.0` → `1.1.0` (new functionality)
- **Bug fixes:** `1.0.0` → `1.0.1` (small fixes)

---

## 🧪 Testing Updates

1. Build version `1.0.1` and install it
2. Bump version to `1.0.2` in `package.json`
3. Build and create GitHub release
4. Launch the `1.0.1` app
5. Should see "Update Available" popup!

---

## ⚡ Quick Reference

### Full Update Workflow:
```bash
# 1. Make your changes to index.html or electron.js
# 2. Update version in package.json (e.g., 1.0.1 → 1.0.2)
# 3. Commit and push
git add .
git commit -m "feat: Your changes"
git push origin main

# 4. Build
npm run build

# 5. Create GitHub release and upload:
#    - dist/Game Dev Task Manager Setup X.X.X.exe
#    - dist/latest.yml
```

---

## 🎯 What Users See

**On app launch (if update available):**

```
┌─────────────────────────────────┐
│    Update Available             │
│                                 │
│  A new version (1.0.2) is      │
│  available!                     │
│                                 │
│  Would you like to download     │
│  it now? The update will        │
│  install when you close the app.│
│                                 │
│  [Download]  [Later]            │
└─────────────────────────────────┘
```

**While downloading:**

Title bar shows: `Game Dev Task Manager - Downloading update: 47%`

**When download complete:**

```
┌─────────────────────────────────┐
│    Update Ready                 │
│                                 │
│  Update downloaded successfully!│
│                                 │
│  The update will be installed   │
│  when you close the app.        │
│                                 │
│  [Restart Now]  [Later]         │
└─────────────────────────────────┘
```

---

## 🛡️ Security Notes

- Auto-updates only work from **GitHub Releases**
- Files are downloaded over **HTTPS**
- Update signatures are **not verified** (set in package.json)
  - If you want signed updates, you'll need a code signing certificate

---

## 🐛 Troubleshooting

**"Update not detected"**
- Check version is higher in `package.json`
- Ensure `latest.yml` was uploaded to GitHub release
- Check tag matches version (e.g., tag `v1.0.2` for version `1.0.2`)

**"Download fails"**
- GitHub release must be **published** (not draft)
- `.exe` file must be uploaded
- Check internet connection

---

## 🎉 You're All Set!

Now you can update your app by just:
1. Making changes
2. Bumping version
3. Building
4. Creating GitHub release

Users automatically get updates! No more manual downloads! 🚀

