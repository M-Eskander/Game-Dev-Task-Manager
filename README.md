# 🎮 Game Dev Task Manager

A beautiful, feature-rich task management application designed specifically for game developers. Manage solo projects or collaborate with your team in real-time!

## ✨ Features

### 🎯 Core Features
- **Beautiful UI** with customizable colors and themes
- **Dark/Light Mode** for comfortable viewing
- **Multiple Project Support** - organize different games/projects
- **Task Management** with priorities, deadlines, and categories
- **Subtasks** - break down complex tasks
- **Progress Tracking** - visual progress bars and statistics
- **Search & Filter** - quickly find tasks
- **Drag & Drop** - reorder tasks easily

### 👥 Collaboration Features
- **User Authentication** - secure login/signup with email verification
- **Unique Usernames** - find and invite team members
- **Group Projects** - invite others by username
- **Invitation System** - accept/decline project invitations
- **Member Management** - view all project members
- **Role-Based Access** - owners can manage members

### 💾 Data Management
- **Auto-Save** to Supabase cloud database
- **Manual Save/Refresh** - full control over syncing
- **Export/Import** - backup your data as JSON
- **Persistent Storage** - never lose your work

### 🎨 Customization
- **Custom Colors** - personalize each project
- **Layout Options** - choose your preferred view
- **Category System** - organize tasks your way
- **Flexible Deadlines** - track time-sensitive tasks

## 🚀 Live Demo

**Try it now:** [https://m-eskander.github.io/Game-Dev-Task-Manager](https://m-eskander.github.io/Game-Dev-Task-Manager)

## 📥 Desktop App

Download the Windows desktop app from the [Releases](https://github.com/M-Eskander/Game-Dev-Task-Manager/releases) page.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (React via Babel)
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Authentication)
- **Icons:** Lucide React
- **Desktop:** Electron
- **Hosting:** GitHub Pages

## 📦 Installation

### Web Version (Instant)
Just visit the live demo link - no installation needed!

### Desktop Version
1. Download `Game Dev Task Manager Setup.exe` from [Releases](https://github.com/YOUR-USERNAME/game-dev-task-manager/releases)
2. Run the installer
3. Launch the app from your Start Menu or Desktop

### Run Locally
```bash
# Clone the repository
git clone https://github.com/M-Eskander/Game-Dev-Task-Manager.git

# Navigate to the directory
cd Game-Dev-Task-Manager

# Open index.html in your browser
# Or use a local server like:
python -m http.server 8000
# Then visit http://localhost:8000
```

### Build Desktop App
```bash
# Install dependencies
npm install

# Run in development
npm start

# Build for Windows
npm run build
```

## 🎮 How to Use

### Getting Started
1. **Sign Up** - Create an account with email and unique username
2. **Verify Email** - Check your inbox for verification link
3. **Login** - Access your dashboard
4. **Create Project** - Start your first game project

### Managing Tasks
- **Add Task** - Click the "+" button
- **Edit Task** - Click on any task to modify
- **Add Subtasks** - Break down complex tasks
- **Set Priority** - High, Medium, or Low
- **Mark Complete** - Check off finished tasks
- **Delete Task** - Remove tasks you no longer need

### Collaborating
1. **Invite Members** - Click "Members" button → Enter username
2. **Accept Invitations** - Check your dashboard for pending invites
3. **Save Changes** - Use Ctrl+S or the Save button
4. **Refresh View** - Use Ctrl+R or the Refresh button to see others' changes

### Keyboard Shortcuts
- `Ctrl+S` - Save current project
- `Ctrl+R` - Refresh current project
- `Shift+Click Refresh` - Full page reload

## 🔐 Security

- Row Level Security (RLS) policies on all database tables
- Email verification required
- Secure password hashing
- Project-level access control
- Owner-only member management

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created by [@M-Eskander](https://github.com/M-Eskander)

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com) for backend services
- Icons by [Lucide](https://lucide.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Desktop app powered by [Electron](https://www.electronjs.org)

## 📞 Support

If you encounter any issues or have questions:
- Open an [Issue](https://github.com/M-Eskander/Game-Dev-Task-Manager/issues)
- Check existing issues for solutions
- Read the documentation above

---

⭐ **Star this repo** if you find it useful!

🎮 **Happy Game Development!** 🚀
