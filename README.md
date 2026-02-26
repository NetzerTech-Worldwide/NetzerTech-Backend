# NetzerTech EdTech Platform

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A comprehensive educational technology platform built with NestJS, featuring multi-role authentication, role-based dashboards, and secure API endpoints.

## ✨ Features

- **Multi-Role Authentication**: 5 user types (Secondary Student, University Student, Parent, Teacher, Admin)
- **JWT Authentication**: Stateless authentication with token blacklisting for secure logout
- **Role-Based Dashboards**: Customized dashboards for each user role
- **Database Integration**: PostgreSQL with TypeORM, supports connection strings and individual parameters
- **API Documentation**: Swagger/OpenAPI at `/api`
- **Performance**: In-memory caching, optimized database queries
- **Security**: Bcrypt password hashing, CORS configuration, SSL support

## 📋 Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+) OR Supabase account
- npm or yarn

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd NetzerTech-server
   npm install
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```env
   # Option 1: Connection string (Recommended)
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   
   # Option 2: Individual parameters
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=netzertech
   
   # Required
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   PORT=3000
   
   # CORS Configuration (comma-separated list of allowed origins)
   # For production, set this to your frontend URL(s)
   # Example: CORS_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
   ```

3. **Setup database**
   - Local: `CREATE DATABASE netzertech;`
   - Supabase: Use connection string from Dashboard → Settings → Database

4. **Seed database**
   ```bash
   npm run seed
   ```

5. **Run application**
   ```bash
   npm run start:dev
   ```

## 📡 API Documentation

**Swagger UI**: https://netzertech-api.onrender.com/api-docs


## 🔑 Authentication

| Role | Endpoint | Credentials |
|------|----------|-------------|
| Secondary Student | `POST /auth/login/secondary-student` | Student ID, Full Name,Password |
| University Student | `POST /auth/login/university-student` | Matric Number, Password |
| Parent | `POST /auth/login/parent` | Email, Student ID, Password |
| Teacher | `POST /auth/login/teacher` | Staff ID, Password |
| Admin | `POST /auth/login/admin` | Email, Password |

**Logout**: `POST /auth/logout` (requires Bearer token)

**Change Password**: `POST /auth/change-password` (requires Bearer token)
- Required on first login for all users
- Users must change their password before accessing other endpoints

## 📊 Dashboard Endpoints

| Endpoint | Role | Description |
|----------|------|-------------|
| `GET /dashboard/secondary-student` | Secondary Student | Student dashboard with classes, assignments, tests |
| `GET /dashboard/university-student` | University Student | University dashboard with CGPA and semester results |
| `GET /dashboard/teacher` | Teacher | Teacher dashboard with classes, students, activities |
| `GET /dashboard/parent` | Parent | Parent dashboard with child's attendance and fees |

All dashboard endpoints require JWT authentication.

## Login Credentials
```bash
ADMIN:
  Email: admin@netzertech.com
  Password: admin123

TEACHER:
  Staff ID: TCH001
  Password: teacher123

PARENT:
  Email: parent@example.com
  Password: parent123
  Student ID (for login): STU001

SECONDARY STUDENT:
  Student ID: STU001
  Full Name: Alice Student
  Password: student123

UNIVERSITY STUDENT:
  Matric Number: MAT001
  Password: university123
```

## 🔧 Available Scripts

```bash
npm run start:dev      # Development mode with hot reload
npm run build          # Build for production
npm run start:prod     # Production mode
npm run lint           # Run ESLint
npm run test           # Run tests
npm run seed           # Seed database
```

## 🚀 Deployment

When deploying to Render or other platforms, make sure to set the following environment variables:

1. **Required Environment Variables:**
   - `DATABASE_URL` or database connection parameters
   - `JWT_SECRET` - A secure random string for JWT token signing
   - `NODE_ENV=production`
   - `PORT` - Usually set automatically by Render

2. **CORS Configuration:**
   - Set `CORS_ORIGINS` to your frontend URL(s), comma-separated
   - Example: `CORS_ORIGINS=https://your-frontend.onrender.com,https://www.your-frontend.com`
   - **Important**: If `CORS_ORIGINS` is not set in production, the API will allow all origins with a warning (not recommended for security)


**Note**: After setting `CORS_ORIGINS`, redeploy your service for the changes to take effect.

## 🔒 Security

- JWT token blacklisting on logout
- Bcrypt password hashing
- Role-based access control (RBAC)
- CORS with environment-based origins
- SSL/TLS support for database connections
- **Rate limiting**: 10 requests per minute per IP address. If exceeded, users are blocked for 30 minutes
- **Password change enforcement**: All users must change password on first login

## ⚡ Performance

- In-memory caching (5-minute TTL)
- Optimized database queries (no N+1 problems)
- Connection pooling support
- Efficient data aggregations


## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Swagger/OpenAPI](https://swagger.io)

## 📄 License
MIT License

---
