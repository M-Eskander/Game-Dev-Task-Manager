-- Create a function to get project members (bypasses RLS)
-- This avoids infinite recursion issues

CREATE OR REPLACE FUNCTION get_project_members(project_uuid UUID)
RETURNS TABLE (
  id BIGINT,
  project_id UUID,
  user_id UUID,
  role TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER -- This runs with the privileges of the function creator
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the requesting user is the owner OR a member
  IF NOT EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_uuid 
    AND projects.owner_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = project_uuid 
    AND project_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Return all members
  RETURN QUERY
  SELECT 
    project_members.id,
    project_members.project_id,
    project_members.user_id,
    project_members.role,
    project_members.created_at
  FROM project_members
  WHERE project_members.project_id = project_uuid;
END;
$$;

-- Create a function to get a project (for members)
CREATE OR REPLACE FUNCTION get_project_if_member(project_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  deadline TEXT,
  tasks JSONB,
  primary_color TEXT,
  secondary_color TEXT,
  dark_mode BOOLEAN,
  layout_style TEXT,
  owner_id UUID,
  is_group_project BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is owner OR member
  IF NOT EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_uuid 
    AND projects.owner_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = project_uuid 
    AND project_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Return the project
  RETURN QUERY
  SELECT 
    projects.id,
    projects.name,
    projects.description,
    projects.deadline,
    projects.tasks,
    projects.primary_color,
    projects.secondary_color,
    projects.dark_mode,
    projects.layout_style,
    projects.owner_id,
    projects.is_group_project,
    projects.created_at,
    projects.updated_at
  FROM projects
  WHERE projects.id = project_uuid;
END;
$$;

