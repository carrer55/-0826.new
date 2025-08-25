/*
  # User invitation system

  1. New Functions
    - `send_user_invitation` - Edge function for sending invitation emails
    - `accept_user_invitation` - Process invitation acceptance

  2. Security
    - Only organization admins can send invitations
    - Invitation tokens expire after 7 days
*/

-- Create user invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'member')),
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Organization admins can manage invitations"
  ON user_invitations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view their own invitations"
  ON user_invitations
  FOR SELECT
  TO public
  USING (email = auth.email());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_invitations_org ON user_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM user_invitations 
  WHERE expires_at < now() 
  AND accepted_at IS NULL;
END;
$$;