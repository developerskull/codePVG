import { Router } from 'express';
import { supabaseAdmin } from '../utils/supabase';

const router = Router();

// Check if PRN already exists
router.post('/check-prn', async (req, res) => {
  try {
    const { prn } = req.body;

    if (!prn) {
      return res.status(400).json({ error: 'PRN is required' });
    }

    // Check if PRN exists in the database
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('prn', prn)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Database error checking PRN:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // If data exists, PRN is taken
    const exists = !!data;
    
    return res.json({ exists });
  } catch (error) {
    console.error('Error checking PRN:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
