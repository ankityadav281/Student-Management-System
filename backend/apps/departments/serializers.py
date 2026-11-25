from rest_framework import serializers
from .models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()
    course_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'code', 'name', 'description', 'head_name', 'student_count', 'teacher_count', 'course_count', 'created_at']

    def get_student_count(self, obj):
        return getattr(obj, 'students', []).count() if hasattr(obj, 'students') else 0

    def get_teacher_count(self, obj):
        return getattr(obj, 'teachers', []).count() if hasattr(obj, 'teachers') else 0

    def get_course_count(self, obj):
        return getattr(obj, 'courses', []).count() if hasattr(obj, 'courses') else 0
