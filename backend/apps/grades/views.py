from datetime import datetime
from rest_framework import viewsets, permissions, filters, status, views
from rest_framework.response import Response
from .models import GradeRecord, calculate_grade_and_gpa
from .serializers import GradeRecordSerializer
from apps.students.models import Student

class GradeRecordViewSet(viewsets.ModelViewSet):
    queryset = GradeRecord.objects.select_related('student', 'course').all()
    serializer_class = GradeRecordSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__name', 'student__student_id', 'subject', 'exam_type', 'grade']
    ordering_fields = ['exam_date', 'percentage', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        course_id = self.request.query_params.get('course')
        exam_type = self.request.query_params.get('exam_type')

        if student_id:
            qs = qs.filter(student_id=student_id)
        if course_id:
            qs = qs.filter(course_id=course_id)
        if exam_type:
            qs = qs.filter(exam_type=exam_type)
        return qs

class ReportCardView(views.APIView):
    """Generates official academic report card with GPA, course results, and evaluation."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, student_id):
        if str(student_id).isdigit():
            student = Student.objects.filter(id=int(student_id)).first()
        else:
            student = Student.objects.filter(student_id=student_id).first()
            
        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        records = student.grade_records.all().order_by('-exam_date')
        if not records.exists():
            return Response({
                'student': {
                    'id': student.id,
                    'student_id': student.student_id,
                    'name': student.name,
                    'department': student.department,
                    'year': student.year
                },
                'records': [],
                'cumulative_percentage': 0.0,
                'cgpa': 0.0,
                'overall_grade': 'N/A',
                'status': 'No Records Available'
            })

        total_pct = sum(r.percentage for r in records)
        avg_pct = round(total_pct / len(records), 1)
        avg_gpa = round(sum(r.gpa for r in records) / len(records), 2)
        overall_grade, _ = calculate_grade_and_gpa(avg_pct)
        passed = avg_pct >= 50.0

        return Response({
            'student': {
                'id': student.id,
                'student_id': student.student_id,
                'name': student.name,
                'email': student.email,
                'department': student.department,
                'year': student.year,
                'status': student.status
            },
            'records': GradeRecordSerializer(records, many=True).data,
            'summary': {
                'total_exams': len(records),
                'cumulative_percentage': avg_pct,
                'cgpa': avg_gpa,
                'overall_grade': overall_grade,
                'result_status': 'PASS' if passed else 'FAIL',
                'attendance_pct': student.attendance_pct,
                'generated_at': datetime.now().isoformat()
            }
        })
