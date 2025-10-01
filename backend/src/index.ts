import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passport';

import { initializeDatabase } from './utils/database';
import authRoutes from './routes/auth';
import problemRoutes from './routes/problems';
import submissionRoutes from './routes/submissions';
import leaderboardRoutes from './routes/leaderboard';
import testRoutes from './routes/test';
import simpleAuthRoutes from './routes/simpleAuth';
import supabaseAuthRoutes from './routes/supabaseAuth';
import checkPrnRoutes from './routes/checkPrn';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';
import securityRoutes from './routes/security';
import notificationRoutes from './routes/notifications';
import adminInvitationRoutes from './routes/adminInvitations';
import createTableRoutes from './routes/createTable';
import checkRoleRoutes from './routes/checkRole';
import updateRoleRoutes from './routes/updateRole';
import testAdminRoutes from './routes/testAdmin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
if (process.env.NODE_ENV !== 'production') {
  // In development, allow all origins for easier local testing
  app.use(cors({ origin: true, credentials: true }));
} else {
  const allowedOrigins = new Set([
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      try {
        const url = new URL(origin);
        const normalized = `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`;
        if (allowedOrigins.has(normalized)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      } catch {
        return callback(new Error('Invalid origin'));
      }
    },
    credentials: true,
  }));
}

// Explicitly handle preflight - removed problematic wildcard route

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/test', testRoutes);
app.use('/api/simple-auth', simpleAuthRoutes);
app.use('/api/supabase-auth', supabaseAuthRoutes);
app.use('/api', checkPrnRoutes);

// Admin routes (super admin only)
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminInvitationRoutes);
app.use('/api', createTableRoutes);
app.use('/api', checkRoleRoutes);
app.use('/api', updateRoleRoutes);
app.use('/api/test', testAdminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request entity too large' });
  }
  
  return res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Don't exit - allow for development without database
    console.log('🔄 Starting server without database...');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (development mode)`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });

    return server;
  }
};

startServer();

export default app;
