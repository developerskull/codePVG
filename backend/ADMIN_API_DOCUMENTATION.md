# Super Admin API Documentation

This document outlines all the backend APIs available for super admin functionality in the CollegeCodeHub platform.

## Authentication

All admin endpoints require:
1. Valid Supabase JWT token in Authorization header
2. User must have `super-admin` role

```bash
Authorization: Bearer <supabase_jwt_token>
```

## Base URL
```
http://localhost:5000/api
```

---

## 🏠 Admin Dashboard

### Get Dashboard Overview
```http
GET /api/admin/dashboard
```

**Response:**
```json
{
  "overview": {
    "totalUsers": 1500,
    "activeUsers": 1200,
    "bannedUsers": 5,
    "systemHealth": "healthy",
    "pendingApprovals": 3,
    "securityAlerts": 2
  },
  "userStats": { ... },
  "systemStats": { ... },
  "recentActivity": [ ... ],
  "securityAlerts": [ ... ],
  "pendingApprovals": [ ... ],
  "systemHealth": { ... }
}
```

### Perform Quick Action
```http
POST /api/admin/quick-action
```

**Body:**
```json
{
  "action": "ban_user|unban_user|force_logout|approve_request|reject_request",
  "targetId": "user_id_or_request_id",
  "details": {
    "reason": "Violation of terms",
    "comments": "Additional notes"
  }
}
```

---

## 👥 User Management

### Get All Users
```http
GET /api/admin/users?page=1&limit=20&search=john&role=student&status=active
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search in name, email, username
- `role`: Filter by role (student, admin, super-admin)
- `status`: Filter by status (active, banned)

### Get User by ID
```http
GET /api/admin/users/:id
```

### Update User
```http
PUT /api/admin/users/:id
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "role": "student",
  "status": "active",
  "bio": "Computer Science student",
  "github_link": "https://github.com/johndoe",
  "linkedin_url": "https://linkedin.com/in/johndoe"
}
```

### Delete User
```http
DELETE /api/admin/users/:id
```

### Ban User
```http
POST /api/admin/users/:id/ban
```

**Body:**
```json
{
  "reason": "Violation of community guidelines",
  "duration": "7d"
}
```

### Unban User
```http
POST /api/admin/users/:id/unban
```

---

## 📊 Data Management

### Get System Statistics
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "users": {
    "total": 1500,
    "active": 1200,
    "banned": 5
  },
  "roleDistribution": {
    "student": 1400,
    "admin": 50,
    "super-admin": 5
  },
  "recentActivity": [ ... ]
}
```

### Export User Data
```http
GET /api/admin/export/users?format=json&role=student&status=active
```

**Query Parameters:**
- `format`: Export format (json, csv)
- `role`: Filter by role
- `status`: Filter by status

---

## ⚙️ System Settings

### Get System Settings
```http
GET /api/admin/settings
```

### Update System Settings
```http
PUT /api/admin/settings
```

**Body:**
```json
{
  "site_name": "CollegeCodeHub",
  "site_description": "Coding platform for students",
  "maintenance_mode": false,
  "registration_enabled": true,
  "max_file_size": 10485760,
  "allowed_file_types": ["jpg", "jpeg", "png", "pdf"],
  "email_notifications": true,
  "security_settings": {
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSpecialChars": true
    },
    "sessionPolicy": {
      "maxSessionDuration": 86400000,
      "maxConcurrentSessions": 3
    },
    "loginPolicy": {
      "maxFailedAttempts": 5,
      "lockoutDuration": 900000,
      "requireEmailVerification": true
    }
  }
}
```

---

## 📈 Analytics

### Get Dashboard Analytics
```http
GET /api/analytics/dashboard?period=30d
```

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y)

### Get User Behavior Analytics
```http
GET /api/analytics/user-behavior?period=30d
```

### Get System Performance Analytics
```http
GET /api/analytics/system-performance?period=7d
```

### Export Analytics Data
```http
GET /api/analytics/export?format=json&type=all&period=30d
```

### Get Real-time Analytics
```http
GET /api/analytics/realtime
```

---

## 🔒 Security Dashboard

### Get Security Dashboard
```http
GET /api/security/dashboard?period=7d
```

### Get Blocked IPs
```http
GET /api/security/blocked-ips?page=1&limit=50
```

### Unblock IP
```http
POST /api/security/blocked-ips/:ip/unblock
```

### Get User Security Status
```http
GET /api/security/users/:userId/status
```

### Force Logout User
```http
POST /api/security/users/:userId/force-logout
```

### Get Security Policies
```http
GET /api/security/policies
```

### Update Security Policies
```http
PUT /api/security/policies
```

**Body:**
```json
{
  "passwordPolicy": { ... },
  "sessionPolicy": { ... },
  "loginPolicy": { ... },
  "ipWhitelist": ["192.168.1.0/24"],
  "ipBlacklist": ["10.0.0.1"]
}
```

### Get Security Alerts
```http
GET /api/security/alerts?severity=high&status=active
```

### Acknowledge Alert
```http
POST /api/security/alerts/:alertId/acknowledge
```

**Body:**
```json
{
  "comments": "Alert investigated and resolved"
}
```

---

## 📧 Notifications

### Create System Notification
```http
POST /api/notifications/system
```

**Body:**
```json
{
  "title": "System Maintenance",
  "message": "Scheduled maintenance on Sunday",
  "type": "warning",
  "targetRoles": ["student", "admin"],
  "targetUsers": ["user_id_1", "user_id_2"],
  "isGlobal": false,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Get System Notifications
```http
GET /api/notifications/system?page=1&limit=20&type=warning&status=active
```

### Update System Notification
```http
PUT /api/notifications/system/:id
```

### Delete System Notification
```http
DELETE /api/notifications/system/:id
```

### Get User Notifications
```http
GET /api/notifications/user?page=1&limit=20&unreadOnly=false
```

### Send Email Notification
```http
POST /api/notifications/email
```

**Body:**
```json
{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Important Update",
  "message": "Please read this important update",
  "template": "default",
  "priority": "high"
}
```

### Bulk Create Notifications
```http
POST /api/notifications/bulk/create
```

**Body:**
```json
{
  "notifications": [
    {
      "title": "Notification 1",
      "message": "Message 1",
      "type": "info"
    },
    {
      "title": "Notification 2",
      "message": "Message 2",
      "type": "warning"
    }
  ]
}
```

### Bulk Delete Notifications
```http
POST /api/notifications/bulk/delete
```

**Body:**
```json
{
  "notificationIds": ["id1", "id2", "id3"]
}
```

### Get Notification Templates
```http
GET /api/notifications/templates
```

### Get Notification Analytics
```http
GET /api/notifications/analytics?period=30d
```

---

## 🗄️ Database Management

### Get Database Statistics
```http
GET /api/admin/database/stats
```

### Cleanup Old Data
```http
POST /api/admin/database/cleanup
```

**Body:**
```json
{
  "days": 90
}
```

---

## ✅ Approval System

### Get Pending Approvals
```http
GET /api/admin/approvals
```

### Approve Request
```http
POST /api/admin/approvals/:id/approve
```

**Body:**
```json
{
  "comments": "Approved after review"
}
```

### Reject Request
```http
POST /api/admin/approvals/:id/reject
```

**Body:**
```json
{
  "comments": "Rejected due to insufficient information"
}
```

---

## 🔍 Security Logs

### Get Security Logs
```http
GET /api/admin/security/logs?page=1&limit=50&type=failed_login&severity=high
```

### Get Admin Actions
```http
GET /api/admin/security/actions?page=1&limit=50&admin_id=admin123&action_type=ban_user
```

---

## 📊 Analytics Endpoints

### Get Analytics
```http
GET /api/admin/analytics?period=30d
```

---

## 🚨 Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Super admin access required"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🔐 Security Features

### Rate Limiting
- 100 requests per 15 minutes per IP
- Admin endpoints have higher limits

### Audit Logging
- All admin actions are logged
- Includes IP address, user agent, and timestamp
- Stored in `admin_actions` table

### Security Monitoring
- Failed login attempts tracked
- Suspicious activity detection
- IP blocking for repeated violations
- Real-time security alerts

### Data Protection
- Row Level Security (RLS) enabled
- Super admin only access to sensitive data
- Encrypted sensitive information
- Secure session management

---

## 🚀 Getting Started

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Login as super admin:**
   - Use the frontend to login with a super-admin account
   - Get the JWT token from localStorage

3. **Test the APIs:**
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:5000/api/admin/dashboard
   ```

4. **Access the admin console:**
   - Navigate to `/admin` in the frontend
   - All admin features will be available

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Pagination is 0-based for page numbers
- All endpoints require super-admin role
- Database operations are logged for audit purposes
- Real-time features require WebSocket connection (future implementation)
