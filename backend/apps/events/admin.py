from django.contrib import admin
from .models import Category, Event


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display  = ['title', 'organizer', 'category', 'status', 'start_date', 'capacity']
    list_filter   = ['status', 'category']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Información básica', {
            'fields': ('title', 'slug', 'description', 'image', 'category')
        }),
        ('Organización', {
            'fields': ('organizer', 'status')
        }),
        ('Detalles', {
            'fields': ('location', 'start_date', 'end_date', 'capacity', 'price')
        }),
        ('Registro', {
            'fields': ('created_at', 'updated_at')
        }),
    )