from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para registrar nuevos usuarios.
    Incluye confirmación de contraseña que no se guarda en BD.
    """
    password  = serializers.CharField(
        write_only=True,       # nunca se devuelve en la respuesta
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model  = User
        fields = ['email', 'first_name', 'last_name', 'phone', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')  # eliminamos antes de crear
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para ver y editar el perfil del usuario autenticado.
    """
    full_name = serializers.ReadOnlyField()  # viene del @property del modelo

    class Meta:
        model  = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'phone', 'role', 'full_name', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'created_at']


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para cambiar contraseña del usuario autenticado.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password': 'Las contraseñas no coinciden.'})
        return attrs