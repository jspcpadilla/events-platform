from django.urls import path
from . import views

urlpatterns = [
    path('',              views.MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('enroll/',       views.EnrollView.as_view(),        name='enroll'),
    path('<int:pk>/cancel/', views.CancelEnrollmentView.as_view(), name='cancel-enrollment'),
]