from rest_framework import serializers
from .models import Enrollment
from apps.events.serializers import EventListSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer para crear una inscripción.
    El usuario se asigna automáticamente del token JWT.
    """
    event_detail = EventListSerializer(source='event', read_only=True)

    class Meta:
        model  = Enrollment
        fields = ['id', 'event', 'event_detail', 'status', 'enrolled_at']
        read_only_fields = ['status', 'enrolled_at']

    def validate(self, attrs):
        user  = self.context['request'].user
        event = attrs['event']

        # Verificar que el evento está publicado
        if event.status != 'published':
            raise serializers.ValidationError(
                'No puedes inscribirte a un evento que no está publicado.'
            )

        # Verificar que hay cupos disponibles
        if not event.is_available:
            raise serializers.ValidationError(
                f'El evento "{event.title}" no tiene cupos disponibles.'
            )

        # Verificar que no está ya inscrito
        if Enrollment.objects.filter(
            user=user,
            event=event,
            status=Enrollment.Status.ACTIVE
        ).exists():
            raise serializers.ValidationError(
                'Ya estás inscrito en este evento.'
            )

        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)