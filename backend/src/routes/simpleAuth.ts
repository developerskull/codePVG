import { Router } from 'express';

const router = Router();

// Test endpoint to check connectivity
router.get('/test', (req, res) => {
  res.json({ message: 'Simple auth test endpoint working!' });
});

// Simple mock users
const users = [
  {
    id: '1',
    name: 'Test Student',
    email: 'student@example.com',
    password: 'password123',
    role: 'student'
  },
  {
    id: '2',
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  }
];

// Simple login endpoint
router.post('/login', (req, res) => {
  console.log('Login request:', req.body);
  
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  
  // Return success response
  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token: 'mock-token-' + user.id
  });
});

// Simple register endpoint
router.post('/register', (req, res) => {
  console.log('Register request:', req.body);
  
  const { name, email, password } = req.body;
  
  // Check if user exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    res.status(400).json({ error: 'User already exists' });
    return;
  }
  
  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    name,
    email,
    password,
    role: 'student'
  };
  
  users.push(newUser);
  
  res.json({
    message: 'Registration successful',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    },
    token: 'mock-token-' + newUser.id
  });
});

export default router;
