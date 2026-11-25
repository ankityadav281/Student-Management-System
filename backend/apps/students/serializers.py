from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    attendance_pct = serializers.ReadOnlyField()
    average_marks = serializers.ReadOnlyField()
    total_attendance_records = serializers.ReadOnlyField()
    present_count = serializers.ReadOnlyField()
    marks_count = serializers.ReadOnlyField()
    at_risk = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'name', 'email', 'phone', 
            'department', 'year', 'gender', 'dob', 'status', 
            'address', 'attendance_pct', 'average_marks', 
            'total_attendance_records', 'present_count', 
            'marks_count', 'at_risk', 'created_at', 'updated_at'
        ]

class StudentDetailSerializer(StudentSerializer):
    marks = serializers.SerializerMethodField()
    attendance = serializers.SerializerMethodField()
    courses = serializers.SerializerMethodField()
    fees = serializers.SerializerMethodField()

    class Meta(StudentSerializer.Meta):
        fields = StudentSerializer.Meta.fields + ['marks', 'attendance', 'courses', 'fees']

    def get_marks(self, obj):
        from apps.grades.serializers import GradeRecordSerializer
        return GradeRecordSerializer(obj.grade_records.all(), many=True).data

    def get_attendance(self, obj):
        from apps.attendance.serializers import AttendanceSerializer
        return AttendanceSerializer(obj.attendance_records.all()[:50], many=True).data

    def get_courses(self, obj):
        from apps.courses.serializers import CourseEnrollmentSerializer
        return CourseEnrollmentSerializer(obj.course_enrollments.all(), many=True).data

    def get_fees(self, obj):
        from apps.fees.serializers import FeeInvoiceSerializer
        return FeeInvoiceSerializer(obj.fee_invoices.all(), many=True).data
