import csv
from datetime import datetime, date
from django.http import HttpResponse
from rest_framework import viewsets, permissions, filters, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer, StudentDetailSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'student_id', 'email', 'phone', 'department']
    ordering_fields = ['name', 'student_id', 'created_at', 'year']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StudentDetailSerializer
        return StudentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        dept = self.request.query_params.get('department')
        status_param = self.request.query_params.get('status')
        year = self.request.query_params.get('year')
        
        if dept and dept != 'All':
            qs = qs.filter(department=dept)
        if status_param and status_param != 'All':
            qs = qs.filter(status=status_param)
        if year and year != 'All':
            qs = qs.filter(year=year)
        return qs

class StudentStatsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        students = Student.objects.all()
        total_students = students.count()

        if total_students == 0:
            return Response({
                "total_students": 0,
                "average_attendance": 0.0,
                "class_average_marks": 0.0,
                "at_risk_count": 0,
                "active_students": 0,
                "top_department": "N/A",
                "departments": {}
            })

        total_att = 0.0
        students_with_marks = []
        at_risk_count = 0
        active_count = 0
        dept_counts = {}

        for s in students:
            total_att += s.attendance_pct
            if s.marks_count > 0:
                students_with_marks.append(s.average_marks)
            if s.at_risk:
                at_risk_count += 1
            if s.status == 'Active':
                active_count += 1
            dept = s.department or 'General'
            dept_counts[dept] = dept_counts.get(dept, 0) + 1

        avg_attendance = round(total_att / total_students, 1)
        avg_marks = round(sum(students_with_marks) / len(students_with_marks), 1) if students_with_marks else 0.0
        top_department = max(dept_counts, key=dept_counts.get) if dept_counts else "Computer Science"

        return Response({
            "total_students": total_students,
            "average_attendance": avg_attendance,
            "class_average_marks": avg_marks,
            "at_risk_count": at_risk_count,
            "active_students": active_count,
            "top_department": top_department,
            "departments": dept_counts
        })

class ExportStudentsCSVView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="students_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Student ID', 'Full Name', 'Email', 'Phone', 
            'Department', 'Year', 'Gender', 'Status', 
            'Attendance %', 'Average Marks %', 'At Risk', 'Date Registered'
        ])

        for s in Student.objects.all():
            writer.writerow([
                s.student_id,
                s.name,
                s.email,
                s.phone,
                s.department,
                s.year,
                s.gender,
                s.status,
                s.attendance_pct,
                s.average_marks,
                'YES' if s.at_risk else 'NO',
                s.created_at.strftime('%Y-%m-%d')
            ])

        return response

class ClearAllStudentsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from apps.attendance.models import Attendance
        from apps.grades.models import GradeRecord
        from apps.fees.models import FeeInvoice
        from apps.courses.models import CourseEnrollment

        Attendance.objects.all().delete()
        GradeRecord.objects.all().delete()
        FeeInvoice.objects.all().delete()
        CourseEnrollment.objects.all().delete()
        count = Student.objects.count()
        Student.objects.all().delete()

        return Response({"message": f"Successfully wiped {count} students and all associated records."})

class SeedDemoDataView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from apps.departments.models import Department
        from apps.teachers.models import Teacher
        from apps.courses.models import Course, CourseEnrollment
        from apps.attendance.models import Attendance
        from apps.grades.models import GradeRecord
        from apps.fees.models import FeeInvoice, FeePayment
        from apps.accounts.models import User

        # 1. Seed Core Faculty Users
        admin_user, _ = User.objects.get_or_create(
            email='admin@campus.edu',
            defaults={
                'username': 'admin',
                'full_name': 'Prof. Alex Mercer',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin_user.set_password('Password@123')
        admin_user.save()

        teacher_user, _ = User.objects.get_or_create(
            email='teacher@campus.edu',
            defaults={
                'username': 'teacher',
                'full_name': 'Dr. Sarah Connor',
                'role': 'teacher',
                'is_staff': True
            }
        )
        teacher_user.set_password('Password@123')
        teacher_user.save()

        student_user, _ = User.objects.get_or_create(
            email='student@campus.edu',
            defaults={
                'username': 'student',
                'full_name': 'Aarav Sharma',
                'role': 'student'
            }
        )
        student_user.set_password('Password@123')
        student_user.save()

        # 2. Seed Departments
        dept_data = [
            ("CS", "Computer Science", "Department of Computer Science & Engineering", "Dr. Alan Turing"),
            ("IT", "Information Technology", "Department of Information Systems & Computing", "Dr. Tim Berners-Lee"),
            ("MECH", "Mechanical Engineering", "Department of Mechanical & Robotics Engineering", "Dr. Nikola Tesla"),
            ("ECE", "Electronics & Communication", "Department of Microelectronics & Signals", "Dr. Claude Shannon"),
            ("CIVIL", "Civil Engineering", "Department of Structural & Environmental Engineering", "Dr. Gustave Eiffel")
        ]
        dept_map = {}
        for code, name, desc, head in dept_data:
            d, _ = Department.objects.get_or_create(
                code=code,
                defaults={'name': name, 'description': desc, 'head_name': head}
            )
            dept_map[name] = d

        # 3. Seed Teachers
        teachers_data = [
            ("TCH-001", "Dr. Alan Turing", "alan.turing@campus.edu", "+91 98765 00001", "Computer Science", "Professor", "Ph.D. in Computer Science"),
            ("TCH-002", "Dr. Sarah Connor", "sarah.connor@campus.edu", "+91 98765 00002", "Information Technology", "Associate Professor", "M.Tech, Ph.D."),
            ("TCH-003", "Prof. Alex Mercer", "admin@campus.edu", "+91 98765 00003", "Computer Science", "Academic Coordinator & Professor", "Ph.D. in AI"),
            ("TCH-004", "Dr. Nikola Tesla", "nikola.tesla@campus.edu", "+91 98765 00004", "Mechanical Engineering", "Professor", "Ph.D. in Mech"),
            ("TCH-005", "Dr. Claude Shannon", "claude.shannon@campus.edu", "+91 98765 00005", "Electronics & Communication", "Professor", "Ph.D. in Signals")
        ]
        teacher_map = {}
        for tid, name, email, phone, dept_name, desig, qual in teachers_data:
            t, _ = Teacher.objects.get_or_create(
                teacher_id=tid,
                defaults={
                    'name': name,
                    'email': email,
                    'phone': phone,
                    'department': dept_map.get(dept_name),
                    'designation': desig,
                    'qualification': qual,
                    'joining_date': date(2020, 8, 15)
                }
            )
            teacher_map[name] = t

        # 4. Seed Courses
        courses_data = [
            ("CS301", "Data Structures & Algorithms", "Computer Science", 4, "Semester 3", "Dr. Alan Turing"),
            ("CS302", "Database Management Systems", "Computer Science", 4, "Semester 3", "Prof. Alex Mercer"),
            ("IT201", "Web Technologies & Fullstack", "Information Technology", 3, "Semester 2", "Dr. Sarah Connor"),
            ("ME401", "Thermodynamics & Heat Transfer", "Mechanical Engineering", 4, "Semester 4", "Dr. Nikola Tesla"),
            ("EC301", "Digital Signal Processing", "Electronics & Communication", 4, "Semester 3", "Dr. Claude Shannon")
        ]
        course_map = {}
        for ccode, ctitle, dept_name, creds, sem, tname in courses_data:
            c, _ = Course.objects.get_or_create(
                code=ccode,
                defaults={
                    'title': ctitle,
                    'department': dept_map.get(dept_name),
                    'credits': creds,
                    'semester': sem,
                    'teacher': teacher_map.get(tname),
                    'description': f"Comprehensive course in {ctitle}."
                }
            )
            course_map[ctitle] = c

        # 5. Seed Students
        sample_students = [
            {
                "student_id": "SMS-2024-001",
                "name": "Aarav Sharma",
                "email": "aarav.sharma@campus.edu",
                "phone": "+91 98765 12001",
                "department": "Computer Science",
                "year": "3rd Year",
                "gender": "Male",
                "dob": "2003-04-14",
                "status": "Active",
                "address": "402 Tech Park Residency, Bangalore",
                "marks": [
                    ("Data Structures & Algorithms", "Midterm Exam", 92, 100, "Outstanding logic implementation"),
                    ("Database Management Systems", "Midterm Exam", 88, 100, "Solid query optimization skills"),
                    ("Operating Systems", "Practical Lab", 95, 100, "Excellent process synchronization lab"),
                    ("Computer Networks", "Assignment", 85, 100, "Thorough packet capture analysis")
                ],
                "attendance": [
                    ("2024-10-21", "Present"),
                    ("2024-10-22", "Present"),
                    ("2024-10-23", "Present"),
                    ("2024-10-24", "Present"),
                    ("2024-10-25", "Present"),
                    ("2024-10-26", "Present")
                ],
                "fees": [
                    ("INV-2024-001", "Semester 5 Tuition Fee", "Fall 2024", 45000, 45000, "Paid", "2024-09-15"),
                    ("INV-2024-002", "Campus Hostel Fee", "Fall 2024", 25000, 25000, "Paid", "2024-09-20")
                ]
            },
            {
                "student_id": "SMS-2024-002",
                "name": "Diya Patel",
                "email": "diya.patel@campus.edu",
                "phone": "+91 98765 12002",
                "department": "Information Technology",
                "year": "2nd Year",
                "gender": "Female",
                "dob": "2004-08-22",
                "status": "Active",
                "address": "12 Lotus Boulevard, Ahmedabad",
                "marks": [
                    ("Web Technologies & Fullstack", "Final Exam", 94, 100, "Exceptional frontend & backend integration"),
                    ("Object-Oriented Programming (Java)", "Midterm Exam", 89, 100, "Clean architecture & design patterns"),
                    ("Discrete Mathematics", "Internal Test", 82, 100, "Strong proof formulation")
                ],
                "attendance": [
                    ("2024-10-21", "Present"),
                    ("2024-10-22", "Present"),
                    ("2024-10-23", "Absent"),
                    ("2024-10-24", "Present"),
                    ("2024-10-25", "Present"),
                    ("2024-10-26", "Present")
                ],
                "fees": [
                    ("INV-2024-003", "Semester 3 Tuition Fee", "Fall 2024", 42000, 20000, "Partial", "2024-11-30")
                ]
            },
            {
                "student_id": "SMS-2024-003",
                "name": "Rohan Deshmukh",
                "email": "rohan.deshmukh@campus.edu",
                "phone": "+91 98765 12003",
                "department": "Mechanical Engineering",
                "year": "4th Year",
                "gender": "Male",
                "dob": "2002-11-05",
                "status": "Active",
                "address": "78 Shivaji Nagar, Pune",
                "marks": [
                    ("Thermodynamics & Heat Transfer", "Final Exam", 78, 100, "Good conceptual understanding"),
                    ("Fluid Mechanics", "Midterm Exam", 74, 100, "Consistent performance"),
                    ("Computer Aided Design (CAD)", "Practical Lab", 88, 100, "Innovative 3D assembly design")
                ],
                "attendance": [
                    ("2024-10-21", "Present"),
                    ("2024-10-22", "Absent"),
                    ("2024-10-23", "Absent"),
                    ("2024-10-24", "Present"),
                    ("2024-10-25", "Absent"),
                    ("2024-10-26", "Present")
                ],
                "fees": [
                    ("INV-2024-004", "Semester 7 Tuition Fee", "Fall 2024", 48000, 0, "Pending", "2024-12-15")
                ]
            },
            {
                "student_id": "SMS-2024-004",
                "name": "Ananya Mukherjee",
                "email": "ananya.m@campus.edu",
                "phone": "+91 98765 12004",
                "department": "Electronics & Communication",
                "year": "3rd Year",
                "gender": "Female",
                "dob": "2003-01-30",
                "status": "Active",
                "address": "55 Salt Lake Sector V, Kolkata",
                "marks": [
                    ("Digital Signal Processing", "Midterm Exam", 91, 100, "Top scorer in filter design"),
                    ("Microcontrollers & Embedded Systems", "Practical Lab", 96, 100, "Flawless ARM assembly programming"),
                    ("VLSI Design", "Assignment", 87, 100, "Very clean layout analysis")
                ],
                "attendance": [
                    ("2024-10-21", "Present"),
                    ("2024-10-22", "Present"),
                    ("2024-10-23", "Present"),
                    ("2024-10-24", "Present"),
                    ("2024-10-25", "Present"),
                    ("2024-10-26", "Present")
                ],
                "fees": [
                    ("INV-2024-005", "Semester 5 Tuition Fee", "Fall 2024", 45000, 45000, "Paid", "2024-09-10")
                ]
            },
            {
                "student_id": "SMS-2024-005",
                "name": "Kabir Verma",
                "email": "kabir.verma@campus.edu",
                "phone": "+91 98765 12005",
                "department": "Civil Engineering",
                "year": "1st Year",
                "gender": "Male",
                "dob": "2005-06-18",
                "status": "Active",
                "address": "19 Civil Lines, Jaipur",
                "marks": [
                    ("Engineering Mechanics", "Internal Test", 72, 100, "Needs more practice on truss vectors"),
                    ("Building Materials & Construction", "Midterm Exam", 79, 100, "Good field report evaluation"),
                    ("Environmental Studies", "Assignment", 85, 100, "Very detailed sustainability case study")
                ],
                "attendance": [
                    ("2024-10-21", "Present"),
                    ("2024-10-22", "Present"),
                    ("2024-10-23", "Present"),
                    ("2024-10-24", "Present"),
                    ("2024-10-25", "Present"),
                    ("2024-10-26", "Present")
                ],
                "fees": [
                    ("INV-2024-006", "Semester 1 Tuition Fee", "Fall 2024", 38000, 38000, "Paid", "2024-08-25")
                ]
            }
        ]

        def get_grade_info(percentage):
            if percentage >= 90: return 'A+', 4.0
            if percentage >= 80: return 'A', 3.7
            if percentage >= 75: return 'B+', 3.3
            if percentage >= 70: return 'B', 3.0
            if percentage >= 60: return 'C', 2.0
            if percentage >= 50: return 'D', 1.0
            return 'F', 0.0

        created_count = 0
        for sdata in sample_students:
            student, created = Student.objects.get_or_create(
                student_id=sdata['student_id'],
                defaults={
                    'name': sdata['name'],
                    'email': sdata['email'],
                    'phone': sdata['phone'],
                    'department': sdata['department'],
                    'department_ref': dept_map.get(sdata['department']),
                    'year': sdata['year'],
                    'gender': sdata['gender'],
                    'dob': sdata.get('dob'),
                    'status': sdata['status'],
                    'address': sdata['address']
                }
            )
            if created:
                created_count += 1

            # Enroll in matched department course if available
            for ctitle, cobj in course_map.items():
                if cobj.department and cobj.department.name == sdata['department']:
                    CourseEnrollment.objects.get_or_create(student=student, course=cobj, defaults={'status': 'Active'})

            # Marks
            for subject, exam_type, obtained, max_m, remarks in sdata.get('marks', []):
                pct = round((obtained / max_m) * 100.0, 1)
                grd, gpa_val = get_grade_info(pct)
                c_rel = course_map.get(subject)
                GradeRecord.objects.get_or_create(
                    student=student,
                    subject=subject,
                    exam_type=exam_type,
                    defaults={
                        'marks_obtained': obtained,
                        'max_marks': max_m,
                        'percentage': pct,
                        'grade': grd,
                        'gpa': gpa_val,
                        'exam_date': date(2024, 10, 15),
                        'remarks': remarks,
                        'course': c_rel
                    }
                )

            # Attendance
            for dt_str, att_status in sdata.get('attendance', []):
                Attendance.objects.get_or_create(
                    student=student,
                    date=datetime.strptime(dt_str, "%Y-%m-%d").date(),
                    defaults={'status': att_status, 'remarks': f"Regular {att_status}"}
                )

            # Fees
            for inv_no, ftitle, aterm, tot_amt, pd_amt, fstat, ddate in sdata.get('fees', []):
                inv, _ = FeeInvoice.objects.get_or_create(
                    invoice_no=inv_no,
                    defaults={
                        'student': student,
                        'title': ftitle,
                        'academic_term': aterm,
                        'total_amount': tot_amt,
                        'paid_amount': pd_amt,
                        'status': fstat,
                        'due_date': datetime.strptime(ddate, "%Y-%m-%d").date()
                    }
                )
                if pd_amt > 0:
                    FeePayment.objects.get_or_create(
                        invoice=inv,
                        amount=pd_amt,
                        defaults={
                            'payment_date': datetime.strptime(ddate, "%Y-%m-%d").date(),
                            'payment_method': 'Net Banking',
                            'transaction_id': f"TXN-{inv_no}",
                            'notes': 'Online settlement'
                        }
                    )

        return Response({
            "message": f"Successfully seeded demo database with {len(sample_students)} students, faculty accounts, departments, courses, marks, attendance, and fee invoices."
        })
