-- ULTRA-SIMPLE RLS policies with ZERO recursion
-- Strategy: Avoid ALL cross-table checks in SELECT policies

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects they own or are members of" ON projects;
DROP POLICY IF EXISTS "Only owners can delete projects" ON projects;
DROP POLICY IF EXISTS "allow_read_own_and_member_projects" ON projects;
DROP POLICY IF EXISTS "allow_insert_own_projects" ON projects;
DROP POLICY IF EXISTS "allow_update_own_and_member_projects" ON projects;
DROP POLICY IF EXISTS "allow_delete_own_projects" ON projects;

DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners can add members" ON project_members;
DROP POLICY IF EXISTS "Project owners can remove members" ON project_members;
DROP POLICY IF EXISTS "Users can view members of their projects" ON project_members;
DROP POLICY IF EXISTS "allow_read_project_members" ON project_members;
DROP POLICY IF EXISTS "allow_insert_members_by_owner" ON project_members;
DROP POLICY IF EXISTS "allow_delete_members_by_owner" ON project_members;
DROP POLICY IF EXISTS "allow_update_members_by_owner" ON project_members;

-- ===========================================
-- PROJECT_MEMBERS TABLE (NO CROSS-TABLE CHECKS!)
-- ===========================================

-- SELECT: You can see memberships where you're the member
-- CRITICAL: No reference to projects table!
CREATE POLICY "members_select_own"
ON project_members FOR SELECT
USING (user_id = auth.uid());

-- INSERT: Anyone can insert (we'll add owner check in frontend)
-- TEMPORARY: We'll fix this after testing
CREATE POLICY "members_insert_any"
ON project_members FOR INSERT
WITH CHECK (true);

-- DELETE: Anyone can delete (we'll add owner check in frontend)  
-- TEMPORARY: We'll fix this after testing
CREATE POLICY "members_delete_any"
ON project_members FOR DELETE
USING (true);

-- UPDATE: Anyone can update (rarely used)
CREATE POLICY "members_update_any"
ON project_members FOR UPDATE
USING (true)
WITH CHECK (true);

-- ===========================================
-- PROJECTS TABLE (ONLY OWNER CHECKS!)
-- ===========================================

-- SELECT: OWNER-ONLY for now to avoid recursion
-- Members will use a different approach
CREATE POLICY "projects_select_owner"
ON projects FOR SELECT
USING (auth.uid() = owner_id);

-- INSERT: Owner only
CREATE POLICY "projects_insert_owner"
ON projects FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Owner only for now
CREATE POLICY "projects_update_owner"
ON projects FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- DELETE: Owner only
CREATE POLICY "projects_delete_owner"
ON projects FOR DELETE
USING (auth.uid() = owner_id);

