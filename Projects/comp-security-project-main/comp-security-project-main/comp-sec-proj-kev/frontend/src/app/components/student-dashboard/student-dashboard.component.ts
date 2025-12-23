import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StudentService, StudentProfile, AcademicInfo, BalanceInfo, Transaction } from '../../services/student.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  studentProfile: StudentProfile | null = null;
  academicInfo: AcademicInfo | null = null;
  balanceInfo: BalanceInfo | null = null;
  transactions: Transaction[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  activeTab = 'overview';

  profileForm: FormGroup;
  isEditingProfile = false;
  
  // For password changes
  changePasswordForm: FormGroup;
  isChangingPassword = false;

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s\-']+$/)
      ]],
      last_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s\-']+$/)
      ]],
      phone_number: ['', [
        Validators.pattern(/^(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/)
      ]],
      address: ['', [
        Validators.maxLength(200)
      ]],
      city: ['', [
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s\-']+$/)
      ]],
      state: ['', [
        Validators.pattern(/^[A-Z]{2}$/)
      ]],
      zip_code: ['', [
        Validators.pattern(/^\d{5}(-\d{4})?$/)
      ]]
    });

    // Initialize change password form
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password matching
  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    if (user.role !== 'student') {
      this.router.navigate(['/faculty-dashboard']);
      return;
    }

    this.loadStudentData();
  }

  loadStudentData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentService.getStudentProfile().subscribe({
      next: (profile) => {
        this.studentProfile = profile;
        this.profileForm.patchValue({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          zip_code: profile.zip_code || ''
        });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load student profile';
        console.error('Error loading profile:', error);
      }
    });

    this.studentService.getAcademicInfo().subscribe({
      next: (academic) => {
        this.academicInfo = academic;
      },
      error: (error) => {
        console.error('Error loading academic info:', error);
      }
    });

    this.studentService.getBalanceInfo().subscribe({
      next: (balance) => {
        this.balanceInfo = balance;
      },
      error: (error) => {
        console.error('Error loading balance info:', error);
      }
    });

    this.studentService.getTransactionHistory().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  enableProfileEdit(): void {
    this.isEditingProfile = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelProfileEdit(): void {
    this.isEditingProfile = false;
    if (this.studentProfile) {
      this.profileForm.patchValue({
        first_name: this.studentProfile.first_name,
        last_name: this.studentProfile.last_name,
        phone_number: this.studentProfile.phone_number || '',
        address: this.studentProfile.address || '',
        city: this.studentProfile.city || '',
        state: this.studentProfile.state || '',
        zip_code: this.studentProfile.zip_code || ''
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.studentService.updateStudentProfile(this.profileForm.value).subscribe({
        next: () => {
          this.successMessage = 'Profile updated successfully!';
          this.isEditingProfile = false;
          this.loadStudentData();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update profile';
          this.isLoading = false;
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatGPA(gpa: number | null | undefined): string {
    if (gpa === null || gpa === undefined || isNaN(Number(gpa))) {
      return '0.00';
    }
    return Number(gpa).toFixed(2);
  }

  // Change password methods
  startChangePassword(): void {
    this.isChangingPassword = true;
    this.changePasswordForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelChangePassword(): void {
    this.isChangingPassword = false;
    this.changePasswordForm.reset();
  }

  changePassword(): void {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { currentPassword, newPassword } = this.changePasswordForm.value;

      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.successMessage = 'Password changed successfully!';
          this.isChangingPassword = false;
          this.changePasswordForm.reset();
          this.isLoading = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to change password';
          console.error('Error changing password:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }
}
