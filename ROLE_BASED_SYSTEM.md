# Team Task Manager - Role-Based System Implementation Guide

## Overview
Your Team Task Manager has been upgraded with a comprehensive role-based access system and team invite codes. This document explains all changes and how to use the system.

---

## 🎯 New Features

### 1. **Role-Based Setup Flow**
After registration, users are redirected to a setup page where they can:
- **Create Team** (becomes Admin)
- **Join Team** using an invite code (becomes Member)

### 2. **Team Management**
- Teams are created with unique 6-character invite codes
- Only one team per user
- Invite codes are shareable and unique

### 3. **Role-Based Access Control**

#### **Admin Capabilities**
- ✅ Create new projects
- ✅ Assign tasks to team members
- ✅ Manage project members
- ✅ View team invite code
- ✅ Access all team projects

#### **Member Capabilities**
- ✅ View assigned projects
- ✅ Update task status (mark as in-progress, done, etc.)
- ✅ View team members
- ❌ Cannot create projects
- ❌ Cannot reassign tasks
- ❌ Cannot see invite code

---

## 📁 Database Schema Changes

### **New Team Model** (`server/models/Team.js`)
```javascript
{
  name: String,           // Team name
  owner: ObjectId,        // Reference to User (admin)
  inviteCode: String,     // Unique 6-char code (uppercase)
  members: [ObjectId],    // Array of User references
  createdAt: Date,
  updatedAt: Date
}
```

### **Updated User Model** (`server/models/User.js`)
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String,           // null (setup pending) | "admin" | "member"
  teamId: ObjectId,       // Reference to Team
  hasCompletedSetup: Boolean,  // Tracks setup completion
  createdAt: Date,
  updatedAt: Date
}
```

### **Updated Project Model** (`server/models/Project.js`)
```javascript
{
  name: String,
  description: String,
  teamId: ObjectId,       // NEW: Associates project with team
  members: [ObjectId],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 Backend API Changes

### **New Team Routes** (`/api/teams`)

#### **POST /teams/create**
Creates a new team (Admin flow)
```javascript
Request: { teamName: "My Team" }
Response: { team: { id, name, inviteCode, owner, members } }
```

#### **POST /teams/join**
Joins existing team (Member flow)
```javascript
Request: { inviteCode: "ABC123" }
Response: { team: { id, name, owner, members } }
```

#### **GET /teams**
Gets current user's team
```javascript
Response: { team: { ...populated team data } }
```

#### **GET /teams/members**
Gets team members list
```javascript
Response: { members: [...populated user data] }
```

#### **GET /teams/invite-code** (Admin only)
Gets team's invite code
```javascript
Response: { inviteCode: "ABC123" }
```

### **Updated Auth Routes**

#### **POST /auth/register** (Modified)
- No longer auto-assigns role
- Returns `role: null` until setup completion
- Redirects to `/setup` page

### **Updated Project Routes** (Modified)

#### **POST /projects** (Admin only)
- Only admins can create projects
- Projects automatically include `teamId`
- Validates user belongs to a team

#### **GET /projects** (Modified)
- Returns only projects from user's team
- Filtered by team access

---

## 🎨 Frontend Changes

### **New Pages**

#### **ChooseSetup.jsx** (`client/src/pages/ChooseSetup.jsx`)
Post-registration setup page with:
- **Step 1**: Choice between Create Team or Join Team
- **Step 2a**: Create Team form
- **Step 2b**: Join Team form with invite code input
- Error handling and loading states

### **Updated Pages**

#### **Register.jsx** (Modified)
- Redirects to `/setup` instead of `/`
- Updated info text about admin/member roles

#### **Projects.jsx** (Modified)
- "Create Project" button only visible to admins
- Members see projects but cannot create

#### **Dashboard.jsx** (Modified)
- Added team invite code display for admins
- Copy-to-clipboard functionality
- Team members information panel

### **Updated Routes** (`App.jsx`)
- Added `/setup` route for team setup page
- Protected route that only authenticated users can access

### **Updated Context** (`AuthContext.jsx`)
- Added `updateUser()` function to update user state after team setup
- User data includes `role`, `teamId`, and `hasCompletedSetup`

---

## 🔐 Access Control Rules

### **Backend Enforcement**

```javascript
// Project Access
- User must belong to team (user.teamId === project.teamId)
- User must be project member or creator

// Create Project
- Only users with role === "admin" can create projects

// Task Assignment
- Only project creator (admin) can assign tasks
- Members can only update task status if assigned to them

// Team Operations
- Only admins can view invite code
- Users cannot join multiple teams
```

### **Frontend Enforcement**

```javascript
// Role-Based UI
- "Create Project" button hidden for members
- "Assign Task" field disabled for members
- Invite code visible only to admins on dashboard
```

---

## 📝 User Flows

### **Flow 1: New User - Create Team (Admin)**
```
1. User signs up (Register page)
2. Redirected to Setup page
3. Clicks "Create Team"
4. Enters team name
5. Backend:
   - Sets role = "admin"
   - Creates team with invite code
   - Adds user to team members
   - Sets user.teamId
6. Redirected to Dashboard
7. Admin can create projects, assign tasks, see invite code
```

### **Flow 2: New User - Join Team (Member)**
```
1. User signs up (Register page)
2. Redirected to Setup page
3. Clicks "Join Team"
4. Enters invite code
5. Backend:
   - Validates invite code
   - Sets role = "member"
   - Adds user to team members
   - Sets user.teamId
6. Redirected to Dashboard
7. Member can view projects, update task status
```

### **Flow 3: Existing Team - Admin Invites Member**
```
1. Admin opens Dashboard
2. Sees invite code in "Share Team Access" card
3. Clicks copy button
4. Shares code with new member via any method
5. New member signs up with code
6. Member can access team projects
```

---

## ✅ Validation Rules

### **Team Creation**
- Team name required and not empty
- User cannot belong to multiple teams
- Invite code is unique (6 uppercase alphanumeric)

### **Team Join**
- Invite code must be exactly 6 characters
- Invite code must exist in database
- User cannot already be in a team
- User cannot join same team twice

### **Project Creation**
- Only admins can create
- User must belong to a team
- Project name required
- Members must exist in database

### **Task Assignment**
- Only admins can assign tasks
- Assignee must be project member
- Members can only update status if assigned

---

## 🚀 How to Use

### **For Project Setup (First Time)**

1. **Create Team (First User)**
   - Sign up
   - Choose "Create Team"
   - Enter team name (e.g., "Design Team")
   - You're now admin
   - Dashboard shows invite code

2. **Team Members Join**
   - Sign up separately
   - Choose "Join Team"
   - Enter invite code from admin
   - They're now members

### **Managing Projects**

**As Admin:**
```
1. Go to Projects
2. Click "Create New Project"
3. Add project name and description
4. Add team members to project
5. Create tasks and assign to members
6. Members can update task status
```

**As Member:**
```
1. Go to Projects
2. View assigned projects
3. Click on project to see tasks
4. Update task status when working on it
```

---

## 🔧 Technical Details

### **Code Structure**

```
server/
├── models/
│   ├── Team.js (NEW)
│   ├── User.js (UPDATED)
│   └── Project.js (UPDATED)
├── controllers/
│   ├── authController.js (UPDATED)
│   ├── projectController.js (UPDATED)
│   └── teamController.js (NEW)
├── routes/
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   └── teamRoutes.js (NEW)
└── server.js (UPDATED)

client/
├── pages/
│   ├── ChooseSetup.jsx (NEW)
│   ├── Register.jsx (UPDATED)
│   ├── Projects.jsx (UPDATED)
│   └── Dashboard.jsx (UPDATED)
├── context/
│   └── AuthContext.jsx (UPDATED)
└── App.jsx (UPDATED)
```

### **Key Functions**

**Team Controller:**
- `createTeam()` - Creates team and sets user as admin
- `joinTeam()` - Adds user to existing team as member
- `getTeam()` - Retrieves team details
- `getTeamMembers()` - Gets all team members
- `getInviteCode()` - Returns invite code (admin only)

**Auth Controller:**
- `register()` - Modified to not auto-assign role

**Project Controller:**
- `createProject()` - Modified to check role and teamId
- `getProjects()` - Modified to filter by team
- `assertProjectAccess()` - Modified to check teamId

---

## 🎓 Best Practices

1. **For Admins:**
   - Share invite code securely
   - Assign appropriate members to projects
   - Review team members regularly

2. **For Members:**
   - Only ask for invite code from admins
   - Update task status regularly
   - Request project additions from admin

3. **For Developers:**
   - Always check `req.user.teamId` for team-scoped queries
   - Validate `req.user.role` before admin operations
   - Use `assertProjectAccess()` for project operations

---

## 🐛 Testing Checklist

- [ ] User can sign up
- [ ] New user redirected to setup
- [ ] User can create team with invite code
- [ ] User can join team with code
- [ ] Admin sees invite code on dashboard
- [ ] Member cannot see invite code
- [ ] Admin can create projects
- [ ] Member cannot create projects
- [ ] Member can view team projects
- [ ] Member can update task status
- [ ] Admin can assign tasks
- [ ] Member cannot reassign tasks
- [ ] Projects filtered by team
- [ ] Invalid invite code shows error
- [ ] User cannot join multiple teams

---

## 📚 References

### **Invite Code Format**
- Length: 6 characters
- Characters: A-Z, 0-9 (uppercase)
- Unique per team
- Example: `ABC123`, `DEF456`

### **Role Enum Values**
- `null` - Setup not completed
- `"admin"` - Team owner/admin
- `"member"` - Team member

### **User Journey Timeline**
```
Sign Up → Setup Page → Create/Join Team → Dashboard → Projects/Tasks
```

---

## 🎯 Future Enhancements

Consider implementing:
- Role customization (multiple role types)
- Invite expiration
- Bulk user import
- Activity logging
- Team settings page
- Role change management
- Invite history

---

**Implementation Date:** May 1, 2026
**Status:** Complete ✅
