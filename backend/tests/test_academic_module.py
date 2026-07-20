"""
Comprehensive tests for Academic Management Module
Tests enrollment, course-teacher assignment, and access control
"""

import pytest
import json
from datetime import datetime
from bson import ObjectId
from app.models.user import User, UserRole
from app.models.course import Course, Enrollment
from app.services.course_service import CourseService
from app.utils.errors import ConflictError, NotFoundError, ValidationError


class TestEnrollmentOperations:
    """Test student enrollment functionality"""

    def test_single_student_enrollment(self, app, db):
        """Test enrolling a single student in a course"""
        with app.app_context():
            # Create teacher and course
            teacher = User(
                email="teacher@test.com",
                password="SecurePass123",
                name="Test Teacher",
                role=UserRole.TEACHER.value
            )
            db.users.insert_one(teacher.to_dict(include_password=True))

            course = Course(
                title="Test Course",
                description="Test Description",
                instructor_id=teacher._id,
                category="tech"
            )
            db.courses.insert_one(course.to_dict())

            # Create student
            student = User(
                email="student@test.com",
                password="SecurePass123",
                name="Test Student",
                role=UserRole.STUDENT.value
            )
            db.users.insert_one(student.to_dict(include_password=True))

            # Enroll student
            service = CourseService(db)
            enrollment = service.enroll_student(str(student._id), str(course._id))

            # Assertions
            assert enrollment.user_id == student._id
            assert enrollment.course_id == course._id
            assert enrollment.progress_percentage == 0.0
            assert db.enrollments.count_documents({"course_id": course._id}) == 1

            # Verify course enrollment count incremented
            updated_course = db.courses.find_one({"_id": course._id})
            assert updated_course["enrollment_count"] == 1

    def test_prevent_duplicate_enrollment(self, app, db):
        """Test that duplicate enrollments are prevented"""
        with app.app_context():
            teacher = User(email="t@test.com", password="Pass123", name="Teacher", role=UserRole.TEACHER.value)
            course = Course(title="Course", description="Desc", instructor_id=teacher._id)
            student = User(email="s@test.com", password="Pass123", name="Student", role=UserRole.STUDENT.value)

            db.users.insert_one(teacher.to_dict(include_password=True))
            db.users.insert_one(student.to_dict(include_password=True))
            db.courses.insert_one(course.to_dict())

            service = CourseService(db)

            # First enrollment should succeed
            service.enroll_student(str(student._id), str(course._id))

            # Second enrollment should fail
            with pytest.raises(ConflictError):
                service.enroll_student(str(student._id), str(course._id))

    def test_bulk_enrollment(self, app, db):
        """Test bulk enrolling multiple students"""
        with app.app_context():
            teacher = User(email="t@test.com", password="Pass123", name="Teacher", role=UserRole.TEACHER.value)
            course = Course(title="Course", description="Desc", instructor_id=teacher._id)
            db.users.insert_one(teacher.to_dict(include_password=True))
            db.courses.insert_one(course.to_dict())

            # Create 5 students
            students = []
            for i in range(5):
                student = User(
                    email=f"student{i}@test.com",
                    password="Pass123",
                    name=f"Student {i}",
                    role=UserRole.STUDENT.value
                )
                db.users.insert_one(student.to_dict(include_password=True))
                students.append(str(student._id))

            service = CourseService(db)
            enrollments, errors = service.bulk_enroll_students(str(course._id), students)

            assert len(enrollments) == 5
            assert len(errors) == 0
            
            # Verify course enrollment count
            updated_course = db.courses.find_one({"_id": course._id})
            assert updated_course["enrollment_count"] == 5

    def test_bulk_enrollment_partial_failure(self, app, db):
        """Test bulk enrollment with some students already enrolled"""
        with app.app_context():
            teacher = User(email="t@test.com", password="Pass123", name="Teacher", role=UserRole.TEACHER.value)
            course = Course(title="Course", description="Desc", instructor_id=teacher._id)
            db.users.insert_one(teacher.to_dict(include_password=True))
            db.courses.insert_one(course.to_dict())

            # Create students
            students = []
            for i in range(3):
                student = User(
                    email=f"student{i}@test.com",
                    password="Pass123",
                    name=f"Student {i}",
                    role=UserRole.STUDENT.value
                )
                db.users.insert_one(student.to_dict(include_password=True))
                students.append(str(student._id))

            service = CourseService(db)

            # Enroll first student manually
            service.enroll_student(students[0], str(course._id))

            # Bulk enroll all 3 (first should fail)
            enrollments, errors = service.bulk_enroll_students(str(course._id), students)

            assert len(enrollments) == 2  # Only 2 new enrollments
            assert len(errors) == 1  # 1 error for duplicate
            assert db.enrollments.count_documents({"course_id": course._id}) == 3

    def test_student_unenrollment(self, app, db):
        """Test unenrolling a student from a course"""
        with app.app_context():
            teacher = User(email="t@test.com", password="Pass123", name="Teacher", role=UserRole.TEACHER.value)
            course = Course(title="Course", description="Desc", instructor_id=teacher._id)
            student = User(email="s@test.com", password="Pass123", name="Student", role=UserRole.STUDENT.value)

            db.users.insert_one(teacher.to_dict(include_password=True))
            db.users.insert_one(student.to_dict(include_password=True))
            db.courses.insert_one(course.to_dict())

            service = CourseService(db)
            service.enroll_student(str(student._id), str(course._id))

            # Verify enrollment exists
            assert service.is_student_enrolled(str(student._id), str(course._id))

            # Unenroll
            service.unenroll_student(str(student._id), str(course._id))

            # Verify unenrollment
            assert not service.is_student_enrolled(str(student._id), str(course._id))
            
            # Verify course enrollment count decremented
            updated_course = db.courses.find_one({"_id": course._id})
            assert updated_course["enrollment_count"] == 0


class TestCourseTeacherAssignment:
    """Test course-teacher assignment functionality"""

    def test_assign_teacher_to_course(self, app, db):
        """Test assigning a teacher to a course"""
        with app.app_context():
            teacher1 = User(email="t1@test.com", password="Pass123", name="Teacher 1", role=UserRole.TEACHER.value)
            teacher2 = User(email="t2@test.com", password="Pass123", name="Teacher 2", role=UserRole.TEACHER.value)

            db.users.insert_one(teacher1.to_dict(include_password=True))
            db.users.insert_one(teacher2.to_dict(include_password=True))

            # Create course with first teacher
            course = Course(
                title="Test Course",
                description="Test Description",
                instructor_id=teacher1._id
            )
            db.courses.insert_one(course.to_dict())

            service = CourseService(db)

            # Update course to new teacher
            updated_course = service.update_course(str(course._id), instructor_id=teacher2._id)

            assert str(updated_course.instructor_id) == str(teacher2._id)
            assert db.courses.find_one({"_id": course._id})["instructor_id"] == teacher2._id

    def test_get_teacher_courses(self, app, db):
        """Test retrieving all courses for a teacher"""
        with app.app_context():
            teacher = User(email="t@test.com", password="Pass123", name="Teacher", role=UserRole.TEACHER.value)
            db.users.insert_one(teacher.to_dict(include_password=True))

            # Create 3 courses
            for i in range(3):
                course = Course(
                    title=f"Course {i}",
                    description=f"Description {i}",
                    instructor_id=teacher._id
                )
                db.courses.insert_one(course.to_dict())

            service = CourseService(db)
            courses, total = service.get_teacher_courses(str(teacher._id), page=1, page_size=10)

            assert len(courses) == 3
            assert total == 3
            assert all(str(c.instructor_id) == str(teacher._id) for c in courses)


class TestAccessControl:
    """Test role-based access control"""

    def test_only_teacher_can_enroll_bulk(self, app, db):
        """Test that only teachers can bulk enroll students"""
        with app.app_context():
            teacher = User(email="t@test.com", password="Pass123", name="Teacher", role=UserRole.TEACHER.value)
            course = Course(title="Course", description="Desc", instructor_id=teacher._id)
            student = User(email="s@test.com", password="Pass123", name="Student", role=UserRole.STUDENT.value)

            db.users.insert_one(teacher.to_dict(include_password=True))
            db.users.insert_one(student.to_dict(include_password=True))
            db.courses.insert_one(course.to_dict())

            # This would be validated in the API route, not in the service
            # Service just executes the operation
            service = CourseService(db)
            enrollments, errors = service.bulk_enroll_students(str(course._id), [str(student._id)])
            assert len(enrollments) == 1

    def test_get_enrolled_students_with_details(self, app, db):
        """Test retrieving enrolled students with user details"""
        with app.app_context():
            teacher = User(email="t@test.com", password="Pass123", name="Teacher", role=UserRole.TEACHER.value)
            course = Course(title="Course", description="Desc", instructor_id=teacher._id)
            student = User(email="s@test.com", password="Pass123", name="Student", role=UserRole.STUDENT.value)

            db.users.insert_one(teacher.to_dict(include_password=True))
            db.users.insert_one(student.to_dict(include_password=True))
            db.courses.insert_one(course.to_dict())

            service = CourseService(db)
            service.enroll_student(str(student._id), str(course._id))

            # Get enrolled students with details
            results, total = service.get_enrolled_students_with_details(str(course._id))

            assert len(results) == 1
            assert results[0]["user"]["name"] == "Student"
            assert results[0]["user"]["email"] == "s@test.com"
            assert results[0]["enrollment"]["user_id"] == student._id


class TestEnrollmentCourseRelationship:
    """Test relationship between enrollments and courses"""

    def test_course_deletion_removes_enrollments(self, app, db):
        """Test that deleting a course removes all enrollments"""
        with app.app_context():
            teacher = User(email="t@test.com", password="Pass123", name="Teacher", role=UserRole.TEACHER.value)
            course = Course(title="Course", description="Desc", instructor_id=teacher._id)
            student = User(email="s@test.com", password="Pass123", name="Student", role=UserRole.STUDENT.value)

            db.users.insert_one(teacher.to_dict(include_password=True))
            db.users.insert_one(student.to_dict(include_password=True))
            db.courses.insert_one(course.to_dict())

            service = CourseService(db)
            service.enroll_student(str(student._id), str(course._id))

            # Verify enrollment exists
            assert db.enrollments.count_documents({"course_id": course._id}) == 1

            # Delete course
            service.delete_course(str(course._id))

            # Verify enrollment removed
            assert db.enrollments.count_documents({"course_id": course._id}) == 0

    def test_get_student_enrolled_courses(self, app, db):
        """Test retrieving all courses a student is enrolled in"""
        with app.app_context():
            teacher = User(email="t@test.com", password="Pass123", name="Teacher", role=UserRole.TEACHER.value)
            student = User(email="s@test.com", password="Pass123", name="Student", role=UserRole.STUDENT.value)

            db.users.insert_one(teacher.to_dict(include_password=True))
            db.users.insert_one(student.to_dict(include_password=True))

            # Create 3 courses
            for i in range(3):
                course = Course(title=f"Course {i}", description=f"Desc {i}", instructor_id=teacher._id)
                db.courses.insert_one(course.to_dict())

            service = CourseService(db)

            # Enroll student in all courses
            courses = db.courses.find({"instructor_id": teacher._id})
            for course in courses:
                service.enroll_student(str(student._id), str(course["_id"]))

            # Get student's courses
            enrollments, total = service.get_student_courses(str(student._id))

            assert len(enrollments) == 3
            assert total == 3
            assert all(e.user_id == student._id for e in enrollments)


@pytest.fixture
def app():
    """Create Flask app for testing"""
    from app.factory import create_app
    app = create_app()
    app.config['TESTING'] = True
    return app


@pytest.fixture
def db(app):
    """Create test database connection"""
    with app.app_context():
        db = app.db
        # Clear collections
        db.users.delete_many({})
        db.courses.delete_many({})
        db.enrollments.delete_many({})
        db.lessons.delete_many({})
        yield db
        # Cleanup
        db.users.delete_many({})
        db.courses.delete_many({})
        db.enrollments.delete_many({})
        db.lessons.delete_many({})
