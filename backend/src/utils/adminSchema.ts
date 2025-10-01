// Database schema for admin features
export const createAdminTables = async () => {
  const { supabaseAdmin } = await import('./supabase');

  try {
    // System Settings Table
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS system_settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          site_name VARCHAR(255) DEFAULT 'CollegeCodeHub',
          site_description TEXT,
          maintenance_mode BOOLEAN DEFAULT false,
          registration_enabled BOOLEAN DEFAULT true,
          max_file_size INTEGER DEFAULT 10485760, -- 10MB
          allowed_file_types TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'],
          email_notifications BOOLEAN DEFAULT true,
          security_settings JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_by UUID REFERENCES users(id)
        );
      `
    });

    // Admin Actions Log Table
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_actions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          admin_id UUID NOT NULL REFERENCES users(id),
          action_type VARCHAR(100) NOT NULL,
          target_id UUID,
          target_type VARCHAR(50),
          details JSONB DEFAULT '{}',
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Security Logs Table
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS security_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'failed_login', 'suspicious_activity', 'data_access'
          severity VARCHAR(20) DEFAULT 'info', -- 'low', 'medium', 'high', 'critical'
          description TEXT NOT NULL,
          ip_address INET,
          user_agent TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Approval Requests Table
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS approval_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          requester_id UUID NOT NULL REFERENCES users(id),
          approver_id UUID REFERENCES users(id),
          request_type VARCHAR(100) NOT NULL, -- 'role_change', 'data_access', 'system_change'
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
          priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
          metadata JSONB DEFAULT '{}',
          approval_comments TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          approved_at TIMESTAMP WITH TIME ZONE
        );
      `
    });

    // Audit Logs Table
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          action VARCHAR(100) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          resource_id UUID,
          old_values JSONB,
          new_values JSONB,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // System Notifications Table
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS system_notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
          target_roles TEXT[] DEFAULT '{}',
          target_users UUID[] DEFAULT '{}',
          is_global BOOLEAN DEFAULT false,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // User Sessions Table
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id),
          session_token VARCHAR(255) NOT NULL UNIQUE,
          ip_address INET,
          user_agent TEXT,
          is_active BOOLEAN DEFAULT true,
          last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE
        );
      `
    });

    // Admin Invitations Table
    await supabaseAdmin.rpc('exec_sql', {
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

    // Create indexes for better performance
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
        CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
        CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_security_logs_type ON security_logs(type);
        CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_approval_requests_requester ON approval_requests(requester_id);
        CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON admin_invitations(email);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(token);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON admin_invitations(status);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_created_at ON admin_invitations(created_at);
      `
    });

    // Create RLS policies
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Enable RLS on all tables
        ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;

        -- System settings - only super admins can access
        CREATE POLICY "Super admins can manage system settings" ON system_settings
          FOR ALL USING (auth.jwt() ->> 'role' = 'super-admin');

        -- Admin actions - only super admins can access
        CREATE POLICY "Super admins can view admin actions" ON admin_actions
          FOR SELECT USING (auth.jwt() ->> 'role' = 'super-admin');

        -- Security logs - only super admins can access
        CREATE POLICY "Super admins can view security logs" ON security_logs
          FOR SELECT USING (auth.jwt() ->> 'role' = 'super-admin');

        -- Approval requests - super admins and the requester can access
        CREATE POLICY "Super admins can manage approval requests" ON approval_requests
          FOR ALL USING (auth.jwt() ->> 'role' = 'super-admin');

        CREATE POLICY "Users can view their own approval requests" ON approval_requests
          FOR SELECT USING (auth.uid()::text = requester_id::text);

        -- Audit logs - only super admins can access
        CREATE POLICY "Super admins can view audit logs" ON audit_logs
          FOR SELECT USING (auth.jwt() ->> 'role' = 'super-admin');

        -- System notifications - all authenticated users can view
        CREATE POLICY "Authenticated users can view notifications" ON system_notifications
          FOR SELECT USING (auth.role() = 'authenticated');

        -- User sessions - users can view their own sessions
        CREATE POLICY "Users can view their own sessions" ON user_sessions
          FOR SELECT USING (auth.uid()::text = user_id::text);

        -- Admin invitations - super admins can manage all invitations
        CREATE POLICY "Super admins can manage admin invitations" ON admin_invitations
          FOR ALL USING (auth.jwt() ->> 'role' = 'super-admin');

        -- Admin invitations - users can view their own invitations
        CREATE POLICY "Users can view their own invitations" ON admin_invitations
          FOR SELECT USING (email = auth.jwt() ->> 'email');
      `
    });

    console.log('✅ Admin tables created successfully');
  } catch (error) {
    console.error('❌ Error creating admin tables:', error);
    throw error;
  }
};

// Helper function to log security events
export const logSecurityEvent = async (
  userId: string | null,
  type: string,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  metadata: any = {},
  ipAddress?: string,
  userAgent?: string
) => {
  const { supabaseAdmin } = await import('./supabase');
  
  try {
    await supabaseAdmin
      .from('security_logs')
      .insert({
        user_id: userId,
        type,
        description,
        severity,
        metadata,
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Helper function to log admin actions
export const logAdminAction = async (
  adminId: string,
  actionType: string,
  targetId: string | null,
  details: any = {},
  ipAddress?: string,
  userAgent?: string
) => {
  const { supabaseAdmin } = await import('./supabase');
  
  try {
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: actionType,
        target_id: targetId,
        details,
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// Helper function to create approval request
export const createApprovalRequest = async (
  requesterId: string,
  requestType: string,
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  metadata: any = {}
) => {
  const { supabaseAdmin } = await import('./supabase');
  
  try {
    const { data, error } = await supabaseAdmin
      .from('approval_requests')
      .insert({
        requester_id: requesterId,
        request_type: requestType,
        title,
        description,
        priority,
        metadata
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create approval request:', error);
    throw error;
  }
};
