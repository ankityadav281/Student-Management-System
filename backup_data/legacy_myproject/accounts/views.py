import csv
import json
from functools import wraps
from datetime import datetime, date
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib import messages
from .mongo import (
    create_user,
    authenticate_user,
    check_mongo_connection,
    get_all_students,
    get_student_by_id,
    create_student,
    update_student,
    delete_student,
    add_student_mark,
    get_student_marks,
    delete_student_mark,
    record_attendance,
    get_student_attendance,
    get_student_stats,
    get_dashboard_summary,
    seed_sample_students_if_empty,
    seed_default_faculty_user,
    clear_all_student_data
)

def get_current_user(request):
    """Retrieve logged-in user dictionary from session, or None if unauthenticated."""
    user_id = request.session.get('user_id')
    if not user_id:
        return None
    role = request.session.get('role', 'Teacher')
    if role not in ['Academic Coordinator', 'Teacher']:
        role = 'Teacher'
    return {
        'id': user_id,
        'full_name': request.session.get('user_name', 'User'),
        'email': request.session.get('user_email', ''),
        'role': role,
    }

def login_required_session(view_func):
    """
    Decorator enforcing that a user must be registered and logged in
    before accessing the Student Directory or any administrative actions.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        current_user = get_current_user(request)
        if not current_user:
            messages.warning(request, "Access restricted. Please register or sign in to access the Student Directory.")
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def coordinator_required(view_func):
    """
    Enforce that only Academic Coordinators can perform the action
    (e.g., adding a student, updating student details, or deleting a student).
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        current_user = get_current_user(request)
        if not current_user:
            messages.warning(request, "Access restricted. Please register or sign in.")
            return redirect('login')
        if current_user.get('role') != 'Academic Coordinator':
            is_json = request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json'
            if is_json:
                return JsonResponse({
                    'success': False,
                    'error': 'Access Denied: Only Academic Coordinators can add, update, or delete student profiles.'
                }, status=403)
            messages.error(request, "Access Denied: Only Academic Coordinators can add, update, or delete student records.")
            if 'student_id' in kwargs:
                return redirect('student_detail', student_id=kwargs['student_id'])
            return redirect('dashboard')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def teacher_required(view_func):
    """
    Enforce that only Teachers can record or manage student marks and attendance.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        current_user = get_current_user(request)
        if not current_user:
            messages.warning(request, "Access restricted. Please register or sign in.")
            return redirect('login')
        if current_user.get('role') != 'Teacher':
            is_json = request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json'
            if is_json:
                return JsonResponse({
                    'success': False,
                    'error': 'Access Denied: Only Teachers can record or manage marks and attendance.'
                }, status=403)
            messages.error(request, "Access Denied: Only Teachers can record or manage student marks and attendance.")
            if 'student_id' in kwargs:
                return redirect('student_detail', student_id=kwargs['student_id'])
            return redirect('dashboard')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def home_view(request):
    """
    Public overview & landing page for the Student Management System.
    """
    seed_default_faculty_user()

    current_user = get_current_user(request)
    mongo_ok = check_mongo_connection()
    stats = get_dashboard_summary()

    return render(request, 'accounts/home.html', {
        'current_user': current_user,
        'mongo_ok': mongo_ok,
        'stats': stats,
        'active_nav': 'home',
    })

@ensure_csrf_cookie
def login_view(request):
    """
    Faculty login portal. Authenticates user against registered credentials in database.
    """
    # Ensure default faculty exists if database is new
    seed_default_faculty_user()

    current_user = get_current_user(request)
    if current_user:
        return redirect('dashboard')

    error_message = None
    email_val = ''

    if request.method == 'POST':
        is_json = request.content_type == 'application/json'
        if is_json:
            try:
                data = json.loads(request.body)
            except Exception:
                data = {}
            email = data.get('email', '')
            password = data.get('password', '')
        else:
            email = request.POST.get('email', '')
            password = request.POST.get('password', '')

        email_val = email
        user = authenticate_user(email, password)

        if user:
            # Session assignment on genuine authentication
            user_role = user.get('role', 'Teacher')
            if user_role not in ['Academic Coordinator', 'Teacher']:
                user_role = 'Teacher'
            request.session['user_id'] = user['id']
            request.session['user_name'] = user['full_name']
            request.session['user_email'] = user['email']
            request.session['role'] = user_role
            request.session.set_expiry(30 * 86400)

            messages.success(request, f"Welcome back, {user['full_name']}!")

            if is_json:
                return JsonResponse({
                    'success': True,
                    'message': 'Login successful!',
                    'redirect_url': '/dashboard/',
                    'user': user
                })
            return redirect('dashboard')
        else:
            error_message = "Invalid institutional email or password. Please verify your credentials or register an account."
            if is_json:
                return JsonResponse({'success': False, 'error': error_message}, status=401)

    return render(request, 'accounts/login.html', {
        'error': error_message,
        'email_val': email_val,
        'active_tab': 'login',
    })

@ensure_csrf_cookie
def signup_view(request):
    """
    Faculty/Staff registration view.
    Creates user record and logs them in immediately upon registration.
    """
    current_user = get_current_user(request)
    if current_user:
        return redirect('dashboard')

    error_message = None
    full_name_val = ''
    email_val = ''

    if request.method == 'POST':
        is_json = request.content_type == 'application/json'
        if is_json:
            try:
                data = json.loads(request.body)
            except Exception:
                data = {}
            full_name = data.get('full_name', '')
            email = data.get('email', '')
            password = data.get('password', '')
            role = data.get('role', 'Teacher').strip()
        else:
            full_name = request.POST.get('full_name', '')
            email = request.POST.get('email', '')
            password = request.POST.get('password', '')
            role = request.POST.get('role', 'Teacher').strip()

        if role not in ['Academic Coordinator', 'Teacher']:
            role = 'Teacher'

        full_name_val = full_name
        email_val = email

        try:
            new_user = create_user(
                full_name=full_name,
                email=email,
                password=password,
                role=role
            )
            # Log in automatically on successful registration
            reg_role = new_user.get('role', 'Teacher')
            if reg_role not in ['Academic Coordinator', 'Teacher']:
                reg_role = 'Teacher'
            request.session['user_id'] = str(new_user.get('_id') or new_user.get('id'))
            request.session['user_name'] = new_user['full_name']
            request.session['user_email'] = new_user['email']
            request.session['role'] = reg_role
            request.session.set_expiry(30 * 86400)

            messages.success(request, f"Registration successful! Welcome to the Student Directory, {new_user['full_name']}.")

            if is_json:
                return JsonResponse({
                    'success': True,
                    'message': 'Account created successfully!',
                    'redirect_url': '/dashboard/'
                })
            return redirect('dashboard')

        except ValueError as ex:
            error_message = str(ex)
            if is_json:
                return JsonResponse({'success': False, 'error': error_message}, status=400)
        except Exception as ex:
            error_message = f"Registration error: {str(ex)}"
            if is_json:
                return JsonResponse({'success': False, 'error': error_message}, status=500)

    return render(request, 'accounts/signup.html', {
        'error': error_message,
        'full_name_val': full_name_val,
        'email_val': email_val,
        'active_tab': 'signup',
    })

def logout_view(request):
    """Clears user session and redirects to login."""
    request.session.flush()
    messages.info(request, "You have been logged out successfully.")
    return redirect('login')

# ==========================================
# Student Management Dashboard Views (Protected)
# ==========================================

@login_required_session
def dashboard_view(request):
    """
    Main Student Management System Dashboard:
    Accessible ONLY after register and login.
    """
    current_user = get_current_user(request)

    search_query = request.GET.get('q', '').strip()
    selected_dept = request.GET.get('dept', 'All').strip()
    selected_status = request.GET.get('status', 'All').strip()

    students = get_all_students(
        query=search_query,
        department=selected_dept,
        status=selected_status
    )
    stats = get_dashboard_summary()
    mongo_healthy = check_mongo_connection()

    departments = [
        "Computer Science",
        "Information Technology",
        "Mechanical Engineering",
        "Electronics & Communication",
        "Civil Engineering",
        "Electrical Engineering",
        "Business Administration"
    ]

    return render(request, 'accounts/dashboard.html', {
        'current_user': current_user,
        'students': students,
        'stats': stats,
        'departments': departments,
        'search_query': search_query,
        'selected_dept': selected_dept,
        'selected_status': selected_status,
        'mongo_healthy': mongo_healthy,
        'today_date': date.today().isoformat(),
        'active_nav': 'dashboard'
    })

@login_required_session
def student_detail_view(request, student_id):
    """
    Deep-dive profile page for a student:
    Accessible ONLY after register and login.
    """
    student = get_student_by_id(student_id)
    if not student:
        messages.error(request, f"Student '{student_id}' not found.")
        return redirect('dashboard')

    current_user = get_current_user(request)
    marks = get_student_marks(student_id)
    attendance = get_student_attendance(student_id)
    stats = get_student_stats(student_id)
    mongo_healthy = check_mongo_connection()

    return render(request, 'accounts/student_detail.html', {
        'current_user': current_user,
        'student': student,
        'marks': marks,
        'attendance': attendance,
        'stats': stats,
        'mongo_healthy': mongo_healthy,
        'today_date': date.today().isoformat()
    })

# ==========================================
# Student CRUD Action Handlers (Protected)
# ==========================================

@login_required_session
@coordinator_required
def add_student_view(request):
    """Handle adding a new student record."""
    if request.method == 'POST':
        is_json = request.content_type == 'application/json'
        if is_json:
            try:
                data = json.loads(request.body)
            except Exception:
                data = {}
        else:
            data = request.POST

        student_id = data.get('student_id', '').strip()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        department = data.get('department', 'Computer Science').strip()
        year = data.get('year', '1st Year').strip()
        gender = data.get('gender', 'Male').strip()
        dob = data.get('dob', '').strip()
        status = data.get('status', 'Active').strip()
        address = data.get('address', '').strip()

        try:
            new_student = create_student(
                student_id=student_id,
                name=name,
                email=email,
                phone=phone,
                department=department,
                year=year,
                gender=gender,
                dob=dob,
                status=status,
                address=address
            )

            if is_json:
                return JsonResponse({'success': True, 'message': f"Student '{name}' added successfully!", 'student': new_student})
            messages.success(request, f"Student '{name}' ({student_id}) has been added successfully.")
            return redirect('dashboard')

        except ValueError as e:
            if is_json:
                return JsonResponse({'success': False, 'error': str(e)}, status=400)
            messages.error(request, str(e))
            return redirect('dashboard')
        except Exception as e:
            if is_json:
                return JsonResponse({'success': False, 'error': f"Error creating student: {str(e)}"}, status=500)
            messages.error(request, f"Failed to add student: {str(e)}")
            return redirect('dashboard')

    return redirect('dashboard')

@login_required_session
@coordinator_required
def update_student_view(request, student_id):
    """Handle updating an existing student."""
    if request.method == 'POST':
        is_json = request.content_type == 'application/json'
        if is_json:
            try:
                data = json.loads(request.body)
            except Exception:
                data = {}
        else:
            data = request.POST

        update_data = {
            'name': data.get('name', '').strip(),
            'email': data.get('email', '').strip(),
            'phone': data.get('phone', '').strip(),
            'department': data.get('department', 'Computer Science').strip(),
            'year': data.get('year', '1st Year').strip(),
            'gender': data.get('gender', 'Male').strip(),
            'dob': data.get('dob', '').strip(),
            'status': data.get('status', 'Active').strip(),
            'address': data.get('address', '').strip(),
        }

        update_data = {k: v for k, v in update_data.items() if v}

        try:
            updated = update_student(student_id, update_data)
            if not updated:
                if is_json:
                    return JsonResponse({'success': False, 'error': 'Student not found.'}, status=404)
                messages.error(request, "Student not found.")
                return redirect('dashboard')

            if is_json:
                return JsonResponse({'success': True, 'message': 'Student updated successfully!', 'student': updated})
            messages.success(request, f"Student record for '{student_id}' updated successfully.")
            
            if 'from_detail' in request.POST or 'from_detail' in data:
                return redirect('student_detail', student_id=student_id)
            return redirect('dashboard')

        except Exception as e:
            if is_json:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
            messages.error(request, f"Update failed: {str(e)}")
            return redirect('dashboard')

    return redirect('dashboard')

@login_required_session
@coordinator_required
def delete_student_view(request, student_id):
    """Handle deleting a student record and all related data."""
    if request.method in ['POST', 'GET']:
        success = delete_student(student_id)
        is_json = request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json'

        if success:
            if is_json:
                return JsonResponse({'success': True, 'message': f"Student '{student_id}' deleted."})
            messages.success(request, f"Student record '{student_id}' and all associated marks/attendance were deleted.")
        else:
            if is_json:
                return JsonResponse({'success': False, 'error': "Student not found or deletion failed."}, status=404)
            messages.error(request, f"Could not delete student '{student_id}'. Record not found.")

        return redirect('dashboard')

# ==========================================
# Marks & Attendance Action Handlers (Protected)
# ==========================================

@login_required_session
@teacher_required
def add_marks_view(request, student_id):
    """Store subject marks for a student."""
    if request.method == 'POST':
        is_json = request.content_type == 'application/json'
        if is_json:
            try:
                data = json.loads(request.body)
            except Exception:
                data = {}
        else:
            data = request.POST

        subject = data.get('subject', '').strip()
        exam_type = data.get('exam_type', 'Midterm Exam').strip()
        score = data.get('score', 0)
        max_score = data.get('max_score', 100)
        remarks = data.get('remarks', '').strip()
        exam_date = data.get('exam_date', '').strip()

        try:
            mark = add_student_mark(
                student_id=student_id,
                subject=subject,
                exam_type=exam_type,
                score=score,
                max_score=max_score,
                remarks=remarks,
                exam_date=exam_date
            )

            if is_json:
                return JsonResponse({'success': True, 'message': f"Marks recorded for {subject}!", 'mark': mark})
            messages.success(request, f"Recorded marks for {student_id}: {subject} ({score}/{max_score}).")
            
            if 'from_detail' in request.POST or 'student/' in request.META.get('HTTP_REFERER', ''):
                return redirect('student_detail', student_id=student_id)
            return redirect('dashboard')

        except ValueError as e:
            if is_json:
                return JsonResponse({'success': False, 'error': str(e)}, status=400)
            messages.error(request, str(e))
        except Exception as e:
            if is_json:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
            messages.error(request, f"Failed to record marks: {str(e)}")

    return redirect('student_detail', student_id=student_id)

@login_required_session
@teacher_required
def delete_marks_view(request, mark_id):
    """Delete a marks record."""
    student_id = request.GET.get('student_id', '')
    delete_student_mark(mark_id)
    messages.success(request, "Mark record removed.")
    if student_id:
        return redirect('student_detail', student_id=student_id)
    return redirect('dashboard')

@login_required_session
@teacher_required
def record_attendance_view(request, student_id):
    """Store an attendance record for a student."""
    if request.method == 'POST':
        is_json = request.content_type == 'application/json'
        if is_json:
            try:
                data = json.loads(request.body)
            except Exception:
                data = {}
        else:
            data = request.POST

        att_date = data.get('attendance_date', '').strip() or date.today().isoformat()
        status = data.get('status', 'Present').strip()
        session_title = data.get('session_title', 'Regular Session').strip()
        notes = data.get('notes', '').strip()

        try:
            record_attendance(
                student_id=student_id,
                attendance_date=att_date,
                status=status,
                session_title=session_title,
                notes=notes
            )
            if is_json:
                return JsonResponse({'success': True, 'message': f"Attendance marked as {status}!"})
            messages.success(request, f"Attendance marked as '{status}' for {student_id} on {att_date}.")
            
            if 'from_detail' in request.POST or 'student/' in request.META.get('HTTP_REFERER', ''):
                return redirect('student_detail', student_id=student_id)
            return redirect('dashboard')

        except Exception as e:
            if is_json:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
            messages.error(request, f"Attendance recording failed: {str(e)}")

    return redirect('dashboard')

@login_required_session
@teacher_required
def quick_batch_attendance_view(request):
    """Record batch attendance for multiple students at once."""
    if request.method == 'POST':
        att_date = request.POST.get('batch_date', date.today().isoformat())
        session_title = request.POST.get('batch_session', 'Morning Roll Call')
        all_students = get_all_students()

        recorded_count = 0
        for student in all_students:
            sid = student.get('student_id')
            field_name = f"status_{sid}"
            status = request.POST.get(field_name, 'Present')
            record_attendance(
                student_id=sid,
                attendance_date=att_date,
                status=status,
                session_title=session_title,
                notes="Batch roll call"
            )
            recorded_count += 1

        messages.success(request, f"Batch attendance recorded for {recorded_count} students on {att_date}.")
        return redirect('dashboard')

    return redirect('dashboard')

@login_required_session
def seed_demo_data_view(request):
    """Seed or reseed demo students."""
    seed_sample_students_if_empty()
    messages.success(request, "Sample student records, marks, and attendance loaded successfully!")
    return redirect('dashboard')

@login_required_session
@coordinator_required
def clear_all_students_view(request):
    """Wipe all student records for a clean slate."""
    clear_all_student_data()
    messages.success(request, "All student records have been cleared. Directory is now clean and empty.")
    return redirect('dashboard')

@login_required_session
def export_students_csv(request):
    """Export all student records with marks and attendance stats to CSV."""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="students_report_{date.today().isoformat()}.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'Student ID', 'Full Name', 'Email', 'Phone', 'Department',
        'Year', 'Gender', 'Status', 'Attendance Rate (%)',
        'Average Marks (%)', 'Overall Grade'
    ])

    students = get_all_students()
    for s in students:
        writer.writerow([
            s.get('student_id', ''),
            s.get('name', ''),
            s.get('email', ''),
            s.get('phone', ''),
            s.get('department', ''),
            s.get('year', ''),
            s.get('gender', ''),
            s.get('status', ''),
            s.get('attendance_pct', 0.0),
            s.get('average_marks', 0.0),
            s.get('overall_grade', 'N/A')
        ])

    return response

def api_status(request):
    """API endpoint to check server & database status."""
    healthy = check_mongo_connection()
    stats = get_dashboard_summary()
    return JsonResponse({
        'status': 'online',
        'application': 'Student Management System',
        'database': {
            'engine': 'MongoDB' if healthy else 'Local Storage Fallback',
            'connected': healthy,
            'database_name': 'student_management_db'
        },
        'system_stats': stats
    })
