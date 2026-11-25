from rest_framework import serializers
from .models import Course, CourseEnrollment

class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    enrolled_students_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'code', 'title', 'department', 'department_name', 
            'credits', 'semester', 'teacher', 'teacher_name', 
            'description', 'enrolled_students_count', 'created_at'
        ]

    def get_enrolled_students_count(self, obj):
        return obj.enrollments.count()

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)

    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'course', 'course_code', 'course_title', 
            'student', 'student_name', 'student_id_code', 
            'status', 'enrolled_at'
        ]
