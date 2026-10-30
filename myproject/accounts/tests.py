from django.test import TestCase, Client
from django.urls import reverse
from .mongo import (
    create_student,
    get_student_by_id,
    get_all_students,
    delete_student,
    add_student_mark,
    get_student_marks,
    record_attendance,
    get_student_attendance,
    get_student_stats,
    calculate_grade,
    create_user,
    seed_default_faculty_user,
    get_users_collection
)

class StudentManagementSystemTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.test_student_id = "TEST-STU-999"
        delete_student(self.test_student_id)
        seed_default_faculty_user()

    def tearDown(self):
        delete_student(self.test_student_id)
        users = get_users_collection()
        if users is not None:
            users.delete_many({"email": {"$regex": "@example\\.com$"}})

    def test_grade_calculation(self):
        """Test letter grade assignments."""
        self.assertEqual(calculate_grade(95.0), "A+")
        self.assertEqual(calculate_grade(85.0), "A")
        self.assertEqual(calculate_grade(75.0), "B")
        self.assertEqual(calculate_grade(65.0), "C")
        self.assertEqual(calculate_grade(55.0), "D")
        self.assertEqual(calculate_grade(45.0), "F")

    def test_create_and_get_student(self):
        """Test adding a new student and retrieving by ID."""
        student = create_student(
            student_id=self.test_student_id,
            name="Test Candidate",
            email="candidate@testexample.com",
            phone="+91 99999 88888",
            department="Computer Science",
            year="2nd Year"
        )
        self.assertIsNotNone(student)
        self.assertEqual(student["student_id"], self.test_student_id)
        self.assertEqual(student["name"], "Test Candidate")

        retrieved = get_student_by_id(self.test_student_id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["email"], "candidate@testexample.com")

    def test_search_and_filter_students(self):
        """Test searching students by ID or name."""
        create_student(
            student_id=self.test_student_id,
            name="Unique Searchable Student",
            email="unique@testexample.com",
            department="Mechanical Engineering"
        )

        results_by_name = get_all_students(query="Unique Searchable")
        self.assertTrue(any(s["student_id"] == self.test_student_id for s in results_by_name))

        results_by_id = get_all_students(query="TEST-STU-999")
        self.assertTrue(any(s["student_id"] == self.test_student_id for s in results_by_id))

        results_by_dept = get_all_students(department="Mechanical Engineering")
        self.assertTrue(any(s["student_id"] == self.test_student_id for s in results_by_dept))

    def test_marks_management(self):
        """Test storing and retrieving marks with automatic grade computation."""
        create_student(
            student_id=self.test_student_id,
            name="Marks Test Student",
            email="markstest@testexample.com"
        )

        mark = add_student_mark(
            student_id=self.test_student_id,
            subject="Algorithms",
            exam_type="Final Exam",
            score=92.0,
            max_score=100.0,
            remarks="Excellent"
        )
        self.assertEqual(mark["grade"], "A+")
        self.assertEqual(mark["percentage"], 92.0)

        marks = get_student_marks(self.test_student_id)
        self.assertEqual(len(marks), 1)
        self.assertEqual(marks[0]["subject"], "Algorithms")

    def test_attendance_tracking(self):
        """Test logging attendance and calculating attendance rates."""
        create_student(
            student_id=self.test_student_id,
            name="Attendance Test Student",
            email="att@testexample.com"
        )

        record_attendance(
            student_id=self.test_student_id,
            attendance_date="2024-10-25",
            status="Present"
        )
        record_attendance(
            student_id=self.test_student_id,
            attendance_date="2024-10-26",
            status="Absent"
        )

        history = get_student_attendance(self.test_student_id)
        self.assertEqual(len(history), 2)

        stats = get_student_stats(self.test_student_id)
        self.assertEqual(stats["total_attendance_records"], 2)
        self.assertEqual(stats["present_count"], 1)
        self.assertEqual(stats["attendance_pct"], 50.0)

    def test_access_control_protection(self):
        """Test that student directory is protected and requires login or registration."""
        # Unauthenticated request must redirect to login
        unauth_resp = self.client.get(reverse('dashboard'))
        self.assertEqual(unauth_resp.status_code, 302)
        self.assertIn('/login/', unauth_resp.url)

        unauth_export = self.client.get(reverse('export_students_csv'))
        self.assertEqual(unauth_export.status_code, 302)
        self.assertIn('/login/', unauth_export.url)

        # Authenticate with credentials
        login_resp = self.client.post(reverse('login'), {
            'email': 'admin@campus.edu',
            'password': 'Password@123'
        })
        self.assertEqual(login_resp.status_code, 302)
        self.assertIn('/dashboard/', login_resp.url)

        # Authenticated access succeeds
        auth_resp = self.client.get(reverse('dashboard'))
        self.assertEqual(auth_resp.status_code, 200)

        # Export succeeds when authenticated
        export_resp = self.client.get(reverse('export_students_csv'))
        self.assertEqual(export_resp.status_code, 200)
        self.assertEqual(export_resp['Content-Type'], 'text/csv')

    def test_roles_restriction(self):
        """Test that user roles are strictly limited to Academic Coordinator and Teacher."""
        # 1. Academic Coordinator
        coord = create_user("Test Coordinator", "coord_test@example.com", "Password@123", role="Academic Coordinator")
        self.assertEqual(coord["role"], "Academic Coordinator")

        # 2. Teacher
        teacher = create_user("Test Teacher", "teacher_test@example.com", "Password@123", role="Teacher")
        self.assertEqual(teacher["role"], "Teacher")

        # 3. Disallowed role falls back to Teacher
        invalid_role_user = create_user("Test Disallowed", "invalid_role@example.com", "Password@123", role="Faculty Professor")
        self.assertEqual(invalid_role_user["role"], "Teacher")

        # 4. Signup form page contains only the two allowed role options
        signup_page = self.client.get(reverse('signup'))
        self.assertEqual(signup_page.status_code, 200)
        self.assertContains(signup_page, '<option value="Academic Coordinator">Academic Coordinator</option>')
        self.assertContains(signup_page, '<option value="Teacher">Teacher</option>')
        self.assertNotContains(signup_page, 'Faculty Professor')
        self.assertNotContains(signup_page, 'Head of Department')
        self.assertNotContains(signup_page, 'Administrative Staff')

    def test_academic_coordinator_permissions(self):
        """
        Academic Coordinator permissions:
        - Allowed: Add student, Update student, Delete student, View student, Search student.
        - Denied: Add marks, Delete marks, Record attendance.
        """
        # Create Coordinator and Teacher users
        create_user("Coord User", "coord_perm@example.com", "Password@123", role="Academic Coordinator")

        # Login as Coordinator
        self.client.post(reverse('login'), {'email': 'coord_perm@example.com', 'password': 'Password@123'})

        # 1. Can view student directory & search
        resp = self.client.get(reverse('dashboard'), {'q': 'TEST'})
        self.assertEqual(resp.status_code, 200)

        # 2. Can add a student
        add_resp = self.client.post(reverse('add_student'), {
            'student_id': 'COORD-STU-001',
            'name': 'Coord Created Student',
            'email': 'coord_stu@example.com',
            'department': 'Computer Science',
            'year': '1st Year'
        })
        self.assertEqual(add_resp.status_code, 302)
        created = get_student_by_id('COORD-STU-001')
        self.assertIsNotNone(created)
        self.assertEqual(created['name'], 'Coord Created Student')

        # 3. Can view student detail
        detail_resp = self.client.get(reverse('student_detail', kwargs={'student_id': 'COORD-STU-001'}))
        self.assertEqual(detail_resp.status_code, 200)

        # 4. Can update student details
        update_resp = self.client.post(reverse('update_student', kwargs={'student_id': 'COORD-STU-001'}), {
            'name': 'Coord Renamed Student',
            'email': 'coord_stu@example.com',
            'department': 'Information Technology'
        })
        self.assertEqual(update_resp.status_code, 302)
        updated = get_student_by_id('COORD-STU-001')
        self.assertEqual(updated['name'], 'Coord Renamed Student')

        # 5. DENIED: Cannot add marks (Redirected / Error)
        marks_resp = self.client.post(reverse('add_marks', kwargs={'student_id': 'COORD-STU-001'}), {
            'subject': 'Physics',
            'score': 90,
            'max_score': 100
        })
        self.assertIn(marks_resp.status_code, [302, 403])
        self.assertEqual(len(get_student_marks('COORD-STU-001')), 0)

        # 6. DENIED: Cannot record attendance
        att_resp = self.client.post(reverse('record_attendance', kwargs={'student_id': 'COORD-STU-001'}), {
            'attendance_date': '2024-10-26',
            'status': 'Present'
        })
        self.assertIn(att_resp.status_code, [302, 403])
        self.assertEqual(len(get_student_attendance('COORD-STU-001')), 0)

        # 7. Can delete student
        del_resp = self.client.post(reverse('delete_student', kwargs={'student_id': 'COORD-STU-001'}))
        self.assertEqual(del_resp.status_code, 302)
        self.assertIsNone(get_student_by_id('COORD-STU-001'))

    def test_teacher_permissions(self):
        """
        Teacher permissions:
        - Allowed: Add marks, Delete marks, Record attendance, View student, Search student.
        - Denied: Add student, Update student, Delete student.
        """
        # Create student first
        create_student(
            student_id="TEACH-STU-001",
            name="Teacher Test Learner",
            email="teach_learner@example.com",
            department="Computer Science"
        )
        create_user("Teacher User", "teacher_perm@example.com", "Password@123", role="Teacher")

        # Login as Teacher
        self.client.post(reverse('login'), {'email': 'teacher_perm@example.com', 'password': 'Password@123'})

        # 1. Can view student directory & search
        resp = self.client.get(reverse('dashboard'), {'q': 'Learner'})
        self.assertEqual(resp.status_code, 200)

        # 2. Can view student detail
        detail_resp = self.client.get(reverse('student_detail', kwargs={'student_id': 'TEACH-STU-001'}))
        self.assertEqual(detail_resp.status_code, 200)

        # 3. DENIED: Cannot add student
        add_resp = self.client.post(reverse('add_student'), {
            'student_id': 'TEACH-STU-002',
            'name': 'Should Not Exist',
            'email': 'none@example.com'
        })
        self.assertIn(add_resp.status_code, [302, 403])
        self.assertIsNone(get_student_by_id('TEACH-STU-002'))

        # 4. DENIED: Cannot update student details
        upd_resp = self.client.post(reverse('update_student', kwargs={'student_id': 'TEACH-STU-001'}), {
            'name': 'Hacked Name'
        })
        self.assertIn(upd_resp.status_code, [302, 403])
        stu = get_student_by_id('TEACH-STU-001')
        self.assertEqual(stu['name'], 'Teacher Test Learner')

        # 5. DENIED: Cannot delete student
        del_resp = self.client.post(reverse('delete_student', kwargs={'student_id': 'TEACH-STU-001'}))
        self.assertIn(del_resp.status_code, [302, 403])
        self.assertIsNotNone(get_student_by_id('TEACH-STU-001'))

        # 6. ALLOWED: Can record marks
        mark_resp = self.client.post(reverse('add_marks', kwargs={'student_id': 'TEACH-STU-001'}), {
            'subject': 'Mathematics',
            'score': 88.0,
            'max_score': 100.0,
            'exam_type': 'Midterm Exam'
        })
        self.assertEqual(mark_resp.status_code, 302)
        marks = get_student_marks('TEACH-STU-001')
        self.assertEqual(len(marks), 1)
        self.assertEqual(marks[0]['subject'], 'Mathematics')

        # 7. ALLOWED: Can record attendance
        att_resp = self.client.post(reverse('record_attendance', kwargs={'student_id': 'TEACH-STU-001'}), {
            'attendance_date': '2024-10-26',
            'status': 'Present',
            'session_title': 'Maths Lab'
        })
        self.assertEqual(att_resp.status_code, 302)
        attendance = get_student_attendance('TEACH-STU-001')
        self.assertEqual(len(attendance), 1)
        self.assertEqual(attendance[0]['status'], 'Present')

        # Cleanup
        delete_student('TEACH-STU-001')


