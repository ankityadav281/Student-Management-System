from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, CourseEnrollmentViewSet

router = DefaultRouter()
router.register(r'enrollments', CourseEnrollmentViewSet, basename='course-enrollment')
router.register(r'', CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
]
