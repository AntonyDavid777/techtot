# Academic Management Module - Integration & Testing Guide

## Overview
The Academic Management Module provides comprehensive tools for managing teacher assignments, student enrollments, and course-academic relationships in the TechTots LMS.

## Components

### Backend APIs (courses.py)
All endpoints require authentication. Admin users have full access; teachers can only access their own courses.

#### Teacher Assignment Endpoints
- **POST** `/courses/academic/teacher-assignment/<course_id>` - Assign a teacher to a course (admin only)
  - Body: `{ "teacher_id": "string" }`
  - Response: Updated course object

- **POST** `/courses/academic/remove-teacher/<course_id>` - Remove teacher from course (admin only)
  - Response: Updated course object

#### Enrollment Endpoints
- **POST** `/courses/academic/enrollment/<course_id>` - Enroll a single student
  - Body: `{ "student_id": "string" }`
  - Response: Enrollment object

- **POST** `/courses/academic/unenrollment/<course_id>` - Unenroll a student
  - Body: `{ "student_id": "string" }`
  - Response: Success message

#### Query Endpoints
- **GET** `/courses/academic/students/<course_id>?page=1&page_size=10` - Get enrolled students with details (teacher/admin only)
  - Response: Paginated list of student objects

- **GET** `/courses/academic/teacher-courses/<teacher_id>?page=1&page_size=10` - Get all courses taught by a teacher
  - Response: Paginated list of course objects

### Frontend Components

#### TeacherSelector
**Location:** `app/components/TeacherSelector.tsx`

Reusable dropdown component for selecting teachers. Features:
- Loads all teachers on mount
- Shows teacher name and email
- Error handling and loading states
- Optional disabled state

```tsx
import TeacherSelector from '@/app/components/TeacherSelector'

<TeacherSelector
  onTeacherSelect={(teacherId, teacher) => {
    // Handle selection
  }}
  selectedTeacherId={selected}
  placeholder="Choose a teacher..."
/>
```

#### StudentMultiSelect
**Location:** `app/components/StudentMultiSelect.tsx`

Checkbox-based multi-select component for students. Features:
- Search by name or email
- Select all functionality
- Exclude specific students
- Shows selection count
- Scrollable list with max height

```tsx
import StudentMultiSelect from '@/app/components/StudentMultiSelect'

<StudentMultiSelect
  onStudentsSelect={(ids) => {
    // Handle selection
  }}
  selectedStudentIds={selected}
  excludeStudentIds={alreadyEnrolled}
  maxHeight="400px"
/>
```

### Admin Pages

#### Academic Overview
**URL:** `/admin/academic/overview`

Displays system-wide academic statistics:
- Total courses count
- Total teachers count
- Average students per course
- Teacher utilization percentage
- List of courses without assigned teachers
- Teacher course distribution

**Features:**
- Real-time statistics calculation
- Identifies staffing gaps
- Shows teacher workload distribution

#### Teacher Assignment
**URL:** `/admin/academic/teacher-assignment`

Manage teacher-course relationships:
- Search courses by title
- View current teacher assignments
- Assign/reassign teachers
- Remove teacher assignments
- Pagination support

**Features:**
- Bulk operations ready (extendable)
- Teacher availability check
- Course status visibility
- Quick assignment modal

#### Student Enrollment
**URL:** `/admin/academic/enrollment`

Manage student-course enrollments:
- Select course first
- Multi-select students for bulk enrollment
- See enrollment status
- Remove individual enrollments

**Features:**
- Prevents duplicate enrollments
- Shows already-enrolled students
- Select all / deselect functionality
- Bulk enrollment support

### Teacher Dashboard
**URL:** `/dashboard/teacher`

Teacher-specific dashboard showing:
- Total assigned courses
- Total student count across courses
- Active (published) course count
- List of assigned courses with:
  - Course title and description
  - Course level (beginner/intermediate/advanced)
  - Current enrollment count
  - Status badge
  - Quick link to view course

**Security:** Teachers can only see their own courses

### Student Dashboard
**URL:** `/dashboard/student`

Student-specific dashboard showing:
- Enrolled courses count
- Completed courses count (placeholder)
- Overall progress percentage (placeholder)
- Enrolled courses with:
  - Course details
  - Progress bar
  - Continue button
- Available courses (up to 5 shown)
- Link to view all courses

**Security:** Students can only see courses they're enrolled in

## API Client Methods

Added methods in `lib/api-client.ts`:

```typescript
// Enrollment operations
async enrollStudent(courseId: string, studentId: string)
async unenrollStudent(courseId: string, studentId: string)

// Query operations
async getCourseStudents(courseId: string, page?: number, pageSize?: number)
async getCourseEnrolledStudents(courseId: string, page?: number, pageSize?: number)
async getTeacherCourses(teacherId: string, page?: number, pageSize?: number)
async getStudentCourses(studentId: string)

// Teacher assignment
async assignTeacher(courseId: string, teacherId: string)
async removeTeacher(courseId: string)
```

## Admin Sidebar Navigation

Added new "Academic Management" section in `/admin/layout.tsx`:
- Overview - System-wide statistics
- Teacher Assignment - Manage teacher-course relationships
- Student Enrollment - Manage student-course enrollments

## Security & Access Control

### Role-Based Access
- **Admin:** Full access to all academic management features
- **Teacher:** Can see own courses, manage own student enrollments
- **Student:** Can see enrolled courses only

### Authorization Checks
All API endpoints verify:
1. User authentication (required)
2. User role (admin/teacher for writes, student for reads of own data)
3. Ownership (teachers can only manage their courses, students their enrollments)

## Testing Checklist

### Backend API Tests
- [ ] Assign teacher to course (success & error cases)
- [ ] Remove teacher from course
- [ ] Enroll student (prevent duplicates)
- [ ] Unenroll student
- [ ] Get course students (pagination)
- [ ] Get teacher courses (pagination)
- [ ] Authorization checks (admin, teacher, student)

### Frontend Component Tests
- [ ] TeacherSelector loads teachers correctly
- [ ] StudentMultiSelect selection works
- [ ] Search functionality filters students
- [ ] Select all/deselect all works

### Admin Page Tests
- [ ] Academic Overview loads and displays stats
- [ ] Teacher Assignment page shows courses
- [ ] Can assign/remove teachers
- [ ] Student Enrollment page works
- [ ] Bulk enrollment functionality
- [ ] Pagination works on all list pages

### Dashboard Tests
- [ ] Teacher dashboard shows assigned courses
- [ ] Student dashboard shows enrolled courses
- [ ] Stats calculations are accurate
- [ ] Navigation links work correctly
- [ ] Role-based access control enforced

## Future Enhancements

1. **Bulk Operations:** Implement bulk assign/remove teachers
2. **Enrollment Analytics:** Detailed enrollment tracking per student
3. **Teacher Load Balancing:** Suggest optimal course distributions
4. **Progress Tracking:** Student progress within each course
5. **Attendance:** Track student participation and attendance
6. **Grading:** Integrate course grading system
7. **Notifications:** Email alerts for enrollments and assignments
8. **Reports:** Generate enrollment and performance reports

## Troubleshooting

### Common Issues

**"Courses Without Teachers" section always shows courses**
- Verify `instructor_id` field is being set correctly in database
- Check that teacher IDs are properly stored as ObjectId or string

**Student multi-select not showing students**
- Verify students exist in database with role='student'
- Check API client method `listUsers` is working
- Look for errors in browser console

**Teacher dashboard shows 0 students**
- Verify enrollments collection has correct `user_id` and `course_id` references
- Check enrolled_count is being calculated correctly

## Integration Workflow

1. **Admin Creates/Imports Courses** (via Courses Management)
2. **Admin Assigns Teachers** (via Academic Overview → Teacher Assignment)
3. **Teachers View Assigned Courses** (via Teacher Dashboard)
4. **Admin Enrolls Students** (via Student Enrollment or course page)
5. **Students View Enrolled Courses** (via Student Dashboard)
6. **Teachers Manage Student Enrollment** (via Course Details)

## Example Usage Scenarios

### Scenario 1: Setting up a new course
1. Admin creates course (draft status)
2. Admin assigns teacher via Academic Overview
3. Teacher reviews course and publishes
4. Admin enrolls students in bulk
5. Students see course on dashboard

### Scenario 2: Moving students between courses
1. Admin unenrolls from Course A
2. Admin enrolls same student in Course B
3. Student dashboards update automatically
4. Teacher enrollment lists update in real-time

### Scenario 3: Reassigning teacher
1. Admin goes to Academic Overview
2. Clicks "Assign" on course without teacher
3. Selects new teacher from dropdown
4. Course now shows under teacher's dashboard
