from flask import Blueprint, request, g, current_app
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.auth import require_auth, require_role, get_current_user
from app.services.course_service import CourseService
from app.models.user import UserRole
from app.utils.errors import ValidationError, NotFoundError, ConflictError
from bson import ObjectId
import logging
from flask import request
import json
from datetime import datetime

logger = logging.getLogger(__name__)

bp = Blueprint('courses', __name__, url_prefix='/courses')


@bp.route('', methods=['GET'])
def list_courses():
    """List all published courses with optional filters"""
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        category = request.args.get('category')
        level = request.args.get('level')
        search = request.args.get('search')
        instructor_id = request.args.get('instructor_id')
        
        # Validate pagination
        if page < 1:
            return error_response('Page must be >= 1', 400)
        if page_size < 1 or page_size > current_app.config['MAX_PAGE_SIZE']:
            return error_response(f'Page size must be between 1 and {current_app.config["MAX_PAGE_SIZE"]}', 400)
        
        service = CourseService(current_app.db)
        
        # If filtering by instructor, only get that instructor's courses
        if instructor_id:
            courses, total = service.get_courses_by_instructor(instructor_id, page, page_size)
        else:
            filters = {}
            if category:
                filters['category'] = category
            if level:
                filters['level'] = level
            if search:
                filters['search'] = search
            
            # Non-authenticated users can only see published courses
            status = 'published' if not get_current_user() else None
            
            courses, total = service.list_courses(page, page_size, filters, status)
        
        courses_data = []
        for course in courses:
            data = course.to_dict(include_lesson_ids=True)
            if "_id" in data:
                data["_id"] = str(data["_id"])
            if "instructor_id" in data:
                data["instructor_id"] = str(data["instructor_id"])
            if "lesson_ids" in data:
                data["lesson_ids"] = [str(lesson_id) for lesson_id in data["lesson_ids"]]
            courses_data.append(data)
        
        return paginated_response(courses_data, total, page, page_size, 'Courses retrieved successfully')
    
    
    except Exception as e:
        logger.exception("Error in list_courses")
        return error_response(str(e), 500)


@bp.route('/<course_id>', methods=['GET'])
@require_auth
def get_course(course_id):
    """Get course details"""
    try:
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id, include_lessons=True)
        
        # Check if user has access to see this course
        user_id = get_current_user()
        user_data = g.user_data if hasattr(g, 'user_data') else {}
        user_role = user_data.get('role')
        
        # Draft courses are only visible to their instructor and admins
        if course.status == 'draft':
            # Check if current user is the instructor
            if user_id and user_id == str(course.instructor_id):
                pass  # Allow access
            # Check if current user is an admin
            elif user_role == UserRole.ADMIN.value:
                pass  # Allow access
            else:
                # Not authorized to view this draft course
                return error_response('This course is not available', 404)
        
        course_data = course.to_dict(include_lesson_ids=True)
        response_data = dict(course_data)

        response_data["_id"] = str(response_data["_id"])
        response_data["instructor_id"] = str(response_data["instructor_id"])

        if "lesson_ids" in response_data:
            response_data["lesson_ids"] = [
                str(x) for x in response_data["lesson_ids"]
            ]
        return success_response(
            data=response_data,
            message="Course retrieved successfully"
        )
    
    except (NotFoundError, ValueError) as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('', methods=['POST'])
@require_role(UserRole.TEACHER.value, UserRole.ADMIN.value)
def create_course():
    """Create a new course"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['title', 'description']):
            return error_response('Missing required fields: title, description', 400)
        
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        category = data.get('category', '').strip()
        level = data.get('level', 'beginner')
        
        if len(title) < 3:
            return error_response('Title must be at least 3 characters', 400)
        if len(description) < 10:
            return error_response('Description must be at least 10 characters', 400)
        
        service = CourseService(current_app.db)
        course = service.create_course(
            title=title,
            description=description,
            instructor_id=get_current_user(),
            category=category,
            level=level,
            thumbnail_url=data.get('thumbnail_url', ''),
        )
        
        return success_response({'message': 'created'}, 'Course created successfully', 201)
    
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>', methods=['PUT'])
@require_auth
def update_course(course_id):
    """Update course information"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', 400)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to update this course', 403)
        
        updated_course = service.update_course(course_id, **data)
        
        course_response = updated_course.to_dict()

        course_response["_id"] = str(course_response["_id"])
        course_response["instructor_id"] = str(course_response["instructor_id"])

        if "lesson_ids" in course_response:
            course_response["lesson_ids"] = [
            str(x) for x in course_response["lesson_ids"]
         ]

        return success_response(
            {"course": course_response},
            "Course updated successfully"
        )
    
    except (ValidationError, NotFoundError) as e:
        status_code = 400 if isinstance(e, ValidationError) else 404
        return error_response(str(e), status_code)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>', methods=['DELETE'])
@require_auth
def delete_course(course_id):
    """Delete course"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to delete this course', 403)
        
        service.delete_course(course_id)
        
        return success_response(None, 'Course deleted successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/enroll', methods=['POST'])
@require_auth
def enroll_course(course_id):
    """Enroll student in a course"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        
        # Only students can enroll
        if user_data.get('role') != UserRole.STUDENT.value:
            return error_response('Only students can enroll in courses', 403)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check if course is published
        if course.status != 'published':
            return error_response('This course is not available for enrollment', 400)
        
        enrollment = service.enroll_student(user_id, course_id)
        
        return success_response({'enrollment': enrollment.to_dict()}, 'Successfully enrolled in course', 201)
    
    except (ConflictError, NotFoundError) as e:
        status_code = 409 if isinstance(e, ConflictError) else 404
        return error_response(str(e), status_code)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/unenroll', methods=['DELETE'])
@require_auth
def unenroll_course(course_id):
    """Unenroll student from a course"""
    try:
        user_id = get_current_user()
        
        service = CourseService(current_app.db)
        service.unenroll_student(user_id, course_id)
        
        return success_response(None, 'Successfully unenrolled from course')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/enrolled-students', methods=['GET'])
@require_auth
def get_enrolled_students(course_id):
    """Get students enrolled in a course"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization (teacher or admin of the course)
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to view this', 403)
        
        enrollments, total = service.get_enrolled_students(course_id, page, page_size)
        enrollments_data = [enrollment.to_dict() for enrollment in enrollments]
        
        return paginated_response(enrollments_data, total, page, page_size, 'Enrolled students retrieved successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/lessons', methods=['GET'])
@require_auth
def get_course_lessons(course_id):
    """Get all lessons in a course"""
    try:
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        lessons = service.get_course_lessons(course_id)
        lessons_data = [lesson.to_dict() for lesson in lessons]
        
        return success_response({
            'course_id': course_id,
            'lessons': lessons_data,
            'total': len(lessons_data)
        }, 'Lessons retrieved successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/lessons', methods=['POST'])
@require_auth
def add_lesson(course_id):
    """Add a lesson to a course"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        data = request.get_json()
        
        if not data or not all(k in data for k in ['title', 'description', 'order']):
            return error_response('Missing required fields: title, description, order', 400)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to add lessons to this course', 403)
        
        lesson = service.create_lesson(
            title=data.get('title'),
            description=data.get('description'),
            course_id=course_id,
            order=data.get('order'),
            content=data.get('content', ''),
            content_type=data.get('content_type', 'text'),
            video_url=data.get('video_url', ''),
            duration=data.get('duration', 0),
            learning_objectives=data.get('learning_objectives', []),
            resources_url=data.get('resources_url', []),
        )
        
        return success_response({'lesson': lesson.to_dict()}, 'Lesson created successfully', 201)
    
    except (ValidationError, NotFoundError) as e:
        status_code = 400 if isinstance(e, ValidationError) else 404
        return error_response(str(e), status_code)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/bulk-enroll', methods=['POST'])
@require_auth
def bulk_enroll_students(course_id):
    """Bulk enroll students in a course"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        data = request.get_json()
        
        if not data or 'user_ids' not in data:
            return error_response('Missing required field: user_ids', 400)
        
        user_ids = data.get('user_ids', [])
        if not isinstance(user_ids, list) or not user_ids:
            return error_response('user_ids must be a non-empty list', 400)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization (only teacher or admin can bulk enroll)
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to enroll students in this course', 403)
        
        enrollments, errors = service.bulk_enroll_students(course_id, user_ids)
        
        enrollments_data = [enrollment.to_dict() for enrollment in enrollments]
        
        return success_response({
            'enrollments': enrollments_data,
            'errors': errors,
            'successful': len(enrollments),
            'failed': len(errors)
        }, 'Bulk enrollment completed', 201)
    
    except (ValidationError, NotFoundError) as e:
        status_code = 400 if isinstance(e, ValidationError) else 404
        return error_response(str(e), status_code)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/bulk-unenroll', methods=['POST'])
@require_auth
def bulk_unenroll_students(course_id):
    """Bulk unenroll students from a course"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        data = request.get_json()
        
        if not data or 'user_ids' not in data:
            return error_response('Missing required field: user_ids', 400)
        
        user_ids = data.get('user_ids', [])
        if not isinstance(user_ids, list) or not user_ids:
            return error_response('user_ids must be a non-empty list', 400)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization (only teacher or admin can bulk unenroll)
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to unenroll students from this course', 403)
        
        count = service.bulk_unenroll_students(course_id, user_ids)
        
        return success_response({
            'unenrolled_count': count
        }, f'Successfully unenrolled {count} students')
    
    except (ValidationError, NotFoundError) as e:
        status_code = 400 if isinstance(e, ValidationError) else 404
        return error_response(str(e), status_code)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/teacher/<teacher_id>/courses', methods=['GET'])
@require_auth
def get_teacher_courses_route(teacher_id):
    """Get all courses for a teacher"""
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        
        # Validate pagination
        if page < 1:
            return error_response('Page must be >= 1', 400)
        if page_size < 1 or page_size > current_app.config['MAX_PAGE_SIZE']:
            return error_response(f'Page size must be between 1 and {current_app.config["MAX_PAGE_SIZE"]}', 400)
        
        service = CourseService(current_app.db)
        courses, total = service.get_teacher_courses(teacher_id, page, page_size)
        
        courses_data = []
        for course in courses:
            data = course.to_dict()
            data["_id"] = str(data["_id"])
            data["instructor_id"] = str(data["instructor_id"])
            courses_data.append(data)
        
        return paginated_response(courses_data, total, page, page_size, 'Teacher courses retrieved successfully')
    
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/enrolled-students-details', methods=['GET'])
@require_auth
def get_enrolled_students_details(course_id):
    """Get enrolled students with detailed user information"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization (teacher or admin of the course)
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to view this', 403)
        
        results, total = service.get_enrolled_students_with_details(course_id, page, page_size)
        
        return paginated_response(results, total, page, page_size, 'Enrolled students with details retrieved successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/publish', methods=['POST'])
@require_auth
def publish_course(course_id):
    """Publish a course (change from draft to published)"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to publish this course', 403)
        
        if course.status == 'published':
            return error_response('Course is already published', 400)
        
        updated_course = service.update_course(course_id, status='published')
        course_data = updated_course.to_dict()
        course_data['_id'] = str(course_data['_id'])
        course_data['instructor_id'] = str(course_data['instructor_id'])
        
        return success_response({'course': course_data}, 'Course published successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/archive', methods=['POST'])
@require_auth
def archive_course(course_id):
    """Archive a course (change status to archived)"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to archive this course', 403)
        
        if course.status == 'archived':
            return error_response('Course is already archived', 400)
        
        updated_course = service.update_course(course_id, status='archived')
        course_data = updated_course.to_dict()
        course_data['_id'] = str(course_data['_id'])
        course_data['instructor_id'] = str(course_data['instructor_id'])
        
        return success_response({'course': course_data}, 'Course archived successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/soft-delete', methods=['DELETE'])
@require_auth
def soft_delete_course(course_id):
    """Soft delete a course (mark as deleted without removing data)"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to delete this course', 403)
        
        # Check if already deleted
        if hasattr(course, 'is_deleted') and course.is_deleted:
            return error_response('Course is already deleted', 400)
        
        updated_course = service.update_course(course_id, is_deleted=True, deleted_at=datetime.utcnow())
        course_data = updated_course.to_dict()
        course_data['_id'] = str(course_data['_id'])
        course_data['instructor_id'] = str(course_data['instructor_id'])
        
        return success_response({'course': course_data}, 'Course soft deleted successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/<course_id>/restore', methods=['POST'])
@require_auth
def restore_course(course_id):
    """Restore a soft-deleted course"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to restore this course', 403)
        
        # Check if deleted
        if not (hasattr(course, 'is_deleted') and course.is_deleted):
            return error_response('Course is not deleted', 400)
        
        updated_course = service.update_course(course_id, is_deleted=False, deleted_at=None)
        course_data = updated_course.to_dict()
        course_data['_id'] = str(course_data['_id'])
        course_data['instructor_id'] = str(course_data['instructor_id'])
        
        return success_response({'course': course_data}, 'Course restored successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('', methods=['GET'])
@require_auth
def list_admin_courses():
    """List all courses (for admin - including draft and archived)"""
    try:
        user_data = g.user_data
        
        # Only admins and teachers can see all courses
        if user_data.get('role') not in [UserRole.ADMIN.value, UserRole.TEACHER.value]:
            return error_response('Only admins and teachers can access this endpoint', 403)
        
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        status = request.args.get('status')
        search = request.args.get('search')
        
        service = CourseService(current_app.db)
        
        filters = {}
        if status:
            filters['status'] = status
        if search:
            filters['search'] = search
        
        courses, total = service.list_courses(page, page_size, filters, status=None)
        
        courses_data = []
        for course in courses:
            data = course.to_dict(include_lesson_ids=True)
            data['_id'] = str(data['_id'])
            data['instructor_id'] = str(data['instructor_id'])
            if 'lesson_ids' in data:
                data['lesson_ids'] = [str(lid) for lid in data['lesson_ids']]
            courses_data.append(data)
        
        return paginated_response(courses_data, total, page, page_size, 'All courses retrieved successfully')
    
    except Exception as e:
        return error_response(str(e), 500)


# Academic Management Endpoints
@bp.route('/academic/teacher-assignment/<course_id>', methods=['POST'])
@require_auth
def assign_teacher_to_course(course_id):
    """Assign a teacher to a course (admin only)"""
    try:
        user_data = g.user_data
        if user_data.get('role') != UserRole.ADMIN.value:
            return error_response('Only admins can assign teachers', 403)
        
        data = request.get_json()
        if not data or 'teacher_id' not in data:
            return error_response('Missing required field: teacher_id', 400)
        
        teacher_id = data.get('teacher_id')
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        updated_course = service.update_course(course_id, instructor_id=teacher_id)
        course_data = updated_course.to_dict()
        course_data['_id'] = str(course_data['_id'])
        course_data['instructor_id'] = str(course_data['instructor_id'])
        
        return success_response({'course': course_data}, 'Teacher assigned successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/academic/remove-teacher/<course_id>', methods=['POST'])
@require_auth
def remove_teacher_from_course(course_id):
    """Remove teacher assignment from a course (admin only)"""
    try:
        user_data = g.user_data
        if user_data.get('role') != UserRole.ADMIN.value:
            return error_response('Only admins can remove teachers', 403)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        updated_course = service.update_course(course_id, instructor_id=None)
        course_data = updated_course.to_dict()
        course_data['_id'] = str(course_data['_id'])
        
        return success_response({'course': course_data}, 'Teacher removed successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/academic/enrollment/<course_id>', methods=['POST'])
@require_auth
def enroll_student(course_id):
    """Enroll a single student in a course"""
    try:
        user_data = g.user_data
        data = request.get_json()
        
        if not data or 'student_id' not in data:
            return error_response('Missing required field: student_id', 400)
        
        student_id = data.get('student_id')
        
        # Check authorization
        if user_data.get('role') not in [UserRole.ADMIN.value, UserRole.TEACHER.value]:
            return error_response('Only admins and teachers can enroll students', 403)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check for existing enrollment
        existing = current_app.db.enrollments.find_one({
            'user_id': ObjectId(student_id),
            'course_id': ObjectId(course_id)
        })
        
        if existing:
            return error_response('Student is already enrolled in this course', 409)
        
        enrollments, _ = service.bulk_enroll_students(course_id, [student_id])
        
        enrollment_data = enrollments[0].to_dict() if enrollments else {}
        enrollment_data['_id'] = str(enrollment_data.get('_id', ''))
        
        return success_response({'enrollment': enrollment_data}, 'Student enrolled successfully', 201)
    
    except ConflictError as e:
        return error_response(str(e), 409)
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/academic/unenrollment/<course_id>', methods=['POST'])
@require_auth
def unenroll_student(course_id):
    """Remove a student from a course"""
    try:
        user_data = g.user_data
        data = request.get_json()
        
        if not data or 'student_id' not in data:
            return error_response('Missing required field: student_id', 400)
        
        student_id = data.get('student_id')
        
        # Check authorization
        if user_data.get('role') not in [UserRole.ADMIN.value, UserRole.TEACHER.value]:
            return error_response('Only admins and teachers can unenroll students', 403)
        
        service = CourseService(current_app.db)
        count = service.bulk_unenroll_students(course_id, [student_id])
        
        return success_response({'unenrolled_count': count}, 'Student unenrolled successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/academic/students/<course_id>', methods=['GET'])
@require_auth
def get_course_students(course_id):
    """Get all students enrolled in a course with details"""
    try:
        user_id = get_current_user()
        user_data = g.user_data
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        
        service = CourseService(current_app.db)
        course = service.get_course_by_id(course_id)
        
        # Check authorization (teacher of course or admin)
        if user_id != str(course.instructor_id) and user_data.get('role') != UserRole.ADMIN.value:
            return error_response('You do not have permission to view this', 403)
        
        results, total = service.get_enrolled_students_with_details(course_id, page, page_size)
        
        return paginated_response(results, total, page, page_size, 'Course students retrieved successfully')
    
    except NotFoundError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@bp.route('/academic/teacher-courses/<teacher_id>', methods=['GET'])
@require_auth
def get_teacher_courses_academic(teacher_id):
    """Get all courses taught by a teacher"""
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        
        service = CourseService(current_app.db)
        courses, total = service.get_teacher_courses(teacher_id, page, page_size)
        
        courses_data = []
        for course in courses:
            data = course.to_dict(include_lesson_ids=True)
            data['_id'] = str(data['_id'])
            data['instructor_id'] = str(data['instructor_id'])
            if 'lesson_ids' in data:
                data['lesson_ids'] = [str(lid) for lid in data['lesson_ids']]
            courses_data.append(data)
        
        return paginated_response(courses_data, total, page, page_size, 'Teacher courses retrieved successfully')
    
    except Exception as e:
        return error_response(str(e), 500)
