from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOrganizerOrAdmin(BasePermission):
    """
    Solo organizadores y admins pueden crear eventos.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return request.user.is_authenticated and (
            request.user.is_organizer or request.user.is_admin
        )


class IsEventOrganizerOrAdmin(BasePermission):
    """
    Solo el organizador dueño del evento o un admin puede editarlo o borrarlo.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return (
            request.user == obj.organizer or
            request.user.is_admin
        )