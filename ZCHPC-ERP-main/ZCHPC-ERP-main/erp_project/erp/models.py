from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from datetime import date # Import date for explicit date usage

# 1. User Model (often depends on nothing, so can be at the top)
class CustomUser(AbstractUser):
    employeeid = models.CharField(max_length=10, unique=True, blank=True)
    firstname = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    role = models.CharField(max_length=50)
    department = models.CharField(max_length=50, default='System')
    email = models.EmailField(unique=True)
    salary = models.IntegerField(null=True, blank=True)
    contractFrom = models.DateField(null=True, blank=True)
    contractTo = models.DateField(null=True, blank=True)
    isActive = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.employeeid:
            last_employee = CustomUser.objects.order_by("-id").first()
            if last_employee and last_employee.employeeid:
                last_id = int(last_employee.employeeid.replace("SYS", ""))
                new_id = f"SYS{last_id + 1:04d}"
            else:
                new_id = "SYS0001"
            self.employeeid = new_id
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employeeid} - {self.email}"

# 2. AllowanceType and DeductionType (often independent, or depend on nothing)
class AllowanceType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        verbose_name = "Allowance Type"
        verbose_name_plural = "Allowance Types"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (${self.amount})"

class DeductionType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        verbose_name = "Deduction Type"
        verbose_name_plural = "Deduction Types"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (${self.amount})"

# 3. Employees (depends on AllowanceType and DeductionType for ManyToMany fields)
class Employees(models.Model):
    employeeid = models.CharField(max_length=10, unique=True, blank=True)
    firstname = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    nationalid = models.CharField(max_length=50, unique=True, null=True)
    dateOfBirth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, blank=True)
    maritalStatus = models.CharField(max_length=50, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    position = models.CharField(max_length=50)
    department = models.CharField(max_length=50, default='System')
    employee_type = models.CharField(max_length=50, default='Unspecified')
    leave_days = models.IntegerField(default=0)
    contractFrom = models.DateField(null=True, blank=True)
    contractTo = models.DateField(null=True, blank=True)
    usd_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    zig_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    # Corrected: Keep only one set of bankName and bankAccount fields
    bankName = models.CharField(max_length=100, blank=True, null=True)
    bankAccount = models.CharField(max_length=50, blank=True, null=True)
    
    frequency = models.CharField(max_length=50, default='monthly')
    pensionFund = models.CharField(max_length=100, blank=True)
    nssaNumber = models.CharField(max_length=50, blank=True)
    zimraTaxNumber = models.CharField(max_length=50, blank=True)
    payeNumber = models.CharField(max_length=50, blank=True)
    aidsLevyNumber = models.BooleanField(default=True) # This is likely a number field, not boolean
    isActive = models.BooleanField(default=True)
    emegencyContactName = models.CharField(max_length=100, blank=True)
    emegencyContactNumber = models.CharField(max_length=15, blank=True)
    emegencyContactRelationship = models.CharField(max_length=50, blank=True)

    allowances = models.ManyToManyField(AllowanceType, blank=True, related_name='employees_with_allowance')
    deductions = models.ManyToManyField(DeductionType, blank=True, related_name='employees_with_deduction')

    def save(self, *args, **kwargs):
        if not self.employeeid:
            last_employee = Employees.objects.order_by("-id").first()
            if last_employee and last_employee.employeeid:
                last_id = int(last_employee.employeeid.replace("EMP", ""))
            else:
                last_id = 0
            
            while True:
                last_id += 1
                new_id = f"EMP{last_id:04d}"
                if not Employees.objects.filter(employeeid=new_id).exists():
                    self.employeeid = new_id
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employeeid} - {self.email}"

# 4. ZiGRateToUSD and TaxBracket (independent, but Payroll will depend on TaxBracket)
class ZiGRateToUSD(models.Model):
    date = models.DateField(unique=True) # Only one rate per day
    rate = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        validators=[MinValueValidator(0)]
    )
    
    class Meta:
        ordering = ['-date'] # Newest rates first
        verbose_name = "ZIG to USD Rate"
        verbose_name_plural = "ZIG to USD Rates"
    
    def __str__(self):
        return f"{self.date}: 1 ZIG = {self.rate} USD"

class TaxBracket(models.Model):
    currency_choices = [
        ('USD', 'USD'),
        ('ZWG', 'ZWL/ZiG') # Use ZWG for consistency with your code
    ]
    currency = models.CharField(max_length=10, choices=currency_choices)
    min_income = models.DecimalField(max_digits=10, decimal_places=2)
    max_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Leave blank for highest bracket")
    rate = models.DecimalField(max_digits=5, decimal_places=3) # e.g., 0.20 for 20%
    deduction = models.DecimalField(max_digits=10, decimal_places=2) # Deductible amount for that bracket
    active_from = models.DateField(default=timezone.now)

    class Meta:
        verbose_name = "Tax Bracket"
        verbose_name_plural = "Tax Brackets"
        ordering = ['currency', 'min_income', '-active_from']

    def __str__(self):
        return f"{self.currency} {self.min_income}-{self.max_income or 'Max'} @ {self.rate*100}%"

# 5. Payroll (depends on Employees and TaxBracket)
class Payroll(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Pending', 'Pending'),
        ('Processed', 'Processed'),
        ('Failed', 'Failed'),
        ('Paid', 'Paid'),
    ]
    
    employee = models.ForeignKey(
        Employees, # This is now defined above
        on_delete=models.PROTECT, 
        related_name='payrolls'
    )
    
    period = models.DateField() # First day of the pay period month
    base_salary_usd = models.DecimalField(
        max_digits=10,
        default=0,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    net_salary_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    base_salary_zig = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    net_salary_zig = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    exchange_rate = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        default=0,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Draft'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now,)
    notes = models.TextField(blank=True)
    nssa_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pension_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    nssa_zig = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pension_zig = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    
    class Meta:
        unique_together = ['employee', 'period'] # One payroll per employee per period
        ordering = ['-period', 'employee__firstname']
    
    def __str__(self):
        return f"{self.employee} - {self.period.strftime('%B %Y')} - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        # Automatically set period to first day of month if not specified
        if not self.period:
            self.period = timezone.now().replace(day=1).date() # Ensure it's a date object
        self.updated_at = timezone.now() # Update timestamp on each save
        super().save(*args, **kwargs)
    
    # NEW METHOD TO LOAD TAX BRACKETS FROM THE DATABASE
    def load_tax_brackets(self, currency, payroll_date=None):
        """
        Loads the active tax brackets for a given currency and date.
        If payroll_date is not provided, uses the current payroll's period.
        """
        if not payroll_date:
            payroll_date = self.period # Use the payroll's period date

        # Get the latest tax brackets active on or before the payroll_date
        # Order by active_from descending to get the most recent set
        brackets = TaxBracket.objects.filter(
            currency=currency,
            active_from__lte=payroll_date
        ).order_by('-active_from', 'min_income') # Ensure correct order for calculation
        
        loaded_brackets = []
        
        # Get the latest active_from date for the given currency
        latest_active_from_date = None
        if brackets.exists():
            latest_active_from_date = brackets.first().active_from
            
        for bracket in brackets:
            # Only include brackets from the latest active set
            if bracket.active_from == latest_active_from_date:
                loaded_brackets.append({
                    'min_income': float(bracket.min_income), # Convert to float for calculation if needed
                    'max_income': float(bracket.max_income) if bracket.max_income is not None else float('inf'),
                    'rate': float(bracket.rate),
                    'deduction': float(bracket.deduction)
                })
        
        # Sort by min_income to ensure correct order for calculation
        loaded_brackets.sort(key=lambda x: x['min_income'])
        return loaded_brackets

    # Example of a calculate PAYE method that would use load_tax_brackets
    def calculate_paye(self, taxable_income, currency):
        """
        Calculates PAYE based on the employee's taxable income and currency,
        using tax brackets loaded from the database.
        """
        calculated_tax = 0.0
        tax_brackets = self.load_tax_brackets(currency, self.period)

        if not tax_brackets:
            print(f"No tax brackets found for {currency} on {self.period}. PAYE will be 0.")
            return 0.0

        for bracket in tax_brackets:
            min_income = bracket['min_income']
            max_income = bracket['max_income']
            rate = bracket['rate']
            deduction = bracket['deduction'] # This is often the amount to subtract *from* the calculated tax

            if taxable_income > min_income:
                if max_income == float('inf') or taxable_income <= max_income:
                    # Found the bracket where taxable_income falls
                    calculated_tax = (taxable_income - min_income) * rate + deduction
                    break
        
        # Aids Levy: 3% of tax payable if tax payable is above a certain threshold (often USD 100 for USD, ZWL equivalent for ZWL)
        # Assuming Aids Levy is always 3% of calculated PAYE if there is PAYE
        aids_levy_rate = 0.03 # 3%
        if calculated_tax > 0: # Assuming Aid Levy only applies if there is tax
            # You might have a specific threshold for Aids Levy, check ZIMRA rules
            # For simplicity, applying it if tax is > 0
            aids_levy = calculated_tax * aids_levy_rate
            return float(calculated_tax + aids_levy)
        
        return float(calculated_tax)


# 6. Models that depend on Employees, DeductionType, MedicalAidPlan, PensionFund, InsuranceOption, Union
# Ensure these are defined before EmployeeDeductables if EmployeeDeductables uses them as ForeignKeys
# MedicalAidProvider first
class MedicalAidProvider(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = "Medical Aid Provider"
        verbose_name_plural = "Medical Aid Providers"

# MedicalAidPlan depends on MedicalAidProvider
class MedicalAidPlan(models.Model):
    provider = models.ForeignKey(MedicalAidProvider, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    usd_amount = models.DecimalField(max_digits=10, decimal_places=2)
    zwl_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    class Meta:
        verbose_name = "Medical Aid Plan"
        verbose_name_plural = "Medical Aid Plans"

# PensionFund (independent)
class PensionFund(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    employee_rate = models.DecimalField(max_digits=5, decimal_places=4)
    employer_rate = models.DecimalField(max_digits=5, decimal_places=4)
    currency = models.CharField(max_length=10, choices=[('usd', 'USD Only'), ('zwl', 'ZWL Only'), ('both', 'Both')])
    
    class Meta:
        verbose_name = "Pension Fund"
        verbose_name_plural = "Pension Funds"

# InsuranceOption (independent)
class InsuranceOption(models.Model):
    INSURANCE_TYPES = [
        ('funeral', 'Funeral Cover'),
        ('life', 'Life Insurance'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    insurance_type = models.CharField(max_length=20, choices=INSURANCE_TYPES)
    calculation_type = models.CharField(max_length=30, null=True, blank=True,
                                       choices=[('fixed', 'Fixed Amount'),
                                                ('percentage', 'Percentage of Salary')])
    usd_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    zwl_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    rate = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    min_amount_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_amount_zwl = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    max_amount_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_amount_zwl = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    cover_details = models.CharField(max_length=200, null=True, blank=True)
    
    class Meta:
        verbose_name = "Insurance Option"
        verbose_name_plural = "Insurance Options"

# Union (independent)
class Union(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    usd_amount = models.DecimalField(max_digits=10, decimal_places=2)
    zwl_amount = models.DecimalField(max_digits=12, decimal_places=2)
    frequency = models.CharField(max_length=20, choices=[('monthly', 'Monthly'), ('annual', 'Annual')])
    
    class Meta:
        verbose_name = "Union"
        verbose_name_plural = "Unions"

# Employee-specific deductions (depends on Employees, MedicalAidPlan, PensionFund, InsuranceOption, Union)
class EmployeeDeductables(models.Model):
    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('ZWL', 'Zimbabwe Dollar'),
    ]
    
    employee = models.ForeignKey('Employees', on_delete=models.CASCADE) # Employees is defined
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES)
    
    # Medical Aid
    medical_aid = models.ForeignKey(MedicalAidPlan, on_delete=models.SET_NULL, null=True, blank=True) # MedicalAidPlan is defined
    
    # Pension
    pension_fund = models.ForeignKey(PensionFund, on_delete=models.SET_NULL, null=True, blank=True) # PensionFund is defined
    pension_employee_contribution = models.BooleanField(default=True)
    
    # Insurance
    funeral_cover = models.ForeignKey(InsuranceOption, on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='funeral_cover', limit_choices_to={'insurance_type': 'funeral'}) # InsuranceOption is defined
    life_insurance = models.ForeignKey(InsuranceOption, on_delete=models.SET_NULL, null=True, blank=True,
                                       related_name='life_insurance', limit_choices_to={'insurance_type': 'life'}) # InsuranceOption is defined
    
    # Union
    union = models.ForeignKey(Union, on_delete=models.SET_NULL, null=True, blank=True) # Union is defined
    
    # Benefits (for withholding tax)
    school_fees_benefit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    housing_benefit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    loan_benefit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Other fields
    active = models.BooleanField(default=True)
    effective_date = models.DateField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Employee Deductable"
        verbose_name_plural = "Employee Deductables"
        unique_together = ('employee', 'effective_date')
    
    def __str__(self):
        return f"Deductions for {self.employee} ({self.currency})"

# 7. PayrollPeriod (independent)
class PayrollPeriod(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="e.g., Monthly, Bi-Weekly, Weekly")
    frequency_in_days = models.IntegerField(help_text="Number of days in the period (approximate for monthly, exact for others)")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Payroll Period Type"
        verbose_name_plural = "Payroll Period Types"
        ordering = ['name']

# 8. Job (independent)
class Job(models.Model):
    JOB_TYPES = [
        ('FT', 'Full-time'),
        ('PT', 'Part-time'),
        ('CT', 'Contract'),
        ('IN', 'Internship'),
    ]
    JOB_STATUSES = [
        ('DR', 'Draft'),
        ('OP', 'Open'),
        ('CL', 'Closed'),
        ('AR', 'Archived'),
    ]

    title = models.CharField(max_length=255)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField()
    application_deadline = models.DateField()
    job_type = models.CharField(max_length=2, choices=JOB_TYPES, default='FT')
    status = models.CharField(max_length=2, choices=JOB_STATUSES, default='DR')
    posted_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
# 9. Applicant (depends on Job)
class Applicant(models.Model):
    APPLICATION_STATUSES = [
        ('NEW', 'New Application'),
        ('REV', 'Under Review'),
        ('INT', 'Interview Scheduled'),
        ('OFF', 'Offer Extended'),
        ('HIR', 'Hired'),
        ('REJ', 'Rejected'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applicants')
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    cover_letter = models.TextField(blank=True, null=True)
    resume_url = models.URLField(blank=True, null=True)
    application_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=3, choices=APPLICATION_STATUSES, default='NEW')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.full_name} - {self.job.title}"

# 10. PAYEThreshold and PAYETaxCredit (depend on DeductionType)
class PAYEThreshold(models.Model):
    deduction_type = models.ForeignKey(DeductionType, on_delete=models.CASCADE)
    currency = models.CharField(max_length=3, choices=[('USD', 'US Dollar'), ('ZWL', 'Zimbabwe Dollar')])
    threshold_from = models.DecimalField(max_digits=12, decimal_places=2)
    threshold_to = models.DecimalField(max_digits=12, decimal_places=2)
    rate = models.DecimalField(max_digits=5, decimal_places=4)
    fixed_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    class Meta:
        verbose_name = "PAYE Threshold"
        verbose_name_plural = "PAYE Thresholds"

class PAYETaxCredit(models.Model):
    deduction_type = models.ForeignKey(DeductionType, on_delete=models.CASCADE)
    usd_amount = models.DecimalField(max_digits=10, decimal_places=2)
    zwl_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    class Meta:
        verbose_name = "PAYE Tax Credit"
        verbose_name_plural = "PAYE Tax Credits"

# 11. NSSACap (depends on DeductionType)
class NSSACap(models.Model):
    deduction_type = models.ForeignKey(DeductionType, on_delete=models.CASCADE)
    usd_cap = models.DecimalField(max_digits=10, decimal_places=2)
    zwl_cap = models.DecimalField(max_digits=12, decimal_places=2)
    rate = models.DecimalField(max_digits=5, decimal_places=4)
    contribution_type = models.CharField(max_length=30, choices=[('employee', 'Employee Only'),
                                                                 ('employer', 'Employer Only'),
                                                                 ('employee_and_employer', 'Employee and Employer')])
    
    class Meta:
        verbose_name = "NSSA Cap"
        verbose_name_plural = "NSSA Caps"