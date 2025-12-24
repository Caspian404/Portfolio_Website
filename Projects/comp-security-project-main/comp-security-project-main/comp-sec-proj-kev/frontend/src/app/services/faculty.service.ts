import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id: number;
  bluegold_id: string;
  first_name: string;
  last_name: string;
  email: string;
  gpa: number;
  total_credits: number;
  account_balance: number;
}

export interface StudentDetail extends Student {
  user_id: number;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  enrollment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentRequest {
  username: string;
  email: string;
  password: string;
  bluegold_id: string;
  first_name: string;
  last_name: string;
}

export interface UpdateStudentRequest {
  gpa: number;
  total_credits: number;
  account_balance: number;
}

export interface TuitionCharge {
  id: number;
  student_id: number;
  amount: number;
  description?: string;
  charged_by: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date?: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTuitionChargeRequest {
  student_id: number;
  amount: number;
  description?: string;
  due_date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FacultyService {
  private apiUrl = 'https://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('user');
    const user = token ? JSON.parse(token) : null;
    return new HttpHeaders({
      'Authorization': `Bearer ${user?.token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/faculty/students`, {
      headers: this.getAuthHeaders()
    });
  }

  getStudentById(studentId: number): Observable<StudentDetail> {
    return this.http.get<StudentDetail>(`${this.apiUrl}/faculty/students/${studentId}`, {
      headers: this.getAuthHeaders()
    });
  }

  createStudent(studentData: CreateStudentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/faculty/students`, studentData, {
      headers: this.getAuthHeaders()
    });
  }

  updateStudent(studentId: number, studentData: UpdateStudentRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/faculty/students/${studentId}`, studentData, {
      headers: this.getAuthHeaders()
    });
  }

  createTuitionCharge(chargeData: CreateTuitionChargeRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/faculty/tuition`, chargeData, {
      headers: this.getAuthHeaders()
    });
  }

  getStudentTuitionCharges(studentId: number): Observable<TuitionCharge[]> {
    return this.http.get<TuitionCharge[]>(`${this.apiUrl}/faculty/tuition/${studentId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
