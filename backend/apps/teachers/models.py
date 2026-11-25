from django.db import models
from django.conf import settings
from apps.departments.models import Department

class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='teacher_profile')
    teacher_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='teachers')
    designation = models.CharField(max_length=100, default='Assistant Professor')
    qualification = models.CharField(max_length=150, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.teacher_id}"

    class Meta:
        ordering = ['name']
