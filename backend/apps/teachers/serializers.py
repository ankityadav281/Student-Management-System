from rest_framework import serializers
from .models import Teacher
from apps.departments.models import Department

class TeacherSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    course_count = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = [
            'id', 'teacher_id', 'name', 'email', 'phone', 
            'department', 'department_name', 'designation', 
            'qualification', 'joining_date', 'course_count', 'created_at'
        ]

    def get_course_count(self, obj):
        return obj.assigned_courses.count() if hasattr(obj, 'assigned_courses') else 0
