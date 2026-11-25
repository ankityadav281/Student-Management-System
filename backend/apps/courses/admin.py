from django.contrib import admin
from .models import Course, CourseEnrollment

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'department', 'teacher', 'credits', 'semester')
    list_filter = ('department', 'semester')
    search_fields = ('code', 'title')

@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'status', 'enrolled_at')
    list_filter = ('status', 'course')
    search_fields = ('student__name', 'student__student_id', 'course__code')
