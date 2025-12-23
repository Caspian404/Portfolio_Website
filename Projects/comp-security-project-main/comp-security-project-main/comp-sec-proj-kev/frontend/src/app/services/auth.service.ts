import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface User {
  id?: number;
  username?: string;
  email: string;
  token?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:3001/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  // CAPTCHA GET REQUEST
  getCaptcha(): Observable<any> {
    return this.http.get(`${this.apiUrl}/captcha`);
  }


  register(username: string, email: string, password: string, role: string = 'student'): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/register`, { username, email, password, role }).pipe(
      tap(response => {
        localStorage.setItem('user', JSON.stringify(response));
        this.userSubject.next(response);
      })
    );
  }

  // LOGIN WITH reCAPTCHA v2
  login(email: string, password: string, recaptchaToken: string): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password, recaptchaToken }).pipe(
      tap(response => {
        localStorage.setItem('user', JSON.stringify(response));
        this.userSubject.next(response);
      })
    );
  }
  
  logout(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user?.token || null;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const user = this.getCurrentUser();
    const token = user?.token;
    
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Admin-only methods
  getAllUsers(): Observable<any[]> {
    const user = this.getCurrentUser();
    const token = user?.token;
    
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  deleteUser(userId: number): Observable<any> {
    const user = this.getCurrentUser();
    const token = user?.token;
    
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  createUser(userData: any): Observable<any> {
    const user = this.getCurrentUser();
    const token = user?.token;
    
    return this.http.post(`${this.apiUrl}/register`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
}
