from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'name', 'email', 'department', 'year', 'status', 'attendance_pct', 'average_marks')
    list_filter = ('department', 'year', 'status', 'gender')
    search_fields = ('name', 'student_id', 'email')
