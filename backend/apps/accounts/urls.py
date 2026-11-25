from django.urls import path
from .views import LoginView, RegisterView, LogoutView, CurrentUserView, UserListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('users/', UserListView.as_view(), name='user_list'),
]
