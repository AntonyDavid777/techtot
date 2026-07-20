from bson import ObjectId
from app.models.course import Course, Lesson, Enrollment
from app.utils.errors import NotFoundError, ConflictError, ValidationError
from datetime import datetime
import logging


logger = logging.getLogger(__name__)


class CourseService:
    """Service layer for course operations"""
    
    def __init__(self, db):
        self.db = db
        self.courses_collection = db.courses
        self.lessons_collection = db.lessons
        self.enrollments_collection = db.enrollments
    
    # Course Operations
    
    def create_course(
        self,
        title: str,
        description: str,
        instructor_id: str,
        category: str = '',
        level: str = 'beginner',
        thumbnail_url: str = '',
        **kwargs
    ):
        """Create a new course"""
        course = Course(
            title=title,
            description=description,
            instructor_id=instructor_id,
            category=category,
            level=level,
            thumbnail_url=thumbnail_url,
            **kwargs
        )
        
        result = self.courses_collection.insert_one(course.to_dict())
        course._id = result.inserted_id
        
        logger.info(f"Course created: {course._id} by instructor {instructor_id}")
        return course

    def get_course_by_id(self, course_id: str, include_lessons: bool = False):
        """Get course by ID"""
        try:
            course_doc = self.courses_collection.find_one({'_id': ObjectId(course_id)})
            if not course_doc:
                raise NotFoundError(f'Course {course_id} not found')
            
            course = Course.from_mongo_dict(course_doc)
            
            if include_lessons:
                lessons_docs = self.lessons_collection.find(
                    {'course_id': ObjectId(course_id)}
                ).sort('order', 1)
                course.lessons = [Lesson.from_mongo_dict(doc) for doc in lessons_docs]
            
            return course
        except Exception as e:
            if isinstance(e, NotFoundError):
                raise
            raise ValueError(f'Invalid course ID: {course_id}')
    def update_course(self, course_id: str, **kwargs):
        """Update course information"""
        allowed_fields = ['title', 'description', 'category', 'level', 'status', 'thumbnail_url']
        update_data = {}
        
        for field in allowed_fields:
            if field in kwargs:
                update_data[field] = kwargs[field]
        
        if not update_data:
            raise ValidationError('No fields to update')
        
        update_data['updated_at'] = datetime.utcnow()
        
        result = self.courses_collection.update_one(
            {'_id': ObjectId(course_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            raise NotFoundError(f'Course {course_id} not found')
        
        logger.info(f"Course updated: {course_id}")
        return self.get_course_by_id(course_id)
    
    def delete_course(self, course_id: str):
        """Delete course and all related data"""
        # Delete lessons
        self.lessons_collection.delete_many({'course_id': ObjectId(course_id)})
        
        # Delete enrollments
        self.enrollments_collection.delete_many({'course_id': ObjectId(course_id)})
        
        # Delete course
        result = self.courses_collection.delete_one({'_id': ObjectId(course_id)})
        
        if result.deleted_count == 0:
            raise NotFoundError(f'Course {course_id} not found')
        
        logger.info(f"Course deleted: {course_id}")
    
    def list_courses(self, page: int = 1, page_size: int = 10, filters: dict = None, status: str = None):
        """List courses with pagination and filtering"""
        query = {}
        
        if status:
            query['status'] = status
        
        if filters:
            if filters.get('category'):
                query['category'] = filters['category']
            if filters.get('level'):
                query['level'] = filters['level']
            if filters.get('search'):
                # Search in title and description
                query['$or'] = [
                    {'title': {'$regex': filters['search'], '$options': 'i'}},
                    {'description': {'$regex': filters['search'], '$options': 'i'}}
                ]
        
        total = self.courses_collection.count_documents(query)
        
        skip = (page - 1) * page_size
        courses_docs = self.courses_collection.find(query).skip(skip).limit(page_size).sort('created_at', -1)
        
        courses = [Course.from_mongo_dict(doc) for doc in courses_docs]
        
        return courses, total
    
    def get_courses_by_instructor(self, instructor_id: str, page: int = 1, page_size: int = 10):
        """Get all courses created by an instructor"""
        query = {'instructor_id': ObjectId(instructor_id)}
        
        total = self.courses_collection.count_documents(query)
        
        skip = (page - 1) * page_size
        courses_docs = self.courses_collection.find(query).skip(skip).limit(page_size).sort('created_at', -1)
        
        courses = [Course.from_mongo_dict(doc) for doc in courses_docs]
        
        return courses, total
    
    # Lesson Operations
    
    def create_lesson(
        self,
        title: str,
        description: str,
        course_id: str,
        order: int,
        content_type: str = 'text',
        content: str = '',
        video_url: str = '',
        duration: int = 0,
        learning_objectives: list = None,
        resources_url: list = None,
        **kwargs
    ):
        """Create a new lesson"""
        lesson = Lesson(
            title=title,
            description=description,
            course_id=course_id,
            order=order,
            content_type=content_type,
            content=content,
            video_url=video_url,
            duration=duration,
            learning_objectives=learning_objectives or [],
            resources_url=resources_url or [],
            **kwargs
        )
        
        result = self.lessons_collection.insert_one(lesson.to_dict())
        lesson._id = result.inserted_id
        
        # Update course lesson_ids
        self.courses_collection.update_one(
            {'_id': ObjectId(course_id)},
            {'$push': {'lesson_ids': result.inserted_id}}
        )
        
        logger.info(f"Lesson created: {lesson._id} in course {course_id}")
        return lesson
    
    def get_lesson_by_id(self, lesson_id: str):
        """Get lesson by ID"""
        try:
            lesson_doc = self.lessons_collection.find_one({'_id': ObjectId(lesson_id)})
            if not lesson_doc:
                raise NotFoundError(f'Lesson {lesson_id} not found')
            return Lesson.from_mongo_dict(lesson_doc)
        except Exception as e:
            if isinstance(e, NotFoundError):
                raise
            raise ValueError(f'Invalid lesson ID: {lesson_id}')
    
    def update_lesson(self, lesson_id: str, **kwargs):
        """Update lesson information"""
        allowed_fields = ['title', 'description', 'content_type', 'content', 'video_url', 'duration', 'order', 'learning_objectives', 'resources_url']
        update_data = {}
        
        for field in allowed_fields:
            if field in kwargs:
                update_data[field] = kwargs[field]
        
        if not update_data:
            raise ValidationError('No fields to update')
        
        update_data['updated_at'] = datetime.utcnow()
        
        result = self.lessons_collection.update_one(
            {'_id': ObjectId(lesson_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            raise NotFoundError(f'Lesson {lesson_id} not found')
        
        logger.info(f"Lesson updated: {lesson_id}")
        return self.get_lesson_by_id(lesson_id)
    
    def delete_lesson(self, lesson_id: str):
        """Delete lesson"""
        lesson = self.get_lesson_by_id(lesson_id)
        course_id = lesson.course_id
        
        result = self.lessons_collection.delete_one({'_id': ObjectId(lesson_id)})
        
        if result.deleted_count == 0:
            raise NotFoundError(f'Lesson {lesson_id} not found')
        
        # Remove lesson_id from course
        self.courses_collection.update_one(
            {'_id': ObjectId(course_id)},
            {'$pull': {'lesson_ids': ObjectId(lesson_id)}}
        )
        
        logger.info(f"Lesson deleted: {lesson_id}")
    
    def get_course_lessons(self, course_id: str):
        """Get all lessons in a course"""
        lessons_docs = self.lessons_collection.find(
            {'course_id': ObjectId(course_id)}
        ).sort('order', 1)
        
        lessons = [Lesson.from_mongo_dict(doc) for doc in lessons_docs]
        return lessons
    
    # Enrollment Operations
    
    def enroll_student(self, user_id: str, course_id: str):
        """Enroll a student in a course"""
        # Check if already enrolled
        existing = self.enrollments_collection.find_one({
            'user_id': ObjectId(user_id),
            'course_id': ObjectId(course_id)
        })
        
        if existing:
            raise ConflictError('Student is already enrolled in this course')
        
        enrollment = Enrollment(
            user_id=user_id,
            course_id=course_id
        )
        
        result = self.enrollments_collection.insert_one(enrollment.to_dict())
        enrollment._id = result.inserted_id
        
        # Increment enrollment count in course
        self.courses_collection.update_one(
            {'_id': ObjectId(course_id)},
            {'$inc': {'enrollment_count': 1}}
        )
        
        logger.info(f"Student {user_id} enrolled in course {course_id}")
        return enrollment
    
    def unenroll_student(self, user_id: str, course_id: str):
        """Unenroll a student from a course"""
        result = self.enrollments_collection.delete_one({
            'user_id': ObjectId(user_id),
            'course_id': ObjectId(course_id)
        })
        
        if result.deleted_count == 0:
            raise NotFoundError('Enrollment not found')
        
        # Decrement enrollment count in course
        self.courses_collection.update_one(
            {'_id': ObjectId(course_id)},
            {'$inc': {'enrollment_count': -1}}
        )
        
        logger.info(f"Student {user_id} unenrolled from course {course_id}")
    
    def get_enrolled_students(self, course_id: str, page: int = 1, page_size: int = 10):
        """Get students enrolled in a course"""
        query = {'course_id': ObjectId(course_id)}
        
        total = self.enrollments_collection.count_documents(query)
        
        skip = (page - 1) * page_size
        enrollments_docs = self.enrollments_collection.find(query).skip(skip).limit(page_size).sort('enrolled_at', -1)
        
        enrollments = [Enrollment.from_mongo_dict(doc) for doc in enrollments_docs]
        
        return enrollments, total
    
    def is_student_enrolled(self, user_id: str, course_id: str) -> bool:
        """Check if student is enrolled in a course"""
        enrollment = self.enrollments_collection.find_one({
            'user_id': ObjectId(user_id),
            'course_id': ObjectId(course_id)
        })
        
        return enrollment is not None
    
    def get_student_courses(self, user_id: str, page: int = 1, page_size: int = 10):
        """Get all courses a student is enrolled in"""
        query = {'user_id': ObjectId(user_id)}
        
        total = self.enrollments_collection.count_documents(query)
        
        skip = (page - 1) * page_size
        enrollments_docs = self.enrollments_collection.find(query).skip(skip).limit(page_size).sort('enrolled_at', -1)
        
        enrollments = [Enrollment.from_mongo_dict(doc) for doc in enrollments_docs]
        
        return enrollments, total
    
    def bulk_enroll_students(self, course_id: str, user_ids: list):
        """Enroll multiple students in a course"""
        if not user_ids:
            raise ValidationError('No user IDs provided')
        
        enrollments = []
        errors = []
        
        for user_id in user_ids:
            try:
                # Check if already enrolled
                existing = self.enrollments_collection.find_one({
                    'user_id': ObjectId(user_id),
                    'course_id': ObjectId(course_id)
                })
                
                if existing:
                    errors.append(f'User {user_id} already enrolled')
                    continue
                
                enrollment = Enrollment(
                    user_id=user_id,
                    course_id=course_id
                )
                
                result = self.enrollments_collection.insert_one(enrollment.to_dict())
                enrollment._id = result.inserted_id
                enrollments.append(enrollment)
                
            except Exception as e:
                errors.append(f'Error enrolling user {user_id}: {str(e)}')
        
        # Increment enrollment count in course
        if enrollments:
            self.courses_collection.update_one(
                {'_id': ObjectId(course_id)},
                {'$inc': {'enrollment_count': len(enrollments)}}
            )
            logger.info(f"Bulk enrollment: {len(enrollments)} students enrolled in course {course_id}")
        
        return enrollments, errors
    
    def bulk_unenroll_students(self, course_id: str, user_ids: list):
        """Unenroll multiple students from a course"""
        if not user_ids:
            raise ValidationError('No user IDs provided')
        
        # Build query to delete multiple enrollments
        query = {
            'course_id': ObjectId(course_id),
            'user_id': {'$in': [ObjectId(uid) for uid in user_ids]}
        }
        
        result = self.enrollments_collection.delete_many(query)
        
        # Decrement enrollment count in course
        if result.deleted_count > 0:
            self.courses_collection.update_one(
                {'_id': ObjectId(course_id)},
                {'$inc': {'enrollment_count': -result.deleted_count}}
            )
            logger.info(f"Bulk unenrollment: {result.deleted_count} students unenrolled from course {course_id}")
        
        return result.deleted_count
    
    def get_teacher_courses(self, teacher_id: str, page: int = 1, page_size: int = 10):
        """Get all courses taught by a teacher"""
        query = {'instructor_id': ObjectId(teacher_id)}
        
        total = self.courses_collection.count_documents(query)
        
        skip = (page - 1) * page_size
        courses_docs = self.courses_collection.find(query).skip(skip).limit(page_size).sort('created_at', -1)
        
        courses = [Course.from_mongo_dict(doc) for doc in courses_docs]
        
        return courses, total
    
    def get_enrolled_students_with_details(self, course_id: str, page: int = 1, page_size: int = 10):
        """Get students enrolled in a course with user details"""
        query = {'course_id': ObjectId(course_id)}
        
        total = self.enrollments_collection.count_documents(query)
        
        skip = (page - 1) * page_size
        enrollments_docs = self.enrollments_collection.find(query).skip(skip).limit(page_size).sort('enrolled_at', -1)
        
        results = []
        for enroll_doc in enrollments_docs:
            enrollment = Enrollment.from_mongo_dict(enroll_doc)
            # Get user details
            user_doc = self.db.users.find_one({'_id': ObjectId(enrollment.user_id)})
            if user_doc:
                user_dict = {
                    '_id': str(user_doc['_id']),
                    'name': user_doc.get('name', ''),
                    'email': user_doc.get('email', ''),
                }
                results.append({
                    'enrollment': enrollment.to_dict(),
                    'user': user_dict
                })
        
        return results, total
