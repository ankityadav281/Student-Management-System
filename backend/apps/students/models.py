from django.db import models
from django.conf import settings
from apps.departments.models import Department

class Student(models.Model):
    YEAR_CHOICES = (
        ('1st Year', '1st Year'),
        ('2nd Year', '2nd Year'),
        ('3rd Year', '3rd Year'),
        ('4th Year', '4th Year'),
    )
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Graduated', 'Graduated'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_profile')
    student_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    department = models.CharField(max_length=100, default='Computer Science')
    department_ref = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    year = models.CharField(max_length=30, choices=YEAR_CHOICES, default='1st Year')
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='Male')
    dob = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.student_id})"

    class Meta:
        ordering = ['-created_at']

    @property
    def total_attendance_records(self):
        return self.attendance_records.count()

    @property
    def present_count(self):
        return self.attendance_records.filter(status__in=['Present', 'Late']).count()

    @property
    def attendance_pct(self):
        total = self.total_attendance_records
        if total == 0:
            return 0.0
        return round((self.present_count / total) * 100.0, 1)

    @property
    def marks_count(self):
        return self.grade_records.count()

    @property
    def average_marks(self):
        marks = self.grade_records.all()
        if not marks.exists():
            return 0.0
        total_pct = sum(m.percentage for m in marks)
        return round(total_pct / len(marks), 1)

    @property
    def at_risk(self):
        has_att = self.total_attendance_records > 0
        has_marks = self.marks_count > 0
        att_bad = has_att and self.attendance_pct < 75.0
        marks_bad = has_marks and self.average_marks < 50.0
        return att_bad or marks_bad
