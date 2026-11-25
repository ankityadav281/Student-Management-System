from django.contrib import admin
from .models import GradeRecord

@admin.register(GradeRecord)
class GradeRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'exam_type', 'marks_obtained', 'max_marks', 'percentage', 'grade', 'gpa')
    list_filter = ('exam_type', 'grade')
    search_fields = ('student__name', 'student__student_id', 'subject')
