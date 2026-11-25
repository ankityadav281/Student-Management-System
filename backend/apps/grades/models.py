from django.db import models
from apps.students.models import Student
from apps.courses.models import Course

def calculate_grade_and_gpa(percentage):
    if percentage >= 90:
        return 'A+', 4.0
    elif percentage >= 80:
        return 'A', 3.7
    elif percentage >= 75:
        return 'B+', 3.3
    elif percentage >= 70:
        return 'B', 3.0
    elif percentage >= 60:
        return 'C', 2.0
    elif percentage >= 50:
        return 'D', 1.0
    else:
        return 'F', 0.0

class GradeRecord(models.Model):
    EXAM_CHOICES = (
        ('Midterm Exam', 'Midterm Exam'),
        ('Final Exam', 'Final Exam'),
        ('Practical Lab', 'Practical Lab'),
        ('Assignment', 'Assignment'),
        ('Internal Test', 'Internal Test'),
        ('Quiz', 'Quiz'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grade_records')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='grade_records')
    subject = models.CharField(max_length=150)
    exam_type = models.CharField(max_length=50, choices=EXAM_CHOICES, default='Midterm Exam')
    marks_obtained = models.FloatField()
    max_marks = models.FloatField(default=100.0)
    percentage = models.FloatField(blank=True)
    grade = models.CharField(max_length=10, blank=True)
    gpa = models.FloatField(default=0.0)
    exam_date = models.DateField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.max_marks > 0:
            self.percentage = round((self.marks_obtained / self.max_marks) * 100.0, 1)
        else:
            self.percentage = 0.0
        grd, gpa_val = calculate_grade_and_gpa(self.percentage)
        self.grade = grd
        self.gpa = gpa_val
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-exam_date', '-created_at']

    def __str__(self):
        return f"{self.student.name} - {self.subject} ({self.grade})"
