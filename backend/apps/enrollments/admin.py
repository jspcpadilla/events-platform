from django.contrib import admin
from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display  = ['user', 'event', 'status', 'enrolled_at']
    list_filter   = ['status']
    search_fields = ['user__email', 'event__title']
    readonly_fields = ['enrolled_at', 'updated_at']