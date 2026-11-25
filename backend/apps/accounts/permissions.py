from rest_framework import permissions

class IsAdminOrCoordinator(permissions.BasePermission):
    """Allows access only to Admin / Academic Coordinator users."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.is_coordinator_or_admin or request.user.is_superuser

class IsTeacherOrAdmin(permissions.BasePermission):
    """Allows access to Teachers and Admins."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.is_teacher_role or request.user.is_coordinator_or_admin or request.user.is_superuser

class IsOwnerOrAdmin(permissions.BasePermission):
    """Allows access to the owner of the record or an Admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_coordinator_or_admin:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'email'):
            return obj.email == request.user.email
        return False
