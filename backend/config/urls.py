from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse, HttpResponse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = BASE_DIR.parent / 'frontend' / 'dist'

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

def serve_react(request):
    index_file = FRONTEND_DIST / 'index.html'
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return api_root(request)

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
    re_path(r'^(?!api|admin|static).*$', serve_react, name='react_frontend'),
]
