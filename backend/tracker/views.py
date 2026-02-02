from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transaction, Category
from .serializers import (
    UserSerializer, TransactionSerializer, 
    CategorySerializer, BalanceSerializer
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
