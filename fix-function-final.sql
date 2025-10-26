-- Fix the function to remove updated_at column

DROP FUNCTION IF EXISTS get_project_if_member(UUID);

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
  created_at TIMESTAMPTZ
  -- Removed updated_at since it doesn't exist
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
  
  -- Return the project (without updated_at)
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
    projects.created_at
  FROM projects
  WHERE projects.id = project_uuid;
END;
$$;

