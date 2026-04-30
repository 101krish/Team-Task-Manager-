# TaskFlow - Team Task Manager

A modern, full-stack task management application built with React, Node.js, Express, and MongoDB. Designed for teams to collaborate on projects and manage tasks efficiently with role-based access control and Kanban-style task boards.

## 🌟 Features

### Authentication & Authorization
- **User Registration & Login** - Secure authentication with JWT tokens
- **Token Persistence** - Login status persists across browser refreshes using localStorage
- **Role-Based Access Control** - Admin and Member roles with different permissions
- **Logout Functionality** - Secure session termination available in both Navbar and Sidebar

### Project Management
- **Create Projects** (Admin only) - Create new projects with description and team members
- **View Projects** - All team members can view projects they're part of
- **Project Members** - Add/remove team members to/from projects
- **Project Progress** - Visual progress bars showing task completion percentage
- **Dynamic Project Stats** - Total tasks and completion metrics calculated in real-time

### Task Management (Kanban Board)
- **3-Column Kanban Board**
  - **To Do** - New tasks start here
  - **In Progress** - Tasks currently being worked on
  - **Done** - Completed tasks
- **Create Tasks** - Add tasks with title, description, due date, and assignee
- **Update Task Status** - Move tasks between columns with status buttons
- **Assign Tasks** - Assign tasks to any project member
- **Task Details** - Title, description, due date, and assignee information
- **Visual Status Indicators** - Color-coded badges showing task status

### Dashboard
- **Task Statistics**
  - Total tasks across all projects
  - Completed tasks count
  - Pending tasks count
  - Overdue tasks count
- **Project Completion** - Visual progress bars for all projects
- **Overdue Tasks List** - Quick view of tasks that need attention
- **Team Workload** - Member activity overview
- **Live Updates** - Real-time data fetched from API

### UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Loading States** - Visual feedback while data is being fetched
- **Error Handling** - Clear error messages for failed operations
- **Empty States** - Helpful messages when no data is available
- **Modern Design** - Material Design 3 styling with Tailwind CSS
- **User Profile Dropdown** - Quick access to user info and logout from Navbar
- **Material Icons** - Comprehensive icon system for better visual communication

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
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |

### Projects
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/projects` | Get all projects | Protected |
| POST | `/api/projects` | Create project | Admin only |
| PUT | `/api/projects/:id/members` | Update project members | Admin only |

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks/:projectId` | Get tasks by project | Protected |
| POST | `/api/tasks` | Create task | Protected |
| PUT | `/api/tasks/:id` | Update task | Protected |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users | Protected |

## 🔐 Authentication Flow

1. **Register** - Create account (first user becomes admin, others are members)
2. **Login** - Authenticate and receive JWT token
3. **Token Storage** - Token saved to localStorage
4. **Authorization Header** - Token automatically attached to all API requests
5. **Session Persistence** - Token and user data restored on page refresh
6. **Protected Routes** - Unauthenticated users redirected to login

## 👥 User Roles

### Admin
- Create projects
- Manage project members (add/remove)
- View all projects
- Create tasks
- Update task status
- Full dashboard access

### Member
- View assigned/team projects
- Create tasks (only in projects they're in)
- Update task status
- Limited dashboard (own projects)
- Cannot create or delete projects

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ["admin", "member"]),
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  name: String,
  description: String,
  members: [ObjectId],
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  title: String,
  description: String,
  status: String (enum: ["todo", "in-progress", "done"]),
  assignedTo: ObjectId (ref: User),
  projectId: ObjectId (ref: Project),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Workflow Example

1. **Create Account**
   - First user registered becomes admin
   - Subsequent users are members
   - Both can register and login

2. **Create Project** (Admin only)
   - Navigate to Projects page
   - Click "Create New Project"
   - Add project name, description, and members
   - Members receive access to the project

3. **Manage Tasks**
   - Open project from Projects page
   - View Kanban board with 3 columns
   - Create task using inline modal
   - Move tasks between columns by clicking status buttons
   - Assign tasks to team members

4. **Monitor Dashboard**
   - View overall team statistics
   - Track project completion
   - Identify overdue tasks
   - See team workload distribution

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

### ✅ Completed
- Authentication system (register/login/logout)
- JWT token management
- Role-based access control
- Project CRUD operations
- Task management with Kanban board
- Task status updates
- Dashboard with statistics
- Form validation
- Error handling
- Loading/empty states
- Responsive design

### 🔄 Future Enhancements
- Drag-and-drop task reordering
- Task filtering and search
- Task comments and attachments
- Notifications system
- Email notifications
- Advanced reporting
- Dark mode
- Team collaboration features

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

**Last Updated:** April 2026  
**Version:** 1.0.0  
**Maintained By:** Development Team
