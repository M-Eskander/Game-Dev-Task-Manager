-- Fix RLS policies to allow members to read and update shared projects

-- Drop ALL existing policies on projects table
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects they own or are members of" ON projects;
DROP POLICY IF EXISTS "Only owners can delete projects" ON projects;

-- Create new policies that support group projects

-- 1. SELECT: Allow users to read projects they own OR are members of
CREATE POLICY "Users can view projects they own or are members of"
ON projects FOR SELECT
USING (
  auth.uid() = owner_id 
  OR 
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);

-- 2. INSERT: Users can only create their own projects
CREATE POLICY "Users can create their own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- 3. UPDATE: Allow owners AND members to update projects
CREATE POLICY "Users can update projects they own or are members of"
ON projects FOR UPDATE
USING (
  auth.uid() = owner_id 
  OR 
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = owner_id 
  OR 
  EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);

-- 4. DELETE: Only owners can delete projects
CREATE POLICY "Only owners can delete projects"
ON projects FOR DELETE
USING (auth.uid() = owner_id);

-- Fix project_members policies too
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners can add members" ON project_members;
DROP POLICY IF EXISTS "Project owners can remove members" ON project_members;
DROP POLICY IF EXISTS "Users can view members of their projects" ON project_members;

-- Allow users to view members of projects they own or are members of
CREATE POLICY "Users can view members of their projects"
ON project_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_members.project_id 
    AND (
      projects.owner_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM project_members pm2
        WHERE pm2.project_id = projects.id 
        AND pm2.user_id = auth.uid()
      )
    )
  )
);

-- Only owners can add members
CREATE POLICY "Project owners can add members"
ON project_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  )
);

-- Only owners can remove members
CREATE POLICY "Project owners can remove members"
ON project_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  )
);

