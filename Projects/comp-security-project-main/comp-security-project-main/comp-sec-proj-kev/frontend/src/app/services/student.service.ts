import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentProfile {
  id: number;
  user_id: number;
  bluegold_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  gpa: number;
  total_credits: number;
  account_balance: number;
  enrollment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicInfo {
  gpa: number;
  total_credits: number;
  timestamp: string;
}

export interface BalanceInfo {
  account_balance: number;
  timestamp: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  transaction_type: string;
  description: string;
  amount?: number;
  student_id?: number;
  status: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'https://localhost:3001/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('user');
    const user = token ? JSON.parse(token) : null;
    return new HttpHeaders({
      'Authorization': `Bearer ${user?.token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  getStudentProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.apiUrl}/students/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  updateStudentProfile(profileData: Partial<StudentProfile>): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/profile`, profileData, {
      headers: this.getAuthHeaders()
    });
  }

  getAcademicInfo(): Observable<AcademicInfo> {
    return this.http.get<AcademicInfo>(`${this.apiUrl}/students/academic`, {
      headers: this.getAuthHeaders()
    });
  }

  getBalanceInfo(): Observable<BalanceInfo> {
    return this.http.get<BalanceInfo>(`${this.apiUrl}/students/balance`, {
      headers: this.getAuthHeaders()
    });
  }

  getTransactionHistory(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`, {
      headers: this.getAuthHeaders()
    });
  }
}
