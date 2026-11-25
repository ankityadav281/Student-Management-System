from django.db import models
from apps.departments.models import Department
from apps.teachers.models import Teacher

class Course(models.Model):
    code = models.CharField(max_length=30, unique=True)
    title = models.CharField(max_length=200)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    credits = models.IntegerField(default=3)
    semester = models.CharField(max_length=50, blank=True, default='Semester 1')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_courses')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.title}"

    class Meta:
        ordering = ['code']

class CourseEnrollment(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Completed', 'Completed'),
        ('Dropped', 'Dropped'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='course_enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    class Meta:
        unique_together = ('course', 'student')
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.student} -> {self.course}"
