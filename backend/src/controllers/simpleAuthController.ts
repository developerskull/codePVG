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

    // Create user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
      username,
      year_of_study,
      role,
      verified: true,
      approval_status: 'approved',
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
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
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
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
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
