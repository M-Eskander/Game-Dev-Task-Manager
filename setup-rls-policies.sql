-- =====================================================
-- Game Dev Task Manager - Supabase RLS Policies Setup
-- =====================================================
-- Run this in your Supabase SQL Editor
-- This ensures member deletion and task assignments work properly

-- =====================================================
-- 1. PROJECT_MEMBERS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;

-- Allow users to view members of projects they own or are part of
CREATE POLICY "project_members_select" ON project_members
    FOR SELECT
    USING (
        -- Can see if you're the project owner
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_members.project_id 
            AND projects.owner_id = auth.uid()
        )
        OR
        -- Can see if you're a member of the project
        user_id = auth.uid()
        OR
        -- Can see if you're a member of the project (through project_members)
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_members.project_id
            AND pm.user_id = auth.uid()
        )
    );

-- Allow project owners to add members (via invitations - handled separately)
CREATE POLICY "project_members_insert" ON project_members
    FOR INSERT
    WITH CHECK (
        -- Can only insert if you're the project owner OR accepting your own invitation
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_members.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- CRITICAL: Allow project owners to delete members
CREATE POLICY "project_members_delete" ON project_members
    FOR DELETE
    USING (
        -- Only project owner can delete members
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_members.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- =====================================================
-- 2. PROJECTS TABLE POLICIES (for task updates)
-- =====================================================

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "projects_update" ON projects;

-- Allow project owners AND members to update projects (including tasks)
CREATE POLICY "projects_update" ON projects
    FOR UPDATE
    USING (
        -- Owner can update
        owner_id = auth.uid()
        OR
        -- Members can update (for collaborative task editing)
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = projects.id 
            AND project_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        -- Owner can update
        owner_id = auth.uid()
        OR
        -- Members can update
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = projects.id 
            AND project_members.user_id = auth.uid()
        )
    );

-- =====================================================
-- 3. USER_PROFILES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;

-- Allow users to view all profiles (for username lookup in task assignment)
CREATE POLICY "user_profiles_select" ON user_profiles
    FOR SELECT
    USING (true); -- Everyone can see usernames for @mentions and assignments

-- =====================================================
-- 4. PROJECT_INVITATIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "project_invitations_select" ON project_invitations;
DROP POLICY IF EXISTS "project_invitations_insert" ON project_invitations;
DROP POLICY IF EXISTS "project_invitations_update" ON project_invitations;

-- View invitations you sent or received
CREATE POLICY "project_invitations_select" ON project_invitations
    FOR SELECT
    USING (
        invited_user_id = auth.uid() -- You're invited
        OR
        invited_by = auth.uid() -- You sent the invite
        OR
        EXISTS ( -- You're the project owner
            SELECT 1 FROM projects 
            WHERE projects.id = project_invitations.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- Only project owners can create invitations
CREATE POLICY "project_invitations_insert" ON project_invitations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_invitations.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- Invited users can update their invitation status (accept/decline)
CREATE POLICY "project_invitations_update" ON project_invitations
    FOR UPDATE
    USING (invited_user_id = auth.uid())
    WITH CHECK (invited_user_id = auth.uid());

-- =====================================================
-- 5. ENABLE RLS ON ALL TABLES (if not already enabled)
-- =====================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. VERIFICATION QUERIES (Optional - run to test)
-- =====================================================

-- Check if policies are created
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('projects', 'project_members', 'project_invitations', 'user_profiles')
-- ORDER BY tablename, policyname;

-- =====================================================
-- DONE! Your Supabase database is now properly configured
-- =====================================================

