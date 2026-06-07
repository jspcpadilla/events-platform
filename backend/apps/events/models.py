from django.db import models
from django.utils.text import slugify
from apps.users.models import User


class Category(models.Model):
    """
    Categoría de eventos. Ejemplos: Tecnología, Arte, Deportes.
    """
    name        = models.CharField(max_length=100, unique=True, verbose_name='Nombre')
    slug        = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, verbose_name='Descripción')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering            = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Event(models.Model):
    """
    Modelo principal de eventos.
    """

    class Status(models.TextChoices):
        DRAFT     = 'draft',     'Borrador'
        PUBLISHED = 'published', 'Publicado'
        CANCELLED = 'cancelled', 'Cancelado'
        FINISHED  = 'finished',  'Finalizado'

    # Información básica
    title       = models.CharField(max_length=200, verbose_name='Título')
    slug        = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField(verbose_name='Descripción')

    # Relaciones
    category  = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='events',
        verbose_name='Categoría'
    )
    organizer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='organized_events',
        verbose_name='Organizador'
    )

    # Fechas
    start_date = models.DateTimeField(verbose_name='Fecha de inicio')
    end_date   = models.DateTimeField(verbose_name='Fecha de fin')

    # Detalles
    location = models.CharField(max_length=300, verbose_name='Ubicación')
    capacity = models.PositiveIntegerField(verbose_name='Capacidad')
    price    = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        verbose_name='Precio'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name='Estado'
    )

    # Control
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Evento'
        verbose_name_plural = 'Eventos'
        ordering            = ['-start_date']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Event.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def is_available(self):
        """Verifica si el evento tiene cupos disponibles."""
        return self.enrollments.count() < self.capacity

    @property
    def available_spots(self):
        """Retorna el número de cupos disponibles."""
        return self.capacity - self.enrollments.count()

    @property
    def is_free(self):
        return self.price == 0