from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Category, Event
from .serializers import CategorySerializer, EventListSerializer, EventDetailSerializer
from .permissions import IsOrganizerOrAdmin, IsEventOrganizerOrAdmin


class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/events/categories/  → listar categorías (público)
    POST /api/events/categories/  → crear categoría (solo admin)
    """
    queryset         = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsOrganizerOrAdmin]


class EventListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/events/  → listar eventos publicados (público)
    POST /api/events/  → crear evento (organizador o admin)
    """
    permission_classes = [IsOrganizerOrAdmin]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['title', 'description', 'location']
    ordering_fields    = ['start_date', 'price', 'capacity']

    def get_queryset(self):
        queryset = Event.objects.select_related('category', 'organizer')

        # Usuarios no autenticados solo ven eventos publicados
        if not self.request.user.is_authenticated:
            return queryset.filter(status=Event.Status.PUBLISHED)

        # Admins ven todos los eventos
        if self.request.user.is_admin:
            return queryset

        # Organizadores ven sus propios eventos + los publicados
        if self.request.user.is_organizer:
            return queryset.filter(
                organizer=self.request.user
            ) | queryset.filter(status=Event.Status.PUBLISHED)

        # Participantes solo ven publicados
        return queryset.filter(status=Event.Status.PUBLISHED)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventDetailSerializer
        return EventListSerializer


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/events/<id>/  → ver detalle
    PUT    /api/events/<id>/  → editar (solo organizador dueño o admin)
    DELETE /api/events/<id>/  → eliminar (solo organizador dueño o admin)
    """
    queryset           = Event.objects.select_related('category', 'organizer')
    serializer_class   = EventDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsEventOrganizerOrAdmin]


class MyEventsView(generics.ListAPIView):
    """
    GET /api/events/my-events/  → eventos del organizador autenticado
    """
    serializer_class = EventListSerializer

    def get_queryset(self):
        return Event.objects.filter(
            organizer=self.request.user
        ).select_related('category', 'organizer')

# Create your views here.
