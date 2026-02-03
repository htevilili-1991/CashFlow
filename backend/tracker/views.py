from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.db.models import Sum, Q, F
from django.utils import timezone
from django.db import transaction
from datetime import datetime, timedelta
from .models import Transaction, Category, Envelope
from .serializers import (
    UserSerializer, TransactionSerializer, 
    CategorySerializer, BalanceSerializer, EnvelopeSerializer
)


class RegisterView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EnvelopeViewSet(viewsets.ModelViewSet):
    serializer_class = EnvelopeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Envelope.objects.filter(user=self.request.user).select_related('category')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get envelope summary statistics"""
        envelopes = self.get_queryset()
        
        total_budgeted = sum(envelope.budgeted_amount for envelope in envelopes)
        total_spent = sum(envelope.spent_amount for envelope in envelopes)
        total_remaining = sum(envelope.remaining_amount for envelope in envelopes)
        
        over_budget_count = sum(1 for envelope in envelopes if envelope.is_over_budget)
        near_limit_count = sum(1 for envelope in envelopes if envelope.is_near_limit and not envelope.is_over_budget)
        
        return Response({
            'total_envelopes': envelopes.count(),
            'total_budgeted': total_budgeted,
            'total_spent': total_spent,
            'total_remaining': total_remaining,
            'over_budget_count': over_budget_count,
            'near_limit_count': near_limit_count,
            'envelopes': EnvelopeSerializer(envelopes, many=True, context={'request': request}).data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def balance_view(request):
    user = request.user
    transactions = Transaction.objects.filter(user=user)
    
    # Total calculations
    total_income = transactions.filter(transaction_type='income').aggregate(
        total=Sum('amount'))['total'] or 0
    total_expenses = transactions.filter(transaction_type='expense').aggregate(
        total=Sum('amount'))['total'] or 0
    balance = total_income - total_expenses
    
    # Monthly calculations
    current_month = timezone.now().replace(day=1)
    monthly_transactions = transactions.filter(date__gte=current_month)
    monthly_income = monthly_transactions.filter(transaction_type='income').aggregate(
        total=Sum('amount'))['total'] or 0
    monthly_expenses = monthly_transactions.filter(transaction_type='expense').aggregate(
        total=Sum('amount'))['total'] or 0

    data = {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'balance': balance,
        'monthly_income': monthly_income,
        'monthly_expenses': monthly_expenses,
    }

    serializer = BalanceSerializer(data)
    return Response(serializer.data)
