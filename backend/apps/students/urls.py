from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet, StudentStatsView, 
    ExportStudentsCSVView, ClearAllStudentsView, SeedDemoDataView
)

router = DefaultRouter()
router.register(r'', StudentViewSet, basename='student')

urlpatterns = [
    path('stats/', StudentStatsView.as_view(), name='student-stats'),
    path('export-csv/', ExportStudentsCSVView.as_view(), name='student-export-csv'),
    path('clear-all/', ClearAllStudentsView.as_view(), name='student-clear-all'),
    path('seed-demo/', SeedDemoDataView.as_view(), name='student-seed-demo'),
    path('', include(router.urls)),
]
