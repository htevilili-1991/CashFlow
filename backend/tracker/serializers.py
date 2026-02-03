from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction, Category, Envelope, SavingsGoal, RecurringTransaction
from django.utils import timezone
from django.db.models import Sum

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ('user',)

    def validate(self, data):
        """Validate that category belongs to the user and transaction_type is valid"""
        if 'transaction_type' in data and data['transaction_type'] not in ['income', 'expense']:
            raise serializers.ValidationError("Transaction type must be 'income' or 'expense'.")
        return data


class EnvelopeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    spent_amount = serializers.IntegerField(read_only=True)
    remaining_amount = serializers.IntegerField(read_only=True)
    percentage_used = serializers.FloatField(read_only=True)
    is_over_budget = serializers.BooleanField(read_only=True)
    is_near_limit = serializers.BooleanField(read_only=True)

    class Meta:
        model = Envelope
        fields = '__all__'
        read_only_fields = ('user',)

    def validate_budgeted_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budgeted amount must be positive.")
        return value

    def validate(self, data):
        """Validate that category belongs to the user"""
        if 'category' in data:
            user = self.context['request'].user
            if data['category'].user != user:
                raise serializers.ValidationError("Category must belong to the current user.")
        return data


class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    envelope_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def get_envelope_remaining(self, obj):
        """Get remaining amount in envelope for this transaction's category"""
        if obj.transaction_type == 'expense':
            try:
                envelope = Envelope.objects.get(user=obj.user, category__name=obj.category)
                return float(envelope.remaining_amount)
            except Envelope.DoesNotExist:
                return None
        return None

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value

    def validate(self, data):
        """Validate envelope budget for expense transactions"""
        user = self.context['request'].user
        category_name = data.get('category')
        transaction_type = data.get('transaction_type')
        amount = data.get('amount')

        if transaction_type == 'expense' and category_name:
            try:
                category = Category.objects.get(user=user, name=category_name)
                envelope = Envelope.objects.get(user=user, category=category)
                
                # Check if this is an update operation
                if self.instance:
                    # For updates, we need to consider the original amount
                    original_amount = self.instance.amount
                    amount_difference = amount - original_amount
                    if envelope.remaining_amount - amount_difference < 0:
                        raise serializers.ValidationError({
                            'amount': f'Not enough money left in {category_name} envelope. Available: VT {envelope.remaining_amount}'
                        })
                else:
                    # For new transactions
                    if envelope.remaining_amount - amount < 0:
                        raise serializers.ValidationError({
                            'amount': f'Not enough money left in {category_name} envelope. Available: VT {envelope.remaining_amount}'
                        })
            except Category.DoesNotExist:
                # No category means no envelope validation needed
                pass
            except Envelope.DoesNotExist:
                # No envelope for this category, no validation needed
                pass

        return data


class BalanceSerializer(serializers.Serializer):
    total_income = serializers.IntegerField()
    total_expenses = serializers.IntegerField()
    balance = serializers.IntegerField()
    monthly_income = serializers.IntegerField()
    monthly_expenses = serializers.IntegerField()


class SavingsGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.FloatField(read_only=True)
    remaining_amount = serializers.IntegerField(read_only=True)  # Changed from DecimalField to IntegerField

    class Meta:
        model = SavingsGoal
        fields = '__all__'
        read_only_fields = ('user', 'is_completed', 'created_at', 'updated_at')

    def validate(self, data):
        """Validate target amount and target date"""
        if data.get('target_amount', 0) <= 0:
            raise serializers.ValidationError("Target amount must be greater than 0.")
        
        target_date = data.get('target_date')
        if target_date and target_date <= timezone.now().date():
            raise serializers.ValidationError("Target date must be in the future.")
        
        return data


class RecurringTransactionSerializer(serializers.ModelSerializer):
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_next = serializers.IntegerField(read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = RecurringTransaction
        fields = '__all__'
        read_only_fields = ('user', 'count_created', 'created_at', 'updated_at', 'last_created')

    def validate(self, data):
        """Validate recurring transaction data"""
        if data.get('amount', 0) <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if end_date and start_date and end_date <= start_date:
            raise serializers.ValidationError("End date must be after start date.")
        
        if start_date and start_date < timezone.now().date():
            raise serializers.ValidationError("Start date cannot be in the past.")
        
        return data

    def create(self, validated_data):
        """Create recurring transaction and set next occurrence"""
        # Set next_occurrence to start_date if not provided
        if 'next_occurrence' not in validated_data:
            validated_data['next_occurrence'] = validated_data['start_date']
        
        return super().create(validated_data)
