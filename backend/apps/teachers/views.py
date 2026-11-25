from rest_framework import viewsets, permissions, filters
from .models import Teacher
from .serializers import TeacherSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related('department').all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'teacher_id', 'email', 'department__name', 'designation']
    ordering_fields = ['name', 'teacher_id', 'joining_date']

    def get_queryset(self):
        qs = super().get_queryset()
        dept_id = self.request.query_params.get('department')
        if dept_id:
            qs = qs.filter(department_id=dept_id)
        return qs
