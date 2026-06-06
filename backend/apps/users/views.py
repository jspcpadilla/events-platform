from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer
)


class RegisterView(generics.CreateAPIView):
    """
    Endpoint público para registrar nuevos usuarios.
    POST /api/auth/register/
    """
    queryset         = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]  # no requiere estar autenticado


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Ver y editar perfil del usuario autenticado.
    GET  /api/auth/profile/
    PUT  /api/auth/profile/
    """
    serializer_class   = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user  # siempre devuelve el usuario del token


class ChangePasswordView(APIView):
    """
    Cambiar contraseña del usuario autenticado.
    POST /api/auth/change-password/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user

            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Contraseña actual incorrecta.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {'message': 'Contraseña actualizada correctamente.'},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout invalidando el refresh token.
    POST /api/auth/logout/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()  # invalida el token
            return Response(
                {'message': 'Sesión cerrada correctamente.'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Token inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )