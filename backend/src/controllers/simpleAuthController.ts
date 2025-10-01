import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

// Simple mock users with plain text passwords for development
const mockUsers = [
  {
    id: '1',
    name: 'Test Student',
    email: 'student@example.com',
    password: 'password123',
    username: 'student',
    role: 'student',
    year_of_study: 3,
    verified: true,
    approval_status: 'approved',
    github_link: null,
    linkedin_url: null,
    bio: null,
    resume_link: null,
    portfolio_link: null,
    privacy_settings: {
      show_email: false,
      show_github: true,
      show_linkedin: true,
      show_bio: true,
      show_resume: false,
      show_portfolio: true
    },
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'password123',
    username: 'admin',
    role: 'admin',
    year_of_study: null,
    verified: true,
    approval_status: 'approved',
    github_link: null,
    linkedin_url: null,
    bio: null,
    resume_link: null,
    portfolio_link: null,
    privacy_settings: {
      show_email: false,
      show_github: true,
      show_linkedin: true,
      show_bio: true,
      show_resume: false,
      show_portfolio: true
    },
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Test Super Admin',
    email: 'superadmin@example.com',
    password: 'password123',
    username: 'superadmin',
    role: 'super-admin',
    year_of_study: null,
    verified: true,
    approval_status: 'approved',
    github_link: null,
    linkedin_url: null,
    bio: null,
    resume_link: null,
    portfolio_link: null,
    privacy_settings: {
      show_email: false,
      show_github: true,
      show_linkedin: true,
      show_bio: true,
      show_resume: false,
      show_portfolio: true
    },
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Pending Student',
    email: 'pending@example.com',
    password: 'password123',
    username: 'pending',
    role: 'student',
    year_of_study: 2,
    verified: false,
    approval_status: 'pending',
    github_link: null,
    linkedin_url: null,
    bio: null,
    resume_link: null,
    portfolio_link: null,
    privacy_settings: {
      show_email: false,
      show_github: true,
      show_linkedin: true,
      show_bio: true,
      show_resume: false,
      show_portfolio: true
    },
    created_at: new Date().toISOString()
  }
];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Register request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { 
      name, 
      email, 
      password, 
      username,
      year_of_study,
      role = 'student' 
    } = req.body;

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with pending approval for students
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
      username,
      year_of_study,
      role,
      verified: false,
      approval_status: role === 'student' ? 'pending' : 'approved',
      github_link: null,
      linkedin_url: null,
      bio: null,
      resume_link: null,
      portfolio_link: null,
      privacy_settings: {
        show_email: false,
        show_github: true,
        show_linkedin: true,
        show_bio: true,
        show_resume: false,
        show_portfolio: true
      },
      created_at: new Date().toISOString()
    };

    mockUsers.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: newUser.approval_status === 'pending' 
        ? 'Registration successful. Awaiting admin approval.' 
        : 'User registered successfully',
      user: userWithoutPassword,
      token,
      needsApproval: newUser.approval_status === 'pending'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user by email
    const user = mockUsers.find(u => u.email === email);
    console.log('Found user:', user ? 'Yes' : 'No');
    console.log('User email:', user?.email);
    console.log('User password:', user?.password);
    console.log('Input password:', password);
    
    if (!user) {
      console.log('User not found');
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password (simple comparison for mock users)
    if (user.password !== password) {
      console.log('Password mismatch');
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check approval status for students
    if (user.role === 'student' && user.approval_status === 'pending') {
      res.status(403).json({
        error: 'Your account is pending admin approval. Please wait for approval.',
        approval_status: 'pending'
      });
      return;
    }

    if (user.role === 'student' && user.approval_status === 'rejected') {
      res.status(403).json({
        error: 'Your account has been rejected. Please contact support.',
        approval_status: 'rejected'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    console.log('Login successful for:', email);
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      username,
      github_link,
      linkedin_url,
      bio,
      resume_link,
      portfolio_link,
      privacy_settings
    } = req.body;

    // Find user in mock data
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if username is already taken (only if updating username)
    if (username && username !== mockUsers[userIndex].username) {
      const existingUser = mockUsers.find(u => u.username === username && u.id !== user.id);
      if (existingUser) {
        res.status(400).json({ error: 'Username already taken' });
        return;
      }
    }

    // Update user data
    const updatedUser = {
      ...mockUsers[userIndex],
      ...(username !== undefined && { username }),
      ...(github_link !== undefined && { github_link }),
      ...(linkedin_url !== undefined && { linkedin_url }),
      ...(bio !== undefined && { bio }),
      ...(resume_link !== undefined && { resume_link }),
      ...(portfolio_link !== undefined && { portfolio_link }),
      ...(privacy_settings !== undefined && { privacy_settings }),
      updated_at: new Date().toISOString()
    };

    mockUsers[userIndex] = updatedUser;

    // Return updated user data (without password)
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Validation middleware
export const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateUpdateProfile = [
  body('username').optional().trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-50 alphanumeric characters or underscores'),
  body('github_link').optional().isURL().withMessage('GitHub link must be a valid URL'),
  body('linkedin_url').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
  body('resume_link').optional().isURL().withMessage('Resume link must be a valid URL'),
  body('portfolio_link').optional().isURL().withMessage('Portfolio link must be a valid URL'),
  body('privacy_settings').optional().isObject().withMessage('Privacy settings must be an object'),
];
