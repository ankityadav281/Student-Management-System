from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    department = serializers.CharField(source='student.department', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'student_id_code', 
            'department', 'course', 'course_title', 
            'date', 'status', 'remarks', 'recorded_at'
        ]
