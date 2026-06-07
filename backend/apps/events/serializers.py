from rest_framework import serializers
from .models import Category, Event
from apps.users.serializers import UserProfileSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'description']
        read_only_fields = ['slug']


class EventListSerializer(serializers.ModelSerializer):
    """
    Serializer ligero para listar eventos.
    No incluye todos los campos para que la respuesta sea rápida.
    """
    category        = CategorySerializer(read_only=True)
    organizer_name  = serializers.CharField(source='organizer.full_name', read_only=True)
    available_spots = serializers.ReadOnlyField()
    is_free         = serializers.ReadOnlyField()

    class Meta:
        model  = Event
        fields = [
            'id', 'title', 'slug', 'category', 'organizer_name',
            'start_date', 'end_date', 'location', 'capacity',
            'available_spots', 'price', 'is_free', 'status'
        ]


class EventDetailSerializer(serializers.ModelSerializer):
    """
    Serializer completo para ver el detalle de un evento.
    """
    category        = CategorySerializer(read_only=True)
    category_id     = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    organizer       = UserProfileSerializer(read_only=True)
    available_spots = serializers.ReadOnlyField()
    is_free         = serializers.ReadOnlyField()
    is_available    = serializers.ReadOnlyField()

    class Meta:
        model  = Event
        fields = [
            'id', 'title', 'slug', 'description',
            'category', 'category_id',
            'organizer', 'start_date', 'end_date',
            'location', 'capacity', 'available_spots',
            'price', 'is_free', 'is_available',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'organizer', 'created_at', 'updated_at']

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end   = attrs.get('end_date',   getattr(self.instance, 'end_date',   None))
        if start and end and end <= start:
            raise serializers.ValidationError({
                'end_date': 'La fecha de fin debe ser posterior a la de inicio.'
            })
        return attrs

    def create(self, validated_data):
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Al editar, regenerar slug si el título cambió
        if 'title' in validated_data and validated_data['title'] != instance.title:
            instance.slug = ''
        return super().update(instance, validated_data)