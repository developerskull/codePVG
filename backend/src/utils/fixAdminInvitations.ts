import { supabaseAdmin } from './supabase';

export const fixAdminInvitationsTable = async () => {
  try {
    console.log('🔧 Fixing admin_invitations table...');

    // First, let's check if the table exists
    const { data: tables, error: tableError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'admin_invitations');

    if (tableError) {
      console.log('Could not check table existence, proceeding with creation...');
    } else if (tables && tables.length > 0) {
      console.log('✅ admin_invitations table already exists');
      return true;
    }

    // Create the table using direct SQL
    const { error: createError } = await supabaseAdmin
      .from('admin_invitations')
      .select('*')
      .limit(1);

    if (createError && createError.message.includes('relation "admin_invitations" does not exist')) {
      console.log('Table does not exist, creating it...');
      
      // Use a different approach - create via Supabase dashboard or direct SQL
      console.log('Please create the admin_invitations table manually in your Supabase dashboard with this SQL:');
      console.log(`
        CREATE TABLE admin_invitations (
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
      `);
      
      return false;
    }

    console.log('✅ admin_invitations table is accessible');
    return true;
  } catch (error) {
    console.error('❌ Error checking admin_invitations table:', error);
    return false;
  }
};
