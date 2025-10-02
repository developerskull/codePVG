# PowerShell script to set up environment files
# Run this script from the project root

Write-Host "Setting up environment files..." -ForegroundColor Green

# Create frontend .env.local
$frontendEnv = @"
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# App Configuration
NEXT_PUBLIC_APP_NAME=CollegeCodeHub
NEXT_PUBLIC_APP_DESCRIPTION=A college-specific LeetCode clone for computer science students

# Feature Flags
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# External Services
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cicpspeczacdnykbqljm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY3BzcGVjemFjZG55a2JxbGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDQ2NTcsImV4cCI6MjA3NDg4MDY1N30.fp5PmQ3oyt1O5j7IqPJNIgS6G29e_-Hk6osjM979va4
"@

# Create backend .env
$backendEnv = @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=codePVG
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Redis Configuration (for caching and queues)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Judge0 Configuration
JUDGE0_API_URL=http://localhost:2358
JUDGE0_API_KEY=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_CALLBACK_URL=http://localhost:5000/api/auth/linkedin/callback

# Session Configuration
SESSION_SECRET=your-session-secret-key-change-this

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
APP_NAME=College Code Hub

# Supabase Configuration
SUPABASE_URL=https://cicpspeczacdnykbqljm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY3BzcGVjemFjZG55a2JxbGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDQ2NTcsImV4cCI6MjA3NDg4MDY1N30.fp5PmQ3oyt1O5j7IqPJNIgS6G29e_-Hk6osjM979va4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY3BzcGVjemFjZG55a2JxbGptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMwNDY1NywiZXhwIjoyMDc0ODgwNjU3fQ.oYYjAO04r86B6mC08xeEbjAiGDyCyTpcl6tNxfx-sk8
"@

# Write frontend .env.local
$frontendEnv | Out-File -FilePath "frontend\.env.local" -Encoding UTF8 -NoNewline
Write-Host "✓ Created frontend/.env.local" -ForegroundColor Cyan

# Write backend .env
$backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8 -NoNewline
Write-Host "✓ Created backend/.env" -ForegroundColor Cyan

Write-Host ""
Write-Host "Environment files created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review and update the environment files if needed" -ForegroundColor White
Write-Host "2. Configure LinkedIn OAuth in Supabase (see LINKEDIN_OAUTH_SETUP.md)" -ForegroundColor White
Write-Host "3. Create demo users in Supabase (see DEMO_USERS_SETUP.md)" -ForegroundColor White
Write-Host "4. Start the backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "5. Start the frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "For more details, see AUTH_FIX_SUMMARY.md" -ForegroundColor Cyan

