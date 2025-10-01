import { Router } from 'express';
import { createAdminInvitationsTable } from '../utils/createAdminInvitationsTable';

const router = Router();

// Endpoint to create admin_invitations table
router.post('/admin-invitations-table', async (req, res) => {
  try {
    const success = await createAdminInvitationsTable();
    
    if (success) {
      res.json({ message: 'admin_invitations table created successfully' });
    } else {
      res.status(500).json({ error: 'Failed to create admin_invitations table' });
    }
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
