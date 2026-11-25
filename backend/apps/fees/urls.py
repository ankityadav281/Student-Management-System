from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeInvoiceViewSet, FeePaymentViewSet, FeeSummaryView

router = DefaultRouter()
router.register(r'invoices', FeeInvoiceViewSet, basename='fee-invoice')
router.register(r'payments', FeePaymentViewSet, basename='fee-payment')

urlpatterns = [
    path('summary/', FeeSummaryView.as_view(), name='fee-summary'),
    path('', include(router.urls)),
]
