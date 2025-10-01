import { Router } from 'express';

const router = Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

router.post('/test-login', (req, res) => {
  console.log('Test login request:', req.body);
  res.json({ 
    message: 'Test login successful',
    user: { id: '1', email: 'test@example.com', role: 'student' },
    token: 'test-token'
  });
});

export default router;
