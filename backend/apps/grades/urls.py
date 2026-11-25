from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GradeRecordViewSet, ReportCardView

router = DefaultRouter()
router.register(r'', GradeRecordViewSet, basename='grade-record')

urlpatterns = [
    path('report-card/<str:student_id>/', ReportCardView.as_view(), name='report-card'),
    path('', include(router.urls)),
]
