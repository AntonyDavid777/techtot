# Academic Management Module Documentation

## Overview
The Academic Management Module provides comprehensive functionality for managing student enrollments, course-teacher assignments, and academic relationships in the TechTots LMS system.

## Architecture

### Key Components
1. **Enrollment Management**: Handle student-course relationships
2. **Course-Teacher Assignment**: Assign and manage teachers for courses
3. **Role-Based Access Control**: Enforce permissions by user role
4. **Bulk Operations**: Efficiently manage multiple enrollments

### Database Models
- **User**: Stores student, teacher, and admin profiles with roles
- **Course**: Manages course metadata and instructor information
- **Enrollment**: Tracks student enrollment status and progress
- **Lesson**: Organizes course content into lessons

## API Endpoints

### Enrollment Endpoints

#### Single Enrollment
```
POST /api/v1/courses/{courseId}/enroll
Authorization: Bearer {token}
Content-Type: application/json

Response:
{
  "success": true,
  "data": {
    "enrollment": {
      "_id": "...",
      "user_id": "...",
      "course_id": "...",
      "progress_percentage": 0,
      "enrolled_at": "2024-01-15T10:00:00"
    }
  }
}
```

#### Bulk Enrollment
```
POST /api/v1/courses/{courseId}/bulk-enroll
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "user_ids": ["userId1", "userId2", "userId3"]
}

Response:
{
  "success": true,
  "data": {
    "enrollments": [...],
    "errors": ["User X already enrolled"],
    "successful": 2,
    "failed": 1
  }
}
```

#### Bulk Unenrollment
```
POST /api/v1/courses/{courseId}/bulk-unenroll
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "user_ids": ["userId1", "userId2"]
}

Response:
{
  "success": true,
  "data": {
    "unenrolled_count": 2
  }
}
```

#### Unenroll from Course
```
DELETE /api/v1/courses/{courseId}/unenroll
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Successfully unenrolled from course"
}
```

### Course-Teacher Management

#### Get Teacher's Courses
```
GET /api/v1/courses/teacher/{teacherId}/courses?page=1&page_size=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [{
    "_id": "...",
    "title": "Course Title",
    "description": "...",
    "instructor_id": "teacherId",
    "level": "beginner",
    "status": "published",
    "enrollment_count": 25
  }],
  "pagination": {
    "total": 5,
    "page": 1,
    "page_size": 10
  }
}
```

#### Assign Teacher to Course (Update Course)
```
PUT /api/v1/courses/{courseId}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "instructor_id": "newTeacherId"
}

Response:
{
  "success": true,
  "data": {
    "course": { ... }
  }
}
```

### Student Management

#### Get Enrolled Students
```
GET /api/v1/courses/{courseId}/enrolled-students?page=1&page_size=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [{
    "_id": "...",
    "user_id": "...",
    "course_id": "...",
    "progress_percentage": 45,
    "enrolled_at": "2024-01-15T10:00:00"
  }],
  "pagination": {
    "total": 30,
    "page": 1,
    "page_size": 10
  }
}
```

#### Get Enrolled Students with Details
```
GET /api/v1/courses/{courseId}/enrolled-students-details?page=1&page_size=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [{
    "enrollment": { ... },
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }],
  "pagination": {
    "total": 30,
    "page": 1,
    "page_size": 10
  }
}
```

#### Get User's Courses
```
GET /api/v1/users/{userId}/courses
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [{
    "enrollment_id": "...",
    "course_id": "...",
    "progress_percentage": 50,
    "enrolled_at": "2024-01-15T10:00:00"
  }],
  "total": 5
}
```

## Access Control Rules

### Admin
- Can view all users and courses
- Can assign teachers to courses
- Can bulk enroll/unenroll students
- Can access all dashboards

### Teacher
- Can view their own courses
- Can see enrolled students in their courses
- Can view student progress
- Cannot assign themselves to courses (admin only)

### Student
- Can enroll in published courses
- Can unenroll from courses
- Can view their enrolled courses
- Can see course instructor details
- Cannot view other students' information

## Frontend Components

### Admin Dashboard - Courses Page
- List all courses with filtering
- Assign teachers to courses via modal
- View course details and status
- Manage bulk student enrollment

### Teacher Dashboard - My Courses
- View all courses they teach
- See enrolled students per course
- View student progress and engagement
- Manage course lessons and content

### Student Dashboard
- View enrolled courses
- Track progress per course
- See instructor information
- Quick actions to explore more courses

## Data Flow

### Enrollment Flow
1. Student clicks "Enroll" on course page
2. Frontend calls `POST /api/v1/courses/{courseId}/enroll`
3. Backend verifies course is published
4. Backend checks for duplicate enrollment
5. Creates enrollment record
6. Increments course enrollment count
7. Returns enrollment confirmation

### Bulk Enrollment Flow
1. Admin/Teacher selects multiple students
2. Clicks "Bulk Enroll" button
3. Frontend calls `POST /api/v1/courses/{courseId}/bulk-enroll`
4. Backend processes each student
5. Returns results with successes and failures
6. UI updates to show enrollment status

### Teacher Assignment Flow
1. Admin clicks "Assign Teacher" on course card
2. Modal displays available teachers
3. Admin selects teacher
4. Frontend calls `PUT /api/v1/courses/{courseId}` with new instructor_id
5. Backend updates course
6. Frontend refreshes course list

## ID Handling Convention

- **Storage**: IDs are stored as MongoDB ObjectId in database
- **API Response**: IDs are converted to strings for JSON responses
- **API Request**: IDs in requests come as strings
- **Queries**: String IDs are converted back to ObjectId for database queries

This ensures consistency and avoids JSON serialization issues with ObjectId.

## Error Handling

### Common HTTP Status Codes
- `200 OK`: Successful GET/PUT operation
- `201 Created`: Successful POST operation (resource created)
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks permission for operation
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Duplicate enrollment or conflicting operation

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "status": 400,
  "data": {}
}
```

## Testing

Run the comprehensive test suite:
```bash
pytest backend/tests/test_academic_module.py -v
```

### Test Coverage
- Single student enrollment
- Duplicate enrollment prevention
- Bulk enrollment with partial failures
- Student unenrollment
- Course-teacher assignment
- Role-based access control
- Enrollment-course relationships

## Performance Considerations

1. **Pagination**: All list endpoints support pagination to handle large datasets
2. **Bulk Operations**: Bulk enroll/unenroll operations are optimized for performance
3. **Indexing**: Ensure database has indexes on:
   - `courses.instructor_id`
   - `enrollments.user_id`
   - `enrollments.course_id`
   - `users.role`

## Security

1. All endpoints require authentication except health check
2. Role-based authorization on sensitive operations
3. Course visibility rules enforce draft course access
4. User can only view/modify their own data (except admin)
5. Input validation on all endpoints
6. Parameterized queries prevent SQL injection

## Future Enhancements

1. Batch operations via CSV upload
2. Enrollment notifications
3. Automatic progress tracking
4. Prerequisite course requirements
5. Enrollment approval workflows
6. Student engagement analytics
