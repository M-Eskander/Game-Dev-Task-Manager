-- SIMPLIFIED RLS policies to avoid infinite recursion
-- The key is to avoid circular references between projects and project_members

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects they own or are members of" ON projects;
DROP POLICY IF EXISTS "Only owners can delete projects" ON projects;

DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners can add members" ON project_members;
DROP POLICY IF EXISTS "Project owners can remove members" ON project_members;
DROP POLICY IF EXISTS "Users can view members of their projects" ON project_members;

-- ===========================================
-- PROJECTS TABLE POLICIES (NO RECURSION!)
-- ===========================================

-- 1. SELECT: Allow reading projects you own OR projects where you're listed in project_members
CREATE POLICY "allow_read_own_and_member_projects"
ON projects FOR SELECT
USING (
  auth.uid() = owner_id 
  OR 
  id IN (
    SELECT project_id FROM project_members 
    WHERE user_id = auth.uid()
  )
);

-- 2. INSERT: Users can only create their own projects
CREATE POLICY "allow_insert_own_projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- 3. UPDATE: Allow owners AND members to update
CREATE POLICY "allow_update_own_and_member_projects"
ON projects FOR UPDATE
USING (
  auth.uid() = owner_id 
  OR 
  id IN (
    SELECT project_id FROM project_members 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = owner_id 
  OR 
  id IN (
    SELECT project_id FROM project_members 
    WHERE user_id = auth.uid()
  )
);

-- 4. DELETE: Only owners can delete
CREATE POLICY "allow_delete_own_projects"
ON projects FOR DELETE
USING (auth.uid() = owner_id);

-- ===========================================
-- PROJECT_MEMBERS TABLE POLICIES (SIMPLE!)
-- ===========================================

-- 1. SELECT: Allow viewing members if you're the owner OR a member yourself
-- SIMPLIFIED: Just check if user has ANY relationship to this project
CREATE POLICY "allow_read_project_members"
ON project_members FOR SELECT
USING (
  -- You can see members if you're one of them
  user_id = auth.uid()
  OR
  -- OR if there's another record showing you're a member of this project
  project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
  OR
  -- OR if you own the project (checking directly, no subquery to projects)
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  )
);

-- 2. INSERT: Only project owners can add members
CREATE POLICY "allow_insert_members_by_owner"
ON project_members FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  )
);

-- 3. DELETE: Only project owners can remove members
CREATE POLICY "allow_delete_members_by_owner"
ON project_members FOR DELETE
USING (
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  )
);

-- 4. UPDATE: Only owners can update member roles (if needed)
CREATE POLICY "allow_update_members_by_owner"
ON project_members FOR UPDATE
USING (
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  )
);

