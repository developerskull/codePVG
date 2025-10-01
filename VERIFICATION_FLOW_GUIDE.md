# Student Verification Flow Guide

## Overview

This document explains the complete student verification flow implemented in the College Code Hub platform. The system ensures that only verified students can access the platform by requiring admin approval for all student registrations.

## Flow Diagram

```
Student Registration → Admin Review → Approval/Rejection → Email Notification → Platform Access
```

## Detailed Flow

### 1. Student Registration

**When a student registers:**
- Student fills out registration form with personal and college information
- System automatically sets `approval_status = 'pending'` for all students
- Student receives confirmation that registration is successful but pending approval
- Student is redirected to pending approval page

**Registration Requirements:**
- Name, Email, Password (required)
- Username (optional but recommended)
- College information (PRN, Department, Batch, etc.)
- Year of study

### 2. Admin Review Process

**Admin Dashboard Access:**
- Only users with `admin` or `super-admin` roles can access `/admin/approvals`
- Admins can view all pending registration requests
- Each request shows:
  - Student's personal information
  - College details (PRN, Department, Batch, Year)
  - Registration date
  - LinkedIn connection status (if applicable)

**Admin Actions:**
- **Approve**: Student account is activated, email notification sent
- **Reject**: Student account is rejected, email notification sent

### 3. Email Notifications

**Approval Email:**
- Sent when admin approves student account
- Contains welcome message and platform access instructions
- Includes direct link to login page

**Rejection Email:**
- Sent when admin rejects student account
- Explains possible reasons for rejection
- Provides contact information for support

### 4. Student Access Control

**Pending Students:**
- Cannot access protected routes
- Redirected to pending approval page when trying to login
- Can view pending approval status

**Approved Students:**
- Full access to platform features
- Can solve problems, participate in competitions
- Can update profile and connect with other students

**Rejected Students:**
- Cannot access platform
- Must contact support for assistance

## Technical Implementation

### Backend Changes

#### 1. Database Schema
```sql
-- Users table already includes:
approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'))
verified BOOLEAN DEFAULT false
```

#### 2. Authentication Middleware
- Updated to check `approval_status` for students
- Blocks access for pending/rejected students
- Returns appropriate error messages

#### 3. Email Service
- Nodemailer integration for SMTP email sending
- HTML email templates for approval/rejection
- Configurable SMTP settings via environment variables

#### 4. API Endpoints
- `GET /api/auth/approvals/pending` - Get pending approvals (admin only)
- `PUT /api/auth/approvals/:id` - Approve/reject user (admin only)
- Updated login endpoints to handle verification status

### Frontend Changes

#### 1. Authentication Context
- Updated to handle verification status
- Proper error handling for pending/rejected accounts
- Token management for different user states

#### 2. Login Flow
- Enhanced error handling for verification status
- Automatic redirection to pending approval page
- Clear messaging about account status

#### 3. Pending Approval Page
- Informative page for students awaiting approval
- Clear instructions about next steps
- Professional design with status indicators

#### 4. Admin Dashboard
- Complete approval interface
- User information display
- Approve/Reject functionality
- Real-time updates

## Environment Variables

### Backend (.env)
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
APP_NAME=College Code Hub
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Testing the Flow

### Test Accounts
1. **Approved Student**: `student@example.com` / `password123`
2. **Admin**: `admin@example.com` / `password123`
3. **Super Admin**: `superadmin@example.com` / `password123`
4. **Pending Student**: `pending@example.com` / `password123`

### Test Scenarios

#### 1. Student Registration
1. Go to `/auth/register`
2. Fill out form with student information
3. Submit registration
4. Should redirect to pending approval page
5. Check admin dashboard for new pending request

#### 2. Admin Approval Process
1. Login as admin (`admin@example.com`)
2. Go to `/admin/approvals`
3. View pending student information
4. Click "Approve" or "Reject"
5. Check email notification (if SMTP configured)

#### 3. Student Login After Approval
1. Login with approved student account
2. Should access dashboard successfully
3. Try login with pending account
4. Should redirect to pending approval page

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on Gmail
2. Generate App Password
3. Use App Password in `SMTP_PASS` environment variable
4. Set `SMTP_USER` to your Gmail address

### Other SMTP Providers
- Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` accordingly
- Use appropriate authentication credentials

## Security Considerations

1. **Admin Access Control**: Only verified admins can approve/reject users
2. **Email Validation**: All email addresses are validated before sending
3. **Token Security**: JWT tokens include user verification status
4. **Rate Limiting**: Email sending is rate-limited to prevent spam
5. **Error Handling**: Failed email sends don't break the approval process

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check server logs for errors

2. **Pending Students Can't Login**
   - Verify middleware is checking approval status
   - Check user's approval_status in database
   - Ensure proper error handling in frontend

3. **Admin Can't Access Approvals**
   - Verify user has admin/super-admin role
   - Check authentication middleware
   - Ensure proper route protection

### Debug Steps

1. Check database for user approval_status
2. Verify JWT token contains correct user information
3. Check server logs for authentication errors
4. Test email configuration separately
5. Verify frontend error handling

## Future Enhancements

1. **Bulk Approval**: Allow admins to approve multiple users at once
2. **Approval Reasons**: Let admins provide reasons for rejection
3. **Email Templates**: Customizable email templates
4. **Notification Settings**: User preferences for email notifications
5. **Approval History**: Track approval/rejection history
6. **Auto-approval**: Rules for automatic approval based on criteria

## Support

For technical support or questions about the verification flow:
- Check server logs for detailed error messages
- Verify environment variables are correctly set
- Test email configuration with a simple test email
- Ensure database schema is up to date
