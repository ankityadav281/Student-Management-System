from django.contrib.auth import authenticate
from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower().strip()
        password = serializer.validated_data['password']

        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            if not user.is_active:
                return Response({'error': 'Account is disabled.'}, status=status.HTTP_403_FORBIDDEN)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': f"Welcome back, {user.full_name or user.username}!"
            })
        return Response({'error': 'Invalid email or password credentials.'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Account registered successfully.'
        }, status=status.HTTP_201_CREATED)

class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = UserSerializer(request.user).data
        return Response({
            **user_data,
            'user': user_data
        })

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'user': serializer.data,
            'message': 'Profile updated successfully.'
        })

class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Logged out successfully.'})

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs
