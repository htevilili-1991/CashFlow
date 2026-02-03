from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal


class Category(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, default='expense')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ['name', 'user', 'transaction_type']

    def __str__(self):
        return f"{self.name} ({self.get_transaction_type_display()})"


class Envelope(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='envelopes')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='envelopes')
    budgeted_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'category']

    def __str__(self):
        return f"{self.user.username} - {self.category.name}: VT {self.budgeted_amount}"

    @property
    def spent_amount(self):
        """Calculate total spent from this envelope"""
        from django.db.models import Sum
        return Transaction.objects.filter(
            user=self.user,
            category=self.category.name,
            transaction_type='expense'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    @property
    def remaining_amount(self):
        """Calculate remaining amount in envelope"""
        return self.budgeted_amount - self.spent_amount

    @property
    def percentage_used(self):
        """Calculate percentage of budget used"""
        if self.budgeted_amount == 0:
            return 0
        return float((self.spent_amount / self.budgeted_amount) * 100)

    @property
    def is_over_budget(self):
        """Check if envelope is over budget"""
        return self.remaining_amount < 0

    @property
    def is_near_limit(self):
        """Check if envelope is near limit (80% or more used)"""
        return self.percentage_used >= 80


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type}: {self.amount}"

    @property
    def is_income(self):
        return self.transaction_type == 'income'

    @property
    def is_expense(self):
        return self.transaction_type == 'expense'


class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    target_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.current_amount}/{self.target_amount}"

    @property
    def progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return (self.current_amount / self.target_amount) * 100

    @property
    def remaining_amount(self):
        return self.target_amount - self.current_amount

    def save(self, *args, **kwargs):
        # Auto-mark as completed if target reached
        if self.current_amount >= self.target_amount and not self.is_completed:
            self.is_completed = True
        elif self.current_amount < self.target_amount and self.is_completed:
            self.is_completed = False
        super().save(*args, **kwargs)


class RecurringTransaction(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
        ('bimonthly', 'Bi-monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_transactions')
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100)
    transaction_type = models.CharField(max_length=10, choices=Transaction.TRANSACTION_TYPES)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_occurrence = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    count_created = models.PositiveIntegerField(default=0)
    max_occurrences = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_created = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['next_occurrence']
        verbose_name = "Recurring Transaction"
        verbose_name_plural = "Recurring Transactions"

    def __str__(self):
        return f"{self.name} - {self.get_frequency_display()} ({self.transaction_type})"

    def calculate_next_occurrence(self):
        """Calculate the next occurrence date based on frequency"""
        from datetime import timedelta, date
        import calendar

        current = self.next_occurrence or self.start_date
        
        if self.frequency == 'daily':
            next_date = current + timedelta(days=1)
        elif self.frequency == 'weekly':
            next_date = current + timedelta(weeks=1)
        elif self.frequency == 'biweekly':
            next_date = current + timedelta(weeks=2)
        elif self.frequency == 'monthly':
            # Add one month, handling month length variations
            year = current.year
            month = current.month + 1
            if month > 12:
                month = 1
                year += 1
            day = min(current.day, calendar.monthrange(year, month)[1])
            next_date = date(year, month, day)
        elif self.frequency == 'bimonthly':
            # Add two months
            year = current.year
            month = current.month + 2
            if month > 12:
                month = month - 12
                year += 1
            day = min(current.day, calendar.monthrange(year, month)[1])
            next_date = date(year, month, day)
        elif self.frequency == 'quarterly':
            # Add three months
            year = current.year
            month = current.month + 3
            if month > 12:
                month = month - 12
                year += 1
            day = min(current.day, calendar.monthrange(year, month)[1])
            next_date = date(year, month, day)
        elif self.frequency == 'yearly':
            # Add one year
            next_date = date(current.year + 1, current.month, current.day)
        else:
            next_date = current

        # Check if we've reached the end date or max occurrences
        if self.end_date and next_date > self.end_date:
            return None
        if self.max_occurrences and self.count_created >= self.max_occurrences:
            return None

        return next_date

    def create_transaction(self):
        """Create an actual transaction from this recurring template"""
        transaction = Transaction.objects.create(
            user=self.user,
            description=f"{self.name} (Recurring)",
            amount=self.amount,
            category=self.category,
            transaction_type=self.transaction_type,
            date=self.next_occurrence,
        )
        
        # Update recurring transaction metadata
        self.count_created += 1
        self.last_created = timezone.now()
        
        # Calculate next occurrence
        next_date = self.calculate_next_occurrence()
        if next_date:
            self.next_occurrence = next_date
        else:
            # No more occurrences, mark as completed
            self.status = 'completed'
        
        self.save()
        return transaction

    @property
    def is_overdue(self):
        """Check if the next occurrence is past due"""
        from datetime import date
        return self.next_occurrence < date.today() and self.status == 'active'

    @property
    def days_until_next(self):
        """Calculate days until next occurrence"""
        from datetime import date
        delta = self.next_occurrence - date.today()
        return delta.days
