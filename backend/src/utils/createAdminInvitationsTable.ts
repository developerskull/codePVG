import { supabaseAdmin } from './supabase';

export const createAdminInvitationsTable = async () => {
  try {
    console.log('Creating admin_invitations table...');

    // Create the table
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (createError) {
      console.error('Error creating admin_invitations table:', createError);
      return false;
    }

    // Create indexes
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON admin_invitations(email);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(token);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON admin_invitations(status);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_created_at ON admin_invitations(created_at);
      `
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
      return false;
    }

    // Enable RLS
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
      return false;
    }

    // Create RLS policies
    const { error: policyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Super admins can manage all invitations
        CREATE POLICY "Super admins can manage admin invitations" ON admin_invitations
          FOR ALL USING (auth.jwt() ->> 'role' = 'super-admin');

        -- Users can view their own invitations
        CREATE POLICY "Users can view their own invitations" ON admin_invitations
          FOR SELECT USING (email = auth.jwt() ->> 'email');
      `
    });

    if (policyError) {
      console.error('Error creating RLS policies:', policyError);
      return false;
    }

    console.log('✅ admin_invitations table created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating admin_invitations table:', error);
    return false;
  }
};
