from django.db import models

class Department(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    head_name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        ordering = ['name']
