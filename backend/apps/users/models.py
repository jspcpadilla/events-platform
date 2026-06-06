from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """
    Manager personalizado para crear usuarios y superusuarios.
    Reemplaza el manager por defecto de Django.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        
        email = self.normalize_email(email)  # convierte a minúsculas
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # hashea la contraseña, nunca texto plano
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuario personalizado.
    Usa email como identificador principal en vez de username.
    """

    class Role(models.TextChoices):
        ADMIN       = 'admin',       'Administrador'
        ORGANIZER   = 'organizer',   'Organizador'
        PARTICIPANT = 'participant', 'Participante'

    # Campos principales
    email      = models.EmailField(unique=True, verbose_name='Correo electrónico')
    first_name = models.CharField(max_length=100, verbose_name='Nombre')
    last_name  = models.CharField(max_length=100, verbose_name='Apellido')
    phone      = models.CharField(max_length=20, blank=True, verbose_name='Teléfono')
    role       = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PARTICIPANT,
        verbose_name='Rol'
    )

    # Campos de control
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    # Le decimos a Django que el login es por email, no por username
    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name        = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering            = ['-created_at']

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.email})'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'

    # Helpers de rol para usar en vistas y permisos
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_organizer(self):
        return self.role == self.Role.ORGANIZER

    @property
    def is_participant(self):
        return self.role == self.Role.PARTICIPANT