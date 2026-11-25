from django.db import models
from apps.students.models import Student

class FeeInvoice(models.Model):
    STATUS_CHOICES = (
        ('Paid', 'Paid'),
        ('Partial', 'Partial'),
        ('Pending', 'Pending'),
        ('Overdue', 'Overdue'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fee_invoices')
    invoice_no = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=150)
    academic_term = models.CharField(max_length=50, default='Academic Year 2024-2025')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def balance_amount(self):
        return max(0.0, float(self.total_amount) - float(self.paid_amount))

    def update_status(self):
        paid = float(self.paid_amount)
        total = float(self.total_amount)
        if paid >= total:
            self.status = 'Paid'
        elif paid > 0:
            self.status = 'Partial'
        else:
            self.status = 'Pending'
        self.save()

    class Meta:
        ordering = ['-due_date', '-created_at']

    def __str__(self):
        return f"{self.invoice_no} - {self.student.name} ({self.status})"

class FeePayment(models.Model):
    METHOD_CHOICES = (
        ('Net Banking', 'Net Banking'),
        ('UPI', 'UPI'),
        ('Card', 'Credit / Debit Card'),
        ('Cash', 'Cash'),
        ('Cheque', 'Cheque / DD'),
    )

    invoice = models.ForeignKey(FeeInvoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=30, choices=METHOD_CHOICES, default='Net Banking')
    transaction_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate invoice paid amount
        total_paid = sum(p.amount for p in self.invoice.payments.all())
        self.invoice.paid_amount = total_paid
        self.invoice.update_status()

    class Meta:
        ordering = ['-payment_date', '-created_at']

    def __str__(self):
        return f"Payment {self.amount} for {self.invoice.invoice_no}"
