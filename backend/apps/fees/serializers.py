from rest_framework import serializers
from .models import FeeInvoice, FeePayment

class FeePaymentSerializer(serializers.ModelSerializer):
    invoice_no = serializers.CharField(source='invoice.invoice_no', read_only=True)
    student_name = serializers.CharField(source='invoice.student.name', read_only=True)

    class Meta:
        model = FeePayment
        fields = [
            'id', 'invoice', 'invoice_no', 'student_name', 
            'amount', 'payment_date', 'payment_method', 
            'transaction_id', 'notes', 'created_at'
        ]

class FeeInvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    department = serializers.CharField(source='student.department', read_only=True)
    balance_amount = serializers.ReadOnlyField()
    payments = FeePaymentSerializer(many=True, read_only=True)

    class Meta:
        model = FeeInvoice
        fields = [
            'id', 'student', 'student_name', 'student_id_code', 
            'department', 'invoice_no', 'title', 'academic_term', 
            'total_amount', 'paid_amount', 'balance_amount', 
            'due_date', 'status', 'payments', 'created_at'
        ]
