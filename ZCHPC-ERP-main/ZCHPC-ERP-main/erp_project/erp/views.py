from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import CustomUser, Employees
from .serializers import employee_serializers
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions
from .models import Job, Applicant
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from .forms import SignUpForm, SignInForm
# from .serializers import JobSerializer, ApplicantSerializer
from .serializers.job_serializer import *


def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)          # auto-login after signup
            return redirect('/')
    else:
        form = SignUpForm()
    return render(request, 'accounts/signup.html', {'form': form})

def signin_view(request):
    if request.method == 'POST':
        form = SignInForm(request, data=request.POST)
        if form.is_valid():
            user = authenticate(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'])
            if user:
                login(request, user)
                return redirect('/')
    else:
        form = SignInForm()
    return render(request, 'accounts/signin.html', {'form': form})

def signout_view(request):
    logout(request)
    return redirect('signin')

User = get_user_model()

# ---- system users

from rest_framework.decorators import authentication_classes, permission_classes
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = employee_serializers.UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # create token
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": serializer.data}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_user(request): 
    users = User.objects.all()
    serializer = employee_serializers.UserRegistrationSerializer(users, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_user(request, id):  # Add the `id` parameter
    try:
        user = User.objects.get(employeeid=id)
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    
@api_view(['GET'])
def get_user(request, id):  # Add the `id` parameter
    try:
        user = User.objects.get(employeeid=id)
        user_data = {
            "employeeid": user.employeeid,
            "firstname": user.firstname,
            "surname": user.surname,
            "role": user.role,
            "department": user.department,
            "email": user.email,
            "salary": user.salary,
            "contractFrom": user.contractFrom,
            "contractTo": user.contractTo,
            "isActive": user.isActive,
        }
        
        return Response(user_data, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# hr module
# In your_app/views.py

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    # Permissions:
    # HR can create, update, delete jobs (IsAuthenticated & custom permission for HR role)
    # Public can only read 'Open' jobs (AllowAny for GET, but filter queryset)
    def get_permissions(self):
        if self.action in ['list', 'retrieve']: # For GET requests (list all, get one)
            return [permissions.AllowAny()] # Anyone can view jobs
        return [permissions.IsAuthenticated()] # Only authenticated users can create/update/delete

    def get_queryset(self):
        # For public view, only show 'Open' jobs
        if self.action == 'list' and not self.request.user.is_authenticated:
            return Job.objects.filter(status='OP')
        return super().get_queryset()

class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    # Only authenticated HR users should manage applicants
    permission_classes = [permissions.IsAuthenticated] # You'd add a custom HR permission here later

    # You might want to filter applicants based on the job they applied for
    # or based on HR's department access.