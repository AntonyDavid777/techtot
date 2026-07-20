# TechTots LMS - Project Summary

## Overview

TechTots LMS is a comprehensive Learning Management System built with Next.js and Python/Flask, featuring robust student enrollment management, course-teacher assignment, and role-based access control.

## Project Structure

```
techtots-lms/
├── app/                          # Next.js frontend application
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── admin/                    # Admin dashboard routes
│   │   └── courses/page.tsx
│   ├── teach/                    # Teacher dashboard routes
│   │   └── my-courses/page.tsx
│   ├── student/                  # Student dashboard routes
│   │   └── dashboard/page.tsx
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/landing page
│
├── components/                   # Reusable React components
│   ├── dashboard/                # Dashboard components
│   │   ├── admin-courses.tsx
│   │   ├── teacher-my-courses.tsx
│   │   └── student-dashboard.tsx
│   ├── auth/                     # Auth components
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   └── ui/                       # Shared UI components
│
├── lib/                          # Utility functions and API client
│   ├── api-client.ts            # Centralized API client
│   ├── auth.ts                  # Auth utilities
│   └── constants.ts             # Constants
│
├── backend/                      # Python Flask backend
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py          # User model
│   │   │   ├── course.py        # Course model
│   │   │   └── enrollment.py    # Enrollment model
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── courses.py       # Course endpoints (enrollment, assignment)
│   │   │   └── users.py         # User endpoints
│   │   ├── services/
│   │   │   ├── course_service.py # Business logic for courses
│   │   │   └── user_service.py   # Business logic for users
│   │   ├── utils/
│   │   │   ├── auth.py          # Auth decorators and utilities
│   │   │   ├── errors.py        # Custom error classes
│   │   │   └── validation.py    # Input validation
│   │   ├── __init__.py
│   │   └── factory.py           # App factory
│   ├── tests/
│   │   ├── test_academic_module.py  # Comprehensive test suite
│   │   └── conftest.py          # Test configuration
│   └── requirements.txt
│
├── ACADEMIC_MODULE_DOCUMENTATION.md  # Academic module API docs
└── PROJECT_SUMMARY.md                # This file
```

## Key Features Implemented

### 1. Authentication System
- User signup with email and password
- Secure login with JWT tokens
- Three user roles: Student, Teacher, Admin
- Password hashing with bcrypt
- Session management

### 2. Enrollment Management
- **Single Enrollment**: Students can enroll in published courses
- **Bulk Enrollment**: Admins can enroll multiple students at once
- **Duplicate Prevention**: Prevents double enrollment
- **Unenrollment**: Students can leave courses, admins can bulk unenroll
- **Progress Tracking**: Track student progress percentage per course

### 3. Course-Teacher Assignment
- Assign teachers to courses via admin dashboard
- Teachers can view all their assigned courses
- Course status management (draft/published)
- Enrollment count tracking per course

### 4. Role-Based Access Control
- **Admin**: 
  - View all users and courses
  - Assign teachers to courses
  - Manage bulk enrollments
  - Access admin dashboard
  
- **Teacher**: 
  - View own courses
  - See enrolled students
  - View student progress
  - Cannot modify course assignments
  
- **Student**: 
  - Enroll in published courses
  - View enrolled courses
  - Track progress
  - Cannot view other students' data

### 5. Frontend Dashboards

#### Admin Dashboard
- Course listing with search and filters
- Teacher assignment modal
- Bulk student enrollment UI
- Course status management
- Analytics overview

#### Teacher Dashboard
- View assigned courses
- Student management per course
- Students modal with pagination
- Progress tracking
- Course content management

#### Student Dashboard
- Enrolled courses listing
- Progress visualization
- Course details and instructor info
- Quick enrollment for new courses
- Course recommendation

### 6. Backend API

#### Enrollment Endpoints
- `POST /api/v1/courses/{courseId}/enroll` - Single enrollment
- `POST /api/v1/courses/{courseId}/bulk-enroll` - Bulk enrollment
- `POST /api/v1/courses/{courseId}/bulk-unenroll` - Bulk unenrollment
- `DELETE /api/v1/courses/{courseId}/unenroll` - Single unenrollment
- `GET /api/v1/courses/{courseId}/enrolled-students` - List enrolled students
- `GET /api/v1/courses/{courseId}/enrolled-students-details` - Students with user data

#### Course Endpoints
- `GET /api/v1/courses` - List all courses
- `POST /api/v1/courses` - Create course (admin only)
- `PUT /api/v1/courses/{courseId}` - Update course (assign teacher)
- `DELETE /api/v1/courses/{courseId}` - Delete course (admin only)
- `GET /api/v1/courses/teacher/{teacherId}/courses` - Get teacher's courses

#### User Endpoints
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/users/{userId}` - Get user profile
- `GET /api/v1/users/{userId}/courses` - Get user's enrolled courses

## Technical Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: SWR for data fetching
- **HTTP Client**: Axios via api-client
- **Authentication**: JWT tokens

### Backend
- **Framework**: Flask with Python
- **Database**: MongoDB
- **ORM**: PyMongo
- **Authentication**: JWT with PyJWT
- **Password Hashing**: Werkzeug
- **Validation**: Custom validation utilities

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  name: string,
  role: "student" | "teacher" | "admin",
  created_at: datetime,
  updated_at: datetime
}
```

### Courses Collection
```javascript
{
  _id: ObjectId,
  title: string,
  description: string,
  instructor_id: ObjectId,
  category: string,
  level: "beginner" | "intermediate" | "advanced",
  status: "draft" | "published",
  enrollment_count: number,
  created_at: datetime,
  updated_at: datetime
}
```

### Enrollments Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  course_id: ObjectId,
  progress_percentage: number (0-100),
  enrolled_at: datetime,
  updated_at: datetime
}
```

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    "key": "value"
  },
  "status": 200
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "status": 400,
  "data": {}
}
```

## Testing

A comprehensive test suite is included covering:
- Single student enrollment
- Duplicate enrollment prevention
- Bulk enrollment with partial failures
- Unenrollment operations
- Course-teacher assignment
- Role-based access control
- Error handling

Run tests with:
```bash
pytest backend/tests/test_academic_module.py -v
```

## Security Features

1. **Authentication**: JWT-based authentication with secure token generation
2. **Authorization**: Role-based access control on all endpoints
3. **Input Validation**: All inputs validated before processing
4. **Password Security**: Bcrypt hashing with salt
5. **SQL Injection Prevention**: Parameterized queries via PyMongo
6. **CORS**: Configured for frontend-backend communication
7. **Error Messages**: Generic error messages to prevent information leakage

## Performance Considerations

1. **Pagination**: All list endpoints support pagination (page, page_size)
2. **Bulk Operations**: Optimized for handling multiple records
3. **Database Indexing**: Indexes on common query fields
4. **Caching**: SWR for intelligent client-side caching
5. **Lazy Loading**: Components load data on demand

## ID Handling Convention

- **Storage**: MongoDB ObjectId for database storage
- **API Response**: Converted to strings for JSON
- **API Request**: Accepted as strings, converted to ObjectId for queries
- **Frontend**: Always uses string IDs

This ensures compatibility across the stack and avoids JSON serialization issues.

## Error Handling

The application implements comprehensive error handling:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing/invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate enrollment or conflicting operation
- `500 Internal Server Error`: Server-side errors

## Development Workflow

1. **Frontend Development**: Edit files in `app/` and `components/`
2. **Backend Development**: Edit files in `backend/app/`
3. **Testing**: Run pytest for backend tests
4. **API Testing**: Use Postman or curl for API endpoints
5. **Git Workflow**: Create feature branches, commit changes, create PRs

## Deployment

The application is deployed on Vercel for the frontend and can be deployed to various platforms for the backend:
- Frontend: Vercel
- Backend: Heroku, AWS, Railway, or similar

## Future Enhancements

1. Lessons and quiz management
2. Real-time notifications
3. Video streaming integration
4. Certificate generation
5. Advanced analytics and reporting
6. Social features (comments, forums)
7. Payment integration for premium courses
8. Mobile app support
9. Offline learning capabilities
10. AI-powered recommendations

## Documentation

- **API Documentation**: See `ACADEMIC_MODULE_DOCUMENTATION.md` for complete API reference
- **Component Documentation**: Each component includes JSDoc comments
- **Testing Documentation**: See test files for usage examples

## Contributing

When contributing to this project:
1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow the coding standards
5. Create descriptive commit messages

## License

[Your License Here]

## Contact

For questions or support, please contact the TechTots team.

---

**Last Updated**: July 20, 2026
**Version**: 1.0.0
**Status**: Complete
