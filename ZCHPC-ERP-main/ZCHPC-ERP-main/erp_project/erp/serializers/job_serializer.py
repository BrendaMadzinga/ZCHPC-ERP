# In your_app/serializers.py
from rest_framework import serializers
from ..models import Job, Applicant

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__' # Include all fields from the Job model

class ApplicantSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True) # To display job title in applicant list
    class Meta:
        model = Applicant
        fields = '__all__'