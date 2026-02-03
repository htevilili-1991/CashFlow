from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.db.models import Sum, Q, F, Count
from django.utils import timezone
from django.db import transaction
from datetime import datetime, timedelta
from .models import Transaction, Category, Envelope, SavingsGoal, RecurringTransaction
from .serializers import (
    UserSerializer, TransactionSerializer, 
    CategorySerializer, BalanceSerializer, EnvelopeSerializer, SavingsGoalSerializer, RecurringTransactionSerializer
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


class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def contribute(self, request, pk=None):
        """Add contribution to a savings goal"""
        goal = self.get_object()
        amount = Decimal(request.data.get('amount', 0))
        
        if amount <= 0:
            return Response(
                {'error': 'Contribution amount must be positive'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update goal current amount
        goal.current_amount += amount
        goal.save()
        
        # Create a transaction record for the contribution
        Transaction.objects.create(
            user=request.user,
            description=f"Contribution to {goal.name}",
            amount=amount,
            category='Savings Goal',
            transaction_type='expense',
            date=timezone.now().date()
        )
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)


class RecurringTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecurringTransaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def create_transaction(self, request, pk=None):
        """Create an actual transaction from this recurring template"""
        recurring = self.get_object()
        
        try:
            transaction = recurring.create_transaction()
            serializer = TransactionSerializer(transaction)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def skip_next(self, request, pk=None):
        """Skip the next occurrence and move to the following one"""
        recurring = self.get_object()
        
        next_date = recurring.calculate_next_occurrence()
        if next_date:
            recurring.next_occurrence = next_date
            recurring.save()
            serializer = self.get_serializer(recurring)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'No more occurrences to skip'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming recurring transactions for the next 30 days"""
        from datetime import date, timedelta
        
        end_date = date.today() + timedelta(days=30)
        upcoming = self.get_queryset().filter(
            next_occurrence__lte=end_date,
            status='active'
        ).order_by('next_occurrence')
        
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue recurring transactions"""
        overdue = self.get_queryset().filter(
            next_occurrence__lt=date.today(),
            status='active'
        ).order_by('next_occurrence')
        
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def process_overdue(self, request):
        """Process all overdue recurring transactions"""
        from datetime import date
        
        overdue = self.get_queryset().filter(
            next_occurrence__lt=date.today(),
            status='active'
        )
        
        created_transactions = []
        for recurring in overdue:
            try:
                transaction = recurring.create_transaction()
                created_transactions.append(TransactionSerializer(transaction).data)
            except Exception as e:
                continue  # Skip problematic transactions
        
        return Response({
            'message': f'Processed {len(created_transactions)} overdue transactions',
            'transactions': created_transactions
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_report(request):
    """Generate monthly financial report"""
    year = int(request.GET.get('year', timezone.now().year))
    month = int(request.GET.get('month', timezone.now().month))
    
    # Get all transactions for the month
    transactions = Transaction.objects.filter(
        user=request.user,
        date__year=year,
        date__month=month
    ).order_by('date')
    
    # Calculate totals
    income = transactions.filter(transaction_type='income').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    expenses = transactions.filter(transaction_type='expense').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    net = income - expenses
    
    # Category breakdown
    category_breakdown = transactions.filter(transaction_type='expense').values('category').annotate(
        amount=Sum('amount'),
        count=Count('id')
    ).order_by('-amount')
    
    # Daily breakdown
    daily_breakdown = []
    for day in range(1, 32):
        try:
            date = timezone.datetime(year, month, day).date()
            day_income = transactions.filter(
                date=date, transaction_type='income'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            day_expenses = transactions.filter(
                date=date, transaction_type='expense'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            daily_breakdown.append({
                'date': date.isoformat(),
                'income': float(day_income),
                'expenses': float(day_expenses),
                'net': float(day_income - day_expenses)
            })
        except ValueError:
            break  # Invalid date for this month
    
    # Envelope performance
    envelopes = Envelope.objects.filter(user=request.user)
    envelope_performance = []
    for envelope in envelopes:
        spent = transactions.filter(category=envelope.category.name).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        envelope_performance.append({
            'category': envelope.category.name,
            'budgeted': float(envelope.budgeted_amount),
            'spent': float(spent),
            'remaining': float(envelope.budgeted_amount - spent),
            'percentage': float((spent / envelope.budgeted_amount * 100) if envelope.budgeted_amount > 0 else 0)
        })
    
    return Response({
        'period': {
            'year': year,
            'month': month,
            'month_name': timezone.datetime(year, month, 1).strftime('%B %Y')
        },
        'summary': {
            'income': float(income),
            'expenses': float(expenses),
            'net': float(net),
            'transaction_count': transactions.count()
        },
        'category_breakdown': [
            {
                'category': item['category'],
                'amount': float(item['amount']),
                'count': item['count'],
                'percentage': float((item['amount'] / expenses * 100) if expenses > 0 else 0)
            }
            for item in category_breakdown
        ],
        'daily_breakdown': daily_breakdown,
        'envelope_performance': envelope_performance
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def yearly_report(request):
    """Generate yearly financial report"""
    year = int(request.GET.get('year', timezone.now().year))
    
    # Get all transactions for the year
    transactions = Transaction.objects.filter(
        user=request.user,
        date__year=year
    ).order_by('date')
    
    # Monthly breakdown
    monthly_breakdown = []
    for month in range(1, 13):
        month_transactions = transactions.filter(date__month=month)
        
        income = month_transactions.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        expenses = month_transactions.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        monthly_breakdown.append({
            'month': month,
            'month_name': timezone.datetime(year, month, 1).strftime('%B'),
            'income': float(income),
            'expenses': float(expenses),
            'net': float(income - expenses),
            'transaction_count': month_transactions.count()
        })
    
    # Category trends
    category_trends = {}
    for transaction in transactions.filter(transaction_type='expense'):
        category = transaction.category
        if category not in category_trends:
            category_trends[category] = {}
        
        month = transaction.date.month
        if month not in category_trends[category]:
            category_trends[category][month] = 0
        category_trends[category][month] += float(transaction.amount)
    
    # Convert to list format
    category_trend_data = []
    for category, monthly_data in category_trends.items():
        trend_data = {'category': category}
        for month in range(1, 13):
            trend_data[f'month_{month}'] = monthly_data.get(month, 0)
        category_trend_data.append(trend_data)
    
    # Top categories
    top_categories = transactions.filter(transaction_type='expense').values('category').annotate(
        total=Sum('amount')
    ).order_by('-total')[:10]
    
    return Response({
        'period': {
            'year': year
        },
        'summary': {
            'total_income': float(transactions.filter(transaction_type='income').aggregate(total=Sum('amount'))['total'] or 0),
            'total_expenses': float(transactions.filter(transaction_type='expense').aggregate(total=Sum('amount'))['total'] or 0),
            'total_net': float(
                (transactions.filter(transaction_type='income').aggregate(total=Sum('amount'))['total'] or 0) -
                (transactions.filter(transaction_type='expense').aggregate(total=Sum('amount'))['total'] or 0)
            ),
            'transaction_count': transactions.count()
        },
        'monthly_breakdown': monthly_breakdown,
        'category_trends': category_trend_data,
        'top_categories': [
            {
                'category': item['category'],
                'total': float(item['total'])
            }
            for item in top_categories
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def comparison_report(request):
    """Compare current period with previous period"""
    period_type = request.GET.get('type', 'monthly')  # monthly or yearly
    current_date = timezone.now()
    
    if period_type == 'monthly':
        # Current month
        current_year = current_date.year
        current_month = current_date.month
        
        # Previous month
        if current_month == 1:
            prev_year = current_year - 1
            prev_month = 12
        else:
            prev_year = current_year
            prev_month = current_month - 1
        
        # Get data for both periods
        current_transactions = Transaction.objects.filter(
            user=request.user,
            date__year=current_year,
            date__month=current_month
        )
        
        prev_transactions = Transaction.objects.filter(
            user=request.user,
            date__year=prev_year,
            date__month=prev_month
        )
        
        current_period = f"{current_year}-{current_month:02d}"
        prev_period = f"{prev_year}-{prev_month:02d}"
        
    else:  # yearly
        current_year = current_date.year
        prev_year = current_year - 1
        
        current_transactions = Transaction.objects.filter(
            user=request.user,
            date__year=current_year
        )
        
        prev_transactions = Transaction.objects.filter(
            user=request.user,
            date__year=prev_year
        )
        
        current_period = str(current_year)
        prev_period = str(prev_year)
    
    def calculate_period_stats(transactions):
        income = transactions.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        expenses = transactions.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        return {
            'income': float(income),
            'expenses': float(expenses),
            'net': float(income - expenses),
            'transaction_count': transactions.count()
        }
    
    current_stats = calculate_period_stats(current_transactions)
    prev_stats = calculate_period_stats(prev_transactions)
    
    # Calculate percentage changes
    def calculate_change(current, previous):
        if previous == 0:
            return 0 if current == 0 else 100
        return ((current - previous) / previous) * 100
    
    # Category comparison
    current_categories = current_transactions.filter(transaction_type='expense').values('category').annotate(
        total=Sum('amount')
    )
    
    prev_categories = prev_transactions.filter(transaction_type='expense').values('category').annotate(
        total=Sum('amount')
    )
    
    category_comparison = {}
    for cat in current_categories:
        category = cat['category']
        current_amount = float(cat['total'])
        prev_amount = 0
        
        for prev_cat in prev_categories:
            if prev_cat['category'] == category:
                prev_amount = float(prev_cat['total'])
                break
        
        category_comparison[category] = {
            'current': current_amount,
            'previous': prev_amount,
            'change': calculate_change(current_amount, prev_amount)
        }
    
    return Response({
        'period_type': period_type,
        'current_period': current_period,
        'previous_period': prev_period,
        'current_stats': current_stats,
        'previous_stats': prev_stats,
        'changes': {
            'income_change': calculate_change(current_stats['income'], prev_stats['income']),
            'expenses_change': calculate_change(current_stats['expenses'], prev_stats['expenses']),
            'net_change': calculate_change(current_stats['net'], prev_stats['net']),
            'transaction_count_change': calculate_change(current_stats['transaction_count'], prev_stats['transaction_count'])
        },
        'category_comparison': category_comparison
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_data(request):
    """Export transaction data in various formats"""
    export_format = request.GET.get('format', 'csv')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    transactions = Transaction.objects.filter(user=request.user)
    
    if start_date:
        transactions = transactions.filter(date__gte=start_date)
    if end_date:
        transactions = transactions.filter(date__lte=end_date)
    
    transactions = transactions.order_by('-date')
    
    if export_format == 'csv':
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="transactions_{timezone.now().date()}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Description', 'Category', 'Amount', 'Type'])
        
        for transaction in transactions:
            writer.writerow([
                transaction.date,
                transaction.description,
                transaction.category,
                transaction.amount,
                transaction.transaction_type
            ])
        
        return response
    
    elif export_format == 'json':
        from django.http import JsonResponse
        
        data = []
        for transaction in transactions:
            data.append({
                'date': transaction.date.isoformat(),
                'description': transaction.description,
                'category': transaction.category,
                'amount': float(transaction.amount),
                'type': transaction.transaction_type
            })
        
        return JsonResponse(data, safe=False)
    
    else:
        return Response({'error': 'Unsupported format'}, status=400)
