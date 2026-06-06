from django.urls import path
from . import views

urlpatterns = [
    path('',               views.EventListCreateView.as_view(),  name='event-list'),
    path('<int:pk>/',      views.EventDetailView.as_view(),      name='event-detail'),
    path('my-events/',     views.MyEventsView.as_view(),         name='my-events'),
    path('categories/',    views.CategoryListCreateView.as_view(), name='category-list'),
]