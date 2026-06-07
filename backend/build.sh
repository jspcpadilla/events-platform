#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install gunicorn
pip install -r requirements/base.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Crear superusuario automáticamente si no existe
python manage.py shell -c "
from apps.users.models import User
import os
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')
first_name = os.environ.get('DJANGO_SUPERUSER_FIRSTNAME', '')
last_name = os.environ.get('DJANGO_SUPERUSER_LASTNAME', '')
if email and not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password, first_name=first_name, last_name=last_name)
    print('Superusuario creado exitosamente.')
else:
    print('Superusuario ya existe o email no configurado.')
"