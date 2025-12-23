import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FacultyService } from '../../services/faculty.service';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
  bluegold_id?: string;
  first_name?: string;
  last_name?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  activeTab = 'users';

  createUserForm: FormGroup;
  showCreateUserForm = false;
  
  // For inline editing
  editingStudent: any = null;
  editForm: FormGroup;
  
  // For password changes
  changePasswordForm: FormGroup;
  showChangePasswordForm = false;

  constructor(
    private authService: AuthService,
    private facultyService: FacultyService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/)
      ]],
      role: ['student', [Validators.required]],
      bluegold_id: [''],
      first_name: [''],
      last_name: ['']
    });

    // Initialize edit form for inline editing
    this.editForm = this.fb.group({
      gpa: ['', [Validators.required, Validators.min(0), Validators.max(4.0)]],
      total_credits: ['', [Validators.required, Validators.min(0)]],
      account_balance: ['', [Validators.required]]
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

    if (user.role !== 'admin') {
      this.router.navigate(['/faculty-dashboard']);
      return;
    }

    this.loadUsers();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load all users (students, faculty, admin)
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load users';
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  showCreateUser(): void {
    this.showCreateUserForm = true;
    this.createUserForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelCreateUser(): void {
    this.showCreateUserForm = false;
    this.createUserForm.reset();
  }

  onRoleChange(): void {
    const role = this.createUserForm.get('role')?.value;
    const bluegoldIdControl = this.createUserForm.get('bluegold_id');
    const firstNameControl = this.createUserForm.get('first_name');
    const lastNameControl = this.createUserForm.get('last_name');

    if (role === 'student') {
      // Students require BlueGold ID and full name
      bluegoldIdControl?.setValidators([Validators.required]);
      firstNameControl?.setValidators([Validators.required]);
      lastNameControl?.setValidators([Validators.required]);
    } else if (role === 'faculty') {
      // Faculty require full name but NOT BlueGold ID
      bluegoldIdControl?.clearValidators();
      firstNameControl?.setValidators([Validators.required]);
      lastNameControl?.setValidators([Validators.required]);
    } else {
      // Admin doesn't require these fields
      bluegoldIdControl?.clearValidators();
      firstNameControl?.clearValidators();
      lastNameControl?.clearValidators();
    }

    bluegoldIdControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    lastNameControl?.updateValueAndValidity();
  }

  createUser(): void {
    if (this.createUserForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const userData: CreateUserRequest = this.createUserForm.value;

      // If creating a student, use the faculty service
      if (userData.role === 'student') {
        this.facultyService.createStudent({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          bluegold_id: userData.bluegold_id!,
          first_name: userData.first_name!,
          last_name: userData.last_name!
        }).subscribe({
          next: () => {
            this.successMessage = 'Student account created successfully!';
            this.showCreateUserForm = false;
            this.createUserForm.reset();
            this.loadUsers();
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to create user';
            this.isLoading = false;
          }
        });
      } else if (userData.role === 'faculty' || userData.role === 'admin') {
        // For faculty and admin, use the auth service
        this.authService.createUser({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null
        }).subscribe({
          next: () => {
            this.successMessage = `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} account created successfully!`;
            this.showCreateUserForm = false;
            this.createUserForm.reset();
            this.loadUsers();
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to create user';
            this.isLoading = false;
          }
        });
      }
    } else {
      this.createUserForm.markAllAsTouched();
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

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'badge-admin';
      case 'faculty': return 'badge-faculty';
      case 'student': return 'badge-student';
      default: return 'badge-default';
    }
  }

  // Start editing a student
  startEdit(student: any): void {
    this.editingStudent = student;
    this.editForm.patchValue({
      gpa: student.gpa,
      total_credits: student.total_credits,
      account_balance: student.account_balance
    });
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Cancel editing
  cancelEdit(): void {
    this.editingStudent = null;
    this.editForm.reset();
  }

  // Save student changes
  saveStudent(): void {
    if (this.editForm.valid && this.editingStudent) {
      const updatedData = this.editForm.value;
      
      this.isLoading = true;
      this.errorMessage = '';
      
      this.facultyService.updateStudent(this.editingStudent.id, updatedData).subscribe({
        next: () => {
          this.successMessage = 'Student information updated successfully!';
          this.editingStudent = null;
          this.editForm.reset();
          this.loadUsers(); // Refresh the list
          this.isLoading = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update student information';
          console.error('Error updating student:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }

  // Change password methods
  showChangePassword(): void {
    this.showChangePasswordForm = true;
    this.changePasswordForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelChangePassword(): void {
    this.showChangePasswordForm = false;
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
          this.showChangePasswordForm = false;
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

  // Delete user method
  deleteUser(user: any): void {
    // Show user's name if available, otherwise email
    const displayName = (user.first_name && user.last_name) 
      ? `${user.first_name} ${user.last_name}` 
      : user.email;
    
    if (confirm(`Are you sure you want to delete ${displayName} (${user.role})? This action cannot be undone.`)) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.deleteUser(user.id).subscribe({
        next: () => {
          this.successMessage = `User ${displayName} deleted successfully!`;
          this.loadUsers(); // Refresh the user list
          this.isLoading = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete user';
          console.error('Error deleting user:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
