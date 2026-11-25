from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'phone', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'full_name', 'role', 'phone', 'password']
        extra_kwargs = {
            'username': {'required': False},
            'full_name': {'required': True},
        }

    def create(self, validated_data):
        email = validated_data.get('email')
        username = validated_data.get('username') or email.split('@')[0]
        # ensure unique username
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
            
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            role=validated_data.get('role', 'teacher'),
            phone=validated_data.get('phone', '')
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
