-- Fix the function with correct data types

DROP FUNCTION IF EXISTS get_project_members(UUID);

CREATE OR REPLACE FUNCTION get_project_members(project_uuid UUID)
RETURNS TABLE (
  id UUID,  -- Changed from BIGINT to UUID
  project_id UUID,
  user_id UUID,
  role TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
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

