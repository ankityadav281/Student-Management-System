from rest_framework import viewsets, permissions, filters, status, views
from rest_framework.response import Response
from .models import Attendance
from .serializers import AttendanceSerializer
from apps.students.models import Student

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('student', 'course').all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__name', 'student__student_id', 'date', 'status']
    ordering_fields = ['date', 'student__name']

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        date_param = self.request.query_params.get('date')
        course_id = self.request.query_params.get('course')
        status_param = self.request.query_params.get('status')

        if student_id:
            qs = qs.filter(student_id=student_id)
        if date_param:
            qs = qs.filter(date=date_param)
        if course_id:
            qs = qs.filter(course_id=course_id)
        if status_param and status_param != 'All':
            qs = qs.filter(status=status_param)
        return qs

class BatchAttendanceView(views.APIView):
    """Allows recording or updating attendance for an entire class at once."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        date_str = request.data.get('date')
        records = request.data.get('records', []) # list of {student_id, status, remarks}
        course_id = request.data.get('course_id')

        if not date_str or not records:
            return Response({'error': 'Date and records array are required.'}, status=status.HTTP_400_BAD_REQUEST)

        updated_count = 0
        created_count = 0

        for item in records:
            s_id = str(item.get('student_id', '')).strip()
            att_status = item.get('status', 'Present')
            remarks = item.get('remarks', '')

            student = None
            if s_id.isdigit():
                student = Student.objects.filter(id=int(s_id)).first()
            if not student:
                student = Student.objects.filter(student_id=s_id).first()
            if not student:
                continue

            obj, created = Attendance.objects.update_or_create(
                student=student,
                date=date_str,
                course_id=course_id if course_id else None,
                defaults={
                    'status': att_status,
                    'remarks': remarks
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        return Response({
            'message': f"Batch attendance saved. Created: {created_count}, Updated: {updated_count}",
            'date': date_str
        })
