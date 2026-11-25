from django.urls import path
from . import views

urlpatterns = [
    # Navigation & Auth
    path('', views.home_view, name='home'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_view, name='dashboard'),

    # Student Management CRUD
    path('student/add/', views.add_student_view, name='add_student'),
    path('student/<str:student_id>/', views.student_detail_view, name='student_detail'),
    path('student/<str:student_id>/update/', views.update_student_view, name='update_student'),
    path('student/<str:student_id>/delete/', views.delete_student_view, name='delete_student'),

    # Marks Management
    path('student/<str:student_id>/marks/add/', views.add_marks_view, name='add_marks'),
    path('marks/<str:mark_id>/delete/', views.delete_marks_view, name='delete_marks'),

    # Attendance Management
    path('student/<str:student_id>/attendance/record/', views.record_attendance_view, name='record_attendance'),
    path('attendance/batch/', views.quick_batch_attendance_view, name='quick_batch_attendance'),

    # Utilities & Reports
    path('seed-demo/', views.seed_demo_data_view, name='seed_demo_data'),
    path('students/clear/', views.clear_all_students_view, name='clear_all_students'),
    path('export/csv/', views.export_students_csv, name='export_students_csv'),
    path('api/status/', views.api_status, name='api_status'),
]
