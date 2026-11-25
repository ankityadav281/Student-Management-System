from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, CourseEnrollment
from .serializers import CourseSerializer, CourseEnrollmentSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('department', 'teacher').all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'title', 'department__name', 'teacher__name']
    ordering_fields = ['code', 'title', 'credits', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        dept_id = self.request.query_params.get('department')
        teacher_id = self.request.query_params.get('teacher')
        if dept_id:
            qs = qs.filter(department_id=dept_id)
        if teacher_id:
            qs = qs.filter(teacher_id=teacher_id)
        return qs

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        course = self.get_object()
        enrollments = course.enrollments.select_related('student').all()
        serializer = CourseEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = CourseEnrollment.objects.select_related('course', 'student').all()
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['student__name', 'student__student_id', 'course__code', 'course__title']

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        course_id = self.request.query_params.get('course')
        if student_id:
            qs = qs.filter(student_id=student_id)
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs
