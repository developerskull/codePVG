-- Create admin_invitations table
CREATE TABLE IF NOT EXISTS admin_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  message TEXT,
  invited_by UUID NOT NULL REFERENCES users(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON admin_invitations(email);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(token);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON admin_invitations(status);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_created_at ON admin_invitations(created_at);

-- Enable RLS
ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admins can manage admin invitations" ON admin_invitations
  FOR ALL USING (auth.jwt() ->> 'role' = 'super-admin');

CREATE POLICY "Users can view their own invitations" ON admin_invitations
  FOR SELECT USING (email = auth.jwt() ->> 'email');
