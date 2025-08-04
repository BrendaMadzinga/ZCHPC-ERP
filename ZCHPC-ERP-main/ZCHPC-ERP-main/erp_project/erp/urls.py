from django.urls import path, include
from . import views
from django.urls import path
from .view.payroll_view import *
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter
from .view import hr_view, payroll_view
from .views import JobViewSet, ApplicantViewSet

router = DefaultRouter()
router.register(r'zig-rates', ZiGRateToUSDViewSet)
router.register(r'nssa-caps', NSSACapViewSet)
router.register(r'pension-funds', PensionFundViewSet)
router.register(r'employee-deductables', EmployeeDeductablesViewSet)
router.register(r'tax-brackets', TaxBracketViewSet)
router.register(r'payroll-periods', PayrollPeriodViewSet) # New entry

router.register(r'allowance-types', AllowanceTypeViewSet)
router.register(r'deduction-types', DeductionTypeViewSet)

router.register(r'jobs', JobViewSet)
router.register(r'applicants', ApplicantViewSet)



urlpatterns = [
    
    # system
    path('', include(router.urls)),
    # API auth endpoints
    path('api/login/', obtain_auth_token, name='api_login'),
    path('api/signup/', views.register_user, name='api_signup'),
    # authentication
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.signin_view, name='signin'),
    path('logout/', views.signout_view, name='signout'),

    path('register/user/', views.register_user, name='login'),
    path('all/users/', views.get_all_user, name='get_all_users'),
    path('delete/user/<str:id>/', views.delete_user, name='delete_user'),
    path('get/user/<str:id>/', views.get_user, name='delete_user'),
    path('update/user/<str:id>/', views.get_user, name='delete_user'),
    
    # hr module
    path('register/employee/', hr_view.register_employee, name='register_employee'),
    path('all/employees/', hr_view.get_all_employees, name='get_all_users'),
    
    # payroll module
    path('all/payslips/', payroll_view.payroll_list, name='payslip_list'),
    # path('delete/payslip/', payroll_view.delete_employee_slip, name='delete_employee_slip'),
    path('delete/payslip/', payroll_view.DeletePayrollSlipView.as_view(), name='delete_payslip'),

    # urls.py
    path('update-employee-salary/<str:employee_id>/', UpdateEmployeeSalaryView.as_view()),
    
    # In your_app/urls.py
    path('api/', include(router.urls)),
    # Add your authentication URLs here, e.g., for login/logout
    # path('api/auth/', include('rest_framework.urls')), # For DRF's browsable API login
]


