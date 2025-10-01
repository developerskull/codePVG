# College-Based Authentication System

## Overview

This application now supports a college-specific authentication system with PRN verification, LinkedIn OAuth, and admin approval workflow.

## Features

### 1. **Multiple Registration Methods**

#### Standard Registration (with PRN)
- Users can register with their college PRN (Permanent Registration Number)
- PRN format: 6-20 alphanumeric characters
- Requires admin approval if PRN or college information is provided

#### LinkedIn OAuth Registration
- Users can sign up/login using LinkedIn
- Automatically fetches college information from LinkedIn education data
- Requires admin approval if college info is found

### 2. **User Profile Fields**

- **Basic Information**: Name, Email, Password
- **Username**: Unique identifier for profile sharing and searching (optional)
- **College Details**: 
  - PRN Number
  - Batch (e.g., 2021-2025)
  - Department
  - Year of Study (1-4)
  - College (searchable dropdown)

### 3. **Admin Approval Workflow**

- Students with PRN or college information require admin approval
- Admin dashboard to view pending requests
- Approve/Reject functionality
- Pending users can login but have limited access until approved

## Setup Instructions

### Backend Configuration

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Variables**
Create a `.env` file with the following variables:

```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_CALLBACK_URL=http://localhost:5000/api/auth/linkedin/callback

# Session
SESSION_SECRET=your-session-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database (ensure PostgreSQL is running)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=collegecodehub
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

3. **LinkedIn OAuth Setup**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Create a new app
   - Add OAuth 2.0 redirect URL: `http://localhost:5000/api/auth/linkedin/callback`
   - Get Client ID and Client Secret
   - Update `.env` file

4. **Database Setup**
   - The application will automatically create tables on startup
   - Tables created: `colleges`, `users` (with new fields), `problems`, `submissions`, etc.

### Frontend Configuration

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Variables**
Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Endpoints

### Public Routes

- `POST /api/auth/register` - Register with email/password + optional college info
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/linkedin` - Initiate LinkedIn OAuth flow
- `GET /api/auth/linkedin/callback` - LinkedIn OAuth callback
- `GET /api/auth/colleges` - Search colleges

### Protected Routes (Authenticated Users)

- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update own profile

### Admin Routes

- `GET /api/auth/approvals/pending` - Get pending approval requests
- `PUT /api/auth/approvals/:id` - Approve/reject user
- `GET /api/auth/users` - List all users
- `PUT /api/auth/users/:id` - Update any user

### Super Admin Routes

- `DELETE /api/auth/users/:id` - Delete user

## User Registration Flow

### Flow 1: Standard Registration with PRN

1. User fills registration form with:
   - Name, Email, Password
   - Username (optional)
   - PRN Number
   - College details (batch, department, year, college)

2. Backend validates:
   - Email uniqueness
   - Username uniqueness
   - PRN format and uniqueness
   
3. User account created with `approval_status: 'pending'`

4. User redirected to pending approval page

5. Admin reviews and approves/rejects

6. User can login after approval

### Flow 2: LinkedIn OAuth Registration

1. User clicks "Continue with LinkedIn"

2. LinkedIn authentication

3. Backend fetches education data from LinkedIn profile

4. If college found:
   - Creates/finds college record
   - Sets `approval_status: 'pending'`
   - User needs admin approval

5. If no college info:
   - Sets `approval_status: 'pending'`
   - User needs admin approval

6. User redirected to pending approval page

## Admin Dashboard

Access: `/admin/approvals`

**Requirements**: User must have role `admin` or `super-admin`

**Features**:
- View all pending registration requests
- See user details:
  - Name, Email, Username
  - PRN, College, Department, Batch, Year
  - LinkedIn connection status
  - Registration date
- Approve/Reject buttons
- Real-time updates

## Database Schema Changes

### New `colleges` Table

```sql
CREATE TABLE colleges (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Updated `users` Table

New fields added:
- `username VARCHAR(50) UNIQUE`
- `prn VARCHAR(50) UNIQUE`
- `batch VARCHAR(20)`
- `department VARCHAR(100)`
- `college_id UUID REFERENCES colleges(id)`
- `year_of_study INTEGER`
- `bio TEXT`
- `avatar_url TEXT`
- `verified BOOLEAN DEFAULT false`
- `linkedin_id VARCHAR(255) UNIQUE`
- `approval_status VARCHAR(20)` - ('pending', 'approved', 'rejected')
- `password_hash VARCHAR(255)` - Now optional (for OAuth users)

## PRN Validation

The system validates PRN format:
- Length: 6-20 characters
- Format: Alphanumeric only
- Case insensitive (stored as uppercase)
- Unique across all users

Examples of valid PRNs:
- `ABC123456`
- `21BCE1234`
- `2021001234`

## Security Features

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT Authentication**: Tokens expire in 7 days
3. **Session Management**: For OAuth flows
4. **Rate Limiting**: 100 requests per 15 minutes per IP
5. **CORS Protection**: Configured for frontend URL
6. **Input Validation**: express-validator for all inputs
7. **SQL Injection Protection**: Parameterized queries

## Testing

### Create Admin User

To test admin features, manually update a user's role in the database:

```sql
UPDATE users 
SET role = 'admin', approval_status = 'approved', verified = true 
WHERE email = 'admin@example.com';
```

### Test PRN Registration

1. Go to `/auth/register`
2. Fill in all fields including PRN
3. Submit
4. Should see pending approval message
5. Login as admin
6. Go to `/admin/approvals`
7. Approve the request
8. Login as the new user

### Test LinkedIn OAuth

1. Configure LinkedIn OAuth credentials
2. Go to `/auth/register`
3. Click "Continue with LinkedIn"
4. Complete LinkedIn authorization
5. Should redirect to pending approval or home based on college info

## Troubleshooting

### LinkedIn OAuth Not Working

- Check LinkedIn app credentials
- Verify redirect URL matches exactly
- Ensure `SESSION_SECRET` is set
- Check LinkedIn app has required permissions: `r_emailaddress`, `r_liteprofile`

### PRN Validation Failing

- Check PRN format (6-20 alphanumeric)
- Ensure no special characters
- Verify PRN is not already registered

### Admin Dashboard Not Loading

- Verify user role is `admin` or `super-admin`
- Check JWT token is valid
- Ensure backend is running

### Database Connection Issues

- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure database exists

## Future Enhancements

- Email notifications for approval/rejection
- Bulk approval feature
- College verification system
- Student verification via email domain
- Profile completion percentage
- Alumni verification
- Department-specific features
