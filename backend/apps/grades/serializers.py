from rest_framework import serializers
from .models import GradeRecord

class GradeRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    percentage = serializers.ReadOnlyField()
    grade = serializers.ReadOnlyField()
    gpa = serializers.ReadOnlyField()

    class Meta:
        model = GradeRecord
        fields = [
            'id', 'student', 'student_name', 'student_id_code', 
            'course', 'subject', 'exam_type', 'marks_obtained', 
            'max_marks', 'percentage', 'grade', 'gpa', 
            'exam_date', 'remarks', 'created_at'
        ]
