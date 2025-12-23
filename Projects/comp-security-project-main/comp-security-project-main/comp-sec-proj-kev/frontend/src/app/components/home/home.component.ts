import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <nav class="navbar">
        <div class="navbar-brand">Welcome {{ username }}</div>
        <button class="logout-button" (click)="logout()">Logout</button>
      </nav>
      <div class="content">
        <h1>Home Page</h1>
        <p>You have successfully logged in!</p>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background: var(--bg-secondary);
    }
    
    .navbar {
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .logout-button {
      padding: 0.5rem 1rem;
      background: var(--accent-light);
      color: var(--accent-dark);
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .logout-button:hover {
      background: var(--primary-color);
      transform: translateY(-2px);
    }

    .content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    p {
      color: var(--text-secondary);
    }
  `]
})
export class HomeComponent implements OnInit {
  username: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
    } else {
      this.username = user.username || user.email;
      
      // Redirect based on role
      if (user.role === 'admin') {
        this.router.navigate(['/admin-dashboard']);
      } else if (user.role === 'faculty') {
        this.router.navigate(['/faculty-dashboard']);
      } else {
        this.router.navigate(['/student-dashboard']);
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
