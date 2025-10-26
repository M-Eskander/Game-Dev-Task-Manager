# 🖥️ Building the Desktop App (EXE)

Follow these steps to create a Windows desktop app from your Game Dev Task Manager.

## Prerequisites

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Verify installation: Open PowerShell and run:
     ```
     node --version
     npm --version
     ```

## Build Steps

### Step 1: Install Dependencies

Open PowerShell in your project folder and run:

```powershell
npm install
```

This will install Electron and Electron Builder (~150MB download).

### Step 2: Test the App Locally

Run the app in development mode to make sure it works:

```powershell
npm start
```

The app should open in a window. Test it:
- ✅ Sign in/Sign up works
- ✅ Create projects
- ✅ Add tasks
- ✅ Invite members

Press `Ctrl+C` in PowerShell to close the app.

### Step 3: Build the EXE

Create the Windows installer:

```powershell
npm run build
```

This will:
- Create an installer (.exe) for Windows
- Take 2-5 minutes
- Output files to `dist/` folder

### Step 4: Find Your App

After building, you'll find:

```
dist/
  ├── Game Dev Task Manager Setup 1.0.0.exe  (Installer - ~80MB)
  └── win-unpacked/                           (Portable version)
```

### Step 5: Install & Run

**Option A: Installer**
- Double-click `Game Dev Task Manager Setup 1.0.0.exe`
- Follow the installation wizard
- App will be in Start Menu

**Option B: Portable**
- Go to `dist/win-unpacked/`
- Run `Game Dev Task Manager.exe`
- No installation needed!

## Build for Other Platforms

### Mac (DMG)
```powershell
npm install
npm run build -- --mac
```

### Linux (AppImage)
```powershell
npm install
npm run build -- --linux
```

### All Platforms
```powershell
npm install
npm run build-all
```

## Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/

### "EPERM: operation not permitted"
- Close any running instances of the app
- Run PowerShell as Administrator

### "Cannot find module 'electron'"
- Run: `npm install`

### App won't start
- Check if icon.png exists
- Make sure index.html is in the same folder

## File Sizes

- **Development** (npm start): Opens instantly
- **Installer**: ~80-100 MB
- **Installed app**: ~150 MB
- **Portable version**: ~150 MB

## Customization

### Change App Icon
Replace `icon.png` with your own 256x256 PNG file.

### Change App Name
Edit `package.json`:
```json
"productName": "Your Custom Name"
```

### App Settings
Edit `electron.js` to change:
- Window size (width/height)
- Minimum size (minWidth/minHeight)
- Title bar text

## Distribution

### Share the Installer
- Upload `Game Dev Task Manager Setup 1.0.0.exe` to Google Drive, Dropbox, etc.
- Users download and install
- ~80-100 MB file

### Share Portable Version
- Zip the `win-unpacked` folder
- Users extract and run the .exe
- No installation needed

## Updates

To update the app:
1. Make changes to `index.html`
2. Run `npm run build` again
3. Distribute the new installer

---

**Need help?** Open an issue on GitHub!

