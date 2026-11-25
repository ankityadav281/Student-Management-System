import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.students.models import Student

def test_full_flow():
    client = APIClient()
    print("==========================================")
    print("STARTING FULL END-TO-END VERIFICATION")
    print("==========================================")

    # 1. API Root
    res = client.get('/api/')
    assert res.status_code == 200, f"API Root failed: {res.status_code}"
    print("[PASS] 1. API Root (/api/) -> 200 OK")

    # 2. Login as Academic Coordinator / Admin
    res = client.post('/api/auth/login/', {'email': 'admin@campus.edu', 'password': 'Password@123'}, format='json')
    assert res.status_code == 200, f"Admin login failed: {res.data}"
    admin_token = res.data['token']
    assert res.data['user']['role'] in ['admin', 'Academic Coordinator']
    print(f"[PASS] 2. Admin Login -> 200 OK (Token: {admin_token[:8]}...)")

    client.credentials(HTTP_AUTHORIZATION='Token ' + admin_token)

    # 3. Check /api/auth/me/
    res = client.get('/api/auth/me/')
    assert res.status_code == 200
    assert res.data['email'] == 'admin@campus.edu'
    print("[PASS] 3. Auth Profile Check (/api/auth/me/) -> 200 OK")

    # 4. Departments
    res = client.get('/api/departments/')
    assert res.status_code == 200
    print(f"[PASS] 4. Departments list -> {len(res.data)} departments found")

    # 5. Teachers
    res = client.get('/api/teachers/')
    assert res.status_code == 200
    print(f"[PASS] 5. Teachers list -> {len(res.data)} teachers found")

    # 6. Courses
    res = client.get('/api/courses/')
    assert res.status_code == 200
    print(f"[PASS] 6. Courses list -> {len(res.data)} courses found")

    # 7. Students & Stats
    res = client.get('/api/students/')
    assert res.status_code == 200
    students_count = len(res.data)
    print(f"[PASS] 7. Students list -> {students_count} students found")

    res = client.get('/api/students/stats/')
    assert res.status_code == 200
    stats = res.data
    print(f"[PASS] 8. Academic Stats -> Total: {stats.get('total_students')}, Avg Att: {stats.get('average_attendance')}%, Avg Marks: {stats.get('class_average_marks')}%")

    # 8. Attendance & Batch recording
    res = client.get('/api/attendance/')
    assert res.status_code == 200
    print(f"[PASS] 9. Attendance records -> {len(res.data)} records")

    sample_student = Student.objects.filter(student_id='SMS-2024-001').first() or Student.objects.first()
    res = client.post('/api/attendance/batch/', {
        'date': '2026-11-25',
        'records': [
            {'student_id': sample_student.student_id, 'status': 'Present', 'remarks': 'Verified on time'}
        ]
    }, format='json')
    assert res.status_code in [200, 201], f"Batch attendance failed: {res.data}"
    print(f"[PASS] 10. Batch Attendance recorded -> {res.data}")

    # 9. Grades & Report Card
    res = client.get('/api/grades/')
    assert res.status_code == 200
    print(f"[PASS] 11. Grades records -> {len(res.data)} records")

    res = client.get(f'/api/grades/report-card/{sample_student.student_id}/')
    assert res.status_code == 200
    report_summary = res.data.get('summary', {})
    print(f"[PASS] 12. Report Card for {sample_student.student_id} -> CGPA: {report_summary.get('cgpa')}, Grade: {report_summary.get('overall_grade')}, Status: {report_summary.get('result_status')}")

    # 10. Fees & Summary
    res = client.get('/api/fees/invoices/')
    assert res.status_code == 200
    print(f"[PASS] 13. Fee Invoices -> {len(res.data)} invoices found")

    res = client.get('/api/fees/summary/')
    assert res.status_code == 200
    print(f"[PASS] 14. Fee Summary -> Invoiced: ₹{res.data.get('total_invoiced')}, Collected: ₹{res.data.get('total_collected')}, Outstanding: ₹{res.data.get('total_outstanding')}")

    # 11. Student User Test
    client.credentials() # Clear token
    res = client.post('/api/auth/login/', {'email': 'student@campus.edu', 'password': 'Password@123'}, format='json')
    assert res.status_code == 200
    student_token = res.data['token']
    client.credentials(HTTP_AUTHORIZATION='Token ' + student_token)

    res = client.get(f'/api/grades/report-card/{sample_student.student_id}/')
    assert res.status_code == 200
    print(f"[PASS] 15. Student portal accessed their report card successfully -> 200 OK")

    print("==========================================")
    print("ALL 15 INTEGRATION TEST CASES PASSED 100%!")
    print("==========================================")

if __name__ == '__main__':
    test_full_flow()
