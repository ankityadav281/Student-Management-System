from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, BatchAttendanceView

router = DefaultRouter()
router.register(r'', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('batch/', BatchAttendanceView.as_view(), name='batch-attendance'),
    path('', include(router.urls)),
]
