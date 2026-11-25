from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "name": "Student Management System API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "auth": "/api/auth/",
            "departments": "/api/departments/",
            "teachers": "/api/teachers/",
            "courses": "/api/courses/",
            "students": "/api/students/",
            "attendance": "/api/attendance/",
            "grades": "/api/grades/",
            "fees": "/api/fees/",
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api_root'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/teachers/', include('apps.teachers.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/grades/', include('apps.grades.urls')),
    path('api/fees/', include('apps.fees.urls')),
]
