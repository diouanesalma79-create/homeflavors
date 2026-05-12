# HomeFlavors Admin Dashboard

## Overview
The Admin Dashboard allows administrators to manage and approve new Chef and Visitor accounts before they gain access to the platform.

## Access Information

### Admin Login
- **URL**: `/admin/login`
- **Demo Credentials**:
  - Email: `admin@homeflavors.com`
  - Password: `admin123`

### Admin Dashboard
- **URL**: `/admin/dashboard`
- **Access**: Only available to authenticated admin users

## Features

### User Management
- View pending Chef and Visitor account applications
- Approve or reject user accounts
- Filter users by status (Pending/Approved/Rejected)
- View user details including:
  - Full name
  - Email address
  - Account type (Chef/Visitor)
  - Registration date

### Security
- Role-based access control
- Only admins can access the dashboard
- Unauthorized users are shown an access denied message
- Protected routes with authentication checks

## Technical Implementation

### Components
- `AdminDashboard.js` - Main dashboard component
- `AdminLogin.js` - Admin authentication page
- `ProtectedRoute.js` - Route protection logic

### Routes
- `/admin/login` - Admin login page
- `/admin/dashboard` - Protected admin dashboard

### Styling
- Uses scoped CSS classes
- Warm color palette consistent with HomeFlavors branding
- Responsive design for all device sizes

## Usage Instructions

1. Navigate to `/admin/login`
2. Enter admin credentials
3. Access the dashboard at `/admin/dashboard`
4. Manage user accounts using the approval/rejection buttons
5. Use tabs to filter between pending, approved, and rejected users

## Security Notes
- In production, implement proper backend authentication
- Store admin credentials securely
- Add additional security measures like 2FA
- Implement proper session management
- Add audit logging for admin actions

## API Integration Points
The dashboard is ready for backend integration with these endpoints:
- `GET /api/admin/pending-users` - Fetch pending users
- `POST /api/admin/approve-user` - Approve user account
- `POST /api/admin/reject-user` - Reject user account