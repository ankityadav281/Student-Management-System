from rest_framework import viewsets, permissions, filters
from .models import Department
from .serializers import DepartmentSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'head_name']
    ordering_fields = ['name', 'code', 'created_at']
