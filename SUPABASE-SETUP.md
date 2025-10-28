# 🔧 Supabase Setup Instructions

## Why You Need This

For the **task assignment** and **member deletion** features to work properly, we need to update the Row Level Security (RLS) policies in your Supabase database.

## What This Fixes

✅ **Member Deletion** - Ensures project owners can delete members  
✅ **Task Assignment** - Members can update tasks with assignments  
✅ **Task Unassignment** - Automatically unassigns tasks when member is removed  
✅ **Username Lookup** - Allows viewing usernames for task assignment dropdown  

---

## 📋 Step-by-Step Instructions

### Step 1: Go to Supabase SQL Editor

1. Open your browser and go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your **Game Dev Task Manager** project
4. In the left sidebar, click on **SQL Editor** (database icon with "SQL" text)
5. Click **New Query** button

### Step 2: Run the SQL Script

1. Open the file `setup-rls-policies.sql` in this folder
2. **Copy all the contents** (Ctrl+A, then Ctrl+C)
3. **Paste into the Supabase SQL Editor** (Ctrl+V)
4. Click the **Run** button (or press F5)

### Step 3: Verify Success

You should see a message like:
```
Success. No rows returned
```

This is normal! The policies have been created successfully.

---

## 🔍 What Was Changed

### 1. **project_members** Table
- ✅ Owners can now DELETE members
- ✅ Members can view other members
- ✅ Users can join projects when invited

### 2. **projects** Table
- ✅ Owners AND members can UPDATE tasks
- ✅ Required for task assignment/unassignment to work
- ✅ Allows collaborative task editing

### 3. **user_profiles** Table
- ✅ Everyone can VIEW usernames
- ✅ Needed for task assignment dropdown
- ✅ Needed for @mentions (future feature)

### 4. **project_invitations** Table
- ✅ Only owners can CREATE invitations
- ✅ Invited users can UPDATE (accept/decline)
- ✅ Both parties can VIEW their invitations

---

## 🧪 Testing

After running the SQL script, test these features:

### Test 1: Member Deletion
1. Go to a project you own
2. Click "Members" button
3. Try deleting a member (trash icon)
4. If they have assigned tasks, you should see a warning
5. Confirm deletion
6. Member should disappear and stay gone ✅

### Test 2: Task Assignment
1. Edit any task
2. You should see an "Assign To" dropdown
3. Select a team member
4. Save the task
5. Task should show who it's assigned to ✅

### Test 3: View Permissions
1. As a non-owner member, view a task assigned to someone else
2. You should see "👁️ View Only" badge
3. Edit and delete buttons should be hidden ✅

---

## ⚠️ Troubleshooting

### "Error: permission denied"
- Make sure you're logged into the correct Supabase project
- Verify you have Owner/Admin role in Supabase

### "Policies already exist"
- The script drops and recreates policies, so this shouldn't happen
- If it does, the script is safe to run multiple times

### "Table does not exist"
- Make sure you've run the initial database setup
- Check that your tables are created in Supabase Table Editor

### Member deletion still not working
1. Check browser console (F12) for errors
2. Verify you're the project owner (not just a member)
3. Try refreshing the page (Ctrl+Shift+R)
4. Clear browser cache and reload

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the Supabase logs (Logs tab in your project)
2. Open browser DevTools console (F12) and look for errors
3. Verify your Supabase project is active and not paused

---

## ✅ You're Done!

Once you've run the SQL script, all the new features should work perfectly:
- 🗑️ Member deletion with task warning
- 👤 Task assignment system  
- 👁️ View-only permissions for assigned tasks
- 🔄 Automatic task unassignment on member removal

Happy coding! 🎮✨

