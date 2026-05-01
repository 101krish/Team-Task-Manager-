# TaskFlow - Team Task Manager

A modern, full-stack task management application built with React, Node.js, Express, and MongoDB. Designed for teams to collaborate on projects and manage tasks efficiently with role-based access control and Kanban-style task boards.

## 🌟 Features

### Authentication & Authorization
- **User Registration & Login** - Secure authentication with JWT tokens
- **Token Persistence** - Login status persists across browser refreshes using localStorage
- **Role-Based Access Control** - Admin and Member roles with different permissions
  - **Admins**: Can create projects, manage team members, create tasks, and delete resources
  - **Members**: Can view projects, create and update tasks within assigned projects
- **Logout Functionality** - Secure session termination available in both Navbar and Sidebar
- **Team Setup Wizard** - New users set up their team (create new team or join existing with invite code)
- **Team Invite Codes** - 6-character unique codes for easy team joining
- **Team Management** - View and manage team members, track team composition

### Project Management
- **Create Projects** (Admin only) - Create new projects with name, description, and add team members
- **View Projects** - All team members can view projects they're part of with complete details
- **Manage Project Members** - Add/remove team members to/from projects by email
- **Project Progress Tracking** - Visual progress bars showing task completion percentage for each project
- **Dynamic Project Stats** - Real-time calculation of total tasks, completed tasks, in-progress tasks, and pending tasks
- **Delete Projects** (Admin only) - Remove projects from the system
- **Project Access Control** - Users can only see and access projects they're members of

### Task Management (Kanban Board)
- **3-Column Kanban Board**
  - **To Do** - New tasks start here by default
  - **In Progress** - Tasks currently being worked on
  - **Done** - Completed tasks
- **Create Tasks** - Add tasks with title, description, due date, and assignee
- **Task Assignment** - Assign tasks to any team member working on the project
- **Update Task Status** - Move tasks between columns with intuitive status buttons
- **Task Details** - Display title, description, due date, and assigned team member information
- **Visual Status Indicators** - Color-coded badges showing task status
- **Team Members Panel** - Quick reference showing all team members on the task board
- **Delete Tasks** - Remove tasks from the board (admin can delete any task)
- **Task Filtering** - Tasks automatically organized by project and status

### Dashboard
- **Task Statistics Dashboard**
  - Total tasks across all projects
  - Pending tasks count
  - Completed tasks count
  - Overdue tasks count
- **Project Overview** - Visual progress bars showing completion status for all projects
- **Overdue Tasks Alert** - Quick view of tasks that need immediate attention
- **Team Workload Distribution** - See member activity and task assignments
- **Team Invite Code** (Admin) - Display and share team invite code for onboarding new members
- **Live Updates** - Real-time data synchronization from API

### UI/UX
- **Responsive Design** - Seamless experience on desktop, tablet, and mobile devices
- **Loading States** - Visual feedback while data is being fetched
- **Error Handling** - Clear and actionable error messages for failed operations
- **Empty States** - Helpful messages and guidance when no data is available
- **Modern Design** - Material Design 3 styling with Tailwind CSS utility-first approach
- **User Profile Dropdown** - Quick access to user information and logout
- **Material Icons** - Comprehensive Material Symbols icon system for intuitive navigation
- **Form Validation Feedback** - Real-time validation with helpful error messages

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **React Router DOM 6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Tailwind CSS** - Utility-first CSS framework
- **Material Symbols** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

### Development Tools
- **Nodemon** - Auto-restart server on file changes
- **Concurrently** - Run multiple npm scripts simultaneously

## 📋 Prerequisites

- **Node.js** v16 or higher
- **npm** v8 or higher
- **MongoDB** v4.4 or higher (local or cloud)
- **Git** (optional, for cloning)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Task-Manager
```

### 2. Install Dependencies
```bash
npm install:all
```
This installs dependencies for both client and server.

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager

# JWT Secret
JWT_SECRET=your_secret_key_here_change_before_production
```

**Note:** For production, use a strong JWT_SECRET and your MongoDB cloud URI.

### 4. Start the Application

#### Development Mode (Both frontend and backend)
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

#### Production Mode
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (first user becomes admin, others are members) |
| POST | `/api/auth/login` | User login with email and password |

### Teams
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/teams/create` | Create a new team | Protected |
| POST | `/api/teams/join` | Join existing team with invite code | Protected |
| GET | `/api/teams` | Get team information | Protected |
| GET | `/api/teams/members` | Get all team members | Protected |
| GET | `/api/teams/invite-code` | Get team's invite code (Admin only) | Protected |

### Projects
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/projects` | Get all projects for user's team | Protected |
| POST | `/api/projects` | Create new project (Admin only) | Protected |
| DELETE | `/api/projects/:id` | Delete project (Admin only) | Protected |
| PUT | `/api/projects/:id/members` | Update project members | Protected |
| POST | `/api/projects/:id/members/add` | Add member to project by email | Protected |
| DELETE | `/api/projects/:id/members/:memberId` | Remove member from project | Protected |

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks/:projectId` | Get all tasks for a project | Protected |
| POST | `/api/tasks` | Create new task | Protected |
| PUT | `/api/tasks/:id` | Update task (status, details, etc) | Protected |
| DELETE | `/api/tasks/:id` | Delete task | Protected |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users in the team | Protected |

## 🔐 Authentication Flow

1. **Register** - Create account (first user becomes admin, others are members)
2. **Login** - Authenticate and receive JWT token
3. **Token Storage** - Token saved to localStorage
4. **Authorization Header** - Token automatically attached to all API requests
5. **Session Persistence** - Token and user data restored on page refresh
6. **Protected Routes** - Unauthenticated users redirected to login

## 👥 User Roles & Permissions

### Admin
- **Team Management**
  - Create new teams
  - View all team members
  - Share invite codes with new members
  - Manage team composition
- **Project Management**
  - Create new projects
  - Delete projects
  - Add/remove project members
  - Assign projects to team members
  - View all project statistics
- **Task Management**
  - Create tasks in any project
  - Update task status and details
  - Assign tasks to team members
  - Delete any task
- **Dashboard Access**
  - View comprehensive team statistics
  - See all projects and tasks
  - Monitor team workload
  - Access invite code management

### Member
- **Team Participation**
  - Join teams using invite code
  - View team members
  - Collaborate with team
- **Project Access**
  - View projects they're assigned to
  - Create tasks in assigned projects
  - Update task status in assigned projects
  - Cannot create or delete projects
  - Cannot add/remove project members
- **Task Management**
  - Create and manage tasks in their projects
  - Update task status
  - See assigned tasks highlighted
- **Dashboard Access**
  - View their own task statistics
  - See assigned projects only
  - Monitor their personal workload
  - Cannot see invite code

## 📊 Database Schema

### User
```javascript
{
  _id: ObjectId,
  name: String (required, unique per team context),
  email: String (required, unique globally),
  password: String (required, minlength 6, hashed with bcryptjs),
  role: String (enum: ["admin", "member"], default: null),
  teamId: ObjectId (ref: Team, default: null),
  hasCompletedSetup: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Team
```javascript
{
  _id: ObjectId,
  name: String (required, team name),
  owner: ObjectId (ref: User, team creator),
  inviteCode: String (required, unique, 6-character uppercase),
  members: [ObjectId] (ref: User, array of team members),
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  _id: ObjectId,
  name: String (required, trim),
  description: String (optional, project details),
  teamId: ObjectId (ref: Team, required),
  members: [ObjectId] (ref: User, project contributors),
  createdBy: ObjectId (ref: User, required, project creator),
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  _id: ObjectId,
  title: String (required, task name),
  description: String (optional, task details),
  status: String (enum: ["todo", "in-progress", "done"], default: "todo"),
  assignedTo: ObjectId (ref: User, required, assigned team member),
  projectId: ObjectId (ref: Project, required),
  dueDate: Date (optional, task deadline),
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Workflow Example

1. **User Registration & Team Setup**
   - New user registers via login page
   - First user automatically becomes team **Admin**
   - Subsequent users become team **Members**
   - New users directed to setup wizard where they can:
     - Create a new team (if admin)
     - Join existing team with 6-character invite code

2. **Create Project** (Admin only)
   - Navigate to Projects page
   - Click "Create New Project" button
   - Fill in project name, description, and select team members
   - Project immediately available to all selected members

3. **Manage Team Members**
   - Admin can view all team members from Dashboard
   - Share invite code with new members for easy onboarding
   - Members appear automatically once they join via invite code

4. **Work on Tasks**
   - Open any project to view its Kanban board
   - Create new tasks with title, description, due date, and assignee
   - View all team members in the Members panel
   - Move tasks between columns (To Do → In Progress → Done) using status buttons
   - Update task details as needed
   - Delete completed or unnecessary tasks

5. **Monitor Progress**
   - Dashboard shows real-time statistics:
     - Total tasks, pending, completed, overdue counts
     - Project completion percentages
     - Team member workload distribution
   - Individual project cards display progress bars
   - Overdue tasks highlighted for quick attention

6. **Team Collaboration**
   - All team members see tasks assigned to them
   - Status updates reflect immediately across all users
   - Project access controlled by membership
   - Admin can add/remove members from projects anytime

## 🔒 Security Features

- **Password Hashing** - bcryptjs for secure password storage
- **JWT Authentication** - Stateless token-based auth
- **Protected Routes** - Client and server-side route protection
- **Email Validation** - Format validation on registration/login
- **CORS** - Cross-origin requests properly configured
- **Token Expiration** - JWT tokens expire after 7 days
- **No Passwords in Response** - Password never returned in API responses

## 🐛 Validation

### Frontend
- Required field validation
- Email format validation
- Password strength requirements (min 6 characters)
- Name length validation (min 2 characters)

### Backend
- Email format validation with regex
- Required field validation for all endpoints
- Task status enum validation
- User existence validation
- Project access validation
- Member validation for projects

## 🌐 Error Handling

- **Network Errors** - User-friendly network failure messages
- **API Errors** - Descriptive error messages from server
- **Authentication Errors** - Clear messaging for auth failures
- **Validation Errors** - Field-specific validation error messages
- **Not Found** - 404 responses for missing resources
- **Unauthorized** - 401 responses for authentication failures

## 📱 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚦 Project Status

### ✅ Completed Features
- Authentication system (register/login/logout) with JWT tokens
- JWT token management with 7-day expiration
- Role-based access control (Admin, Member)
- Team management system with invite codes
- Team setup wizard for new users
- Complete project CRUD operations
- Project member management (add/remove by email)
- Task management with full CRUD operations
- 3-Column Kanban board (To Do, In Progress, Done)
- Task status updates and transitions
- Task assignment to team members
- Dashboard with comprehensive statistics
- Project progress tracking and visualization
- Overdue task detection and alerts
- Team member workload overview
- Form validation (frontend and backend)
- Comprehensive error handling
- Loading and empty states UI
- Responsive design for all screen sizes
- Material Design 3 UI with Tailwind CSS
- User profile dropdown and logout
- Real-time data fetching and display
- Secure password hashing with bcryptjs
- Protected API routes with authentication
- Email validation and sanitization
- Project access control and permissions

### 🔄 Future Enhancements
- Drag-and-drop task reordering
- Advanced task filtering and search
- Task comments and activity history
- Task attachments support
- Push notifications system
- Email notifications for task assignments
- Advanced analytics and reporting
- Dark mode theme
- Task priority levels
- Recurring tasks
- Task time tracking
- Integration with external services
- Mobile app (React Native)
- Task webhooks

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add improvement'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository or contact the development team.

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [JWT Introduction](https://jwt.io/introduction)

---

**Last Updated:** May 1, 2026  
**Version:** 1.0.0  
**Maintained By:** Development Team  
**Status:** Active Development
