import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Academic Coordinator / Admin'),
        ('teacher', 'Teacher / Faculty'),
        ('student', 'Student'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='teacher')
    phone = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']

    def __str__(self):
        return f"{self.full_name or self.username} ({self.get_role_display()})"
    
    @property
    def is_coordinator_or_admin(self):
        return self.role in ['admin', 'Academic Coordinator'] or self.is_superuser or self.is_staff

    @property
    def is_teacher_role(self):
        return self.role == 'teacher'

    @property
    def is_student_role(self):
        return self.role == 'student'
