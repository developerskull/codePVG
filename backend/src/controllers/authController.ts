import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../utils/database';
import { User, AuthRequest } from '../types';
import { validatePRN } from '../utils/prnValidation';
import emailService from '../services/emailService';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      email, 
      password, 
      username,
      prn, 
      batch, 
      department, 
      college_id, 
      year_of_study,
      role = 'student' 
    } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Validate PRN if provided
    if (prn) {
      const prnValidation = await validatePRN(prn);
      if (!prnValidation.valid) {
        return res.status(400).json({ error: prnValidation.message });
      }
    }

    // Check if username already exists
    if (username) {
      const existingUsername = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );
      
      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Determine approval status
    // Students with PRN or college_id need admin approval
    const approvalStatus = (prn || college_id) ? 'pending' : 'approved';

    // Create user
    const result = await pool.query(
      `INSERT INTO users (
        name, email, password_hash, username, prn, batch, 
        department, college_id, year_of_study, role, approval_status, verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING id, name, email, username, role, approval_status, created_at`,
      [
        name, email, passwordHash, username, prn, batch, 
        department, college_id, year_of_study, role, approvalStatus, false
      ]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      message: approvalStatus === 'pending' 
        ? 'Registration successful. Awaiting admin approval.' 
        : 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        approval_status: user.approval_status,
        created_at: user.created_at
      },
      token,
      needsApproval: approvalStatus === 'pending'
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    // Return mock data for development when database isn't available
    if (error.message && error.message.includes('ECONNREFUSED')) {
      return res.status(201).json({
        message: 'Registration successful (development mode)',
        user: {
          id: 'dev-user-id',
          name: req.body.name,
          email: req.body.email,
          role: req.body.role || 'student',
          approval_status: 'approved',
          created_at: new Date().toISOString()
        },
        token: 'dev-jwt-token',
        needsApproval: false
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT id, name, email, username, password_hash, role, approval_status, verified, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if password exists (for non-OAuth users)
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Please login using LinkedIn' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check approval status
    if (user.approval_status === 'pending') {
      return res.status(403).json({
        error: 'Your account is pending admin approval. Please wait for approval.',
        approval_status: 'pending'
      });
    }

    if (user.approval_status === 'rejected') {
      return res.status(403).json({
        error: 'Your account has been rejected. Please contact support.',
        approval_status: 'rejected'
      });
    }

    // Auto-populate LinkedIn URL if user logged in with LinkedIn but doesn't have linkedin_url set
    if (user.linkedin_id && !user.linkedin_url) {
      try {
        await pool.query(
          'UPDATE users SET linkedin_url = $1 WHERE id = $2',
          [`https://linkedin.com/in/${user.linkedin_id}`, user.id]
        );
        user.linkedin_url = `https://linkedin.com/in/${user.linkedin_id}`;
      } catch (updateError) {
        console.error('Error updating LinkedIn URL:', updateError);
        // Continue with login even if LinkedIn URL update fails
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        github_link: user.github_link,
        linkedin_url: user.linkedin_url,
        bio: user.bio,
        resume_link: user.resume_link,
        portfolio_link: user.portfolio_link,
        privacy_settings: user.privacy_settings,
        role: user.role,
        approval_status: user.approval_status,
        verified: user.verified,
        created_at: user.created_at
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    // Return mock data for development when database isn't available
    if (error.message && error.message.includes('ECONNREFUSED')) {
      return res.json({
        message: 'Login successful (development mode)',
        user: {
          id: 'dev-user-id',
          name: 'Development User',
          email: req.body?.email || 'dev@example.com',
          role: 'student',
          approval_status: 'approved',
          verified: true,
          created_at: new Date().toISOString()
        },
        token: 'dev-jwt-token'
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const authReq = req as unknown as AuthRequest;
    const user = authReq.user;

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        github_link: user.github_link,
        linkedin_url: user.linkedin_url,
        bio: user.bio,
        resume_link: user.resume_link,
        portfolio_link: user.portfolio_link,
        privacy_settings: user.privacy_settings,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    // Return mock data for development when database isn't available
    if (error.message && error.message.includes('ECONNREFUSED')) {
      return res.json({
        user: {
          id: 'dev-user-id',
          name: 'Development User',
          email: 'dev@example.com',
          role: 'student',
          created_at: new Date().toISOString()
        }
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update own profile (student/admin/super-admin)
export const updateProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const authReq = req as unknown as AuthRequest;
    const userId = authReq.user?.id;
    const {
      username,
      github_link,
      linkedin_url,
      bio,
      resume_link,
      portfolio_link,
      privacy_settings,
      current_password,
      new_password
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current user data
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If updating password, verify current password
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password required to set new password' });
      }

      const isValidPassword = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    // Check if username is already taken (only if updating username)
    if (username) {
      const existingUsername = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );

      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    // Only allow username updates for now (as per requirements)
    if (username !== undefined) {
      updateFields.push(`username = $${paramCount}`);
      updateValues.push(username || null);
      paramCount++;
    }

    // Profile fields that can be updated
    if (github_link !== undefined) {
      updateFields.push(`github_link = $${paramCount}`);
      updateValues.push(github_link || null);
      paramCount++;
    }

    if (linkedin_url !== undefined) {
      updateFields.push(`linkedin_url = $${paramCount}`);
      updateValues.push(linkedin_url || null);
      paramCount++;
    }

    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCount}`);
      updateValues.push(bio || null);
      paramCount++;
    }

    if (resume_link !== undefined) {
      updateFields.push(`resume_link = $${paramCount}`);
      updateValues.push(resume_link || null);
      paramCount++;
    }

    if (portfolio_link !== undefined) {
      updateFields.push(`portfolio_link = $${paramCount}`);
      updateValues.push(portfolio_link || null);
      paramCount++;
    }

    if (privacy_settings !== undefined) {
      updateFields.push(`privacy_settings = $${paramCount}`);
      updateValues.push(JSON.stringify(privacy_settings));
      paramCount++;
    }

    if (new_password) {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(new_password, saltRounds);
      updateFields.push(`password_hash = $${paramCount}`);
      updateValues.push(passwordHash);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(userId);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, username, github_link, linkedin_url, bio, resume_link, portfolio_link, privacy_settings, role, created_at, updated_at
    `;

    const result = await pool.query(query, updateValues);

    return res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    // Return mock data for development when database isn't available
    if (error.message && error.message.includes('ECONNREFUSED')) {
      return res.json({
        message: 'Profile updated successfully (development mode)',
        user: {
          id: 'dev-user-id',
          name: 'Development User',
          email: 'dev@example.com',
          username: req.body.username || 'devuser',
          github_link: req.body.github_link || null,
          linkedin_url: req.body.linkedin_url || null,
          bio: req.body.bio || null,
          resume_link: req.body.resume_link || null,
          portfolio_link: req.body.portfolio_link || null,
          privacy_settings: req.body.privacy_settings || {
            show_email: false,
            show_github: true,
            show_linkedin: true,
            show_bio: true,
            show_resume: false,
            show_portfolio: true
          },
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update any user (admin/super-admin only)
export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const authReq = req as unknown as AuthRequest;
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    // Check if target user exists
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUser = userResult.rows[0];

    // Super-admin can update anyone
    // Admin can update students only, not other admins or super-admins
    if (authReq.user?.role === 'admin') {
      if (targetUser.role === 'admin' || targetUser.role === 'super-admin') {
        return res.status(403).json({ error: 'Admins cannot update other admins or super-admins' });
      }
      if (role && (role === 'admin' || role === 'super-admin')) {
        return res.status(403).json({ error: 'Admins cannot promote users to admin or super-admin' });
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }

    if (email) {
      // Check if email is already taken
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
      paramCount++;
    }

    if (role) {
      updateFields.push(`role = $${paramCount}`);
      updateValues.push(role);
      paramCount++;
    }

    if (password) {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updateFields.push(`password_hash = $${paramCount}`);
      updateValues.push(passwordHash);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, created_at, updated_at
    `;

    const result = await pool.query(query, updateValues);

    return res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users (admin/super-admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE 1=1';
    const queryParams: any[] = [];
    let paramCount = 1;

    if (role) {
      queryText += ` AND role = $${paramCount}`;
      queryParams.push(role);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(Number(limit), offset);

    const result = await pool.query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (role) {
      countQuery += ` AND role = $${countParamCount}`;
      countParams.push(role);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);

    return res.json({
      users: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user (super-admin only)
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const authReq = req as unknown as AuthRequest;

    // Cannot delete yourself
    if (id === authReq.user?.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    return res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// LinkedIn OAuth callback handler
export const linkedinCallback = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=authentication_failed`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Check approval status
    if (user.approval_status === 'pending') {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/pending-approval?token=${token}`);
    }

    // Redirect to frontend with token
    return res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  } catch (error: any) {
    console.error('LinkedIn callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=server_error`);
  }
};

// Get pending approval requests (admin only)
export const getPendingApprovals = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.username, u.prn, u.batch, u.department, 
              u.year_of_study, u.linkedin_id, u.created_at, c.name as college_name
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       WHERE u.approval_status = 'pending'
       ORDER BY u.created_at ASC
       LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE approval_status = $1',
      ['pending']
    );

    return res.json({
      requests: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get pending approvals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve or reject user (admin only)
export const updateApprovalStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update approval status
    const result = await pool.query(
      `UPDATE users 
       SET approval_status = $1, verified = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, username, approval_status, verified`,
      [status, status === 'approved', id]
    );

    const user = result.rows[0];

    // Send email notification to user about approval/rejection
    try {
      await emailService.sendApprovalEmail(user.email, user.name, status);
      console.log(`Approval email sent to ${user.email} for status: ${status}`);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails
    }

    return res.json({
      message: `User ${status} successfully`,
      user: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update approval status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all colleges
export const getColleges = async (req: Request, res: Response): Promise<any> => {
  try {
    const search = (req.query as any).search as string || '';

    let queryText = 'SELECT id, name, city, state FROM colleges';
    const queryParams: any[] = [];

    if (search) {
      queryText += ' WHERE name ILIKE $1';
      queryParams.push(`%${search}%`);
    }

    queryText += ' ORDER BY name ASC';

    const result = await pool.query(queryText, queryParams);

    return res.json({
      colleges: result.rows
    });
  } catch (error: any) {
    console.error('Get colleges error:', error);
    // Return mock data for development when database isn't available
    if (error.message && error.message.includes('ECONNREFUSED')) {
      const mockColleges = [
        { id: '1', name: 'MIT College of Engineering', city: 'Pune', state: 'Maharashtra' },
        { id: '2', name: 'VIT Pune', city: 'Pune', state: 'Maharashtra' },
        { id: '3', name: 'Sinhgad College', city: 'Pune', state: 'Maharashtra' },
        { id: '4', name: 'PCCOE', city: 'Pune', state: 'Maharashtra' }
      ];

      const searchTerm = req.query.search as string;
      const filteredColleges = searchTerm
        ? mockColleges.filter(college =>
            college.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockColleges;

      return res.json({
        colleges: filteredColleges
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Validation middleware
export const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').optional().trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-50 alphanumeric characters or underscores'),
  body('prn').optional().trim().isLength({ min: 6, max: 20 }).withMessage('PRN must be 6-20 characters'),
  body('batch').optional().trim().isLength({ max: 20 }).withMessage('Batch must be max 20 characters'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
  body('college_id').optional().isUUID().withMessage('Invalid college ID'),
  body('year_of_study').optional().isInt({ min: 1, max: 6 }).withMessage('Year of study must be 1-6'),
  body('role').optional().isIn(['student', 'admin', 'super-admin']).withMessage('Invalid role')
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

export const validateUpdateProfile = [
  body('username').optional().trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-50 alphanumeric characters or underscores'),
  body('github_link').optional().isURL().withMessage('GitHub link must be a valid URL'),
  body('linkedin_url').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
  body('resume_link').optional().isURL().withMessage('Resume link must be a valid URL'),
  body('portfolio_link').optional().isURL().withMessage('Portfolio link must be a valid URL'),
  body('privacy_settings').optional().isObject().withMessage('Privacy settings must be an object'),
  body('current_password').optional().isString().withMessage('Current password must be a string'),
  body('new_password').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

export const validateUpdateUser = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['student', 'admin', 'super-admin']).withMessage('Invalid role'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
