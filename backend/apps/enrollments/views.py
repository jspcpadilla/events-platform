from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Enrollment
from .serializers import EnrollmentSerializer


class MyEnrollmentsView(generics.ListAPIView):
    """
    GET /api/enrollments/
    Lista todas las inscripciones activas del usuario autenticado.
    """
    serializer_class   = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(
            user=self.request.user,
            status=Enrollment.Status.ACTIVE
        ).select_related('event', 'event__category')


class EnrollView(generics.CreateAPIView):
    """
    POST /api/enrollments/enroll/
    Inscribirse a un evento.
    """
    serializer_class   = EnrollmentSerializer
    permission_classes = [IsAuthenticated]


class CancelEnrollmentView(APIView):
    """
    POST /api/enrollments/<id>/cancel/
    Cancelar una inscripción.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            enrollment = Enrollment.objects.get(
                pk=pk,
                user=request.user,
                status=Enrollment.Status.ACTIVE
            )
        except Enrollment.DoesNotExist:
            return Response(
                {'error': 'Inscripción no encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        enrollment.status = Enrollment.Status.CANCELLED
        enrollment.save()

        return Response(
            {'message': 'Inscripción cancelada correctamente.'},
            status=status.HTTP_200_OK
        )