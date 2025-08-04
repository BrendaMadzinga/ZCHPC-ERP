"""erp_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter # Import DefaultRouter


router = DefaultRouter()
# router.register(r'jobs', JobViewSet) # Uncomment and add your viewsets
# router.register(r'applicants', ApplicantViewSet) # Uncomment and add your viewsets


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('erp.urls')), # This assumes your main ERP app has its own urls.py
    path("__reload__/", include("django_browser_reload.urls")),
    path('api/', include(router.urls)), # This line will now work
]