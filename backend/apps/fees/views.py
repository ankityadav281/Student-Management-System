from rest_framework import viewsets, permissions, filters, status, views
from rest_framework.response import Response
from .models import FeeInvoice, FeePayment
from .serializers import FeeInvoiceSerializer, FeePaymentSerializer

class FeeInvoiceViewSet(viewsets.ModelViewSet):
    queryset = FeeInvoice.objects.select_related('student').prefetch_related('payments').all()
    serializer_class = FeeInvoiceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['invoice_no', 'title', 'student__name', 'student__student_id', 'status']
    ordering_fields = ['due_date', 'total_amount', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        status_param = self.request.query_params.get('status')
        term = self.request.query_params.get('term')

        if student_id:
            qs = qs.filter(student_id=student_id)
        if status_param and status_param != 'All':
            qs = qs.filter(status=status_param)
        if term and term != 'All':
            qs = qs.filter(academic_term=term)
        return qs

class FeePaymentViewSet(viewsets.ModelViewSet):
    queryset = FeePayment.objects.select_related('invoice', 'invoice__student').all()
    serializer_class = FeePaymentSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['transaction_id', 'invoice__invoice_no', 'invoice__student__name']
    ordering_fields = ['payment_date', 'amount']

    def get_queryset(self):
        qs = super().get_queryset()
        invoice_id = self.request.query_params.get('invoice')
        if invoice_id:
            qs = qs.filter(invoice_id=invoice_id)
        return qs

class FeeSummaryView(views.APIView):
    """Returns overall financial overview for tuition and fee management."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        invoices = FeeInvoice.objects.all()
        total_invoiced = sum(float(inv.total_amount) for inv in invoices)
        total_collected = sum(float(inv.paid_amount) for inv in invoices)
        total_outstanding = max(0.0, total_invoiced - total_collected)

        status_counts = {}
        for inv in invoices:
            status_counts[inv.status] = status_counts.get(inv.status, 0) + 1

        return Response({
            'total_invoices': invoices.count(),
            'total_invoiced': round(total_invoiced, 2),
            'total_collected': round(total_collected, 2),
            'total_outstanding': round(total_outstanding, 2),
            'collection_rate': round((total_collected / total_invoiced * 100), 1) if total_invoiced > 0 else 0.0,
            'status_breakdown': status_counts
        })
