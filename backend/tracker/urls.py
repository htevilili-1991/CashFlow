from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    TransactionViewSet, CategoryViewSet, EnvelopeViewSet, RegisterView, 
    balance_view, income_view, monthly_rollover_view, SavingsGoalViewSet, 
    RecurringTransactionViewSet, monthly_report, yearly_report, 
    comparison_report, export_data
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'envelopes', EnvelopeViewSet, basename='envelope')
router.register(r'savings-goals', SavingsGoalViewSet, basename='savings_goal')
router.register(r'recurring-transactions', RecurringTransactionViewSet, basename='recurring_transaction')
router.register(r'register', RegisterView, basename='register')

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('balance/', balance_view, name='balance'),
    path('income/', income_view, name='income'),
    path('monthly-rollover/', monthly_rollover_view, name='monthly_rollover'),
    path('reports/monthly/', monthly_report, name='monthly_report'),
    path('reports/yearly/', yearly_report, name='yearly_report'),
    path('reports/comparison/', comparison_report, name='comparison_report'),
    path('export/', export_data, name='export_data'),
    path('', include(router.urls)),
]
