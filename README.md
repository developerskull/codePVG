# CollegeCodeHub

A comprehensive coding platform designed specifically for computer science students, featuring real-time code execution, competitive programming, and collaborative learning.

## 🚀 Features

### Core Platform
- **Real-time Code Execution**: Integrated Judge0 for instant code testing
- **Multi-language Support**: Python, Java, C++, and C
- **Problem Management**: 1000+ curated problems with varying difficulty levels
- **User Management**: Student, Admin, and Super-Admin roles
- **Leaderboards**: Global and department-level rankings
- **Progress Tracking**: Detailed analytics and performance metrics

### Student Features
- **Dashboard**: Personal progress tracking and goal setting
- **Problem Solving**: Interactive coding environment with Monaco Editor
- **Submission History**: Track all submissions with detailed feedback
- **Achievements**: Badge system for milestones and accomplishments
- **Peer Learning**: Collaborative problem-solving features

### Admin Features
- **Student Management**: Account approval and user administration
- **Problem Management**: Create, edit, and manage coding problems
- **Analytics**: Comprehensive reporting and progress monitoring
- **Bulk Operations**: Mass problem assignment and user management

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Code Editor**: Monaco Editor
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT-based with role-based access control
- **Code Execution**: Judge0 self-hosted instance
- **Queue System**: BullMQ for asynchronous processing
- **Caching**: Redis for leaderboards and performance

### Infrastructure
- **Database**: PostgreSQL with optimized indexes
- **Cache**: Redis for session management and caching
- **Code Execution**: Dockerized Judge0 instance
- **Security**: Helmet, CORS, rate limiting, input validation

## 📁 Project Structure

```
collegecodehub/
├── frontend/                 # Next.js 15 frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 13+
- Redis 6+
- Docker (for Judge0)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your database and Redis credentials
   ```

4. **Set up PostgreSQL database**:
   ```bash
   # Create database
   createdb collegecodehub
   ```

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.local.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### Judge0 Setup (Code Execution)

1. **Start Judge0 with Docker**:
   ```bash
   docker run -p 2358:2358 -d judge0/judge0:1.13.0
   ```

2. **Verify Judge0 is running**:
   ```bash
   curl http://localhost:2358/health
   ```

## 🔧 Configuration

### Database Schema
The application uses PostgreSQL with the following main tables:
- `users`: User accounts with role-based access
- `problems`: Coding problems with test cases
- `submissions`: Code submissions and results
- `leaderboard`: Rankings and statistics
- `badges`: Achievement system

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=collegecodehub
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Judge0
JUDGE0_API_URL=http://localhost:2358
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🎯 User Roles

### Student
- Solve coding problems
- Track personal progress
- Participate in leaderboards
- Earn achievements and badges

### Admin
- Manage student accounts
- Create and assign problems
- Monitor student progress
- Generate reports

### Super Admin
- Full system access
- Manage other admins
- System configuration
- Advanced analytics

## 🔒 Security Features

- **Authentication**: JWT-based with secure token handling
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive validation using Zod
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization and validation

## 📊 Performance Optimizations

### Frontend
- **Code Splitting**: Dynamic imports for better loading
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: Strategic use of React.memo and useMemo
- **Bundle Analysis**: Regular bundle size monitoring

### Backend
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Redis Caching**: Leaderboard and session caching
- **Queue Processing**: Asynchronous code execution

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Configure PostgreSQL and Redis add-ons
4. Deploy with automatic builds

### Judge0 (Self-hosted)
1. Deploy Judge0 on a VPS or cloud instance
2. Configure network access
3. Update backend environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Judge0**: For providing the code execution engine
- **Next.js Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **shadcn/ui**: For the beautiful component library
- **Monaco Editor**: For the code editor integration

## 📞 Support

For support, email support@collegecodehub.com or join our Discord community.

---

**Built with ❤️ for computer science students**
