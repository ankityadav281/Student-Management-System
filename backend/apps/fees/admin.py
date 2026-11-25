from django.contrib import admin
from .models import FeeInvoice, FeePayment

@admin.register(FeeInvoice)
class FeeInvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_no', 'student', 'title', 'total_amount', 'paid_amount', 'status', 'due_date')
    list_filter = ('status', 'academic_term')
    search_fields = ('invoice_no', 'title', 'student__name', 'student__student_id')

@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'amount', 'payment_method', 'payment_date', 'transaction_id')
    list_filter = ('payment_method', 'payment_date')
    search_fields = ('transaction_id', 'invoice__invoice_no')
