from django.db import models
from apps.users.models import User
from apps.events.models import Event


class Enrollment(models.Model):
    """
    Representa la inscripción de un usuario a un evento.
    Un usuario no puede inscribirse dos veces al mismo evento.
    """

    class Status(models.TextChoices):
        ACTIVE    = 'active',    'Activa'
        CANCELLED = 'cancelled', 'Cancelada'

    user  = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name='Usuario'
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name='Evento'
    )
    status      = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name='Estado'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Inscripción'
        verbose_name_plural = 'Inscripciones'
        ordering            = ['-enrolled_at']
        # Esta línea evita que un usuario se inscriba dos veces al mismo evento
        unique_together     = ['user', 'event']

    def __str__(self):
        return f'{self.user.full_name} → {self.event.title}'