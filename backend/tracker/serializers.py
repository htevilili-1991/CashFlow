from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction, Category, Envelope


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
    spent_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
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
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
