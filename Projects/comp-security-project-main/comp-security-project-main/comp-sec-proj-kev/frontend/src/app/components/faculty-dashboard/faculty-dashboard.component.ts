import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FacultyService, Student, StudentDetail, CreateStudentRequest, UpdateStudentRequest, TuitionCharge, CreateTuitionChargeRequest } from '../../services/faculty.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './faculty-dashboard.component.html',
  styleUrls: ['./faculty-dashboard.component.scss']
})
export class FacultyDashboardComponent implements OnInit {
  // Component State
  students: Student[] = [];
  filteredStudents: Student[] = [];
  selectedStudent: StudentDetail | null = null;
  tuitionCharges: TuitionCharge[] = [];
  activeTab: 'overview' | 'students' = 'students';
  searchTerm: string = '';
  isLoading: boolean = false;
  alert = { show: false, type: '', message: '' };

  // Form Groups
  createStudentForm: FormGroup;
  updateStudentForm: FormGroup;
  tuitionChargeForm: FormGroup;

  // UI Visibility Flags
  showCreateStudentForm: boolean = false;
  showUpdateStudentForm: boolean = false;
  showTuitionChargeForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private facultyService: FacultyService,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize Create Student Form
    this.createStudentForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
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
      bluegold_id: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z0-9]{6,10}$/)
      ]]
    });

    // Initialize Update Student Form
    this.updateStudentForm = this.fb.group({
      gpa: [0, [Validators.required, Validators.min(0), Validators.max(4)]],
      total_credits: [0, [Validators.required, Validators.min(0)]],
      account_balance: [0, [Validators.required, Validators.min(0)]]
    });

    // Initialize Tuition Charge Form
    this.tuitionChargeForm = this.fb.group({
      amount: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999.99)
      ]],
      description: ['', [
        Validators.maxLength(500)
      ]],
      due_date: ['']
    });
  }

  ngOnInit(): void {
    // Check if user is logged in and has proper role
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (user.role !== 'faculty' && user.role !== 'admin') {
      this.handleError('Access denied. Faculty or Admin role required.');
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
    
    this.loadStudents();
  }

  // Data Loading
  loadStudents(): void {
    this.isLoading = true;
    this.facultyService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError('Failed to load students.');
        this.isLoading = false;
      }
    });
  }

  // Student Selection
  selectStudent(student: Student): void {
    this.isLoading = true;
    this.selectedStudent = null; // Clear previous selection
    this.tuitionCharges = []; // Clear previous charges
    
    this.facultyService.getStudentById(student.id).subscribe({
      next: (details) => {
        this.selectedStudent = details;
        this.updateStudentForm.patchValue({
          gpa: details.gpa,
          total_credits: details.total_credits,
          account_balance: details.account_balance
        });
        
        // Now fetch tuition charges separately
        this.facultyService.getStudentTuitionCharges(student.id).subscribe({
          next: (charges) => {
            this.tuitionCharges = charges;
            this.closeAllForms();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Failed to load tuition charges:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.handleError('Failed to load student details.');
        this.isLoading = false;
      }
    });
  }

  // Student CRUD Operations
  createStudent(): void {
    if (this.createStudentForm.invalid) return;
    this.isLoading = true;

    const request: CreateStudentRequest = this.createStudentForm.value;

    this.facultyService.createStudent(request).subscribe({
      next: (newStudent) => {
        this.handleSuccess('Student created successfully!');
        this.loadStudents();
        this.cancelCreateStudent();
      },
      error: (err) => this.handleError(err.error.message || 'Failed to create student.')
    });
  }

  updateStudent(): void {
    if (!this.selectedStudent || this.updateStudentForm.invalid) return;
    this.isLoading = true;

    const request: UpdateStudentRequest = this.updateStudentForm.value;

    this.facultyService.updateStudent(this.selectedStudent.id, request).subscribe({
      next: () => {
        this.handleSuccess('Student updated successfully!');
        // Update the selected student with new values
        if (this.selectedStudent) {
          this.selectedStudent.gpa = request.gpa;
          this.selectedStudent.total_credits = request.total_credits;
          this.selectedStudent.account_balance = request.account_balance;
        }
        this.loadStudents(); // Refresh the main list
        this.cancelUpdateStudent();
      },
      error: (err) => this.handleError(err.error?.message || 'Failed to update student.')
    });
  }

  // Tuition Operations
  createTuitionCharge(): void {
    console.log('createTuitionCharge called');
    console.log('Selected Student:', this.selectedStudent);
    console.log('Form Valid:', this.tuitionChargeForm.valid);
    console.log('Form Value:', this.tuitionChargeForm.value);
    
    if (!this.selectedStudent) {
      this.handleError('Please select a student first.');
      return;
    }
    
    if (this.tuitionChargeForm.invalid) {
      this.handleError('Please fill in all required fields correctly.');
      // Mark all fields as touched to show validation errors
      Object.keys(this.tuitionChargeForm.controls).forEach(key => {
        this.tuitionChargeForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isLoading = true;

    const request: CreateTuitionChargeRequest = {
      student_id: this.selectedStudent.id,
      amount: Number(this.tuitionChargeForm.value.amount),
      description: this.tuitionChargeForm.value.description || '',
      due_date: this.tuitionChargeForm.value.due_date || null
    };

    console.log('Sending request:', request);

    this.facultyService.createTuitionCharge(request).subscribe({
      next: () => {
        console.log('Tuition charged successfully');
        this.handleSuccess('Tuition charged successfully!');
        // Refresh student details to get updated balance and charges
        if (this.selectedStudent) {
          this.selectStudent(this.selectedStudent);
        }
        this.cancelTuitionCharge();
      },
      error: (err) => {
        console.error('Error charging tuition:', err);
        this.handleError(err.error?.message || 'Failed to charge tuition.');
      }
    });
  }

  // UI Control Methods
  showCreateStudent(): void {
    this.closeAllForms();
    this.showCreateStudentForm = true;
  }

  cancelCreateStudent(): void {
    this.showCreateStudentForm = false;
    this.createStudentForm.reset();
  }

  showUpdateStudent(): void {
    this.closeAllForms();
    this.showUpdateStudentForm = true;
  }

  cancelUpdateStudent(): void {
    this.showUpdateStudentForm = false;
    // Reset form to the selected student's current state
    if (this.selectedStudent) {
      this.updateStudentForm.patchValue({
        gpa: this.selectedStudent.gpa,
        total_credits: this.selectedStudent.total_credits,
        account_balance: this.selectedStudent.account_balance
      });
    }
  }

  showTuitionCharge(): void {
    this.closeAllForms();
    this.showTuitionChargeForm = true;
    // Keep user on Students tab so they can see the form immediately
  }

  cancelTuitionCharge(): void {
    this.showTuitionChargeForm = false;
    this.tuitionChargeForm.reset();
  }

  closeAllForms(): void {
    this.showCreateStudentForm = false;
    this.showUpdateStudentForm = false;
    this.showTuitionChargeForm = false;
  }

  filterStudents(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(s =>
      s.first_name.toLowerCase().includes(term) ||
      s.last_name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.bluegold_id.toLowerCase().includes(term)
    );
  }

  // Utility and Formatting
  formatCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null || isNaN(value)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  formatDate(date: string | undefined | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getChargeStatusColor(status: string): string {
    return status === 'paid' ? 'var(--success-color)' : 'var(--warning-color)';
  }

  formatGPA(gpa: number | null | undefined): string {
    if (gpa === null || gpa === undefined || isNaN(Number(gpa))) {
      return '0.00';
    }
    return Number(gpa).toFixed(2);
  }

  // Computed Stats
  get averageGpa(): string {
    if (this.students.length === 0) return '0.00';
    const total = this.students.reduce((acc, s) => acc + (s.gpa || 0), 0);
    return (total / this.students.length).toFixed(2);
  }

  get totalOutstanding(): number {
    return this.students.reduce((acc, s) => acc + (s.account_balance || 0), 0);
  }

  // Alert Handling
  private handleSuccess(message: string): void {
    this.showAlert('success', message);
    this.isLoading = false;
  }

  private handleError(message: string): void {
    this.showAlert('danger', message);
    this.isLoading = false;
  }

  private showAlert(type: string, message: string): void {
    this.alert = { show: true, type, message };
    setTimeout(() => this.alert.show = false, 5000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
