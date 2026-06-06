from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# En desarrollo, React en puerto 3000 puede llamar a Django en 8000
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]

# Herramientas de desarrollo
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']

INTERNAL_IPS = ['127.0.0.1']