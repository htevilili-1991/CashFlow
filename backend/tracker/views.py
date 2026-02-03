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

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({
            'request': self.request,
        })
        return context


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def income_view(request):
    """Get total income and allocated amounts for envelope budgeting"""
    user = request.user
    
    # Get total income (excluding income allocations to avoid double counting)
    total_income = Transaction.objects.filter(
        user=user, 
        transaction_type='income'
    ).exclude(
        category='Income Allocation'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Get total allocated to envelopes
    total_allocated = Envelope.objects.filter(user=user).aggregate(
        total=Sum('budgeted_amount')
    )['total'] or 0
    
    # Calculate available income
    available_income = total_income - total_allocated
    
    data = {
        'total_income': total_income,
        'total_allocated': total_allocated,
        'available_income': available_income,
    }
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def monthly_rollover_view(request):
    """Perform monthly envelope rollover - carry over underspent amounts and reset overspent"""
    user = request.user
    rollover_data = request.data
    
    # Get rollover settings from request
    carry_over_underspent = rollover_data.get('carry_over_underspent', True)
    reset_overspent = rollover_data.get('reset_overspent', True)
    
    updated_envelopes = []
    
    for envelope in Envelope.objects.filter(user=user):
        current_budget = float(envelope.budgeted_amount)
        spent_amount = float(envelope.spent_amount)
        remaining = current_budget - spent_amount
        
        new_budget = current_budget
        
        if remaining > 0 and carry_over_underspent:
            # Carry over underspent amount
            new_budget = spent_amount  # Reset to spent amount, remaining becomes new budget
        elif remaining < 0 and reset_overspent:
            # Reset overspent envelopes to 0
            new_budget = 0
        else:
            # Keep current budget
            new_budget = current_budget
        
        if new_budget != current_budget:
            envelope.budgeted_amount = new_budget
            envelope.save()
            updated_envelopes.append({
                'id': envelope.id,
                'category_name': envelope.category.name,
                'old_budget': current_budget,
                'new_budget': new_budget,
                'remaining': remaining
            })
    
    return Response({
        'message': 'Monthly rollover completed',
        'updated_envelopes': updated_envelopes,
        'settings_used': {
            'carry_over_underspent': carry_over_underspent,
            'reset_overspent': reset_overspent
        }
    })
