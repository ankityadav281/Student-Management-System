from django.db import models
from apps.students.models import Student
from apps.courses.models import Course

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Excused', 'Excused'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    remarks = models.CharField(max_length=255, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date', 'course')
        ordering = ['-date', 'student__name']

    def __str__(self):
        return f"{self.student.name} - {self.date}: {self.status}"
