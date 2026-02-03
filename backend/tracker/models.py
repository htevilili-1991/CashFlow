from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal


class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ['name', 'user']

    def __str__(self):
        return self.name


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
